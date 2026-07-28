import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { clinicalReports } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [report] = await db
    .select()
    .from(clinicalReports)
    .where(eq(clinicalReports.id, id))
    .limit(1);

  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ report });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(clinicalReports).where(eq(clinicalReports.id, id));

  return NextResponse.json({ success: true });
}
