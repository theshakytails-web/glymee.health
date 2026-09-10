import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { cgmsReports, patients } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId");

  let query = db.select().from(cgmsReports);
  if (patientId) {
    query = query.where(eq(cgmsReports.patientId, patientId)) as typeof query;
  }
  const reports = await query.orderBy(desc(cgmsReports.createdAt)).limit(200);
  return NextResponse.json({ reports });
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

  const period = typeof body.period === "string" ? body.period : "";
  const duration = typeof body.duration === "string" ? body.duration : "";
  const reportData = typeof body.reportData === "string" ? body.reportData : JSON.stringify(body.reportData || {});

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const createdBy = admin.name || admin.email;

  await db.insert(cgmsReports).values({
    id,
    patientId,
    patientName: patient.fullName,
    period,
    duration,
    reportData,
    createdAt,
    createdBy,
  });

  return NextResponse.json({ success: true, id, patientName: patient.fullName }, { status: 201 });
}
