import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { patients, payments, appointments, clinicalReports } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

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

  const age = data.age === undefined || data.age === null || data.age === ""
    ? NaN
    : parseInt(data.age);
  if (Number.isNaN(age) || !Number.isInteger(age) || age < 1 || age > 150) {
    return NextResponse.json(
      { error: "Age must be a whole number between 1 and 150" },
      { status: 400 }
    );
  }

  const fee = data.fee === undefined || data.fee === null || data.fee === ""
    ? 0
    : parseFloat(data.fee);
  if (Number.isNaN(fee) || fee < 0) {
    return NextResponse.json(
      { error: "Fee must be a non-negative number" },
      { status: 400 }
    );
  }

  await db
    .update(patients)
    .set({
      fullName: data.fullName,
      age,
      gender: data.gender,
      email: data.email,
      phone: data.phone,
      city: data.city,
      state: data.state,
      address: data.address || null,
      occupation: data.occupation || null,
      maritalStatus: data.maritalStatus || null,
      religion: data.religion || null,
      education: data.education || null,
      chiefComplaint: data.chiefComplaint || null,
      diagnosis: data.diagnosis || null,
      diabetesType: data.diabetesType || null,
      diagnosisDuration: data.diagnosisDuration || null,
      currentMedications: data.currentMedications || null,
      mainConcern: data.mainConcern || null,
      referralSource: data.referralSource || null,
      additionalNotes: data.additionalNotes || null,
      fee,
      nextFollowUp: data.nextFollowUp || null,
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

  const [existing] = await db
    .select({ id: patients.id })
    .from(patients)
    .where(eq(patients.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const patientIds = [id];
  await db
    .delete(payments)
    .where(inArray(payments.patientId, patientIds));
  await db
    .delete(appointments)
    .where(inArray(appointments.patientId, patientIds));
  await db
    .delete(clinicalReports)
    .where(inArray(clinicalReports.patientId, patientIds));
  await db.delete(patients).where(eq(patients.id, id));

  return NextResponse.json({ success: true });
}
