"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface SettingsMap {
  [key: string]: string;
}

const FIELD_LABELS: Record<string, { label: string; unit: string }> = {
  bloodPressureSystolic_max: { label: "Systolic BP (max)", unit: "mmHg" },
  bloodPressureDiastolic_max: { label: "Diastolic BP (max)", unit: "mmHg" },
  heartRate_min: { label: "Heart Rate (min)", unit: "bpm" },
  heartRate_max: { label: "Heart Rate (max)", unit: "bpm" },
  bmi_min: { label: "BMI (min)", unit: "kg/m²" },
  bmi_max: { label: "BMI (max)", unit: "kg/m²" },
  hba1c_max: { label: "HbA1c (max)", unit: "%" },
  glucoseFasting_max: { label: "Fasting Glucose (max)", unit: "mg/dL" },
  glucosePostPrandial_max: { label: "Postprandial Glucose (max)", unit: "mg/dL" },
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
  ];

  return (
    <div className="min-h-screen bg-surface-container-low">
      <AdminSidebar />
      <main className="md:ml-64 p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-headline-md text-2xl font-bold text-on-surface mb-6">Report Threshold Settings</h1>
          <p className="text-sm text-on-surface-variant mb-8">
            Set the normal-range thresholds used in the Clinical Assessment Report gauges and status indicators.
          </p>

          {saved && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              Settings saved successfully.
            </div>
          )}

          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.title} className="bg-surface rounded-xl border border-outline-variant/10 p-6">
                <h2 className="font-headline-md text-base font-semibold text-on-surface mb-4">{group.title}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {group.keys.map((key) => (
                    <div key={key}>
                      <label className="block text-xs text-on-surface-variant mb-1">
                        {FIELD_LABELS[key]?.label || key} ({FIELD_LABELS[key]?.unit || ""})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={settings[key] ?? ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                  ))}
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
