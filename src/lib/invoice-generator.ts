import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  computeInvoiceTotals,
  round2,
  type GstMode,
  type InvoiceLineItem,
} from "./invoice-math";

export { computeInvoiceTotals, round2, type GstMode, type InvoiceLineItem };

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  businessName: string;
  gstin: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientAddress: string;
  items: InvoiceLineItem[];
  subtotal: number;
  discount: number;
  taxableAmount: number;
  gstMode: GstMode;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: string;
  paymentNote: string;
  upiId: string;
  bankName: string;
  bankAccount: string;
  bankIfsc: string;
  paymentTerms: string;
}

const TEAL: [number, number, number] = [0, 100, 124];
const ACCENT: [number, number, number] = [141, 212, 230];
const LIGHT: [number, number, number] = [240, 249, 251];
const MUTED: [number, number, number] = [110, 110, 110];
const INK: [number, number, number] = [30, 30, 30];

function fmt(n: number): string {
  const [i, d] = round2(n || 0).toFixed(2).split(".");
  const grouped = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `Rs. ${grouped}.${d}`;
}

function loadPngDataUrl(file: string): string {
  const buf = readFileSync(join(process.cwd(), "public", file));
  return `data:image/png;base64,${buf.toString("base64")}`;
}

function upiUri(upiId: string, payeeName: string, amount: number): string {
  return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amount.toFixed(2)}&cu=INR`;
}

export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentW = pageW - 2 * margin;

  // Header band
  doc.setFillColor(...TEAL);
  doc.rect(0, 0, pageW, 44, "F");
  doc.setFillColor(...ACCENT);
  doc.rect(0, 44, pageW, 1.2, "F");

  try {
    doc.addImage(loadPngDataUrl("Glymee_logo_1.png"), "PNG", 14, 8, 18, 12);
  } catch {
    /* logo optional */
  }
  try {
    doc.addImage(loadPngDataUrl("Glymee_name.png"), "PNG", 34, 9.5, 46, 12.4);
  } catch {
    /* logo optional */
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(data.businessName, pageW - margin, 12, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`GSTIN: ${data.gstin}`, pageW - margin, 20, { align: "right" });
  doc.text(`Phone: ${data.phone}`, pageW - margin, 26, { align: "right" });
  doc.text(`Email: ${data.email}`, pageW - margin, 31, { align: "right" });
  doc.text(`Website: ${data.website}`, pageW - margin, 36, { align: "right" });

  let y = 54;

  // Title + meta
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...TEAL);
  doc.text("TAX INVOICE", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text("Service / Goods Invoice", margin, y + 5);

  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  doc.text(`Invoice No: ${data.invoiceNumber}`, pageW - margin, 54, {
    align: "right",
  });
  doc.setTextColor(...MUTED);
  doc.text(`Invoice Date: ${data.invoiceDate}`, pageW - margin, 60, {
    align: "right",
  });

  y = 68;

  // Bill To box
  doc.setFillColor(...LIGHT);
  doc.roundedRect(margin, y, contentW, 30, 2, 2, "F");
  doc.setTextColor(...TEAL);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("BILL TO", margin + 5, y + 7);
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(data.patientName, margin + 5, y + 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const billLines: string[] = [];
  if (data.patientPhone) billLines.push(`Mobile: ${data.patientPhone}`);
  if (data.patientEmail) billLines.push(`Email: ${data.patientEmail}`);
  const addrLines = data.patientAddress
    ? (doc.splitTextToSize(data.patientAddress, contentW - 130) as string[])
    : [];
  let by = y + 22;
  for (const line of billLines) {
    doc.text(line, margin + 5, by);
    by += 5;
  }
  if (addrLines.length > 0) {
    for (const line of addrLines.slice(0, 2)) {
      doc.text(line, margin + 5, by);
      by += 5;
    }
  }

  y += 36;

  // Services table
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["#", "Service Description", "Qty", "Rate (Rs.)", "Amount (Rs.)"]],
    body: data.items.map((it, i) => [
      String(i + 1),
      it.description || "-",
      String(it.qty || 0),
      fmt(it.rate || 0),
      fmt((it.qty || 0) * (it.rate || 0)),
    ]),
    columnStyles: {
      0: { cellWidth: 12 },
      2: { cellWidth: 18, halign: "center" },
      3: { cellWidth: 34, halign: "right" },
      4: { cellWidth: 36, halign: "right" },
    },
    styles: { fontSize: 9, cellPadding: 3, textColor: [40, 40, 40] },
    headStyles: { fillColor: TEAL, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: LIGHT },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
    .finalY + 10;

  // Payment info (left) + summary (right)
  const leftW = 96;
  const rightW = contentW - leftW - 6;
  const boxH = 82;

  if (y + boxH > pageH - 18) {
    doc.addPage();
    y = 18;
  }

  // Payment summary (right box)
  doc.setFillColor(...LIGHT);
  doc.roundedRect(margin + leftW + 6, y, rightW, boxH, 2, 2, "F");
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.4);
  doc.rect(margin + leftW + 6, y, rightW, boxH);
  doc.setTextColor(...TEAL);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("PAYMENT SUMMARY", margin + leftW + 6 + 5, y + 8);

  const summaryRows: { label: string; value: string; bold?: boolean }[] = [
    { label: "Subtotal", value: fmt(data.subtotal) },
    { label: "Discount", value: `- ${fmt(data.discount)}` },
    { label: "Taxable Amount", value: fmt(data.taxableAmount) },
  ];
  if (data.gstMode === "cgst_sgst") {
    summaryRows.push(
      { label: "CGST (9%)", value: fmt(data.cgst) },
      { label: "SGST (9%)", value: fmt(data.sgst) }
    );
  } else if (data.gstMode === "igst") {
    summaryRows.push({ label: "IGST (18%)", value: fmt(data.igst) });
  }
  summaryRows.push(
    { label: "Grand Total", value: fmt(data.grandTotal), bold: true },
    { label: "Amount Paid", value: `- ${fmt(data.amountPaid)}` },
    { label: "Balance Due", value: fmt(data.balanceDue), bold: true }
  );

  let sy = y + 14;
  doc.setFontSize(9);
  for (const row of summaryRows) {
    doc.setFont("helvetica", row.bold ? "bold" : "normal");
    if (row.bold) {
      doc.setTextColor(...TEAL);
    } else {
      doc.setTextColor(70, 70, 70);
    }
    if (row.bold && row.label === "Grand Total") {
      doc.setFillColor(...TEAL);
      doc.rect(margin + leftW + 6, sy - 5, rightW, 9, "F");
      doc.setTextColor(255, 255, 255);
    }
    doc.text(row.label, margin + leftW + 6 + 5, sy);
    doc.text(row.value, margin + leftW + 6 + rightW - 5, sy, {
      align: "right",
    });
    sy += 8;
  }

  // Payment information (left box)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...TEAL);
  doc.roundedRect(margin, y, leftW, boxH, 2, 2, "FD");
  doc.setTextColor(...TEAL);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("PAYMENT INFORMATION", margin + 5, y + 8);

  doc.setFontSize(8.5);
  doc.setTextColor(70, 70, 70);
  doc.setFont("helvetica", "bold");
  doc.text(`Payment Method: ${data.paymentMethod}`, margin + 5, y + 16);

  let qrY = y + 16;
  if (data.upiId) {
    const qrDataUrl = await QRCode.toDataURL(
      upiUri(data.upiId, data.businessName, data.grandTotal),
      { errorCorrectionLevel: "M", margin: 1, width: 400 }
    );
    doc.addImage(qrDataUrl, "PNG", margin + 5, qrY + 4, 30, 30);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    const upiLines = doc.splitTextToSize(
      `UPI ID: ${data.upiId}`,
      leftW - 50
    ) as string[];
    doc.setFontSize(8);
    upiLines.slice(0, 3).forEach((line, idx) => {
      doc.text(line as string, margin + 40, qrY + 10 + idx * 4.5);
    });
    qrY += 38;
  }
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...INK);
  doc.text("Bank Details", margin + 5, qrY + 2);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  let px = qrY + 8;
  const bankLines: string[] = [];
  if (data.bankName) bankLines.push(`Bank: ${data.bankName}`);
  if (data.bankAccount) bankLines.push(`A/C No: ${data.bankAccount}`);
  if (data.bankIfsc) bankLines.push(`IFSC: ${data.bankIfsc}`);
  if (bankLines.length === 0) bankLines.push("Payable at the clinic / as per arrangement.");
  doc.setFontSize(8);
  for (const line of bankLines) {
    const wrapped = doc.splitTextToSize(line, leftW - 12) as string[];
    wrapped.forEach((wl) => {
      if (px <= y + boxH - 4) doc.text(wl as string, margin + 5, px);
      px += 4.5;
    });
  }
  if (data.paymentNote) {
    px += 2;
    const noteLines = doc.splitTextToSize(
      `Note: ${data.paymentNote}`,
      leftW - 12
    ) as string[];
    noteLines.slice(0, 2).forEach((wl) => {
      if (px <= y + boxH - 4) doc.text(wl as string, margin + 5, px);
      px += 4.5;
    });
  }

  // Footer on every page
  const footer = (page: number) => {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text("Thank you for choosing Glymee.", pageW / 2, pageH - 16, {
      align: "center",
    });
    doc.text(data.paymentTerms, pageW / 2, pageH - 12, { align: "center" });
    doc.text(
      "This is a computer generated invoice and does not require any signature.",
      pageW / 2,
      pageH - 8,
      { align: "center" }
    );
    doc.setFontSize(7.5);
    doc.text(`Page ${page} of ${doc.getNumberOfPages()}`, pageW - margin, pageH - 8, {
      align: "right",
    });
  };

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    footer(p);
  }

  return Buffer.from(doc.output("arraybuffer"));
}
