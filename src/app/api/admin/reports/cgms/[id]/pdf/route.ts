import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { cgmsReports, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateCgmsReportPdf, type CgmsReportData } from "@/lib/cgms-report-generator";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const [report] = await db
    .select()
    .from(cgmsReports)
    .where(eq(cgmsReports.id, id))
    .limit(1);

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const settingsRows = await db.select().from(settings);
  const s: Record<string, string> = {};
  for (const row of settingsRows) s[row.key] = row.value;

  const rd = (() => {
    try {
      return JSON.parse(report.reportData || "{}");
    } catch {
      return {};
    }
  })();

  const data: CgmsReportData = {
    patientName: report.patientName,
    period: report.period || "",
    duration: report.duration || "",
    clinicalBackground: rd.clinicalBackground || "",
    glucoseOverview: rd.glucoseOverview || {
      avgGlucose: "", gmi: "", tir: "", tar: "", tbr: "", cv: "", lowest: "", highest: "",
    },
    healthScore: rd.healthScore || { score: "", interpretation: "", commentary: "" },
    patternAnalysis: rd.patternAnalysis || {
      morningPattern: "", morningObservation: "", afternoonHourly: [],
      afternoonObservation: "", nightPattern: "", nightObservation: "",
    },
    dawnPhenomenon: rd.dawnPhenomenon || "",
    keyFindings: rd.keyFindings || { goingWell: "", areasForAttention: "" },
    actionPlan: rd.actionPlan || {
      foodGoal: "", foodRecommendations: "", walkingTarget: "", movement: "", strength: "",
      sleepTarget: "", sleepRecommendations: "", stressTarget: "", stressRecommendations: "",
    },
    summary: rd.summary || "",
    nextGoals: rd.nextGoals || "",
    conclusion: rd.conclusion || "",
  };

  const business = {
    name: s.invoice_business_name || "RK Enterprises",
    phone: s.invoice_phone || "+91 8452823804",
    email: s.invoice_email || "help@glymee.com",
    website: s.invoice_website || "www.glymee.com",
  };

  const pdf = await generateCgmsReportPdf(data, business);

  const safeName = report.patientName.replace(/[^a-zA-Z0-9]/g, "-");
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="CGMS-Report-${safeName}.pdf"`,
    },
  });
}
