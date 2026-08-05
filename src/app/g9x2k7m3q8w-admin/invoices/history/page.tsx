"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface CreatedInvoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string | null;
  invoiceDate: string;
  grandTotal: number;
  balanceDue: number;
  createdAt: string;
}

interface DeletedInvoice {
  id: string;
  invoiceNumber: string;
  patientId: string | null;
  patientName: string | null;
  patientPhone: string | null;
  invoiceDate: string;
  grandTotal: number;
  balanceDue: number;
  deletedBy: string | null;
  deletedAt: string;
}

export default function InvoiceHistoryPage() {
  const router = useRouter();
  const [created, setCreated] = useState<CreatedInvoice[]>([]);
  const [deleted, setDeleted] = useState<DeletedInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/invoices/history")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setCreated(data.created || []);
        setDeleted(data.deleted || []);
      })
      .catch(() => router.push("/g9x2k7m3q8w-admin"))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-on-surface-variant">Loading history...</div>
      </div>
    );
  }

  function fmtDate(ts: string | number) {
    const d = new Date(ts);
    return isNaN(d.getTime())
      ? String(ts)
      : d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  }

  return (
    <div className="min-h-screen bg-surface-container-low">
      <AdminSidebar />
      <main className="md:ml-64 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-headline-md text-2xl font-bold text-on-surface">
              Invoice History
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

          <div className="space-y-8">
            <section className="bg-surface rounded-xl border border-outline-variant/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
                <h2 className="font-headline-md text-base font-semibold text-on-surface">
                  Created Invoices
                </h2>
                <span className="text-xs text-on-surface-variant">
                  {created.length} total
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant/10 bg-surface-container-low">
                      <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Invoice No</th>
                      <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Patient</th>
                      <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Invoice Date</th>
                      <th className="text-right py-3 px-4 font-medium text-on-surface-variant">Total</th>
                      <th className="text-right py-3 px-4 font-medium text-on-surface-variant">Balance</th>
                      <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {created.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                          No invoices created yet.
                        </td>
                      </tr>
                    ) : (
                      created.map((inv) => (
                        <tr key={inv.id} className="border-b border-outline-variant/5 hover:bg-surface-container-low">
                          <td className="py-3 px-4 text-on-surface font-medium">{inv.invoiceNumber}</td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() =>
                                router.push(`/g9x2k7m3q8w-admin/patients/${inv.patientId}`)
                              }
                              className="text-on-surface font-medium hover:text-primary"
                            >
                              {inv.patientName || "Unknown"}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-on-surface-variant">{inv.invoiceDate}</td>
                          <td className="py-3 px-4 text-right text-on-surface font-medium">₹{inv.grandTotal.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right text-on-surface-variant">₹{inv.balanceDue.toFixed(2)}</td>
                          <td className="py-3 px-4 text-on-surface-variant">{fmtDate(inv.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-surface rounded-xl border border-outline-variant/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
                <h2 className="font-headline-md text-base font-semibold text-on-surface">
                  Deleted Invoices
                </h2>
                <span className="text-xs text-on-surface-variant">
                  {deleted.length} total
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant/10 bg-surface-container-low">
                      <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Invoice No</th>
                      <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Patient</th>
                      <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Invoice Date</th>
                      <th className="text-right py-3 px-4 font-medium text-on-surface-variant">Total</th>
                      <th className="text-right py-3 px-4 font-medium text-on-surface-variant">Balance</th>
                      <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Deleted By</th>
                      <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Deleted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deleted.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-on-surface-variant">
                          No deleted invoices yet.
                        </td>
                      </tr>
                    ) : (
                      deleted.map((inv) => (
                        <tr key={inv.id} className="border-b border-outline-variant/5 hover:bg-surface-container-low">
                          <td className="py-3 px-4 text-on-surface font-medium">{inv.invoiceNumber}</td>
                          <td className="py-3 px-4 text-on-surface font-medium">
                            {inv.patientName || "Unknown"}
                            {inv.patientPhone && (
                              <div className="text-xs text-on-surface-variant font-normal">
                                {inv.patientPhone}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-on-surface-variant">{inv.invoiceDate}</td>
                          <td className="py-3 px-4 text-right text-on-surface font-medium">₹{inv.grandTotal.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right text-on-surface-variant">₹{inv.balanceDue.toFixed(2)}</td>
                          <td className="py-3 px-4 text-on-surface-variant">{inv.deletedBy || "-"}</td>
                          <td className="py-3 px-4 text-on-surface-variant">{fmtDate(inv.deletedAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
