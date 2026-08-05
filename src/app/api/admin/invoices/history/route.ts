import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { invoices, deleteInvoices, patients } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const created = await db
    .select({
      invoice: invoices,
      patientName: patients.fullName,
      patientPhone: patients.phone,
    })
    .from(invoices)
    .leftJoin(patients, eq(invoices.patientId, patients.id))
    .orderBy(desc(invoices.createdAt))
    .limit(500);

  const deleted = await db
    .select()
    .from(deleteInvoices)
    .orderBy(desc(deleteInvoices.deletedAt))
    .limit(500);

  return NextResponse.json({
    created: created.map(({ invoice, patientName, patientPhone }) => ({
      ...invoice,
      patientName: patientName || null,
      patientPhone: patientPhone || null,
    })),
    deleted,
  });
}
