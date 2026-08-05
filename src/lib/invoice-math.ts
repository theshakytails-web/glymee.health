export interface InvoiceLineItem {
  description: string;
  qty: number;
  rate: number;
}

export type GstMode = "cgst_sgst" | "igst" | "none";

export interface InvoiceTotals {
  subtotal: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeInvoiceTotals(
  items: { qty: number; rate: number }[],
  discount: number,
  gstMode: GstMode
): InvoiceTotals {
  const subtotal = round2(
    items.reduce((sum, it) => sum + (it.qty || 0) * (it.rate || 0), 0)
  );
  const taxableAmount = round2(Math.max(0, subtotal - (discount || 0)));
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  if (gstMode === "cgst_sgst") {
    cgst = round2(taxableAmount * 0.09);
    sgst = round2(taxableAmount * 0.09);
  } else if (gstMode === "igst") {
    igst = round2(taxableAmount * 0.18);
  }
  const grandTotal = round2(taxableAmount + cgst + sgst + igst);
  return { subtotal, taxableAmount, cgst, sgst, igst, grandTotal };
}
