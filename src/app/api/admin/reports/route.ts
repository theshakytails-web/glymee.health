import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { clinicalReports } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId");

  let query = db
    .select()
    .from(clinicalReports)
    .orderBy(desc(clinicalReports.createdAt));

  if (patientId) {
    query = query.where(eq(clinicalReports.patientId, patientId)) as typeof query;
  }

  const reports = await query;

  return NextResponse.json({ reports });
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const id = crypto.randomUUID();
  const now = new Date();

  await db.insert(clinicalReports).values({
    id,
    patientId: body.patientId,
    pdfUrl: body.pdfUrl || null,
    clinicianName: body.clinicianName || "",
    chiefComplaint: body.chiefComplaint || "",
    metricsJson: JSON.stringify(body.metrics || {}),
    lifestyleJson: JSON.stringify(body.lifestyle || {}),
    clinicalHistoryJson: JSON.stringify(body.clinicalHistory || {}),
    reviewOfSystemsJson: JSON.stringify(body.reviewOfSystems || {}),
    ayurvedicAssessmentJson: JSON.stringify(body.ayurvedicAssessment || {}),
    actionPlanJson: JSON.stringify(body.actionPlan || {}),
    clinicalSummary: body.clinicalSummary || "",
    previousInvestigations: body.previousInvestigations || "",
    reportDataJson: JSON.stringify(body.reportData || {}),
    createdAt: now,
  });

  return NextResponse.json({ success: true, id }, { status: 201 });
}
