import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { patients, appointments, payments } from "@/db/schema";
import { sql, eq, and, ne } from "drizzle-orm";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)` })
      .from(patients);

    let active = 0, pending = 0, inactive = 0, completed = 0;
    try {
      const r = await db.select({ active: sql<number>`count(*)` }).from(patients).where(eq(patients.status, "active"));
      active = r[0].active;
    } catch (e) { console.error("Stats: active count failed", e); }
    try {
      const r = await db.select({ pending: sql<number>`count(*)` }).from(patients).where(eq(patients.status, "pending"));
      pending = r[0].pending;
    } catch (e) { console.error("Stats: pending count failed", e); }
    try {
      const r = await db.select({ inactive: sql<number>`count(*)` }).from(patients).where(eq(patients.status, "inactive"));
      inactive = r[0].inactive;
    } catch (e) { console.error("Stats: inactive count failed", e); }
    try {
      const r = await db.select({ completed: sql<number>`count(*)` }).from(patients).where(eq(patients.status, "completed"));
      completed = r[0].completed;
    } catch (e) { console.error("Stats: completed count failed", e); }

    let totalCollection = 0;
    let appointmentsToday = 0;
    let followUpsDue = 0;
    try {
      const [{ tc }] = await db
        .select({ tc: sql<number>`coalesce(sum(${patients.fee}), 0)` })
        .from(patients);
      totalCollection = tc;
    } catch (e) {
      console.error("Stats: fee sum failed", e);
    }
    try {
      const [{ pc }] = await db
        .select({ pc: sql<number>`coalesce(sum(${payments.amount}), 0)` })
        .from(payments)
        .where(ne(payments.type, "consultation"));
      totalCollection += pc;
    } catch (e) {
      console.error("Stats: payments sum failed", e);
    }
    try {
      const today = new Date().toISOString().split("T")[0];
      const [aptResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(appointments)
        .where(and(eq(appointments.scheduledDate, today), eq(appointments.type, "appointment")));
      appointmentsToday = aptResult.count;
      const [fuResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(appointments)
        .where(and(eq(appointments.scheduledDate, today), eq(appointments.type, "follow_up")));
      followUpsDue = fuResult.count;
    } catch (e) {
      console.error("Stats: appointments query failed", e);
    }

    let diabetesTypes: { type: string | null; count: number }[] = [];
    try {
      diabetesTypes = await db
        .select({
          type: patients.diabetesType,
          count: sql<number>`count(*)`,
        })
        .from(patients)
        .where(sql`${patients.diabetesType} IS NOT NULL AND ${patients.diabetesType} != ''`)
        .groupBy(patients.diabetesType);
    } catch (e) { console.error("Stats: diabetesTypes query failed", e); }

    let genderSplit: { gender: string; count: number }[] = [];
    try {
      genderSplit = await db
        .select({
          gender: patients.gender,
          count: sql<number>`count(*)`,
        })
        .from(patients)
        .groupBy(patients.gender);
    } catch (e) { console.error("Stats: genderSplit query failed", e); }

    let recentPatients: { id: string; fullName: string; status: string; createdAt: Date }[] = [];
    try {
      recentPatients = await db
        .select({
          id: patients.id,
          fullName: patients.fullName,
          status: patients.status,
          createdAt: patients.createdAt,
        })
        .from(patients)
        .orderBy(sql`${patients.createdAt} DESC`)
        .limit(5);
    } catch (e) { console.error("Stats: recentPatients query failed", e); }

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
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
