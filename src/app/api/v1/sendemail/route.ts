import { NextRequest, NextResponse } from "next/server";
import { getBrevo, CONFIRMATION_SENDER_EMAIL, CONFIRMATION_SENDER_NAME, ADMIN_SENDER_EMAIL, ADMIN_SENDER_NAME, ADMIN_EMAIL } from "@/lib/brevo";
import { getConfirmationEmail, getAdminNotificationEmail } from "@/lib/email-templates";
import { db } from "@/db";
import { consultations } from "@/db/schema";
import { eq } from "drizzle-orm";

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

    const id = crypto.randomUUID();
    const now = new Date();

    await db.insert(consultations).values({
      id,
      fullName: data.fullName,
      age: parseInt(data.age),
      gender: data.gender,
      email: data.email,
      phone: data.phone,
      city: data.city,
      state: data.state,
      diabetesType: data.diabetesType || null,
      diagnosisDuration: data.diagnosisDuration || null,
      currentMedications: data.currentMedications || null,
      mainConcern: data.mainConcern || null,
      referralSource: data.referralSource || null,
      additionalNotes: data.additionalNotes || null,
      emailSent: false,
      status: "new",
      createdAt: now,
    });

    let emailSent = false;
    try {
      const brevo = getBrevo();

      await brevo.transactionalEmails.sendTransacEmail({
        sender: { email: CONFIRMATION_SENDER_EMAIL, name: CONFIRMATION_SENDER_NAME },
        to: [{ email: data.email, name: data.fullName }],
        subject: `We've Received Your Consultation Request - Glymee Health`,
        htmlContent: getConfirmationEmail(data),
        tags: ["consultation", "confirmation"],
      });

      await brevo.transactionalEmails.sendTransacEmail({
        sender: { email: ADMIN_SENDER_EMAIL, name: ADMIN_SENDER_NAME },
        to: [{ email: ADMIN_EMAIL, name: "Glymee Admin" }],
        subject: `New Consultation Request from ${data.fullName}`,
        htmlContent: getAdminNotificationEmail(data),
        replyTo: { email: data.email, name: data.fullName },
        tags: ["consultation", "notification"],
      });

      emailSent = true;
    } catch (emailError) {
      console.error("Email sending failed (consultation saved):", emailError);
    }

    await db
      .update(consultations)
      .set({ emailSent })
      .where(eq(consultations.id, id));

    return NextResponse.json(
      { message: "Consultation request received successfully", id },
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
