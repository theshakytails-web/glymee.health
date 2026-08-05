import { NextResponse } from "next/server";
import { getAdminByEmail, verifyPassword, createAndSendOTP } from "@/lib/admin-auth";
import { checkRateLimit, consumeRateLimit, getClientIp } from "@/lib/rate-limit";

const TEN_MINUTES = 10 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const ip = getClientIp(request);
    const emailKey = `login:email:${normalizedEmail}`;
    const ipKey = `login:ip:${ip}`;

    const emailLimit = await checkRateLimit(emailKey, 5, TEN_MINUTES);
    const ipLimit = await checkRateLimit(ipKey, 15, TEN_MINUTES);
    if (!emailLimit.ok) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }
    if (!ipLimit.ok) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    const admin = await getAdminByEmail(normalizedEmail);
    if (!admin) {
      await consumeRateLimit(emailKey, TEN_MINUTES);
      await consumeRateLimit(ipKey, TEN_MINUTES);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, admin.passwordHash);
    if (!valid) {
      await consumeRateLimit(emailKey, TEN_MINUTES);
      await consumeRateLimit(ipKey, TEN_MINUTES);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const otpEmailLimit = await checkRateLimit(`otp:email:${normalizedEmail}`, 3, TEN_MINUTES);
    const otpIpLimit = await checkRateLimit(`otp:ip:${ip}`, 5, TEN_MINUTES);
    if (!otpEmailLimit.ok || !otpIpLimit.ok) {
      return NextResponse.json(
        { error: "Too many OTP requests. Please try again later." },
        { status: 429 }
      );
    }

    const otpSent = await createAndSendOTP(admin.email);
    if (!otpSent) {
      return NextResponse.json(
        { error: "Failed to send OTP. Please try again." },
        { status: 500 }
      );
    }

    await consumeRateLimit(`otp:email:${normalizedEmail}`, TEN_MINUTES);
    await consumeRateLimit(`otp:ip:${ip}`, TEN_MINUTES);

    return NextResponse.json({
      step: "otp_sent",
      email: admin.email,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
