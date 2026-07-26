"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface PatientData {
  id: string;
  fullName: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  diabetesType: string | null;
  diagnosisDuration: string | null;
  currentMedications: string | null;
  mainConcern: string | null;
  referralSource: string | null;
  additionalNotes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/patients/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setPatient(data.patient);
        setForm({
          fullName: data.patient.fullName,
          age: String(data.patient.age),
          gender: data.patient.gender,
          email: data.patient.email,
          phone: data.patient.phone,
          city: data.patient.city,
          state: data.patient.state,
          diabetesType: data.patient.diabetesType || "",
          diagnosisDuration: data.patient.diagnosisDuration || "",
          currentMedications: data.patient.currentMedications || "",
          mainConcern: data.patient.mainConcern || "",
          referralSource: data.patient.referralSource || "",
          additionalNotes: data.patient.additionalNotes || "",
          status: data.patient.status,
        });
      })
      .catch(() => router.push("/g9x2k7m3q8w-admin/patients"));
  }, [id, router]);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/patients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        return;
      }

      setEditing(false);
      const updated = await fetch(`/api/admin/patients/${id}`).then((r) =>
        r.json()
      );
      setPatient(updated.patient);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-on-surface-variant">Loading patient...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-low">
      <AdminSidebar />
      <main className="md:ml-64 p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <button
                onClick={() => router.push("/g9x2k7m3q8w-admin/patients")}
                className="text-sm text-primary hover:underline mb-1 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">
                  arrow_back
                </span>
                All Patients
              </button>
              <h1 className="font-headline-md text-2xl font-bold text-on-surface">
                {editing ? "Edit Patient" : patient.fullName}
              </h1>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 text-sm bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors"
              >
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-6">
              <Card title="Personal Information">
                <Row label="Full Name">
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    required
                    className={inputClass}
                  />
                </Row>
                <div className="grid grid-cols-2 gap-4">
                  <Row label="Age">
                    <input
                      type="number"
                      value={form.age}
                      onChange={(e) => set("age", e.target.value)}
                      required
                      className={inputClass}
                    />
                  </Row>
                  <Row label="Gender">
                    <select
                      value={form.gender}
                      onChange={(e) => set("gender", e.target.value)}
                      required
                      className={inputClass}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </Row>
                </div>
              </Card>

              <Card title="Contact">
                <div className="grid grid-cols-2 gap-4">
                  <Row label="Email">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      required
                      className={inputClass}
                    />
                  </Row>
                  <Row label="Phone">
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      required
                      className={inputClass}
                    />
                  </Row>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Row label="City">
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      required
                      className={inputClass}
                    />
                  </Row>
                  <Row label="State">
                    <input
                      type="text"
                      value={form.state}
                      onChange={(e) => set("state", e.target.value)}
                      required
                      className={inputClass}
                    />
                  </Row>
                </div>
              </Card>

              <Card title="Health">
                <div className="grid grid-cols-2 gap-4">
                  <Row label="Diabetes Type">
                    <select
                      value={form.diabetesType}
                      onChange={(e) => set("diabetesType", e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select</option>
                      <option value="Type 1">Type 1</option>
                      <option value="Type 2">Type 2</option>
                      <option value="Gestational">Gestational</option>
                      <option value="Prediabetes">Prediabetes</option>
                      <option value="Other">Other</option>
                    </select>
                  </Row>
                  <Row label="Duration">
                    <input
                      type="text"
                      value={form.diagnosisDuration}
                      onChange={(e) => set("diagnosisDuration", e.target.value)}
                      className={inputClass}
                    />
                  </Row>
                </div>
                <Row label="Medications">
                  <input
                    type="text"
                    value={form.currentMedications}
                    onChange={(e) => set("currentMedications", e.target.value)}
                    className={inputClass}
                  />
                </Row>
                <Row label="Main Concern">
                  <textarea
                    value={form.mainConcern}
                    onChange={(e) => set("mainConcern", e.target.value)}
                    rows={3}
                    className={inputClass}
                  />
                </Row>
              </Card>

              <Card title="Status">
                <Row label="Status">
                  <select
                    value={form.status}
                    onChange={(e) => set("status", e.target.value)}
                    className={inputClass}
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </Row>
              </Card>

              {error && (
                <p className="text-error text-sm bg-error/10 px-4 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-6 py-3 border border-outline-variant/20 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <Card title="Personal Information">
                <InfoRow label="Full Name" value={patient.fullName} />
                <InfoRow label="Age" value={String(patient.age)} />
                <InfoRow label="Gender" value={patient.gender} />
                <InfoRow
                  label="Status"
                  value={
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        patient.status === "active"
                          ? "bg-secondary/10 text-secondary"
                          : patient.status === "pending"
                            ? "bg-tertiary/10 text-tertiary"
                            : "bg-error/10 text-error"
                      }`}
                    >
                      {patient.status}
                    </span>
                  }
                />
              </Card>

              <Card title="Contact Information">
                <InfoRow label="Email" value={patient.email} />
                <InfoRow label="Phone" value={patient.phone} />
                <InfoRow label="City" value={patient.city} />
                <InfoRow label="State" value={patient.state} />
              </Card>

              <Card title="Health Information">
                <InfoRow label="Diabetes Type" value={patient.diabetesType || "-"} />
                <InfoRow label="Duration" value={patient.diagnosisDuration || "-"} />
                <InfoRow label="Medications" value={patient.currentMedications || "-"} />
                <InfoRow label="Main Concern" value={patient.mainConcern || "-"} />
              </Card>

              <Card title="Other">
                <InfoRow label="Referral Source" value={patient.referralSource || "-"} />
                <InfoRow label="Notes" value={patient.additionalNotes || "-"} />
                <InfoRow
                  label="Created"
                  value={new Date(patient.createdAt).toLocaleDateString("en-IN")}
                />
                <InfoRow
                  label="Last Updated"
                  value={new Date(patient.updatedAt).toLocaleDateString("en-IN")}
                />
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const inputClass =
  "w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors";

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
      <h2 className="font-headline-md text-sm font-semibold text-on-surface mb-4 uppercase tracking-wider">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-2 border-b border-outline-variant/5 last:border-0">
      <span className="text-sm text-on-surface-variant w-36 shrink-0">
        {label}
      </span>
      <span className="text-sm text-on-surface font-medium">{value}</span>
    </div>
  );
}
