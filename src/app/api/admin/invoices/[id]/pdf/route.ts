import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { invoices, patients, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateInvoicePdf, type InvoiceData } from "@/lib/invoice-generator";

export async function GET(
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

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const settingsRows = await db.select().from(settings);
  const s: Record<string, string> = {};
  for (const row of settingsRows) s[row.key] = row.value;

  const items = (() => {
    try {
      return JSON.parse(invoice.itemsJson || "[]");
    } catch {
      return [];
    }
  })();

  const data: InvoiceData = {
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate,
    businessName: s.invoice_business_name || "RK Enterprises",
    gstin: s.invoice_gstin || "27CVDPP6588E1Z3",
    phone: s.invoice_phone || "+91 8452823804",
    email: s.invoice_email || "help@glymee.com",
    website: s.invoice_website || "www.glymee.com",
    address: s.invoice_address || "Pune, Maharashtra, India",
    patientName: patient.fullName,
    patientPhone: patient.phone,
    patientEmail: patient.email,
    patientAddress: [patient.address, patient.city, patient.state]
      .filter(Boolean)
      .join(", "),
    items,
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
    paymentNote: invoice.paymentNote || "",
    upiId: s.invoice_upi_id || "",
    bankName: s.invoice_bank_name || "",
    bankAccount: s.invoice_bank_account || "",
    bankIfsc: s.invoice_bank_ifsc || "",
    paymentTerms:
      s.invoice_payment_terms ||
      "Payment is due within 7 days of the invoice date.",
  };

  const pdf = await generateInvoicePdf(data);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
    },
  });
}
