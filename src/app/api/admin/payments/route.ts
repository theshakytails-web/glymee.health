import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { payments, patients } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const PAYMENT_TYPES = ["consultation", "treatment", "medicine", "other"] as const;

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    const where = patientId ? eq(payments.patientId, patientId) : undefined;
    const rows = await db
      .select()
      .from(payments)
      .where(where)
      .orderBy(desc(payments.paymentDate), desc(payments.createdAt))
      .limit(100);

    return NextResponse.json({ payments: rows });
  } catch (error) {
    console.error("Payments list error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { patientId, amount, type, paymentDate, notes } = body;

    if (!patientId || amount == null || !paymentDate) {
      return NextResponse.json(
        { error: "patientId, amount, and paymentDate are required" },
        { status: 400 }
      );
    }

    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: "amount must be a positive number" },
        { status: 400 }
      );
    }

    if (type && !PAYMENT_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${PAYMENT_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const [patient] = await db
      .select({ id: patients.id })
      .from(patients)
      .where(eq(patients.id, patientId))
      .limit(1);

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    const id = crypto.randomUUID();
    const now = new Date();

    await db.insert(payments).values({
      id,
      patientId,
      amount: parsedAmount,
      type: type || "treatment",
      paymentDate,
      notes: notes || "",
      createdAt: now,
    });

    return NextResponse.json({ success: true, payment: { id, patientId, amount, type, paymentDate, notes } });
  } catch (error) {
    console.error("Payment create error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
