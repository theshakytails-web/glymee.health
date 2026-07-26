import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { consultations } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await request.json();

  if (!["new", "contacted", "converted", "closed"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await db
    .update(consultations)
    .set({ status })
    .where(eq(consultations.id, id));

  return NextResponse.json({ success: true });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const result = await db
    .select()
    .from(consultations)
    .where(eq(consultations.id, id))
    .limit(1);

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(result[0]);
}
