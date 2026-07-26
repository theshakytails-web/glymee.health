import { NextRequest, NextResponse } from "next/server";
import { getBrevo, CONFIRMATION_SENDER_EMAIL, CONFIRMATION_SENDER_NAME, ADMIN_SENDER_EMAIL, ADMIN_SENDER_NAME, ADMIN_EMAIL } from "@/lib/brevo";
import { getConfirmationEmail, getAdminNotificationEmail } from "@/lib/email-templates";

interface FormData {
  fullName: string;
  age: string;
  gender: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  diabetesType: string;
  diagnosisDuration: string;
  currentMedications: string;
  mainConcern: string;
  referralSource: string;
  additionalNotes: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: FormData = await request.json();

    if (!data.fullName || !data.email || !data.phone || !data.city || !data.state || !data.gender || !data.age) {
      return NextResponse.json(
        { message: "Missing required fields: fullName, age, gender, email, phone, city, state" },
        { status: 400 }
      );
    }

    const brevo = getBrevo();

    // 1. Send confirmation email to the user (from help@glymee.com)
    await brevo.transactionalEmails.sendTransacEmail({
      sender: { email: CONFIRMATION_SENDER_EMAIL, name: CONFIRMATION_SENDER_NAME },
      to: [{ email: data.email, name: data.fullName }],
      subject: `We've Received Your Consultation Request - Glymee Health`,
      htmlContent: getConfirmationEmail(data),
      tags: ["consultation", "confirmation"],
    });

    // 2. Send notification email to admin (from noreply@glymee.com)
    await brevo.transactionalEmails.sendTransacEmail({
      sender: { email: ADMIN_SENDER_EMAIL, name: ADMIN_SENDER_NAME },
      to: [{ email: ADMIN_EMAIL, name: "Glymee Admin" }],
      subject: `New Consultation Request from ${data.fullName}`,
      htmlContent: getAdminNotificationEmail(data),
      replyTo: { email: data.email, name: data.fullName },
      tags: ["consultation", "notification"],
    });

    return NextResponse.json(
      { message: "Consultation request received successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing consultation form:", error);
    return NextResponse.json(
      { message: "Failed to process request" },
      { status: 500 }
    );
  }
}
