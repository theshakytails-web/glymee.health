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

export interface DietMeal {
  name: string;
  timing: string;
  meal: string;
  calories: string;
  protein: string;
  carbs: string;
  fiber: string;
  fat: string;
}

export interface DietPlanData {
  patientName: string;
  planName: string;
  diabetesType: string;
  dietaryGoals: string;
  dailyTargets: { calories: string; protein: string; carbs: string; fiber: string; fat: string };
  meals: DietMeal[];
  foodsRecommended: string;
  foodsToAvoid: string;
  hydration: string;
  mealTimingGuidance: string;
  specialInstructions: string;
  followUp: string;
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

export async function generateDietPlanPdf(
  data: DietPlanData,
  business: BusinessInfo
): Promise<Buffer> {
  const doc = createReportDoc(business);
  let y = 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...TEAL);
  doc.text("PERSONALISED DIABETES DIET PLAN", MARGIN, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  doc.text(`Plan Date: ${today}`, MARGIN + CONTENT_W, y, { align: "right" });
  y += 5;

  const boxH = 22;
  y = softBox(doc, "Patient Details", MARGIN, y, CONTENT_W, boxH);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  doc.text(data.patientName, MARGIN + 5, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(`Diabetes Type: ${data.diabetesType}`, MARGIN + 5, y + 5.5);
  y += boxH + 4;

  y = ensure(doc, y, 30);
  y = sectionHeading(doc, "1. PLAN OVERVIEW", y);
  y = kvLine(doc, "Plan", data.planName, y);
  y = kvLine(doc, "Diabetes Type", data.diabetesType, y);
  y = paragraph(doc, data.dietaryGoals, y);

  y = ensure(doc, y, 30);
  y = sectionHeading(doc, "2. DAILY TARGETS", y);
  const t = data.dailyTargets;
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    styles: { fontSize: 9 },
    headStyles: { fillColor: TEAL, textColor: 255 },
    theme: "grid",
    head: [["Calories", "Protein", "Carbs", "Fiber", "Fat"]],
    body: [[
      `${t.calories || "–"} kcal`,
      `${t.protein || "–"} g`,
      `${t.carbs || "–"} g`,
      `${t.fiber || "–"} g`,
      `${t.fat || "–"} g`,
    ]],
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7;

  y = ensure(doc, y, 14);
  y = sectionHeading(doc, "3. MEAL PLAN", y);
  data.meals.forEach((meal, idx) => {
    y = ensure(doc, y, 28);
    y = subheading(doc, `3.${idx + 1}  ${meal.name} (${meal.timing})`, y);
    y = paragraph(doc, meal.meal, y);
    const macroLine = `Calories ${meal.calories || "–"} kcal  ·  Protein ${meal.protein || "–"} g  ·  Carbs ${meal.carbs || "–"} g  ·  Fiber ${meal.fiber || "–"} g  ·  Fat ${meal.fat || "–"} g`;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    const macroLines = doc.splitTextToSize(macroLine, CONTENT_W) as string[];
    for (const line of macroLines) {
      doc.text(line, MARGIN, y);
      y += 3.8;
    }
    y += 2;
  });

  y = ensure(doc, y, 14);
  y = sectionHeading(doc, "4. FOODS TO INCLUDE", y);
  y = bulletList(doc, data.foodsRecommended, y);

  y = ensure(doc, y, 14);
  y = sectionHeading(doc, "5. FOODS TO AVOID", y);
  y = bulletList(doc, data.foodsToAvoid, y);

  y = ensure(doc, y, 14);
  y = sectionHeading(doc, "6. HYDRATION", y);
  y = paragraph(doc, data.hydration, y);

  y = ensure(doc, y, 14);
  y = sectionHeading(doc, "7. MEAL TIMING GUIDANCE", y);
  y = paragraph(doc, data.mealTimingGuidance, y);

  y = ensure(doc, y, 14);
  y = sectionHeading(doc, "8. SPECIAL INSTRUCTIONS", y);
  y = paragraph(doc, data.specialInstructions, y);

  y = ensure(doc, y, 14);
  y = sectionHeading(doc, "9. FOLLOW-UP", y);
  y = paragraph(doc, data.followUp, y);

  brandFooter(doc, { generatedFor: data.patientName });
  return Buffer.from(doc.output("arraybuffer"));
}
