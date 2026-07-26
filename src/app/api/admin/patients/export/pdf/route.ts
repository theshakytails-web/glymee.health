import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { patients } from "@/db/schema";
import { sql } from "drizzle-orm";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { patientIds } = await request.json();

  let data;
  if (patientIds && patientIds.length > 0) {
    data = await db
      .select()
      .from(patients)
      .where(sql`${patients.id} IN ${patientIds}`);
  } else {
    data = await db.select().from(patients);
  }

  const doc = new jsPDF("l", "mm", "a4");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(0, 100, 124);
  doc.text("Glymee Health - Patient Report", 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 28);
  doc.text(`Total Patients: ${data.length}`, 14, 34);

  const tableData = data.map((p) => [
    p.fullName,
    String(p.age),
    p.gender,
    p.email,
    p.phone,
    `${p.city}, ${p.state}`,
    p.diabetesType || "-",
    p.status,
  ]);

  autoTable(doc, {
    startY: 40,
    head: [
      [
        "Name",
        "Age",
        "Gender",
        "Email",
        "Phone",
        "Location",
        "Diabetes Type",
        "Status",
      ],
    ],
    body: tableData,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [0, 100, 124], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 249, 251] },
  });

  const pdfBytes = doc.output("arraybuffer");
  return new Response(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="glymee-patients-${new Date().toISOString().split("T")[0]}.pdf"`,
    },
  });
}
