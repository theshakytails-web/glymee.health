import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { consultations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkRateLimit, consumeRateLimit, getClientIp } from "@/lib/rate-limit";

const ONE_HOUR = 60 * 60 * 1000;

interface LeadData {
  fullName: string;
  phone: string;
  email: string;
}

function validateLead(data: Record<string, unknown>): string | null {
  if (!data || typeof data !== "object") return "Invalid request body";

  const fullName = String(data.fullName ?? "").trim();
  const phone = String(data.phone ?? "").trim();
  const email = String(data.email ?? "").trim();

  if (!fullName || !phone || !email) {
    return "Missing required fields: fullName, phone, email";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email address";
  if (!/^[0-9+()\-\s]{7,20}$/.test(phone)) return "Invalid phone number";

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
    const id = crypto.randomUUID();
    const now = new Date();

    await db.insert(consultations).values({
      id,
      fullName: lead.fullName.trim(),
      age: 0,
      gender: "lead",
      email,
      phone: lead.phone.trim(),
      city: "Pending",
      state: "Pending",
      referralSource: "health-assessment-lead",
      additionalNotes: "Collected before health assessment (basic contact only)",
      emailSent: false,
      status: "new",
      createdAt: now,
    });

    return NextResponse.json(
      { message: "Contact details received", id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing contact details:", error);
    return NextResponse.json(
      { message: "Failed to process request" },
      { status: 500 }
    );
  }
}
