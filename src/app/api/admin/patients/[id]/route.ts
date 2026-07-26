import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { patients } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.id, id))
    .limit(1);

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  return NextResponse.json({ patient });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const data = await request.json();

  const [existing] = await db
    .select({ id: patients.id })
    .from(patients)
    .where(eq(patients.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  await db
    .update(patients)
    .set({
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
      status: data.status,
      updatedAt: new Date(),
    })
    .where(eq(patients.id, id));

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await db.delete(patients).where(eq(patients.id, id));

  return NextResponse.json({ success: true });
}
