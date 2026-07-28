import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { clinicalReports, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateReportPdf } from "@/lib/pdf-generator";
import { uploadPdf } from "@/lib/gcs";

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { reportId } = body;
  if (!reportId) return NextResponse.json({ error: "reportId is required" }, { status: 400 });

  const [report] = await db.select().from(clinicalReports).where(eq(clinicalReports.id, reportId));
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  const settingsRows = await db.select().from(settings);
  const s: Record<string, string> = {};
  for (const row of settingsRows) s[row.key] = row.value;

  const metrics = JSON.parse(report.metricsJson || "{}");
  const lifestyle = JSON.parse(report.lifestyleJson || "{}");
  const actionPlan = JSON.parse(report.actionPlanJson || "{}");
  const reportData = JSON.parse(report.reportDataJson || "{}");

  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const pdfData = {
    patientName: reportData.patientName || "Unknown",
    age: reportData.age || 0,
    gender: reportData.gender || "Unknown",
    chiefComplaint: reportData.chiefComplaint || "Not specified",
    clinicianName: report.clinicianName || "Not specified",
    assessmentDate: today,
    diagnoses: reportData.diagnoses || "Not specified",
    medications: reportData.medications || "None reported",
    history: reportData.history || "None reported",
    dietaryPattern: lifestyle.dietaryPattern || "—",
    hydrationStatus: lifestyle.hydrationStatus || "—",
    physicalActivity: lifestyle.physicalActivity || "—",
    substanceUse: lifestyle.substanceUse || "—",
    sleepStress: lifestyle.sleepStress || "—",
    previousInvestigations: report.previousInvestigations || "None reported",
    clinicalSummary: report.clinicalSummary || "No clinical summary provided.",
    bloodPressure: metrics.bloodPressureSystolic
      ? `${metrics.bloodPressureSystolic}/${metrics.bloodPressureDiastolic || "—"} mmHg`
      : "—",
    heartRate: metrics.heartRate ? `${metrics.heartRate} bpm` : "—",
    bmi: metrics.bmi
      ? `${metrics.bmi} kg/m2${metrics.weight ? ` (${metrics.weight} kg)` : ""}`
      : "—",
    hba1c: metrics.hba1c ? `${metrics.hba1c}%` : "—",
    glucoseFasting: metrics.glucoseFasting ? `${metrics.glucoseFasting} mg/dL` : "—",
    glucosePostPrandial: metrics.glucosePostPrandial ? `${metrics.glucosePostPrandial} mg/dL` : "—",
    continuousMonitoring: actionPlan.continuousMonitoring || "—",
    dietaryOptimization: actionPlan.dietaryOptimization || "—",
    physicalActivityPlan: actionPlan.physicalActivityPlan || "—",
    followUpSchedule: actionPlan.followUpSchedule || "—",
  };

  const metricTargets = {
    bloodPressureSystolic: { label: "Systolic BP", max: parseFloat(s.bloodPressureSystolic_max) || 130, unit: "mmHg" },
    bloodPressureDiastolic: { label: "Diastolic BP", max: parseFloat(s.bloodPressureDiastolic_max) || 80, unit: "mmHg" },
    heartRate: { label: "Heart Rate", min: parseFloat(s.heartRate_min) || 60, max: parseFloat(s.heartRate_max) || 100, unit: "bpm" },
    bmi: { label: "BMI", min: parseFloat(s.bmi_min) || 18.5, max: parseFloat(s.bmi_max) || 24.9, unit: "kg/m2" },
    hba1c: { label: "HbA1c", max: parseFloat(s.hba1c_max) || 7.0, unit: "%" },
    glucoseFasting: { label: "Fasting Glucose", max: parseFloat(s.glucoseFasting_max) || 126, unit: "mg/dL" },
    glucosePostPrandial: { label: "Postprandial Glucose", max: parseFloat(s.glucosePostPrandial_max) || 180, unit: "mg/dL" },
  };

  const pdfBuffer = generateReportPdf(pdfData, { metricTargets });

  const fileName = `reports/${report.patientId}/${report.id}.pdf`;
  const pdfUrl = await uploadPdf(fileName, pdfBuffer);

  if (pdfUrl) {
    await db.update(clinicalReports).set({ pdfUrl }).where(eq(clinicalReports.id, reportId));
  }

  return NextResponse.json({ success: true, pdfUrl });
}
