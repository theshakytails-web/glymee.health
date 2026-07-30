"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface Stats {
  overview: { total: number; active: number; pending: number; inactive: number; completed: number };
  totalCollection: number;
  appointmentsToday: number;
  followUpsDue: number;
  diabetesTypes: { name: string; value: number }[];
  genderSplit: { name: string; value: number }[];
  recentPatients: {
    id: string;
    fullName: string;
    status: string;
    createdAt: string;
  }[];
}

const GLYMEE_COLORS = ["#00647c", "#006c49", "#825100", "#004e5e", "#7c5800"];

function PieChart({ title, data }: { title: string; data: { name: string; y: number; color: string }[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<unknown>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const HC = (await import("highcharts")).default;
      if (!mounted || !containerRef.current) return;
      chartRef.current = HC.chart(containerRef.current, {
        chart: { type: "pie", height: 300, backgroundColor: "transparent" },
        title: { text: title, style: { fontSize: "14px", fontWeight: "600", color: "#1a1a1a" } },
        credits: { enabled: false },
        tooltip: { backgroundColor: "#fff", borderColor: "#e0e0e0", borderRadius: 8, style: { fontSize: "13px" } },
        plotOptions: {
          pie: {
            innerSize: "50%",
            dataLabels: { enabled: true, format: "<b>{point.name}</b>: {point.y}", style: { fontSize: "12px", fontWeight: "500", textOutline: "none" } },
            showInLegend: true,
            borderWidth: 2,
            borderColor: "#ffffff",
          },
        },
        legend: { itemStyle: { fontSize: "12px", fontWeight: "500", color: "#555" }, itemHoverStyle: { color: "#00647c" } },
        series: [{ type: "pie" as const, name: "Patients", data }],
      });
    })();
    return () => {
      mounted = false;
      if (chartRef.current) (chartRef.current as { destroy: () => void }).destroy();
    };
  }, [title, data]);

  return <div ref={containerRef} />;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/auth/me")
      .then((r) => {
        if (!r.ok) throw new Error("auth failed");
        return r.json();
      })
      .then(() => {
        fetch("/api/admin/stats")
          .then(async (r) => {
            if (r.ok) {
              setStats(await r.json());
            } else {
              console.error("Stats error:", await r.text());
            }
          })
          .catch((err) => console.error("Stats fetch error:", err))
          .finally(() => setLoading(false));
      })
      .catch(() => router.push("/g9x2k7m3q8w-admin"));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-on-surface-variant">Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-surface-container-low">
        <AdminSidebar />
        <main className="md:ml-64 p-6 md:p-8">
          <div className="max-w-7xl mx-auto text-center text-on-surface-variant mt-20">
            <p>Unable to load dashboard data.</p>
            <p className="text-sm mt-2">Check the server console for details.</p>
          </div>
        </main>
      </div>
    );
  }

  const statusData = [
    { name: "Active", y: stats.overview.active, color: "#006c49" },
    { name: "Pending", y: stats.overview.pending, color: "#825100" },
    { name: "Completed", y: stats.overview.completed, color: "#00647c" },
    { name: "Inactive", y: stats.overview.inactive, color: "#ba1a1a" },
  ];

  const diabetesData = stats.diabetesTypes.map((d, i) => ({
    name: d.name,
    y: d.value,
    color: GLYMEE_COLORS[i % GLYMEE_COLORS.length],
  }));

  const genderData = stats.genderSplit.map((g, i) => ({
    name: g.name,
    y: g.value,
    color: GLYMEE_COLORS[i % GLYMEE_COLORS.length],
  }));

  return (
    <div className="min-h-screen bg-surface-container-low">
      <AdminSidebar />
      <main className="md:ml-64 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-headline-md text-2xl font-bold text-on-surface mb-8">
            Dashboard
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label: "Total Footfall", value: stats.overview.total, color: "text-primary" },
              { label: "Enrolled Patients", value: stats.overview.active, color: "text-secondary" },
              { label: "Total Collection (₹)", value: `₹${stats.totalCollection}`, color: "text-emerald-600" },
              { label: "Completed", value: stats.overview.completed, color: "text-primary" },
              { label: "Appointments Today", value: stats.appointmentsToday, color: "text-tertiary" },
              { label: "Follow-ups Due", value: stats.followUpsDue, color: "text-amber-600" },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-surface rounded-xl border border-outline-variant/10 p-5"
              >
                <p className="text-sm text-on-surface-variant">{card.label}</p>
                <p className={`text-3xl font-bold mt-1 ${card.color}`}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-surface rounded-xl border border-outline-variant/10 p-4">
              <PieChart title="Patient Status" data={statusData} />
            </div>
            <div className="bg-surface rounded-xl border border-outline-variant/10 p-4">
              <PieChart title="Diabetes Types" data={diabetesData} />
            </div>
            <div className="bg-surface rounded-xl border border-outline-variant/10 p-4">
              <PieChart title="Gender Split" data={genderData} />
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
            <h2 className="font-headline-md text-lg font-semibold text-on-surface mb-4">
              Recent Patients
            </h2>
            {stats.recentPatients.length === 0 ? (
              <p className="text-on-surface-variant text-sm">No patients yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant/10">
                      <th className="text-left py-3 px-4 font-medium text-on-surface-variant">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-on-surface-variant">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-on-surface-variant">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentPatients.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-outline-variant/5 hover:bg-surface-container-low cursor-pointer"
                        onClick={() =>
                          router.push(`/g9x2k7m3q8w-admin/patients/${p.id}`)
                        }
                      >
                        <td className="py-3 px-4 text-on-surface font-medium">
                          {p.fullName}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              p.status === "active"
                                ? "bg-secondary/10 text-secondary"
                                : p.status === "pending"
                                  ? "bg-tertiary/10 text-tertiary"
                                  : p.status === "completed"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-error/10 text-error"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-on-surface-variant">
                          {new Date(p.createdAt).toLocaleDateString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
