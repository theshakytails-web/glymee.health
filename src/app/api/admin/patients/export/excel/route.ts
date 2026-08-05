import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { patients } from "@/db/schema";
import { inArray } from "drizzle-orm";
import * as XLSX from "xlsx";

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { patientIds } = await request.json();

  const ids =
    Array.isArray(patientIds) && patientIds.length > 0
      ? patientIds.filter((id: unknown) => typeof id === "string").slice(0, 5000)
      : null;

  const data = ids && ids.length > 0
    ? await db.select().from(patients).where(inArray(patients.id, ids))
    : await db.select().from(patients).limit(5000);

  const worksheetData = data.map((p) => ({
    "Full Name": p.fullName,
    Age: p.age,
    Gender: p.gender,
    "Marital Status": p.maritalStatus || "",
    Occupation: p.occupation || "",
    Religion: p.religion || "",
    Education: p.education || "",
    Email: p.email,
    Phone: p.phone,
    Address: p.address || "",
    City: p.city,
    State: p.state,
    "Chief Complaint": p.chiefComplaint || "",
    Diagnosis: p.diagnosis || "",
    "Diabetes Type": p.diabetesType || "",
    "Diagnosis Duration": p.diagnosisDuration || "",
    Medications: p.currentMedications || "",
    "Main Concern": p.mainConcern || "",
    "Referral Source": p.referralSource || "",
    "Additional Notes": p.additionalNotes || "",
    "Fee (₹)": p.fee || 0,
    "Next Follow-up": p.nextFollowUp || "",
    Status: p.status,
    "Created At": p.createdAt.toISOString().split("T")[0],
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Patients");

  worksheet["!cols"] = [
    { wch: 20 }, { wch: 5 }, { wch: 8 }, { wch: 14 }, { wch: 20 },
    { wch: 10 }, { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 25 },
    { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 12 },
    { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 25 },
    { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 12 },
  ];

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  return new Response(excelBuffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="glymee-patients-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
}
