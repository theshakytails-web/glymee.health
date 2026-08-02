import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { patients } from "@/db/schema";
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
        like(patients.fullName, `%${search}%`),
        like(patients.email, `%${search}%`),
        like(patients.phone, `%${search}%`),
        like(patients.city, `%${search}%`)
      )
    );
  }
  if (status && ["active", "inactive", "pending", "completed"].includes(status)) {
    conditions.push(eq(patients.status, status as any));
  }

  const whereClause =
    conditions.length > 0 ? and(...(conditions as any[])) : undefined;

  const allPatients = await db
    .select()
    .from(patients)
    .where(whereClause)
    .orderBy(desc(patients.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ count: total }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(patients)
    .where(whereClause);

  return NextResponse.json({
    patients: allPatients,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();
  const now = new Date();

  const age = data.age === undefined || data.age === null || data.age === ""
    ? NaN
    : parseInt(data.age);
  if (Number.isNaN(age) || !Number.isInteger(age) || age < 1 || age > 150) {
    return NextResponse.json(
      { error: "Age must be a whole number between 1 and 150" },
      { status: 400 }
    );
  }

  const fee = data.fee === undefined || data.fee === null || data.fee === ""
    ? 0
    : parseFloat(data.fee);
  if (Number.isNaN(fee) || fee < 0) {
    return NextResponse.json(
      { error: "Fee must be a non-negative number" },
      { status: 400 }
    );
  }

  const id = crypto.randomUUID();
  await db.insert(patients).values({
    id,
    fullName: data.fullName,
    age,
    gender: data.gender,
    email: data.email,
    phone: data.phone,
    city: data.city,
    state: data.state,
    address: data.address || null,
    occupation: data.occupation || null,
    maritalStatus: data.maritalStatus || null,
    religion: data.religion || null,
    education: data.education || null,
    chiefComplaint: data.chiefComplaint || null,
    diagnosis: data.diagnosis || null,
    diabetesType: data.diabetesType || null,
    diagnosisDuration: data.diagnosisDuration || null,
    currentMedications: data.currentMedications || null,
    mainConcern: data.mainConcern || null,
    referralSource: data.referralSource || null,
    additionalNotes: data.additionalNotes || null,
    fee,
    nextFollowUp: data.nextFollowUp || null,
    status: data.status || "pending",
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ success: true, id }, { status: 201 });
}
