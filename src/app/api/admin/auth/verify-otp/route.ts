import { NextResponse } from "next/server";
import {
  verifyOTP,
  createJWT,
  setAuthCookie,
  getAdminByEmail,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    const valid = await verifyOTP(email, code);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid or expired OTP code" },
        { status: 401 }
      );
    }

    const admin = await getAdminByEmail(email);
    if (!admin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    const token = await createJWT({
      id: admin.id,
      email: admin.email,
      name: admin.name,
    });
    await setAuthCookie(token);

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
