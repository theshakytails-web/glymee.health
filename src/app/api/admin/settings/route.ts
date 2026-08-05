import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

const DEFAULT_SETTINGS: Record<string, string> = {
  bloodPressureSystolic_max: "130",
  bloodPressureDiastolic_max: "80",
  heartRate_min: "60",
  heartRate_max: "100",
  bmi_min: "18.5",
  bmi_max: "24.9",
  hba1c_max: "7.0",
  glucoseFasting_max: "126",
  glucosePostPrandial_max: "180",
  invoice_business_name: "RK Enterprises",
  invoice_gstin: "27CVDPP6588E1Z3",
  invoice_phone: "+91 8452823804",
  invoice_email: "help@glymee.com",
  invoice_website: "www.glymee.com",
  invoice_address: "Pune, Maharashtra, India",
  invoice_upi_id: "",
  invoice_bank_name: "",
  invoice_bank_account: "",
  invoice_bank_ifsc: "",
  invoice_payment_terms: "Payment is due within 7 days of the invoice date.",
};

async function getSettingsMap(): Promise<Record<string, string>> {
  const rows = await db.select().from(settings);
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let map = await getSettingsMap();

  const missing: { key: string; value: string }[] = [];
  for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
    if (!(k in map)) {
      map[k] = v;
      missing.push({ key: k, value: v });
    }
  }

  if (missing.length > 0) {
    const now = new Date();
    for (const m of missing) {
      await db.insert(settings).values({ key: m.key, value: m.value, updatedAt: now }).onConflictDoNothing();
    }
  }

  return NextResponse.json({ settings: map });
}

export async function PUT(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const now = new Date();

  for (const [key, value] of Object.entries(body)) {
    if (typeof value === "string" && key in DEFAULT_SETTINGS) {
      await db.insert(settings).values({ key, value, updatedAt: now }).onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: now } });
    }
  }

  return NextResponse.json({ success: true });
}
