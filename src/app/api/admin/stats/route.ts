import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { patients, appointments } from "@/db/schema";
import { sql, eq, and } from "drizzle-orm";

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

  const [{ completed }] = await db
    .select({ completed: sql<number>`count(*)` })
    .from(patients)
    .where(eq(patients.status, "completed"));

  const [{ totalCollection }] = await db
    .select({ totalCollection: sql<number>`coalesce(sum(${patients.fee}), 0)` })
    .from(patients);

  const today = new Date().toISOString().split("T")[0];

  const [{ appointmentsToday }] = await db
    .select({ appointmentsToday: sql<number>`count(*)` })
    .from(appointments)
    .where(and(eq(appointments.scheduledDate, today), eq(appointments.type, "appointment")));

  const [{ followUpsDue }] = await db
    .select({ followUpsDue: sql<number>`count(*)` })
    .from(appointments)
    .where(and(eq(appointments.scheduledDate, today), eq(appointments.type, "follow_up")));

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
    overview: { total, active, pending, inactive, completed },
    totalCollection,
    appointmentsToday,
    followUpsDue,
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
