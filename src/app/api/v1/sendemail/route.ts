import { NextRequest, NextResponse } from "next/server";
import { getBrevo, CONFIRMATION_SENDER_EMAIL, CONFIRMATION_SENDER_NAME, ADMIN_SENDER_EMAIL, ADMIN_SENDER_NAME, ADMIN_EMAIL } from "@/lib/brevo";
import { getConfirmationEmail, getAdminNotificationEmail, type ConsultationFormData } from "@/lib/email-templates";
import { db } from "@/db";
import { consultations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkRateLimit, consumeRateLimit, getClientIp } from "@/lib/rate-limit";

const ONE_HOUR = 60 * 60 * 1000;

function validateForm(data: Record<string, unknown>): string | null {
  if (!data || typeof data !== "object") return "Invalid request body";
  if (data.fullName === undefined) return "Missing required fields: fullName, age, gender, email, phone, city, state";

  const str = (v: unknown, maxLen: number): string => {
    if (v == null) return "";
    const s = String(v);
    return s.length > maxLen ? "" : s.trim();
  };

  const fullName = str(data.fullName, 120);
  const age = str(data.age, 3);
  const gender = str(data.gender, 30);
  const email = str(data.email, 200);
  const phone = str(data.phone, 20);
  const city = str(data.city, 80);
  const state = str(data.state, 80);

  if (!fullName || !age || !gender || !email || !phone || !city || !state) {
    return "Missing required fields: fullName, age, gender, email, phone, city, state";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email address";
  if (!/^[0-9+()\-\s]{7,20}$/.test(phone)) return "Invalid phone number";
  const ageNum = Number(age);
  if (!Number.isInteger(ageNum) || ageNum < 1 || ageNum > 120) return "Invalid age";

  const optionalFields: [string, number][] = [
    ["diabetesType", 100],
    ["diagnosisDuration", 100],
    ["currentMedications", 500],
    ["mainConcern", 2000],
    ["referralSource", 100],
    ["additionalNotes", 2000],
  ];
  for (const [field, maxLen] of optionalFields) {
    if (data[field] != null && String(data[field]).length > maxLen) {
      return `${field} exceeds maximum length of ${maxLen} characters`;
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    let data: Record<string, unknown>;
    try {
      data = await request.json();
    } catch {
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }

    const validationError = validateForm(data);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    const email = String(data.email).toLowerCase().trim();
    const ip = getClientIp(request);
    const ipLimit = await checkRateLimit(`sendemail:ip:${ip}`, 5, ONE_HOUR);
    const emailLimit = await checkRateLimit(`sendemail:email:${email}`, 3, ONE_HOUR);
    if (!ipLimit.ok || !emailLimit.ok) {
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    await consumeRateLimit(`sendemail:ip:${ip}`, ONE_HOUR);
    await consumeRateLimit(`sendemail:email:${email}`, ONE_HOUR);

    const id = crypto.randomUUID();
    const now = new Date();

    await db.insert(consultations).values({
      id,
      fullName: String(data.fullName),
      age: Number(data.age),
      gender: String(data.gender),
      email,
      phone: String(data.phone),
      city: String(data.city),
      state: String(data.state),
      diabetesType: data.diabetesType ? String(data.diabetesType) : null,
      diagnosisDuration: data.diagnosisDuration ? String(data.diagnosisDuration) : null,
      currentMedications: data.currentMedications ? String(data.currentMedications) : null,
      mainConcern: data.mainConcern ? String(data.mainConcern) : null,
      referralSource: data.referralSource ? String(data.referralSource) : null,
      additionalNotes: data.additionalNotes ? String(data.additionalNotes) : null,
      emailSent: false,
      status: "new",
      createdAt: now,
    });

    let emailSent = false;
    try {
      const brevo = getBrevo();

      await brevo.transactionalEmails.sendTransacEmail({
        sender: { email: CONFIRMATION_SENDER_EMAIL, name: CONFIRMATION_SENDER_NAME },
        to: [{ email, name: String(data.fullName) }],
        subject: `We've Received Your Consultation Request - Glymee Health`,
        htmlContent: getConfirmationEmail(data as unknown as ConsultationFormData),
        tags: ["consultation", "confirmation"],
      });

      await brevo.transactionalEmails.sendTransacEmail({
        sender: { email: ADMIN_SENDER_EMAIL, name: ADMIN_SENDER_NAME },
        to: [{ email: ADMIN_EMAIL, name: "Glymee Admin" }],
        subject: `New Consultation Request from ${data.fullName}`,
        htmlContent: getAdminNotificationEmail(data as unknown as ConsultationFormData),
        replyTo: { email, name: String(data.fullName) },
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
