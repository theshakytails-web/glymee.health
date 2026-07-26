"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface Consultation {
  id: string;
  fullName: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  diabetesType: string | null;
  mainConcern: string | null;
  emailSent: boolean;
  status: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_OPTIONS = ["new", "contacted", "converted", "closed"] as const;

const STATUS_STYLE: Record<string, string> = {
  new: "bg-blue-50 text-blue-700",
  contacted: "bg-amber-50 text-amber-700",
  converted: "bg-secondary/10 text-secondary",
  closed: "bg-error/10 text-error",
};

export default function ConsultationsPage() {
  const router = useRouter();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function fetchConsultations() {
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
    });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    fetch(`/api/admin/consultations?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setConsultations(data.consultations);
        setPagination(data.pagination);
      })
      .catch(() => router.push("/g9x2k7m3q8w-admin"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchConsultations();
  }, [page, statusFilter]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchConsultations();
  }

  async function handleStatusChange(id: string, newStatus: string) {
    setUpdatingId(id);
    setConsultations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    try {
      const res = await fetch(`/api/admin/consultations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) fetchConsultations();
    } catch {
      fetchConsultations();
    } finally {
      setUpdatingId(null);
    }
  }

  function formatDate(ts: string) {
    const d = new Date(ts);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-on-surface-variant">Loading inquiries...</div>
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
                Inquiries
              </h1>
              <p className="text-sm text-on-surface-variant mt-1">
                Consultation submissions from the landing page form
              </p>
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
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
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
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Diabetes</th>
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {consultations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-on-surface-variant">
                        No inquiries found.
                      </td>
                    </tr>
                  ) : (
                    consultations.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-outline-variant/5 hover:bg-surface-container-low"
                      >
                        <td className="py-3 px-4">
                          <div className="text-on-surface font-medium">{c.fullName}</div>
                          <div className="text-xs text-on-surface-variant">
                            {c.age} &middot; {c.gender}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-on-surface-variant">
                          <div className="text-xs">{c.email}</div>
                          <div className="text-xs">{c.phone}</div>
                        </td>
                        <td className="py-3 px-4 text-on-surface-variant text-xs">
                          {c.city}, {c.state}
                        </td>
                        <td className="py-3 px-4 text-on-surface-variant text-xs">
                          {c.diabetesType || "-"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              c.emailSent
                                ? "bg-secondary/10 text-secondary"
                                : "bg-error/10 text-error"
                            }`}
                          >
                            {c.emailSent ? "Sent" : "Failed"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-on-surface-variant text-xs">
                          {formatDate(c.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={c.status}
                            disabled={updatingId === c.id}
                            onChange={(e) => handleStatusChange(c.id, e.target.value)}
                            className={`px-2 py-1 rounded-md text-xs font-medium border-0 focus:ring-2 focus:ring-primary/40 disabled:opacity-50 cursor-pointer ${STATUS_STYLE[c.status] || "bg-surface-container text-on-surface-variant"}`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
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
                    onClick={() => setPage((p) => Math.min(pagination!.totalPages, p + 1))}
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
