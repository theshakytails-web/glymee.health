import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { patients } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(patients);

  const [{ active }] = await db
    .select({ active: sql<number>`count(*)` })
    .from(patients)
    .where(eq(patients.status, "active"));

  const [{ pending }] = await db
    .select({ pending: sql<number>`count(*)` })
    .from(patients)
    .where(eq(patients.status, "pending"));

  const [{ inactive }] = await db
    .select({ inactive: sql<number>`count(*)` })
    .from(patients)
    .where(eq(patients.status, "inactive"));

  const diabetesTypes = await db
    .select({
      type: patients.diabetesType,
      count: sql<number>`count(*)`,
    })
    .from(patients)
    .where(sql`${patients.diabetesType} IS NOT NULL AND ${patients.diabetesType} != ''`)
    .groupBy(patients.diabetesType);

  const genderSplit = await db
    .select({
      gender: patients.gender,
      count: sql<number>`count(*)`,
    })
    .from(patients)
    .groupBy(patients.gender);

  const recentPatients = await db
    .select({
      id: patients.id,
      fullName: patients.fullName,
      status: patients.status,
      createdAt: patients.createdAt,
    })
    .from(patients)
    .orderBy(sql`${patients.createdAt} DESC`)
    .limit(5);

  return NextResponse.json({
    overview: { total, active, pending, inactive },
    diabetesTypes: diabetesTypes.map((d) => ({
      name: d.type || "Unknown",
      value: d.count,
    })),
    genderSplit: genderSplit.map((g) => ({
      name: g.gender,
      value: g.count,
    })),
    recentPatients,
  });
}
