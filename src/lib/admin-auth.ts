import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { createHmac, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/db";
import { admins, otpCodes, refreshTokens } from "@/db/schema";
import { eq, and, gt, desc } from "drizzle-orm";
import { sendOtpEmail } from "@/lib/brevo";

export const MAX_OTP_ATTEMPTS = 5;

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);
const ACCESS_TOKEN_TTL = 60 * 60; // 1 hour
export const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days
const COOKIE_NAME = "glymee_admin_token";
const REFRESH_COOKIE_NAME = "glymee_admin_refresh";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

function hashOtp(code: string): string {
  return createHmac("sha256", process.env.ADMIN_JWT_SECRET!)
    .update(code)
    .digest("hex");
}

function hashRefreshToken(token: string): string {
  return createHmac("sha256", process.env.ADMIN_JWT_SECRET!)
    .update(`rt:${token}`)
    .digest("hex");
}

export function generateRefreshToken(): string {
  return randomBytes(48).toString("hex");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createJWT(
  admin: AdminUser,
  ttlSeconds: number = ACCESS_TOKEN_TTL
): Promise<string> {
  return new SignJWT({ ...admin })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(new Date(Date.now() + ttlSeconds * 1000))
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<AdminUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AdminUser;
  } catch {
    return null;
  }
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

async function setAccessCookie(store: CookieStore, token: string) {
  store.set(COOKIE_NAME, token, {
    ...cookieOptions(),
    maxAge: ACCESS_TOKEN_TTL,
  });
}

async function setRefreshCookie(store: CookieStore, token: string) {
  store.set(REFRESH_COOKIE_NAME, token, {
    ...cookieOptions(),
    maxAge: REFRESH_TOKEN_TTL,
  });
}

async function insertRefreshToken(
  adminId: string,
  tokenHash: string,
  expiresAt: Date
) {
  await db.insert(refreshTokens).values({
    id: crypto.randomUUID(),
    adminId,
    tokenHash,
    expiresAt,
    createdAt: new Date(),
  });
}

async function rotateSession(
  store: CookieStore,
  refreshToken: string
): Promise<AdminUser | null> {
  const tokenHash = hashRefreshToken(refreshToken);
  const now = new Date();

  const [record] = await db
    .select()
    .from(refreshTokens)
    .where(
      and(eq(refreshTokens.tokenHash, tokenHash), gt(refreshTokens.expiresAt, now))
    )
    .limit(1);

  if (!record) return null;

  const [admin] = await db
    .select()
    .from(admins)
    .where(eq(admins.id, record.adminId))
    .limit(1);

  if (!admin) {
    await db.delete(refreshTokens).where(eq(refreshTokens.id, record.id));
    return null;
  }

  const adminUser: AdminUser = {
    id: admin.id,
    email: admin.email,
    name: admin.name,
  };

  const newRefreshToken = generateRefreshToken();
  await insertRefreshToken(
    admin.id,
    hashRefreshToken(newRefreshToken),
    new Date(Date.now() + REFRESH_TOKEN_TTL * 1000)
  );
  await db.delete(refreshTokens).where(eq(refreshTokens.id, record.id));

  await setAccessCookie(store, await createJWT(adminUser));
  await setRefreshCookie(store, newRefreshToken);

  return adminUser;
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const store = await cookies();

  const accessToken = store.get(COOKIE_NAME)?.value;
  if (accessToken) {
    const admin = await verifyJWT(accessToken);
    if (admin) return admin;
  }

  const refreshToken = store.get(REFRESH_COOKIE_NAME)?.value;
  if (refreshToken) {
    return await rotateSession(store, refreshToken);
  }

  return null;
}

export async function createSession(admin: AdminUser): Promise<void> {
  const store = await cookies();
  const accessToken = await createJWT(admin);
  const refreshToken = generateRefreshToken();
  await insertRefreshToken(
    admin.id,
    hashRefreshToken(refreshToken),
    new Date(Date.now() + REFRESH_TOKEN_TTL * 1000)
  );
  await setAccessCookie(store, accessToken);
  await setRefreshCookie(store, refreshToken);
}

export async function clearAuthCookie() {
  const store = await cookies();
  const refreshToken = store.get(REFRESH_COOKIE_NAME)?.value;
  if (refreshToken) {
    await db
      .delete(refreshTokens)
      .where(eq(refreshTokens.tokenHash, hashRefreshToken(refreshToken)));
  }
  store.delete(COOKIE_NAME);
  store.delete(REFRESH_COOKIE_NAME);
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createAndSendOTP(email: string): Promise<boolean> {
  const code = generateOTP();
  const id = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.insert(otpCodes).values({
    id,
    email,
    code: hashOtp(code),
    expiresAt,
    used: false,
    attempts: 0,
    createdAt: now,
  });

  return sendOtpEmail(email, code);
}

export async function verifyOTP(
  email: string,
  code: string
): Promise<boolean> {
  const now = new Date();
  const record = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.email, email),
        eq(otpCodes.used, false),
        gt(otpCodes.expiresAt, now)
      )
    )
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);

  if (record.length === 0) return false;

  const otp = record[0];

  if (otp.attempts >= MAX_OTP_ATTEMPTS) {
    await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otp.id));
    return false;
  }

  if (hashOtp(code) !== otp.code) {
    const attempts = otp.attempts + 1;
    await db
      .update(otpCodes)
      .set({
        attempts,
        ...(attempts >= MAX_OTP_ATTEMPTS ? { used: true } : {}),
      })
      .where(eq(otpCodes.id, otp.id));
    return false;
  }

  await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otp.id));

  return true;
}

export async function getAdminByEmail(email: string) {
  const result = await db
    .select()
    .from(admins)
    .where(eq(admins.email, email))
    .limit(1);
  return result[0] || null;
}
