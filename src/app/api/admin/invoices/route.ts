import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/db";
import { invoices, patients, settings } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { computeInvoiceTotals, round2, type GstMode } from "@/lib/invoice-math";

const GST_MODES: GstMode[] = ["cgst_sgst", "igst", "none"];

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = parseFloat(value);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

async function nextInvoiceNumber(): Promise<string> {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  try {
    const result = await db
      .insert(settings)
      .values({ key: "invoice_sequence", value: "1", updatedAt: now })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: sql`${settings.value} + 1`, updatedAt: now },
      })
      .returning({ value: settings.value });

    const seq = parseInt(result[0]?.value || "1", 10) || 1;
    return `INV-${stamp}-${String(seq).padStart(4, "0")}`;
  } catch {
    return `INV-${stamp}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  }
}

export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId");

  let query = db
    .select({
      invoice: invoices,
      patientName: patients.fullName,
      patientPhone: patients.phone,
    })
    .from(invoices)
    .leftJoin(patients, eq(invoices.patientId, patients.id));

  if (patientId) {
    query = query.where(eq(invoices.patientId, patientId)) as typeof query;
  }

  const rows = await query.orderBy(desc(invoices.createdAt)).limit(200);

  const list = rows.map(({ invoice, patientName, patientPhone }) => ({
    ...invoice,
    patientName: patientName || null,
    patientPhone: patientPhone || null,
  }));

  return NextResponse.json({ invoices: list });
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const patientId = typeof body.patientId === "string" ? body.patientId : "";

  if (!patientId) {
    return NextResponse.json({ error: "patientId is required" }, { status: 400 });
  }

  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.id, patientId))
    .limit(1);

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const items = Array.isArray(body.items)
    ? body.items
        .map((it: unknown) => {
          const row = (it || {}) as Record<string, unknown>;
          const qty = toNumber(row.qty);
          const rate = toNumber(row.rate);
          return {
            description: String(row.description || "").trim(),
            qty: qty && qty > 0 ? qty : 0,
            rate: rate && rate >= 0 ? rate : 0,
          };
        })
        .filter((it: { qty: number }) => it.qty > 0)
    : [];

  if (items.length === 0) {
    return NextResponse.json(
      { error: "At least one service line item with a quantity is required" },
      { status: 400 }
    );
  }

  const discount = toNumber(body.discount);
  if (discount == null || discount < 0) {
    return NextResponse.json(
      { error: "discount must be a non-negative number" },
      { status: 400 }
    );
  }

  const gstMode: GstMode = GST_MODES.includes(body.gstMode) ? body.gstMode : "cgst_sgst";

  const amountPaid = toNumber(body.amountPaid);
  if (amountPaid == null || amountPaid < 0) {
    return NextResponse.json(
      { error: "amountPaid must be a non-negative number" },
      { status: 400 }
    );
  }

  const totals = computeInvoiceTotals(items, discount, gstMode);
  const balanceDue = round2(Math.max(0, totals.grandTotal - amountPaid));

  const invoiceDate =
    typeof body.invoiceDate === "string" && body.invoiceDate
      ? body.invoiceDate
      : new Date().toLocaleDateString("en-IN");

  const id = crypto.randomUUID();
  const invoiceNumber = await nextInvoiceNumber();

  await db.insert(invoices).values({
    id,
    invoiceNumber,
    patientId,
    itemsJson: JSON.stringify(items),
    subtotal: totals.subtotal,
    discount,
    taxableAmount: totals.taxableAmount,
    gstMode,
    cgst: totals.cgst,
    sgst: totals.sgst,
    igst: totals.igst,
    grandTotal: totals.grandTotal,
    amountPaid,
    balanceDue,
    paymentMethod: typeof body.paymentMethod === "string" ? body.paymentMethod || "UPI" : "UPI",
    paymentNote: typeof body.paymentNote === "string" ? body.paymentNote : "",
    invoiceDate,
    createdAt: new Date(),
  });

  return NextResponse.json(
    {
      success: true,
      invoice: {
        id,
        invoiceNumber,
        patientId,
        invoiceDate,
        grandTotal: totals.grandTotal,
        amountPaid,
        balanceDue,
      },
    },
    { status: 201 }
  );
}
