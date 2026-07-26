"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

interface Stats {
  overview: { total: number; active: number; pending: number; inactive: number };
  diabetesTypes: { name: string; value: number }[];
  genderSplit: { name: string; value: number }[];
  recentPatients: {
    id: string;
    fullName: string;
    status: string;
    createdAt: string;
  }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/auth/me")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(() => fetch("/api/admin/stats"))
      .then((r) => r.json())
      .then(setStats)
      .catch(() => router.push("/g9x2k7m3q8w-admin"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-on-surface-variant">Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) return null;

  const statusChartOptions: Highcharts.Options = {
    chart: { type: "pie", height: 280 },
    title: { text: "Patient Status", style: { fontSize: "14px", fontWeight: "600" } },
    plotOptions: {
      pie: {
        innerSize: "55%",
        dataLabels: { enabled: true, format: "<b>{point.name}</b>: {point.y}" },
      },
    },
    series: [
      {
        type: "pie",
        name: "Patients",
        data: [
          { name: "Active", y: stats.overview.active, color: "#006c49" },
          { name: "Pending", y: stats.overview.pending, color: "#825100" },
          { name: "Inactive", y: stats.overview.inactive, color: "#ba1a1a" },
        ],
      },
    ],
  };

  const diabetesChartOptions: Highcharts.Options = {
    chart: { type: "pie", height: 280 },
    title: { text: "Diabetes Types", style: { fontSize: "14px", fontWeight: "600" } },
    plotOptions: {
      pie: {
        innerSize: "55%",
        dataLabels: { enabled: true, format: "<b>{point.name}</b>: {point.y}" },
      },
    },
    series: [
      {
        type: "pie",
        name: "Patients",
        data: stats.diabetesTypes.map((d, i) => ({
          name: d.name,
          y: d.value,
          color: ["#00647c", "#006c49", "#825100", "#7c5800", "#004e5e"][i % 5],
        })),
      },
    ],
  };

  const genderChartOptions: Highcharts.Options = {
    chart: { type: "pie", height: 280 },
    title: { text: "Gender Split", style: { fontSize: "14px", fontWeight: "600" } },
    plotOptions: {
      pie: {
        innerSize: "55%",
        dataLabels: { enabled: true, format: "<b>{point.name}</b>: {point.y}" },
      },
    },
    series: [
      {
        type: "pie",
        name: "Patients",
        data: stats.genderSplit.map((g, i) => ({
          name: g.name,
          y: g.value,
          color: i === 0 ? "#00647c" : i === 1 ? "#006c49" : "#825100",
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-surface-container-low">
      <AdminSidebar />
      <main className="md:ml-64 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-headline-md text-2xl font-bold text-on-surface mb-8">
            Dashboard
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Patients", value: stats.overview.total, color: "text-primary" },
              { label: "Active", value: stats.overview.active, color: "text-secondary" },
              { label: "Pending", value: stats.overview.pending, color: "text-tertiary" },
              { label: "Inactive", value: stats.overview.inactive, color: "text-error" },
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
              <HighchartsReact highcharts={Highcharts} options={statusChartOptions} />
            </div>
            <div className="bg-surface rounded-xl border border-outline-variant/10 p-4">
              <HighchartsReact highcharts={Highcharts} options={diabetesChartOptions} />
            </div>
            <div className="bg-surface rounded-xl border border-outline-variant/10 p-4">
              <HighchartsReact highcharts={Highcharts} options={genderChartOptions} />
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
