import { NextResponse } from "next/server";
import {
  verifyOTP,
  createSession,
  getAdminByEmail,
} from "@/lib/admin-auth";
import { checkRateLimit, consumeRateLimit, getClientIp } from "@/lib/rate-limit";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const ip = getClientIp(request);
    const emailKey = `otp-verify:email:${normalizedEmail}`;
    const ipKey = `otp-verify:ip:${ip}`;

    const emailLimit = await checkRateLimit(emailKey, 10, FIFTEEN_MINUTES);
    const ipLimit = await checkRateLimit(ipKey, 20, FIFTEEN_MINUTES);
    if (!emailLimit.ok || !ipLimit.ok) {
      return NextResponse.json(
        { error: "Too many attempts. Request a new code and try again later." },
        { status: 429 }
      );
    }

    const valid = await verifyOTP(normalizedEmail, String(code));
    if (!valid) {
      await consumeRateLimit(emailKey, FIFTEEN_MINUTES);
      await consumeRateLimit(ipKey, FIFTEEN_MINUTES);
      return NextResponse.json(
        { error: "Invalid or expired OTP code" },
        { status: 401 }
      );
    }

    const admin = await getAdminByEmail(normalizedEmail);
    if (!admin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    await createSession({
      id: admin.id,
      email: admin.email,
      name: admin.name,
    });

    return NextResponse.json({
      success: true,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    });
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
