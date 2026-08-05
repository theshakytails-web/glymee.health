"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface SettingsMap {
  [key: string]: string;
}

interface FieldMeta {
  label: string;
  unit?: string;
  type?: "number" | "text";
  placeholder?: string;
}

const FIELD_LABELS: Record<string, FieldMeta> = {
  bloodPressureSystolic_max: { label: "Systolic BP (max)", unit: "mmHg", type: "number" },
  bloodPressureDiastolic_max: { label: "Diastolic BP (max)", unit: "mmHg", type: "number" },
  heartRate_min: { label: "Heart Rate (min)", unit: "bpm", type: "number" },
  heartRate_max: { label: "Heart Rate (max)", unit: "bpm", type: "number" },
  bmi_min: { label: "BMI (min)", unit: "kg/m²", type: "number" },
  bmi_max: { label: "BMI (max)", unit: "kg/m²", type: "number" },
  hba1c_max: { label: "HbA1c (max)", unit: "%", type: "number" },
  glucoseFasting_max: { label: "Fasting Glucose (max)", unit: "mg/dL", type: "number" },
  glucosePostPrandial_max: { label: "Postprandial Glucose (max)", unit: "mg/dL", type: "number" },
  invoice_business_name: { label: "Business Name", type: "text", placeholder: "e.g. RK Enterprises" },
  invoice_gstin: { label: "GSTIN", type: "text", placeholder: "e.g. 27CVDPP6588E1Z3" },
  invoice_phone: { label: "Phone", type: "text", placeholder: "e.g. +91 8452823804" },
  invoice_email: { label: "Email", type: "text", placeholder: "e.g. help@glymee.com" },
  invoice_website: { label: "Website", type: "text", placeholder: "e.g. www.glymee.com" },
  invoice_address: { label: "Address", type: "text", placeholder: "e.g. Pune, Maharashtra, India" },
  invoice_upi_id: { label: "UPI ID (for QR on invoice)", type: "text", placeholder: "e.g. glymee@upi" },
  invoice_bank_name: { label: "Bank Name", type: "text", placeholder: "e.g. HDFC Bank" },
  invoice_bank_account: { label: "Bank Account No.", type: "text" },
  invoice_bank_ifsc: { label: "Bank IFSC", type: "text", placeholder: "e.g. HDFC0001234" },
  invoice_payment_terms: { label: "Payment Terms", type: "text", placeholder: "e.g. Payment is due within 7 days." },
};

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/auth/me")
      .then((r) => { if (!r.ok) throw new Error(); })
      .then(() => fetch("/api/admin/settings"))
      .then((r) => r.json())
      .then((data) => setSettings(data.settings || {}))
      .catch(() => router.push("/g9x2k7m3q8w-admin"))
      .finally(() => setLoading(false));
  }, [router]);

  function handleChange(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
    } catch {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-on-surface-variant">Loading...</div>
      </div>
    );
  }

  const groups = [
    { title: "Blood Pressure", keys: ["bloodPressureSystolic_max", "bloodPressureDiastolic_max"] },
    { title: "Heart Rate", keys: ["heartRate_min", "heartRate_max"] },
    { title: "BMI", keys: ["bmi_min", "bmi_max"] },
    { title: "HbA1c", keys: ["hba1c_max"] },
    { title: "Glucose", keys: ["glucoseFasting_max", "glucosePostPrandial_max"] },
    {
      title: "Invoice / Company Details",
      description: "Shown on generated invoices. UPI ID is used for the payment QR code.",
      keys: [
        "invoice_business_name",
        "invoice_gstin",
        "invoice_phone",
        "invoice_email",
        "invoice_website",
        "invoice_address",
        "invoice_upi_id",
        "invoice_bank_name",
        "invoice_bank_account",
        "invoice_bank_ifsc",
        "invoice_payment_terms",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-surface-container-low">
      <AdminSidebar />
      <main className="md:ml-64 p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-headline-md text-2xl font-bold text-on-surface mb-6">Settings</h1>
          <p className="text-sm text-on-surface-variant mb-8">
            Configure report thresholds and the business details used on invoices.
          </p>

          {saved && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              Settings saved successfully.
            </div>
          )}

          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.title} className="bg-surface rounded-xl border border-outline-variant/10 p-6">
                <h2 className="font-headline-md text-base font-semibold text-on-surface mb-1">{group.title}</h2>
                {group.description && (
                  <p className="text-xs text-on-surface-variant mb-4">{group.description}</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {group.keys.map((key) => {
                    const meta = FIELD_LABELS[key];
                    const isNumber = meta?.type === "number";
                    return (
                      <div key={key}>
                        <label className="block text-xs text-on-surface-variant mb-1">
                          {meta?.label || key} {meta?.unit ? `(${meta.unit})` : ""}
                        </label>
                        <input
                          type={isNumber ? "number" : "text"}
                          step={isNumber ? "0.1" : undefined}
                          value={settings[key] ?? ""}
                          placeholder={meta?.placeholder}
                          onChange={(e) => handleChange(key, e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
