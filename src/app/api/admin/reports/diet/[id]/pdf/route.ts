import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { dietPlans, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateDietPlanPdf, type DietPlanData } from "@/lib/diet-plan-generator";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const [plan] = await db
    .select()
    .from(dietPlans)
    .where(eq(dietPlans.id, id))
    .limit(1);

  if (!plan) {
    return NextResponse.json({ error: "Diet plan not found" }, { status: 404 });
  }

  const settingsRows = await db.select().from(settings);
  const s: Record<string, string> = {};
  for (const row of settingsRows) s[row.key] = row.value;

  const parsed = (() => {
    try {
      return JSON.parse(plan.planData || "{}") as Partial<DietPlanData>;
    } catch {
      return {} as Partial<DietPlanData>;
    }
  })();

  const data: DietPlanData = {
    patientName: plan.patientName,
    planName: plan.planName || "",
    diabetesType: parsed.diabetesType || "",
    dietaryGoals: parsed.dietaryGoals || "",
    dailyTargets: parsed.dailyTargets || { calories: "", protein: "", carbs: "", fiber: "", fat: "" },
    meals: Array.isArray(parsed.meals) ? parsed.meals : [],
    foodsRecommended: parsed.foodsRecommended || "",
    foodsToAvoid: parsed.foodsToAvoid || "",
    hydration: parsed.hydration || "",
    mealTimingGuidance: parsed.mealTimingGuidance || "",
    specialInstructions: parsed.specialInstructions || "",
    followUp: parsed.followUp || "",
  };

  const pdf = await generateDietPlanPdf(data, {
    name: s.invoice_business_name || "RK Enterprises",
    phone: s.invoice_phone || "+91 8452823804",
    email: s.invoice_email || "help@glymee.com",
    website: s.invoice_website || "www.glymee.com",
  });

  const safeName = plan.patientName.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "-");

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Diet-Plan-${safeName}.pdf"`,
    },
  });
}
