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
const INK: [number, number, number] = [40, 40, 40];

const MARGIN = 14;
const PAGE_W = 210;
const PAGE_H = 297;

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

function sectionTitle(doc: jsPDF, text: string, x: number, y: number) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...TEAL);
  doc.text(text.toUpperCase(), x, y);
}

function bodyText(doc: jsPDF, text: string, x: number, y: number) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...INK);
  doc.text(text, x, y);
}

export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const contentW = PAGE_W - 2 * MARGIN;

  // ---- Header band ----
  doc.setFillColor(...TEAL);
  doc.rect(0, 0, PAGE_W, 42, "F");
  doc.setFillColor(...ACCENT);
  doc.rect(0, 42, PAGE_W, 1.4, "F");

  try {
    doc.addImage(loadPngDataUrl("Glymee_name.png"), "PNG", MARGIN, 13, 46, 12.4);
  } catch {
    /* name image optional */
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text(data.businessName, PAGE_W - MARGIN, 14, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(`GSTIN: ${data.gstin}`, PAGE_W - MARGIN, 21, { align: "right" });
  doc.text(`Phone: ${data.phone}`, PAGE_W - MARGIN, 27, { align: "right" });
  doc.text(`Email: ${data.email}`, PAGE_W - MARGIN, 33, { align: "right" });
  doc.text(`Website: ${data.website}`, PAGE_W - MARGIN, 39, {
    align: "right",
  });

  // ---- Title row ----
  let y = 56;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...TEAL);
  doc.text("TAX INVOICE", MARGIN, y);
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text(`Invoice No: ${data.invoiceNumber}`, PAGE_W - MARGIN, y, {
    align: "right",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(`Invoice Date: ${data.invoiceDate}`, PAGE_W - MARGIN, y + 5.5, {
    align: "right",
  });

  // ---- Bill To ----
  y = 66;
  doc.setFillColor(...LIGHT);
  doc.roundedRect(MARGIN, y, contentW, 26, 2, 2, "F");
  sectionTitle(doc, "Bill To", MARGIN + 5, y + 7);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(data.patientName, MARGIN + 5, y + 15);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  let by = y + 21;
  if (data.patientPhone) {
    doc.text(`Mobile: ${data.patientPhone}`, MARGIN + 5, by);
    by += 5;
  }
  if (data.patientEmail) {
    doc.text(`Email: ${data.patientEmail}`, MARGIN + 5, by);
    by += 5;
  }
  const addrLines = data.patientAddress
    ? (doc.splitTextToSize(data.patientAddress, contentW - 10) as string[])
    : [];
  for (const line of addrLines.slice(0, 1)) {
    if (by <= y + 24) {
      doc.text(line as string, MARGIN + 5, by);
    }
    by += 5;
  }

  // ---- Services table ----
  y = 100;
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["#", "Service Description", "Qty", "Rate (Rs.)", "Amount (Rs.)"]],
    body: data.items.map((it, i) => [
      String(i + 1),
      it.description || "-",
      String(it.qty || 0),
      fmt(it.rate || 0),
      fmt((it.qty || 0) * (it.rate || 0)),
    ]),
    columnStyles: {
      0: { cellWidth: 10 },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 34, halign: "right" },
      4: { cellWidth: 36, halign: "right" },
    },
    styles: { fontSize: 9, cellPadding: 3, textColor: INK },
    headStyles: { fillColor: TEAL, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: LIGHT },
    theme: "striped",
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
    .finalY + 8;

  // ---- Bottom boxes (payment info left, summary right) ----
  const boxH = 76;
  if (y + boxH > PAGE_H - 18) {
    doc.addPage();
    y = 20;
  }
  const leftW = 96;
  const rightW = contentW - leftW - 6;
  const leftX = MARGIN;
  const rightX = MARGIN + leftW + 6;

  // Payment Summary (right)
  doc.setFillColor(...LIGHT);
  doc.roundedRect(rightX, y, rightW, boxH, 2, 2, "F");
  sectionTitle(doc, "Payment Summary", rightX + 5, y + 8);

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

  let sy = y + 15;
  doc.setFontSize(8.5);
  for (const row of summaryRows) {
    const isGrand = row.bold && row.label === "Grand Total";
    if (isGrand) {
      doc.setFillColor(...TEAL);
      doc.rect(rightX, sy - 5, rightW, 8.5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
    } else {
      doc.setFont("helvetica", row.bold ? "bold" : "normal");
      doc.setTextColor(...(row.bold ? INK : MUTED));
    }
    doc.text(row.label, rightX + 5, sy);
    doc.text(row.value, rightX + rightW - 5, sy, { align: "right" });
    sy += 7.2;
  }

  // Payment Information (left)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...TEAL);
  doc.roundedRect(leftX, y, leftW, boxH, 2, 2, "FD");
  sectionTitle(doc, "Payment Information", leftX + 5, y + 8);

  let px = y + 16;

  if (data.upiId) {
    const qrDataUrl = await QRCode.toDataURL(
      upiUri(data.upiId, data.businessName, data.grandTotal),
      { errorCorrectionLevel: "M", margin: 1, width: 400 }
    );
    doc.addImage(qrDataUrl, "PNG", leftX + 5, px, 26, 26);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...INK);
    doc.text("Scan to pay via UPI", leftX + 36, px + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    const upiLines = doc.splitTextToSize(
      `UPI ID: ${data.upiId}`,
      leftW - 46
    ) as string[];
    upiLines.slice(0, 3).forEach((line, i) => {
      doc.text(line as string, leftX + 36, px + 13 + i * 4.5);
    });
    doc.text(
      `Amount: ${fmt(data.grandTotal)}`,
      leftX + 36,
      px + 13 + upiLines.slice(0, 3).length * 4.5 + 1
    );
    px += 30;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...INK);
  doc.text(`Payment Method: ${data.paymentMethod}`, leftX + 5, px + 3);

  const bankLines: string[] = [];
  if (data.bankName) bankLines.push(`Bank: ${data.bankName}`);
  if (data.bankAccount) bankLines.push(`A/C No: ${data.bankAccount}`);
  if (data.bankIfsc) bankLines.push(`IFSC: ${data.bankIfsc}`);
  if (bankLines.length === 0) {
    bankLines.push("Payable at the clinic / as per arrangement.");
  }

  let bky = px + 10;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...INK);
  doc.text("Bank Details", leftX + 5, bky);
  bky += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.setFontSize(8);
  for (const line of bankLines) {
    const wrapped = doc.splitTextToSize(line, leftW - 12) as string[];
    for (const wl of wrapped) {
      if (bky <= y + boxH - 5) doc.text(wl as string, leftX + 5, bky);
      bky += 4.5;
    }
  }

  if (data.paymentNote) {
    bky += 2;
    const noteLines = doc.splitTextToSize(
      `Note: ${data.paymentNote}`,
      leftW - 12
    ) as string[];
    noteLines.slice(0, 2).forEach((wl) => {
      if (bky <= y + boxH - 5) doc.text(wl as string, leftX + 5, bky);
      bky += 4.5;
    });
  }

  // ---- Footer on every page ----
  const footer = (page: number) => {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text("Thank you for choosing Glymee.", PAGE_W / 2, PAGE_H - 15, {
      align: "center",
    });
    const terms = doc.splitTextToSize(data.paymentTerms, PAGE_W - 30) as string[];
    terms.slice(0, 1).forEach((line) => {
      doc.text(line as string, PAGE_W / 2, PAGE_H - 11, { align: "center" });
    });
    doc.text(
      "This is a computer generated invoice and does not require any signature.",
      PAGE_W / 2,
      PAGE_H - 7,
      { align: "center" }
    );
    doc.setFontSize(7.5);
    doc.text(
      `Page ${page} of ${doc.getNumberOfPages()}`,
      PAGE_W - MARGIN,
      PAGE_H - 7,
      { align: "right" }
    );
  };

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    footer(p);
  }

  return Buffer.from(doc.output("arraybuffer"));
}
