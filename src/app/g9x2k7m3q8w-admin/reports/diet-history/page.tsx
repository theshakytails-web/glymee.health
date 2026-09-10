"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ReportsTabs from "@/components/admin/ReportsTabs";

interface DietPlanRecord {
  id: string;
  patientName: string;
  planName: string | null;
  createdAt: string;
}

export default function DietPlanHistoryPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<DietPlanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/auth/me")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(() => fetch("/api/admin/reports/diet"))
      .then((r) => r.json())
      .then((data) => setPlans(data.plans || []))
      .catch(() => router.push("/g9x2k7m3q8w-admin"))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen bg-surface-container-low">
      <AdminSidebar />
      <main className="md:ml-64 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <ReportsTabs />
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-headline-md text-2xl font-bold text-on-surface">
              Diet Plan History
            </h1>
          </div>

          {loading ? (
            <div className="text-on-surface-variant">Loading diet plans...</div>
          ) : plans.length === 0 ? (
            <div className="bg-surface rounded-xl border border-outline-variant/10 p-10 text-center text-on-surface-variant">
              No diet plans have been generated yet.
            </div>
          ) : (
            <div className="bg-surface rounded-xl border border-outline-variant/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-container-low text-left text-xs text-on-surface-variant">
                    <th className="px-5 py-3 font-medium">Patient</th>
                    <th className="px-5 py-3 font-medium">Plan Name</th>
                    <th className="px-5 py-3 font-medium">Saved At</th>
                    <th className="px-5 py-3 font-medium text-right">PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t border-outline-variant/10 hover:bg-surface-container-low/50"
                    >
                      <td className="px-5 py-3 font-medium text-on-surface">
                        {p.patientName}
                      </td>
                      <td className="px-5 py-3 text-on-surface-variant">
                        {p.planName || "—"}
                      </td>
                      <td className="px-5 py-3 text-on-surface-variant">
                        {new Date(p.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() =>
                            window.open(
                              `/api/admin/reports/diet/${p.id}/pdf`,
                              "_blank"
                            )
                          }
                          className="text-sm text-primary hover:underline"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}