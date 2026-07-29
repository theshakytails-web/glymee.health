import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { payments, patients } from "@/db/schema";
import { sql, eq, desc } from "drizzle-orm";

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

    const id = crypto.randomUUID();
    const now = new Date();

    await db.insert(payments).values({
      id,
      patientId,
      amount: parseFloat(amount),
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
