import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { consultations } from "@/db/schema";
import { and, eq, desc, like, or, sql } from "drizzle-orm";

export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || "20") || 20)
  );
  const offset = (page - 1) * limit;

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        like(consultations.fullName, `%${search}%`),
        like(consultations.email, `%${search}%`),
        like(consultations.phone, `%${search}%`),
        like(consultations.city, `%${search}%`)
      )
    );
  }
  if (status && ["new", "contacted", "converted", "closed"].includes(status)) {
    conditions.push(eq(consultations.status, status as "new" | "contacted" | "converted" | "closed"));
  }

  const whereClause =
    conditions.length > 0 ? and(...(conditions as any[])) : undefined;

  const allConsultations = await db
    .select()
    .from(consultations)
    .where(whereClause)
    .orderBy(desc(consultations.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ count: total }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(consultations)
    .where(whereClause);

  return NextResponse.json({
    consultations: allConsultations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
