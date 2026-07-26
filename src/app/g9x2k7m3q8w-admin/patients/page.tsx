"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface Patient {
  id: string;
  fullName: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  diabetesType: string | null;
  status: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  function fetchPatients() {
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
    });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    fetch(`/api/admin/patients?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setPatients(data.patients);
        setPagination(data.pagination);
      })
      .catch(() => router.push("/g9x2k7m3q8w-admin"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchPatients();
  }, [page, statusFilter]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchPatients();
  }

  async function handleExport(type: "pdf" | "excel") {
    const res = await fetch(`/api/admin/patients/export/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `glymee-patients.${type === "pdf" ? "pdf" : "xlsx"}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this patient? This cannot be undone.")) return;
    await fetch(`/api/admin/patients/${id}`, { method: "DELETE" });
    fetchPatients();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-on-surface-variant">Loading patients...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-low">
      <AdminSidebar />
      <main className="md:ml-64 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="font-headline-md text-2xl font-bold text-on-surface">
              Patients
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => handleExport("pdf")}
                className="px-4 py-2 text-sm bg-surface border border-outline-variant/20 rounded-lg hover:bg-surface-container-low transition-colors text-on-surface-variant"
              >
                Export PDF
              </button>
              <button
                onClick={() => handleExport("excel")}
                className="px-4 py-2 text-sm bg-surface border border-outline-variant/20 rounded-lg hover:bg-surface-container-low transition-colors text-on-surface-variant"
              >
                Export Excel
              </button>
              <button
                onClick={() => router.push("/g9x2k7m3q8w-admin/patients/new")}
                className="px-4 py-2 text-sm bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                + Add Patient
              </button>
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-outline-variant/10 p-4 mb-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, phone, city..."
                className="flex-1 px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          <div className="bg-surface rounded-xl border border-outline-variant/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/10 bg-surface-container-low">
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Age</th>
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Gender</th>
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-on-surface-variant">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-on-surface-variant">
                        No patients found.
                      </td>
                    </tr>
                  ) : (
                    patients.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-outline-variant/5 hover:bg-surface-container-low cursor-pointer"
                        onClick={() =>
                          router.push(`/g9x2k7m3q8w-admin/patients/${p.id}`)
                        }
                      >
                        <td className="py-3 px-4 text-on-surface font-medium">{p.fullName}</td>
                        <td className="py-3 px-4 text-on-surface-variant">{p.age}</td>
                        <td className="py-3 px-4 text-on-surface-variant">{p.gender}</td>
                        <td className="py-3 px-4 text-on-surface-variant">
                          <div className="text-xs">{p.email}</div>
                          <div className="text-xs">{p.phone}</div>
                        </td>
                        <td className="py-3 px-4 text-on-surface-variant text-xs">
                          {p.city}, {p.state}
                        </td>
                        <td className="py-3 px-4 text-on-surface-variant text-xs">
                          {p.diabetesType || "-"}
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
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(p.id);
                            }}
                            className="text-on-surface-variant hover:text-error transition-colors p-1"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              delete
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/10">
                <p className="text-xs text-on-surface-variant">
                  Showing {(pagination.page - 1) * pagination.limit + 1}-
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                  {pagination.total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-xs border border-outline-variant/20 rounded-md disabled:opacity-40 hover:bg-surface-container-low"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="px-3 py-1 text-xs border border-outline-variant/20 rounded-md disabled:opacity-40 hover:bg-surface-container-low"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
