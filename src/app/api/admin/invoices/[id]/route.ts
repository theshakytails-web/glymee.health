import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { invoices, deleteInvoices, patients } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, id))
    .limit(1);

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.id, invoice.patientId))
    .limit(1);

  await db.insert(deleteInvoices).values({
    id: crypto.randomUUID(),
    originalInvoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    patientId: invoice.patientId,
    patientName: patient?.fullName ?? null,
    patientPhone: patient?.phone ?? null,
    itemsJson: invoice.itemsJson,
    subtotal: invoice.subtotal,
    discount: invoice.discount,
    taxableAmount: invoice.taxableAmount,
    gstMode: invoice.gstMode,
    cgst: invoice.cgst,
    sgst: invoice.sgst,
    igst: invoice.igst,
    grandTotal: invoice.grandTotal,
    amountPaid: invoice.amountPaid,
    balanceDue: invoice.balanceDue,
    paymentMethod: invoice.paymentMethod,
    paymentNote: invoice.paymentNote,
    invoiceDate: invoice.invoiceDate,
    deletedBy: admin.name || admin.email || null,
    deletedAt: new Date(),
  });

  await db.delete(invoices).where(eq(invoices.id, id));

  return NextResponse.json({ success: true, deletedInvoiceId: id });
}
