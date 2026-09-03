import { NextRequest, NextResponse } from "next/server";
import { getBrevo, CONFIRMATION_SENDER_EMAIL, CONFIRMATION_SENDER_NAME, ADMIN_SENDER_EMAIL, ADMIN_SENDER_NAME, ADMIN_EMAIL } from "@/lib/brevo";
import { getLeadConfirmationEmail, getLeadAdminNotificationEmail, type LeadFormData } from "@/lib/email-templates";
import { db } from "@/db";
import { consultations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkRateLimit, consumeRateLimit, getClientIp } from "@/lib/rate-limit";

const ONE_HOUR = 60 * 60 * 1000;

interface LeadData {
  fullName: string;
  age: string;
  phone: string;
  email: string;
  diabetesStatus: string;
  diabetesType: string;
  duration: string;
  currentMedications: string;
  mainConcern: string;
  city: string;
  contactMethod: string;
  consent: boolean;
}

function validateLead(data: Record<string, unknown>): string | null {
  if (!data || typeof data !== "object") return "Invalid request body";

  const fullName = String(data.fullName ?? "").trim();
  const age = String(data.age ?? "").trim();
  const phone = String(data.phone ?? "").trim();
  const email = String(data.email ?? "").trim();
  const city = String(data.city ?? "").trim();
  const consent = Boolean(data.consent);

  if (!fullName || !age || !phone || !email || !city) {
    return "Missing required fields: fullName, age, phone, email, city";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email address";
  if (!/^[0-9+()\-\s]{7,20}$/.test(phone)) return "Invalid phone number";
  const ageNum = Number(age);
  if (!Number.isInteger(ageNum) || ageNum < 1 || ageNum > 120) return "Invalid age";
  if (!consent) return "Consent is required";

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

    const validationError = validateLead(data);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    const email = String(data.email).toLowerCase().trim();
    const ip = getClientIp(request);
    const ipLimit = await checkRateLimit(`lead:ip:${ip}`, 5, ONE_HOUR);
    const emailLimit = await checkRateLimit(`lead:email:${email}`, 3, ONE_HOUR);
    if (!ipLimit.ok || !emailLimit.ok) {
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    await consumeRateLimit(`lead:ip:${ip}`, ONE_HOUR);
    await consumeRateLimit(`lead:email:${email}`, ONE_HOUR);

    const lead = data as unknown as LeadData;
    const emailData: LeadFormData = {
      fullName: lead.fullName.trim(),
      age: lead.age,
      phone: lead.phone.trim(),
      email,
      city: lead.city.trim(),
      diabetesStatus: lead.diabetesStatus || "",
      diabetesType: lead.diabetesType || "",
      duration: lead.duration || "",
      currentMedications: lead.currentMedications || "",
      mainConcern: lead.mainConcern || "",
      contactMethod: lead.contactMethod || "",
    };

    const additionalNotes = [
      `Preferred contact method: ${lead.contactMethod || "N/A"}`,
      `Diabetes status: ${lead.diabetesStatus || "N/A"}`,
      `Consent given: yes`,
    ]
      .filter(Boolean)
      .join(" | ");

    const id = crypto.randomUUID();
    const now = new Date();

    await db.insert(consultations).values({
      id,
      fullName: lead.fullName.trim(),
      age: Number(lead.age),
      gender: "lead",
      email,
      phone: lead.phone.trim(),
      city: lead.city.trim(),
      state: lead.city.trim(),
      diabetesType: lead.diabetesType || null,
      diagnosisDuration: lead.duration || null,
      currentMedications: lead.currentMedications || null,
      mainConcern: lead.mainConcern || null,
      referralSource: "health-assessment-lead",
      additionalNotes,
      emailSent: false,
      status: "new",
      createdAt: now,
    });

    let emailSent = false;
    try {
      const brevo = getBrevo();

      await brevo.transactionalEmails.sendTransacEmail({
        sender: { email: CONFIRMATION_SENDER_EMAIL, name: CONFIRMATION_SENDER_NAME },
        to: [{ email, name: lead.fullName.trim() }],
        subject: "We've Received Your Health Assessment Details - Glymee Health",
        htmlContent: getLeadConfirmationEmail(emailData),
        tags: ["lead", "confirmation"],
      });

      await brevo.transactionalEmails.sendTransacEmail({
        sender: { email: ADMIN_SENDER_EMAIL, name: ADMIN_SENDER_NAME },
        to: [{ email: ADMIN_EMAIL, name: "Glymee Admin" }],
        subject: `New Health Assessment Lead from ${lead.fullName.trim()}`,
        htmlContent: getLeadAdminNotificationEmail(emailData),
        replyTo: { email, name: lead.fullName.trim() },
        tags: ["lead", "notification"],
      });

      emailSent = true;
    } catch (emailError) {
      console.error("Lead email sending failed (lead saved):", emailError);
    }

    await db
      .update(consultations)
      .set({ emailSent })
      .where(eq(consultations.id, id));

    return NextResponse.json(
      { message: "Health assessment details received successfully", id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing health assessment lead:", error);
    return NextResponse.json(
      { message: "Failed to process request" },
      { status: 500 }
    );
  }
}
