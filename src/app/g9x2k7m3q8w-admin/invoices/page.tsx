"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string | null;
  patientPhone: string | null;
  invoiceDate: string;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: string;
  createdAt: string;
}

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

export default function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string }>;
}) {
  const router = useRouter();
  const [query, setQuery] = useState<{ patientId?: string } | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    searchParams.then((sp) => setQuery(sp));
  }, [searchParams]);

  const load = useCallback(() => {
    if (!query) return;
    setLoading(true);
    fetch(
      "/api/admin/invoices" +
        (query.patientId ? `?patientId=${encodeURIComponent(query.patientId)}` : "")
    )
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => setInvoices(data.invoices || []))
      .catch(() => router.push("/g9x2k7m3q8w-admin"))
      .finally(() => setLoading(false));
  }, [query, router]);

  useEffect(() => {
    load();
  }, [load]);

  if (!query || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-on-surface-variant">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-low">
      <AdminSidebar />
      <main className="md:ml-64 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="font-headline-md text-2xl font-bold text-on-surface">
                Invoices
              </h1>
              {query.patientId && (
                <p className="text-sm text-on-surface-variant mt-1">
                  Filtered by patient.{" "}
                  <button
                    onClick={() => router.push("/g9x2k7m3q8w-admin/invoices")}
                    className="text-primary hover:underline"
                  >
                    Clear filter
                  </button>
                </p>
              )}
            </div>
            <button
              onClick={() =>
                router.push(
                  "/g9x2k7m3q8w-admin/invoices/new" +
                    (query.patientId
                      ? `?patientId=${encodeURIComponent(query.patientId)}`
                      : "")
                )
              }
              className="px-4 py-2 text-sm bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              + Create Invoice
            </button>
          </div>

          <div className="bg-surface rounded-xl border border-outline-variant/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/10 bg-surface-container-low">
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Invoice No</th>
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Patient</th>
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Date</th>
                    <th className="text-right py-3 px-4 font-medium text-on-surface-variant">Total</th>
                    <th className="text-right py-3 px-4 font-medium text-on-surface-variant">Paid</th>
                    <th className="text-right py-3 px-4 font-medium text-on-surface-variant">Balance</th>
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-on-surface-variant">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-on-surface-variant">
                        No invoices found.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => {
                      const paid = inv.amountPaid >= inv.grandTotal;
                      const partial = inv.amountPaid > 0 && inv.balanceDue > 0;
                      const status = paid ? "Paid" : partial ? "Partial" : "Due";
                      return (
                        <tr
                          key={inv.id}
                          className="border-b border-outline-variant/5 hover:bg-surface-container-low"
                        >
                          <td className="py-3 px-4 text-on-surface font-medium">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() =>
                                router.push(
                                  `/g9x2k7m3q8w-admin/patients/${inv.patientId}`
                                )
                              }
                              className="text-on-surface font-medium hover:text-primary"
                            >
                              {inv.patientName || "Unknown"}
                            </button>
                            {inv.patientPhone && (
                              <div className="text-xs text-on-surface-variant">
                                {inv.patientPhone}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-on-surface-variant">{inv.invoiceDate}</td>
                          <td className="py-3 px-4 text-right text-on-surface font-medium">
                            ₹{inv.grandTotal.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right text-on-surface-variant">
                            ₹{inv.amountPaid.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right text-on-surface-variant">
                            ₹{inv.balanceDue.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                paid
                                  ? "bg-secondary/10 text-secondary"
                                  : partial
                                    ? "bg-tertiary/10 text-tertiary"
                                    : "bg-error/10 text-error"
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() =>
                                downloadPdf(inv.id, inv.invoiceNumber)
                              }
                              className="inline-flex items-center gap-1 text-sm text-primary hover:underline px-2 py-1"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                download
                              </span>
                              PDF
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
