import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { dietPlans, patients } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId");

  let query = db.select().from(dietPlans);

  if (patientId) {
    query = query.where(eq(dietPlans.patientId, patientId)) as typeof query;
  }

  const rows = await query.orderBy(desc(dietPlans.createdAt)).limit(200);

  return NextResponse.json({ plans: rows });
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const patientId = typeof body.patientId === "string" ? body.patientId : "";

  if (!patientId) {
    return NextResponse.json({ error: "patientId is required" }, { status: 400 });
  }

  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.id, patientId))
    .limit(1);

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const planName = typeof body.planName === "string" ? body.planName : "";
  const planData = typeof body.planData === "string" ? body.planData : JSON.stringify(body.planData || {});

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const createdBy = admin.name || admin.email;

  await db.insert(dietPlans).values({
    id,
    patientId,
    patientName: patient.fullName,
    planName,
    planData,
    createdAt,
    createdBy,
  });

  return NextResponse.json({ success: true, id, patientName: patient.fullName }, { status: 201 });
}
