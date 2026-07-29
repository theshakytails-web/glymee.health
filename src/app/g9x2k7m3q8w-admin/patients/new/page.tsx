"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

const emptyForm = {
  fullName: "",
  age: "",
  gender: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  address: "",
  occupation: "",
  maritalStatus: "",
  religion: "",
  education: "",
  chiefComplaint: "",
  diagnosis: "",
  diabetesType: "",
  diagnosisDuration: "",
  currentMedications: "",
  mainConcern: "",
  referralSource: "",
  additionalNotes: "",
  fee: "",
  nextFollowUp: "",
  status: "pending",
};

export default function NewPatientPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save patient");
        return;
      }

      router.push("/g9x2k7m3q8w-admin/patients");
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-container-low">
      <AdminSidebar />
      <main className="md:ml-64 p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-headline-md text-2xl font-bold text-on-surface mb-6">
            Add New Patient
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Section title="Personal Information">
              <Field label="Full Name" required>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  required
                  className={inputClass}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Age" required>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => set("age", e.target.value)}
                    required
                    min={1}
                    max={120}
                    className={inputClass}
                  />
                </Field>
                <Field label="Gender" required>
                  <select
                    value={form.gender}
                    onChange={(e) => set("gender", e.target.value)}
                    required
                    className={inputClass}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Marital Status">
                  <select
                    value={form.maritalStatus}
                    onChange={(e) => set("maritalStatus", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </Field>
                <Field label="Occupation">
                  <input
                    type="text"
                    value={form.occupation}
                    onChange={(e) => set("occupation", e.target.value)}
                    placeholder="e.g. Software Engineer"
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Religion">
                  <input
                    type="text"
                    value={form.religion}
                    onChange={(e) => set("religion", e.target.value)}
                    placeholder="e.g. Hindu"
                    className={inputClass}
                  />
                </Field>
                <Field label="Education">
                  <input
                    type="text"
                    value={form.education}
                    onChange={(e) => set("education", e.target.value)}
                    placeholder="e.g. Graduate"
                    className={inputClass}
                  />
                </Field>
              </div>
            </Section>

            <Section title="Contact Information">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Email" required>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    required
                    className={inputClass}
                  />
                </Field>
                <Field label="Phone" required>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    required
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="City" required>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    required
                    className={inputClass}
                  />
                </Field>
                <Field label="State" required>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => set("state", e.target.value)}
                    required
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="Address">
                <textarea
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  rows={2}
                  placeholder="e.g. 123 Main Street, Apartment 4B"
                  className={inputClass}
                />
              </Field>
            </Section>

            <Section title="Chief Complaints & Diagnosis">
              <Field label="Chief Complaints">
                <textarea
                  value={form.chiefComplaint}
                  onChange={(e) => set("chiefComplaint", e.target.value)}
                  rows={3}
                  placeholder="Patient's primary complaints"
                  className={inputClass}
                />
              </Field>
              <Field label="Diagnosis">
                <input
                  type="text"
                  value={form.diagnosis}
                  onChange={(e) => set("diagnosis", e.target.value)}
                  placeholder="Primary diagnosis"
                  className={inputClass}
                />
              </Field>
            </Section>

            <Section title="Health Information">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Diabetes Type">
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
                </Field>
                <Field label="Diagnosis Duration">
                  <input
                    type="text"
                    value={form.diagnosisDuration}
                    onChange={(e) => set("diagnosisDuration", e.target.value)}
                    placeholder="e.g. 2 years"
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="Current Medications">
                <input
                  type="text"
                  value={form.currentMedications}
                  onChange={(e) => set("currentMedications", e.target.value)}
                  placeholder="e.g. Metformin 500mg"
                  className={inputClass}
                />
              </Field>
              <Field label="Main Concern">
                <textarea
                  value={form.mainConcern}
                  onChange={(e) => set("mainConcern", e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </Field>
            </Section>

            <Section title="Billing & Follow-up">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Consultation Fee (₹)">
                  <input
                    type="number"
                    value={form.fee}
                    onChange={(e) => set("fee", e.target.value)}
                    placeholder="e.g. 500"
                    min={0}
                    className={inputClass}
                  />
                </Field>
                <Field label="Next Follow-up Date">
                  <input
                    type="date"
                    value={form.nextFollowUp}
                    onChange={(e) => set("nextFollowUp", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
            </Section>

            <Section title="Other Details">
              <Field label="Referral Source">
                <input
                  type="text"
                  value={form.referralSource}
                  onChange={(e) => set("referralSource", e.target.value)}
                  placeholder="e.g. Google, Doctor referral"
                  className={inputClass}
                />
              </Field>
              <Field label="Additional Notes">
                <textarea
                  value={form.additionalNotes}
                  onChange={(e) => set("additionalNotes", e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </Field>
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                  className={inputClass}
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                </select>
              </Field>
            </Section>

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
                {saving ? "Saving..." : "Save Patient"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/g9x2k7m3q8w-admin/patients")}
                className="px-6 py-3 border border-outline-variant/20 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

const inputClass =
  "w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors";

function Section({
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
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
        {label}
        {required && <span className="text-error ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
