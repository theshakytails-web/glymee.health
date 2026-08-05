"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { computeInvoiceTotals, round2, type GstMode } from "@/lib/invoice-math";

interface PatientOption {
  id: string;
  fullName: string;
  email: string;
}

interface PatientFull {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  address: string | null;
}

interface LineItem {
  description: string;
  qty: string;
  rate: string;
}

const DEFAULT_ITEMS: LineItem[] = [
  { description: "CGM Sensor", qty: "1", rate: "" },
  { description: "CGM Sensor Installation", qty: "1", rate: "" },
  { description: "Doctor Consultation", qty: "1", rate: "" },
  { description: "Diet Consultation", qty: "1", rate: "" },
  { description: "Monitoring and Reports", qty: "1", rate: "" },
];

const inputClass =
  "w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors";

export default function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string }>;
}) {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [patient, setPatient] = useState<PatientFull | null>(null);
  const [items, setItems] = useState<LineItem[]>(DEFAULT_ITEMS);
  const [discount, setDiscount] = useState("");
  const [gstMode, setGstMode] = useState<GstMode>("cgst_sgst");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentNote, setPaymentNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{
    id: string;
    invoiceNumber: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/admin/auth/me")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(() => fetch("/api/admin/patients?limit=200"))
      .then((r) => r.json())
      .then((data) => setPatients(data.patients || []))
      .catch(() => router.push("/g9x2k7m3q8w-admin"));
  }, [router]);

  useEffect(() => {
    searchParams.then((sp) => {
      if (sp.patientId) setSelectedPatientId(sp.patientId);
    });
  }, [searchParams]);

  useEffect(() => {
    if (!selectedPatientId) {
      setPatient(null);
      return;
    }
    fetch(`/api/admin/patients/${selectedPatientId}`)
      .then((r) => r.json())
      .then((data) => setPatient(data.patient || null))
      .catch(() => setPatient(null));
  }, [selectedPatientId]);

  function setItem(index: number, field: keyof LineItem, value: string) {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it))
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { description: "", qty: "1", rate: "" }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const parsedItems = items.map((it) => ({
    description: it.description,
    qty: parseFloat(it.qty) || 0,
    rate: parseFloat(it.rate) || 0,
  }));
  const totals = computeInvoiceTotals(parsedItems, parseFloat(discount) || 0, gstMode);
  const paid = parseFloat(amountPaid) || 0;
  const balance = round2(Math.max(0, totals.grandTotal - paid));

  function downloadPdf(id: string, name: string) {
    fetch(`/api/admin/invoices/${id}/pdf`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${name || id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => alert("Failed to download invoice PDF."));
  }

  async function handleSave() {
    setError("");
    if (!selectedPatientId) {
      setError("Please select a patient.");
      return;
    }
    if (parsedItems.every((it) => it.qty <= 0)) {
      setError("Add at least one service line item with a quantity.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatientId,
          items: parsedItems,
          discount: parseFloat(discount) || 0,
          gstMode,
          amountPaid: paid,
          paymentMethod,
          paymentNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save invoice");
        return;
      }
      const invoice = data.invoice;
      setCreated({ id: invoice.id, invoiceNumber: invoice.invoiceNumber });
      downloadPdf(invoice.id, invoice.invoiceNumber);
    } catch {
      setError("Network error while saving invoice.");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setCreated(null);
    setItems(DEFAULT_ITEMS);
    setDiscount("");
    setGstMode("cgst_sgst");
    setAmountPaid("");
    setPaymentMethod("UPI");
    setPaymentNote("");
    setError("");
  }

  const summaryRows: { label: string; value: string; bold?: boolean }[] = [
    { label: "Subtotal", value: `₹${totals.subtotal.toFixed(2)}` },
    { label: "Discount", value: `- ₹${(parseFloat(discount) || 0).toFixed(2)}` },
    { label: "Taxable Amount", value: `₹${totals.taxableAmount.toFixed(2)}` },
  ];
  if (gstMode === "cgst_sgst") {
    summaryRows.push(
      { label: "CGST (9%)", value: `₹${totals.cgst.toFixed(2)}` },
      { label: "SGST (9%)", value: `₹${totals.sgst.toFixed(2)}` }
    );
  } else if (gstMode === "igst") {
    summaryRows.push({ label: "IGST (18%)", value: `₹${totals.igst.toFixed(2)}` });
  }
  summaryRows.push(
    { label: "Grand Total", value: `₹${totals.grandTotal.toFixed(2)}`, bold: true },
    { label: "Amount Paid", value: `- ₹${paid.toFixed(2)}` },
    { label: "Balance Due", value: `₹${balance.toFixed(2)}`, bold: true }
  );

  return (
    <div className="min-h-screen bg-surface-container-low">
      <AdminSidebar />
      <main className="md:ml-64 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-headline-md text-2xl font-bold text-on-surface">
              Create Invoice
            </h1>
            <button
              onClick={() => router.push("/g9x2k7m3q8w-admin/invoices")}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">
                arrow_back
              </span>
              All Invoices
            </button>
          </div>

          {created ? (
            <div className="bg-surface rounded-xl border border-outline-variant/10 p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-secondary/10 text-secondary rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[32px]">
                  check_circle
                </span>
              </div>
              <h2 className="font-headline-md text-xl font-bold text-on-surface">
                Invoice {created.invoiceNumber} created
              </h2>
              <p className="text-sm text-on-surface-variant mt-2">
                The invoice PDF has been downloaded. You can download it again
                from the invoice history.
              </p>
              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={() => downloadPdf(created.id, created.invoiceNumber)}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary/90"
                >
                  Download PDF again
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-2.5 border border-outline-variant/20 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container-low"
                >
                  Create another invoice
                </button>
                <button
                  onClick={() => router.push("/g9x2k7m3q8w-admin/invoices")}
                  className="px-6 py-2.5 border border-outline-variant/20 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container-low"
                >
                  View invoice history
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
                  <h2 className="font-headline-md text-base font-semibold text-on-surface mb-4">
                    Patient
                  </h2>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">— Choose a patient —</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.email})
                      </option>
                    ))}
                  </select>
                  {patient && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-on-surface-variant">Name:</span>{" "}
                        <span className="font-medium text-on-surface">
                          {patient.fullName}
                        </span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant">Mobile:</span>{" "}
                        <span className="font-medium text-on-surface">
                          {patient.phone}
                        </span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant">Email:</span>{" "}
                        <span className="font-medium text-on-surface">
                          {patient.email}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-headline-md text-base font-semibold text-on-surface">
                      Service Details
                    </h2>
                    <button
                      onClick={addItem}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        add
                      </span>
                      Add item
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="hidden sm:grid grid-cols-12 gap-3 text-xs text-on-surface-variant font-medium px-1">
                      <span className="col-span-6">Service Description</span>
                      <span className="col-span-2">Qty</span>
                      <span className="col-span-2">Rate (₹)</span>
                      <span className="col-span-2 text-right">Amount</span>
                    </div>
                    {items.map((it, i) => {
                      const amt = (parseFloat(it.qty) || 0) * (parseFloat(it.rate) || 0);
                      return (
                        <div
                          key={i}
                          className="grid grid-cols-12 gap-3 items-center"
                        >
                          <input
                            type="text"
                            value={it.description}
                            onChange={(e) =>
                              setItem(i, "description", e.target.value)
                            }
                            placeholder="e.g. CGM Sensor"
                            className={`${inputClass} col-span-12 sm:col-span-6`}
                          />
                          <input
                            type="number"
                            min="0"
                            value={it.qty}
                            onChange={(e) => setItem(i, "qty", e.target.value)}
                            className={`${inputClass} col-span-4 sm:col-span-2`}
                          />
                          <input
                            type="number"
                            min="0"
                            value={it.rate}
                            onChange={(e) => setItem(i, "rate", e.target.value)}
                            placeholder="0.00"
                            className={`${inputClass} col-span-4 sm:col-span-2`}
                          />
                          <div className="col-span-3 sm:col-span-2 text-right text-on-surface font-medium text-sm">
                            ₹{amt.toFixed(2)}
                          </div>
                          <button
                            onClick={() => removeItem(i)}
                            disabled={items.length === 1}
                            className="col-span-1 text-on-surface-variant hover:text-error transition-colors disabled:opacity-30"
                            title="Remove item"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              delete
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
                  <h2 className="font-headline-md text-base font-semibold text-on-surface mb-4">
                    GST & Payment
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-on-surface-variant mb-1">
                        GST Mode
                      </label>
                      <select
                        value={gstMode}
                        onChange={(e) => setGstMode(e.target.value as GstMode)}
                        className={inputClass}
                      >
                        <option value="cgst_sgst">CGST + SGST (9% + 9%)</option>
                        <option value="igst">IGST (18%)</option>
                        <option value="none">No GST</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-on-surface-variant mb-1">
                        Discount (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        placeholder="0.00"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-on-surface-variant mb-1">
                        Payment Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className={inputClass}
                      >
                        <option value="UPI">UPI</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-on-surface-variant mb-1">
                        Amount Paid (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        placeholder="0.00"
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-on-surface-variant mb-1">
                        Payment Note (optional)
                      </label>
                      <input
                        type="text"
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value)}
                        placeholder="e.g. Paid via UPI at the clinic"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-error text-sm bg-error/10 px-4 py-2 rounded-lg">
                    {error}
                  </p>
                )}
              </div>

              <div>
                <div className="bg-surface rounded-xl border border-outline-variant/10 p-6 sticky top-24">
                  <h2 className="font-headline-md text-base font-semibold text-on-surface mb-4">
                    Payment Summary
                  </h2>
                  <div className="space-y-2">
                    {summaryRows.map((row) => (
                      <div
                        key={row.label}
                        className={`flex items-center justify-between text-sm ${
                          row.bold
                            ? "font-bold text-on-surface border-t border-outline-variant/20 pt-2"
                            : "text-on-surface-variant"
                        }`}
                      >
                        <span>{row.label}</span>
                        <span>{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full mt-6 px-6 py-3 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save & Generate Invoice"}
                  </button>
                  <p className="text-xs text-on-surface-variant mt-3 text-center">
                    Generates a GST invoice PDF with UPI QR / bank details.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
