import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  type BusinessInfo,
  createReportDoc,
  softBox,
  sectionHeading,
  paragraph,
  bulletList,
  kvLine,
  brandFooter,
  TEAL,
  INK,
  MUTED,
  MARGIN,
  PAGE_H,
  CONTENT_W,
} from "./report-pdf-shared";

export interface CgmsReportData {
  patientName: string;
  period: string;
  duration: string;
  clinicalBackground: string;
  glucoseOverview: {
    avgGlucose: string;
    gmi: string;
    tir: string;
    tar: string;
    tbr: string;
    cv: string;
    lowest: string;
    highest: string;
    dataCoverage: string;
  };
  healthScore: { score: string; interpretation: string; commentary: string };
  patternAnalysis: {
    morningPattern: string;
    morningObservation: string;
    afternoonObservation: string;
    nightPattern: string;
    nightObservation: string;
  };
  dawnPhenomenon: string;
  keyFindings: { goingWell: string; areasForAttention: string };
  actionPlan: {
    foodGoal: string;
    foodRecommendations: string;
    walkingTarget: string;
    movement: string;
    strength: string;
    sleepTarget: string;
    sleepRecommendations: string;
    stressTarget: string;
    stressRecommendations: string;
  };
  summary: string;
  nextGoals: string;
  conclusion: string;
}

function ensure(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_H - 20) {
    doc.addPage();
    return 18;
  }
  return y;
}

function subheading(doc: jsPDF, text: string, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  doc.text(text, MARGIN, y);
  return y + 5;
}

export async function generateCgmsReportPdf(
  data: CgmsReportData,
  business: BusinessInfo
): Promise<Buffer> {
  const doc = createReportDoc(business);
  let y = 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...TEAL);
  doc.text("PERSONALIZED 14-DAY CGMS INSIGHT REPORT", MARGIN, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  doc.text(`Report Date: ${today}`, MARGIN + CONTENT_W, y, { align: "right" });
  y += 5;

  const boxH = 22;
  y = softBox(doc, "Patient Details", MARGIN, y, CONTENT_W, boxH);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  doc.text(`Patient Name: ${data.patientName}`, MARGIN + 5, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`Period: ${data.period}  |  Duration: ${data.duration}`, MARGIN + 5, y + 5.5);
  y += boxH + 4;

  y = ensure(doc, y, 14);
  y = sectionHeading(doc, "B. CLINICAL BACKGROUND", y);
  y = paragraph(doc, data.clinicalBackground, y);

  y = ensure(doc, y, 60);
  y = sectionHeading(doc, "C. GLUCOSE OVERVIEW", y);
  const ov = data.glucoseOverview;
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    styles: { fontSize: 9 },
    headStyles: { fillColor: TEAL, textColor: 255 },
    theme: "grid",
    head: [["Metric", "Value"]],
    body: [
      ["Average Glucose", `${ov.avgGlucose} mg/dL`],
      ["GMI (CGM-derived estimate)", `${ov.gmi}%`],
      ["Time in Range", `${ov.tir}%`],
      ["Time Above Range", `${ov.tar}%`],
      ["Time Below Range", `${ov.tbr}%`],
      ["Glucose Variability (CV)", `${ov.cv}%`],
      ["Lowest Glucose", `${ov.lowest} mg/dL`],
      ["Highest Glucose", `${ov.highest} mg/dL`],
      ...(ov.dataCoverage ? [["Data Coverage", `${ov.dataCoverage}%`]] : []),
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 7;

  y = ensure(doc, y, 20);
  y = sectionHeading(doc, "D. GLYMEE GLUCOSE HEALTH SCORE", y);
  y = kvLine(doc, "Overall Score", `${data.healthScore.score}/100`, y);
  y = kvLine(doc, "Interpretation", data.healthScore.interpretation, y);
  y = paragraph(doc, data.healthScore.commentary, y);

  y = ensure(doc, y, 14);
  y = sectionHeading(doc, "E. GLUCOSE PATTERN ANALYSIS", y);
  y = subheading(doc, "1. Morning", y);
  y = paragraph(doc, data.patternAnalysis.morningPattern, y);
  y = paragraph(doc, data.patternAnalysis.morningObservation, y);

  y = subheading(doc, "2. Afternoon", y);
  y = paragraph(doc, data.patternAnalysis.afternoonObservation, y);

  y = subheading(doc, "3. Evening / Night", y);
  y = paragraph(doc, data.patternAnalysis.nightPattern, y);
  y = paragraph(doc, data.patternAnalysis.nightObservation, y);

  y = ensure(doc, y, 14);
  y = sectionHeading(doc, "F. DAWN PHENOMENON ANALYSIS", y);
  y = paragraph(doc, data.dawnPhenomenon, y);

  y = ensure(doc, y, 14);
  y = sectionHeading(doc, "G. KEY FINDINGS", y);
  y = subheading(doc, "What Is Going Well", y);
  y = bulletList(doc, data.keyFindings.goingWell, y);
  y = ensure(doc, y, 10);
  y = subheading(doc, "Areas Requiring Attention", y);
  y = bulletList(doc, data.keyFindings.areasForAttention, y);

  y = ensure(doc, y, 14);
  y = sectionHeading(doc, "H. PERSONALISED GLYMEE ACTION PLAN", y);
  y = subheading(doc, "1. FOOD & NUTRITION", y);
  y = kvLine(doc, "Primary Goal", data.actionPlan.foodGoal, y);
  y = bulletList(doc, data.actionPlan.foodRecommendations, y);

  y = ensure(doc, y, 14);
  y = subheading(doc, "2. PHYSICAL ACTIVITY", y);
  y = kvLine(doc, "Daily Target", data.actionPlan.walkingTarget, y);
  y = kvLine(doc, "Movement", data.actionPlan.movement, y);
  y = kvLine(doc, "Strength Training", data.actionPlan.strength, y);

  y = ensure(doc, y, 14);
  y = subheading(doc, "3. SLEEP", y);
  y = kvLine(doc, "Target", data.actionPlan.sleepTarget, y);
  y = bulletList(doc, data.actionPlan.sleepRecommendations, y);

  y = ensure(doc, y, 14);
  y = subheading(doc, "4. STRESS & MENTAL WELL-BEING", y);
  y = kvLine(doc, "Daily Target", data.actionPlan.stressTarget, y);
  y = bulletList(doc, data.actionPlan.stressRecommendations, y);

  y = ensure(doc, y, 14);
  y = sectionHeading(doc, "I. GLYMEE SUMMARY", y);
  y = paragraph(doc, data.summary, y);

  y = ensure(doc, y, 14);
  y = sectionHeading(doc, "J. NEXT GOALS", y);
  y = bulletList(doc, data.nextGoals, y);

  y = ensure(doc, y, 14);
  y = sectionHeading(doc, "GLYMEE CONCLUSION", y);
  y = paragraph(doc, data.conclusion, y);

  brandFooter(doc, { generatedFor: data.patientName });
  return Buffer.from(doc.output("arraybuffer"));
}
