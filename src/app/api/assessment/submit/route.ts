import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  assessmentSubmissions,
  assessmentResponses,
} from "@/db/schema";

interface SubmitRequest {
  assessmentSlug: string;
  fullName: string;
  email: string;
  phone?: string;
  age: number;
  gender: string;
  heightCm?: number;
  weightKg?: number;
  city?: string;
  responses: Record<string, unknown>;
  consentGiven: boolean;
}

function calculateBMI(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export async function POST(request: Request) {
  try {
    const body: SubmitRequest = await request.json();

    if (!body.consentGiven) {
      return NextResponse.json(
        { error: "Consent is required to submit the assessment" },
        { status: 400 }
      );
    }

    if (!body.fullName || !body.email || !body.age || !body.gender) {
      return NextResponse.json(
        { error: "Please fill in all required profile fields" },
        { status: 400 }
      );
    }

    const submissionId = crypto.randomUUID();
    const now = new Date();
    const bmi =
      body.heightCm && body.weightKg
        ? calculateBMI(body.heightCm, body.weightKg)
        : null;

    await db.insert(assessmentSubmissions).values({
      id: submissionId,
      assessmentSlug: body.assessmentSlug,
      fullName: body.fullName,
      email: body.email,
      phone: body.phone || null,
      age: body.age,
      gender: body.gender,
      heightCm: body.heightCm || null,
      weightKg: body.weightKg || null,
      bmi,
      city: body.city || null,
      status: "completed",
      currentStep: 0,
      consentGiven: true,
      consentText: "User consented to data storage for health insights",
      createdAt: now,
      completedAt: now,
    });

    const responseEntries = Object.entries(body.responses);
    if (responseEntries.length > 0) {
      await db.insert(assessmentResponses).values(
        responseEntries.map(([key, value]) => ({
          id: crypto.randomUUID(),
          submissionId,
          questionId: key,
          questionKey: key,
          responseValue: JSON.stringify(value),
          createdAt: now,
        }))
      );
    }

    return NextResponse.json({
      id: submissionId,
      message: "Assessment submitted successfully",
    });
  } catch (error) {
    console.error("Failed to submit assessment:", error);
    return NextResponse.json(
      { error: "Failed to submit assessment" },
      { status: 500 }
    );
  }
}
