"use client";

import { useEffect, useState, useRef } from "react";
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
  diagnosisDuration: string | null;
  currentMedications: string | null;
  mainConcern: string | null;
  referralSource: string | null;
  additionalNotes: string | null;
}

interface SavedReport {
  id: string;
  patientId: string;
  pdfUrl: string | null;
  clinicianName: string;
  clinicalSummary: string;
  createdAt: string;
}

interface ClinicalMetrics {
  bloodPressureSystolic: number | "";
  bloodPressureDiastolic: number | "";
  heartRate: number | "";
  bmi: number | "";
  weight: number | "";
  hba1c: number | "";
  glucoseFasting: number | "";
  glucosePostPrandial: number | "";
}

interface LifestyleAssessment {
  dietaryPattern: string;
  hydrationStatus: string;
  physicalActivity: string;
  substanceUse: string;
  sleepStress: string;
}

interface ActionPlan {
  continuousMonitoring: string;
  dietaryOptimization: string;
  physicalActivityPlan: string;
  followUpSchedule: string;
}

interface MetricTarget {
  min?: number;
  max?: number;
  unit: string;
  label: string;
}

function MetricGauge({ label, value, min, max, unit }: { label: string; value: number; min?: number; max?: number; unit: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<unknown>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const HC = (await import("highcharts")).default;
      const sg = await import("highcharts/modules/solid-gauge");
      (sg.default as any)(HC);
      if (!mounted || !containerRef.current) return;
      const inRange = (min != null ? value >= min : true) && (max != null ? value <= max : true);
      const pct = max != null && min != null ? Math.min(100, ((value - min) / (max - min)) * 100) : max != null ? (value / max) * 100 : 50;
      chartRef.current = HC.chart(containerRef.current, {
        chart: { type: "solidgauge", height: 140, backgroundColor: "transparent" },
        credits: { enabled: false },
        title: { text: "" },
        pane: { center: ["50%", "70%"], size: "110%", startAngle: -90, endAngle: 90, background: [{ backgroundColor: "#f0f0f0", borderWidth: 0, outerRadius: "105%", innerRadius: "90%" }] },
        yAxis: { min: 0, max: 100, lineWidth: 0, tickWidth: 0, labels: { enabled: false } },
        plotOptions: { solidgauge: { dataLabels: { enabled: false }, linecap: "round", stickyTracking: false } },
        series: [{ type: "solidgauge" as const, data: [{ y: Math.min(100, Math.max(0, pct)), color: inRange ? "#006c49" : "#ba1a1a" }], dataLabels: { format: "" } }],
      });
    })();
    return () => { mounted = false; if (chartRef.current) (chartRef.current as { destroy: () => void }).destroy(); };
  }, [label, value, min, max]);

  const status = (min != null && value < min) ? "Low" : (max != null && value > max) ? "High" : "Normal";
  const statusColor = status === "Normal" ? "#006c49" : status === "High" ? "#ba1a1a" : "#825100";

  return (
    <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-100">
      <div ref={containerRef} className="w-full h-[100px]" />
      <div className="text-center mt-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-bold" style={{ color: statusColor }}>
          {value} <span className="text-xs font-normal text-gray-400">{unit}</span>
        </p>
        <p className="text-xs font-medium" style={{ color: statusColor }}>
          {status}
          {(min != null || max != null) && (
            <span className="text-gray-400 font-normal">
              {" "}(Target: {min != null ? min + "-" : ""}{max != null ? max : ""}{unit})
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

const EMPTY_METRICS: ClinicalMetrics = {
  bloodPressureSystolic: "",
  bloodPressureDiastolic: "",
  heartRate: "",
  bmi: "",
  weight: "",
  hba1c: "",
  glucoseFasting: "",
  glucosePostPrandial: "",
};

const EMPTY_LIFESTYLE: LifestyleAssessment = {
  dietaryPattern: "",
  hydrationStatus: "",
  physicalActivity: "",
  substanceUse: "",
  sleepStress: "",
};

const EMPTY_ACTION_PLAN: ActionPlan = {
  continuousMonitoring: "",
  dietaryOptimization: "",
  physicalActivityPlan: "",
  followUpSchedule: "",
};

export default function ClinicalReportPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [clinicianName, setClinicianName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState<"input" | "report" | "history">("input");
  const reportRef = useRef<HTMLDivElement>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [metricTargets, setMetricTargets] = useState<Record<string, MetricTarget>>({});
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [lastReportId, setLastReportId] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const [metrics, setMetrics] = useState<ClinicalMetrics>({ ...EMPTY_METRICS });
  const [lifestyle, setLifestyle] = useState<LifestyleAssessment>({ ...EMPTY_LIFESTYLE });
  const [actionPlan, setActionPlan] = useState<ActionPlan>({ ...EMPTY_ACTION_PLAN });
  const [clinicalSummary, setClinicalSummary] = useState("");
  const [previousInvestigations, setPreviousInvestigations] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        const s = data.settings || {};
        const targets: Record<string, MetricTarget> = {
          bloodPressureSystolic: { max: parseFloat(s.bloodPressureSystolic_max) || 130, unit: "mmHg", label: "Systolic BP" },
          bloodPressureDiastolic: { max: parseFloat(s.bloodPressureDiastolic_max) || 80, unit: "mmHg", label: "Diastolic BP" },
          heartRate: { min: parseFloat(s.heartRate_min) || 60, max: parseFloat(s.heartRate_max) || 100, unit: "bpm", label: "Heart Rate" },
          bmi: { min: parseFloat(s.bmi_min) || 18.5, max: parseFloat(s.bmi_max) || 24.9, unit: "kg/m2", label: "BMI" },
          weight: { unit: "kg", label: "Weight" },
          hba1c: { max: parseFloat(s.hba1c_max) || 7.0, unit: "%", label: "HbA1c" },
          glucoseFasting: { max: parseFloat(s.glucoseFasting_max) || 126, unit: "mg/dL", label: "Fasting Glucose" },
          glucosePostPrandial: { max: parseFloat(s.glucosePostPrandial_max) || 180, unit: "mg/dL", label: "Postprandial Glucose" },
        };
        setMetricTargets(targets);
      })
      .finally(() => setSettingsLoading(false));
  }, []);

  function loadPatients() {
    fetch("/api/admin/auth/me")
      .then((r) => { if (!r.ok) throw new Error(); })
      .then(() => fetch("/api/admin/patients?limit=200"))
      .then((r) => r.json())
      .then((data) => setPatients(data.patients || []))
      .catch(() => router.push("/g9x2k7m3q8w-admin"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadPatients(); }, [router]);

  function loadSavedReports(pid: string) {
    setLoadingReports(true);
    fetch("/api/admin/reports?patientId=" + encodeURIComponent(pid))
      .then((r) => r.json())
      .then((data) => setSavedReports(data.reports || []))
      .catch(() => setSavedReports([]))
      .finally(() => setLoadingReports(false));
  }

  useEffect(() => {
    if (!selectedPatient) { setPatient(null); setSavedReports([]); return; }
    fetch("/api/admin/patients/" + selectedPatient)
      .then((r) => r.json())
      .then((data) => setPatient(data.patient))
      .catch(() => setPatient(null));
    loadSavedReports(selectedPatient);
  }, [selectedPatient]);

  function handleMetricChange(key: keyof ClinicalMetrics, value: string) {
    if (value === "") {
      setMetrics((prev) => ({ ...prev, [key]: "" }));
      return;
    }
    const num = parseFloat(value);
    if (isNaN(num)) return;
    setMetrics((prev) => ({ ...prev, [key]: num }));
  }

  function buildMetricTargets() {
    const t = metricTargets;
    return {
      bloodPressureSystolic: { max: t.bloodPressureSystolic?.max ?? 130, unit: "mmHg", label: "Systolic BP" },
      bloodPressureDiastolic: { max: t.bloodPressureDiastolic?.max ?? 80, unit: "mmHg", label: "Diastolic BP" },
      heartRate: { min: t.heartRate?.min ?? 60, max: t.heartRate?.max ?? 100, unit: "bpm", label: "Heart Rate" },
      bmi: { min: t.bmi?.min ?? 18.5, max: t.bmi?.max ?? 24.9, unit: "kg/m2", label: "BMI" },
      weight: { unit: "kg", label: "Weight" },
      hba1c: { max: t.hba1c?.max ?? 7.0, unit: "%", label: "HbA1c" },
      glucoseFasting: { max: t.glucoseFasting?.max ?? 126, unit: "mg/dL", label: "Fasting Glucose" },
      glucosePostPrandial: { max: t.glucosePostPrandial?.max ?? 180, unit: "mg/dL", label: "Postprandial Glucose" },
    };
  }

  function getMetricStatus(key: string, value: number): string {
    const targets = buildMetricTargets();
    const target = (targets as any)[key] as MetricTarget;
    if (!target) return "";
    if (!("min" in target) && "max" in target) return value <= (target.max ?? Infinity) ? "Normal" : "High";
    if ("min" in target && "max" in target) return value >= (target.min ?? -Infinity) && value <= (target.max ?? Infinity) ? "Normal" : value < (target.min ?? -Infinity) ? "Low" : "High";
    return "";
  }

  async function handleGenerateReport() {
    if (!patient) return;
    setSaving(true);
    setSaveSuccess(false);
    setSaveError("");

    await new Promise((r) => setTimeout(r, 300));

    try {
      const reportData = {
        patientId: patient.id,
        clinicianName,
        metrics,
        lifestyle,
        actionPlan,
        clinicalSummary,
        previousInvestigations,
        reportData: {
          patientName: patient.fullName,
          age: patient.age,
          gender: patient.gender,
          chiefComplaint: patient.mainConcern || "Not specified",
          diagnoses: (patient.diabetesType || "Not specified") + " - " + (patient.diagnosisDuration || "Duration not specified"),
          medications: patient.currentMedications || "None reported",
          history: patient.additionalNotes || "None reported",
        },
      };

      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });

      if (!res.ok) throw new Error("Failed to save report");

      const result = await res.json();
      setLastReportId(result.id);

      setGenerated(true);
      setActiveTab("report");
      setSaveSuccess(true);
      loadSavedReports(patient.id);
    } catch (err) {
      setSaveError("Failed to save report. Check console for details.");
      console.error(err);
      setGenerated(true);
      setActiveTab("report");
    } finally {
      setSaving(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  async function handleDownloadPdf(reportId: string) {
    setGeneratingPdf(true);
    try {
      const res = await fetch("/api/admin/reports/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });
      if (!res.ok) throw new Error("Failed to generate PDF");

      const data = await res.json();
      if (data.pdfUrl) {
        window.open(data.pdfUrl, "_blank");
        loadSavedReports(selectedPatient);
      } else {
        alert("PDF generation succeeded but no URL returned. GCS may not be configured.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      setGeneratingPdf(false);
    }
  }

  function loadReportIntoView(report: SavedReport) {
    try {
      const data = JSON.parse((report as any).reportDataJson || "{}");
      const m = JSON.parse((report as any).metricsJson || "{}");
      const l = JSON.parse((report as any).lifestyleJson || "{}");
      const a = JSON.parse((report as any).actionPlanJson || "{}");

      setClinicianName(report.clinicianName || "");
      if (m.bloodPressureSystolic != null) setMetrics(m);
      if (l.dietaryPattern != null) setLifestyle(l);
      if (a.continuousMonitoring != null) setActionPlan(a);
      setClinicalSummary(report.clinicalSummary || "");
      setPreviousInvestigations((report as any).previousInvestigations || "");
      setGenerated(true);
      setActiveTab("report");
    } catch {
      alert("Could not load report data.");
    }
  }

  function formatDate(ts: string) {
    return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-on-surface-variant">Loading...</div>
      </div>
    );
  }

  const T = buildMetricTargets();

  return (
    <div className="min-h-screen bg-surface-container-low">
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          @page { margin: 15mm; size: A4; }
        }
      `}</style>
      <AdminSidebar />
      <main className="md:ml-64 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 no-print">
            <h1 className="font-headline-md text-2xl font-bold text-on-surface">Clinical Assessment Report</h1>
            <div className="flex gap-2">
              {generated && (
                <>
                  <button onClick={handlePrint} className="px-4 py-2 text-sm bg-surface border border-outline-variant/20 rounded-lg hover:bg-surface-container-low transition-colors text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">print</span>
                    Print
                  </button>
                  <button onClick={() => lastReportId && handleDownloadPdf(lastReportId)} disabled={generatingPdf || !lastReportId} className="px-4 py-2 text-sm bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50">
                    <span className="material-symbols-outlined text-[18px]">{generatingPdf ? "hourglass_top" : "download"}</span>
                    {generatingPdf ? "Generating..." : "Download PDF"}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mb-6 no-print">
            <div className="flex gap-1 bg-surface rounded-xl p-1 border border-outline-variant/10 w-fit">
              <button onClick={() => setActiveTab("input")} className={"px-4 py-2 text-sm font-medium rounded-lg transition-colors " + (activeTab === "input" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface")}>Patient & Metrics</button>
              <button onClick={() => setActiveTab("report")} disabled={!generated} className={"px-4 py-2 text-sm font-medium rounded-lg transition-colors " + (activeTab === "report" ? "bg-primary text-on-primary" : generated ? "text-on-surface-variant hover:text-on-surface" : "text-gray-300 cursor-not-allowed")}>Generated Report</button>
              <button onClick={() => setActiveTab("history")} disabled={!selectedPatient} className={"px-4 py-2 text-sm font-medium rounded-lg transition-colors " + (activeTab === "history" ? "bg-primary text-on-primary" : selectedPatient ? "text-on-surface-variant hover:text-on-surface" : "text-gray-300 cursor-not-allowed")}>History</button>
            </div>
          </div>

          {saveSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 no-print">
              Report saved successfully.
            </div>
          )}
          {saveError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 no-print">
              {saveError}
            </div>
          )}

          {activeTab === "input" && (
            <div className="space-y-6 no-print">
              <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
                <h2 className="font-headline-md text-lg font-semibold text-on-surface mb-4">Select Patient</h2>
                <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                  <option value="">— Choose a patient —</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.fullName} ({p.email})</option>
                  ))}
                </select>
                {patient && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><span className="text-on-surface-variant">Age / Gender:</span> <span className="font-medium">{patient.age} / {patient.gender}</span></div>
                    <div><span className="text-on-surface-variant">Location:</span> <span className="font-medium">{patient.city}, {patient.state}</span></div>
                    <div><span className="text-on-surface-variant">Diabetes:</span> <span className="font-medium">{patient.diabetesType || "—"}</span></div>
                    <div><span className="text-on-surface-variant">Duration:</span> <span className="font-medium">{patient.diagnosisDuration || "—"}</span></div>
                  </div>
                )}
              </div>

              {patient && (
                <>
                  <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
                    <h2 className="font-headline-md text-lg font-semibold text-on-surface mb-4">Clinician Details</h2>
                    <input type="text" value={clinicianName} onChange={(e) => setClinicianName(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="e.g. Dr. Adhar Battulwar, MD (General Medicine)" />
                  </div>

                  <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
                    <h2 className="font-headline-md text-lg font-semibold text-on-surface mb-4">Clinical Metrics & Vitals</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {[
                        { key: "bloodPressureSystolic" as const, label: "Systolic BP", unit: "mmHg", placeholder: "e.g. 120" },
                        { key: "bloodPressureDiastolic" as const, label: "Diastolic BP", unit: "mmHg", placeholder: "e.g. 80" },
                        { key: "heartRate" as const, label: "Heart Rate", unit: "bpm", placeholder: "e.g. 72" },
                        { key: "bmi" as const, label: "BMI", unit: "kg/m2", placeholder: "e.g. 24.5" },
                        { key: "weight" as const, label: "Weight", unit: "kg", placeholder: "e.g. 70" },
                        { key: "hba1c" as const, label: "HbA1c", unit: "%", placeholder: "e.g. 6.8" },
                        { key: "glucoseFasting" as const, label: "Fasting Glucose", unit: "mg/dL", placeholder: "e.g. 110" },
                        { key: "glucosePostPrandial" as const, label: "Postprandial Glucose", unit: "mg/dL", placeholder: "e.g. 150" },
                      ].map(({ key, label, unit, placeholder }) => (
                        <div key={key}>
                          <label className="block text-xs text-on-surface-variant mb-1">{label} ({unit})</label>
                          <input type="number" value={metrics[key] === "" ? "" : metrics[key]} onChange={(e) => handleMetricChange(key, e.target.value)} step="0.1" placeholder={placeholder} className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {(["bloodPressureSystolic", "heartRate", "bmi", "hba1c"] as const).map((key) => {
                        const t = T[key];
                        const val = metrics[key];
                        if (val === "" || val == null) {
                          return <div key={key} className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-100"><p className="text-xs text-gray-400 py-8">Enter {t.label} to see gauge</p></div>;
                        }
                        return <MetricGauge key={key} label={t.label} value={val as number} min={"min" in t ? t.min : undefined} max={"max" in t ? t.max : undefined} unit={t.unit} />;
                      })}
                    </div>
                  </div>

                  <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
                    <h2 className="font-headline-md text-lg font-semibold text-on-surface mb-4">Lifestyle & Behavioral Assessment</h2>
                    <div className="space-y-4">
                      {[
                        { key: "dietaryPattern" as const, label: "Dietary Pattern", placeholder: "e.g. Mixed diet with occasional high-carb meals. Inconsistent meal timing." },
                        { key: "hydrationStatus" as const, label: "Hydration Status", placeholder: "e.g. Approximately 1.5L daily water intake. Below recommended 2-3L." },
                        { key: "physicalActivity" as const, label: "Physical Activity", placeholder: "e.g. Sedentary desk job. Walks 2-3 times per week, 20 min each." },
                        { key: "substanceUse" as const, label: "Substance Use", placeholder: "e.g. Non-smoker. Occasional social alcohol consumption (1-2 drinks/week)." },
                        { key: "sleepStress" as const, label: "Sleep & Stress", placeholder: "e.g. Reports 6-7 hours sleep. Moderate daytime fatigue. Workplace stress noted." },
                      ].map(({ key, label, placeholder }) => (
                        <div key={key}>
                          <label className="block text-xs text-on-surface-variant mb-1">{label}</label>
                          <textarea value={lifestyle[key]} onChange={(e) => setLifestyle((prev) => ({ ...prev, [key]: e.target.value }))} rows={2} placeholder={placeholder} className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
                    <h2 className="font-headline-md text-lg font-semibold text-on-surface mb-4">Previous Investigations</h2>
                    <textarea value={previousInvestigations} onChange={(e) => setPreviousInvestigations(e.target.value)} rows={3} placeholder="e.g. HbA1c (3 months ago): 7.2% — Fasting Glucose (1 month ago): 128 mg/dL — Lipid Profile: TC 210, LDL 130, HDL 38, TG 180 — Reports from endocrinologist dated Jan 2026..." className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>

                  <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
                    <h2 className="font-headline-md text-lg font-semibold text-on-surface mb-4">Management & Action Plan</h2>
                    <div className="space-y-4">
                      {[
                        { key: "continuousMonitoring" as const, label: "Continuous Monitoring", placeholder: "e.g. Daily fasting and postprandial glucose logging. Consider CGM if HbA1c remains above target." },
                        { key: "dietaryOptimization" as const, label: "Dietary Optimization", placeholder: "e.g. Reduce refined carbohydrates. Increase fiber intake to 25-30g/day. Distribute meals evenly." },
                        { key: "physicalActivityPlan" as const, label: "Physical Activity", placeholder: "e.g. 150 min/week moderate aerobic activity. Add resistance training 2x/week." },
                        { key: "followUpSchedule" as const, label: "Follow-up Schedule", placeholder: "e.g. Follow-up in 3 months for HbA1c review. Quarterly clinical assessment thereafter." },
                      ].map(({ key, label, placeholder }) => (
                        <div key={key}>
                          <label className="block text-xs text-on-surface-variant mb-1">{label}</label>
                          <textarea value={actionPlan[key]} onChange={(e) => setActionPlan((prev) => ({ ...prev, [key]: e.target.value }))} rows={2} placeholder={placeholder} className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
                    <h2 className="font-headline-md text-lg font-semibold text-on-surface mb-4">Clinical Summary & Observations</h2>
                    <textarea value={clinicalSummary} onChange={(e) => setClinicalSummary(e.target.value)} rows={4} placeholder="e.g. Patient presents with Type 2 diabetes managed on Metformin 500 mg BD. Metabolic control is moderate with HbA1c at 7.2%. Lifestyle assessment reveals sedentary routine and suboptimal dietary patterns. Primary risk factors include central obesity and family history of CVD. Recommended intervention focuses on glycemic optimization and lifestyle modification." className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>

                  <div className="flex justify-end no-print">
                    <button onClick={handleGenerateReport} disabled={saving} className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                      {saving ? "Generating..." : "Generate & Save Report"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "report" && generated && patient && (
            <div ref={reportRef} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-none">
              <div className="bg-[#00647c] px-8 py-6 text-white print:px-6 print:py-4">
                <h1 className="text-2xl font-bold tracking-tight">Glymee Health Clinical Assessment</h1>
                <p className="text-[#8dd4e6] text-sm mt-1">Comprehensive Patient Metabolic & Lifestyle Evaluation Report</p>
              </div>

              <div className="p-8 print:p-6 space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pb-6 border-b border-gray-200">
                  <div><span className="text-gray-500">Patient Name:</span><p className="font-semibold text-gray-900">{patient.fullName}</p></div>
                  <div><span className="text-gray-500">Age / Gender:</span><p className="font-semibold text-gray-900">{patient.age} / {patient.gender}</p></div>
                  <div><span className="text-gray-500">Assessment Date:</span><p className="font-semibold text-gray-900">{today}</p></div>
                  <div><span className="text-gray-500">Primary Clinician:</span><p className="font-semibold text-gray-900">{clinicianName || "Not specified"}</p></div>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">Chief Complaint:</p>
                  <p className="text-gray-900 font-medium">{patient.mainConcern || "Not specified"}</p>
                </div>

                <section>
                  <h2 className="text-lg font-bold text-[#00647c] border-b-2 border-[#00647c] pb-1 mb-4">1. Clinical & Medical History</h2>
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50"><th className="text-left py-2.5 px-4 font-semibold text-gray-700 w-1/3">Condition / Parameter</th><th className="text-left py-2.5 px-4 font-semibold text-gray-700">Clinical Status & Details</th></tr></thead>
                    <tbody>
                      <tr className="border-b border-gray-100"><td className="py-2.5 px-4 text-gray-500">Primary Diagnoses</td><td className="py-2.5 px-4 font-medium">{patient.diabetesType || "Not specified"} — {patient.diagnosisDuration || "Duration not specified"}</td></tr>
                      <tr className="border-b border-gray-100"><td className="py-2.5 px-4 text-gray-500">Current Medications</td><td className="py-2.5 px-4 font-medium">{patient.currentMedications || "None reported"}</td></tr>
                      <tr className="border-b border-gray-100"><td className="py-2.5 px-4 text-gray-500">Significant History</td><td className="py-2.5 px-4 font-medium">{patient.additionalNotes || "None reported"}</td></tr>
                    </tbody>
                  </table>
                </section>

                <section>
                  <h2 className="text-lg font-bold text-[#00647c] border-b-2 border-[#00647c] pb-1 mb-4">2. Lifestyle & Behavioral Assessment</h2>
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50"><th className="text-left py-2.5 px-4 font-semibold text-gray-700 w-1/3">Domain</th><th className="text-left py-2.5 px-4 font-semibold text-gray-700">Patient Assessment Findings</th></tr></thead>
                    <tbody>
                      {[
                        { label: "Dietary Pattern", value: lifestyle.dietaryPattern },
                        { label: "Hydration Status", value: lifestyle.hydrationStatus },
                        { label: "Physical Activity", value: lifestyle.physicalActivity },
                        { label: "Substance Use", value: lifestyle.substanceUse },
                        { label: "Sleep & Stress", value: lifestyle.sleepStress },
                      ].map((item) => (
                        <tr key={item.label} className="border-b border-gray-100"><td className="py-2.5 px-4 text-gray-500 align-top">{item.label}</td><td className="py-2.5 px-4">{item.value || "—"}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </section>

                <section>
                  <h2 className="text-lg font-bold text-[#00647c] border-b-2 border-[#00647c] pb-1 mb-4">3. Previous Investigations</h2>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
                    {previousInvestigations || "None reported"}
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-bold text-[#00647c] border-b-2 border-[#00647c] pb-1 mb-4">4. Clinical Metrics & Vitals</h2>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {(["bloodPressureSystolic", "heartRate", "bmi", "hba1c"] as const).map((key) => {
                      const t = T[key];
                      const val = metrics[key];
                      if (val === "" || val == null) return null;
                      return <MetricGauge key={key} label={t.label} value={val as number} min={"min" in t ? t.min : undefined} max={"max" in t ? t.max : undefined} unit={t.unit} />;
                    })}
                  </div>
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50"><th className="text-left py-2.5 px-4 font-semibold text-gray-700">Metric</th><th className="text-left py-2.5 px-4 font-semibold text-gray-700">Recorded Value</th><th className="text-left py-2.5 px-4 font-semibold text-gray-700">Target Range</th><th className="text-left py-2.5 px-4 font-semibold text-gray-700">Status</th></tr></thead>
                    <tbody>
                      {(metrics.bloodPressureSystolic !== "" || metrics.bloodPressureDiastolic !== "") && (() => {
                        const sys = metrics.bloodPressureSystolic || 0;
                        const dia = metrics.bloodPressureDiastolic || 0;
                        const st = getMetricStatus("bloodPressureSystolic", sys as number);
                        const sc = st === "Normal" ? "text-green-700 bg-green-50" : st === "High" ? "text-red-700 bg-red-50" : "text-amber-700 bg-amber-50";
                        return (
                          <tr className="border-b border-gray-100">
                            <td className="py-2.5 px-4 text-gray-500">Blood Pressure</td>
                            <td className="py-2.5 px-4 font-medium">{sys}/{dia} mmHg</td>
                            <td className="py-2.5 px-4 text-gray-500">&lt; {T.bloodPressureSystolic.max}/{T.bloodPressureDiastolic.max} mmHg</td>
                            <td className="py-2.5 px-4"><span className={"inline-block px-2 py-0.5 rounded-full text-xs font-medium " + sc}>{st}</span></td>
                          </tr>
                        );
                      })()}
                      {(metrics.heartRate !== "") && (() => {
                        const hr = metrics.heartRate as number;
                        const st = getMetricStatus("heartRate", hr);
                        const sc = st === "Normal" ? "text-green-700 bg-green-50" : st === "High" ? "text-red-700 bg-red-50" : "text-amber-700 bg-amber-50";
                        return (
                          <tr className="border-b border-gray-100">
                            <td className="py-2.5 px-4 text-gray-500">Heart Rate</td>
                            <td className="py-2.5 px-4 font-medium">{hr} bpm</td>
                            <td className="py-2.5 px-4 text-gray-500">{T.heartRate.min}-{T.heartRate.max} bpm</td>
                            <td className="py-2.5 px-4"><span className={"inline-block px-2 py-0.5 rounded-full text-xs font-medium " + sc}>{st}</span></td>
                          </tr>
                        );
                      })()}
                      {(metrics.bmi !== "" || metrics.weight !== "") && (() => {
                        const bmi = (metrics.bmi as number) || 0;
                        const st = getMetricStatus("bmi", bmi);
                        const sc = st === "Normal" ? "text-green-700 bg-green-50" : st === "High" ? "text-red-700 bg-red-50" : "text-amber-700 bg-amber-50";
                        return (
                          <tr className="border-b border-gray-100">
                            <td className="py-2.5 px-4 text-gray-500">BMI / Weight</td>
                            <td className="py-2.5 px-4 font-medium">{bmi} kg/m2{metrics.weight !== "" ? ` (${metrics.weight} kg)` : ""}</td>
                            <td className="py-2.5 px-4 text-gray-500">{T.bmi.min}-{T.bmi.max} kg/m2</td>
                            <td className="py-2.5 px-4"><span className={"inline-block px-2 py-0.5 rounded-full text-xs font-medium " + sc}>{st}</span></td>
                          </tr>
                        );
                      })()}
                      {(metrics.hba1c !== "") && (() => {
                        const hba = metrics.hba1c as number;
                        const st = getMetricStatus("hba1c", hba);
                        const sc = st === "Normal" ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50";
                        return (
                          <tr className="border-b border-gray-100">
                            <td className="py-2.5 px-4 text-gray-500">HbA1c</td>
                            <td className="py-2.5 px-4 font-medium">{hba}%</td>
                            <td className="py-2.5 px-4 text-gray-500">&lt; {T.hba1c.max}%</td>
                            <td className="py-2.5 px-4"><span className={"inline-block px-2 py-0.5 rounded-full text-xs font-medium " + sc}>{st}</span></td>
                          </tr>
                        );
                      })()}
                      {(metrics.glucoseFasting !== "") && (() => {
                        const gl = metrics.glucoseFasting as number;
                        const st = getMetricStatus("glucoseFasting", gl);
                        const sc = st === "Normal" ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50";
                        return (
                          <tr className="border-b border-gray-100">
                            <td className="py-2.5 px-4 text-gray-500">Fasting Glucose</td>
                            <td className="py-2.5 px-4 font-medium">{gl} mg/dL</td>
                            <td className="py-2.5 px-4 text-gray-500">&lt; {T.glucoseFasting.max} mg/dL</td>
                            <td className="py-2.5 px-4"><span className={"inline-block px-2 py-0.5 rounded-full text-xs font-medium " + sc}>{st}</span></td>
                          </tr>
                        );
                      })()}
                      {(metrics.glucosePostPrandial !== "") && (() => {
                        const gl = metrics.glucosePostPrandial as number;
                        const st = getMetricStatus("glucosePostPrandial", gl);
                        const sc = st === "Normal" ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50";
                        return (
                          <tr className="border-b border-gray-100">
                            <td className="py-2.5 px-4 text-gray-500">Postprandial Glucose</td>
                            <td className="py-2.5 px-4 font-medium">{gl} mg/dL</td>
                            <td className="py-2.5 px-4 text-gray-500">&lt; {T.glucosePostPrandial.max} mg/dL</td>
                            <td className="py-2.5 px-4"><span className={"inline-block px-2 py-0.5 rounded-full text-xs font-medium " + sc}>{st}</span></td>
                          </tr>
                        );
                      })()}
                      {metrics.bloodPressureSystolic === "" && metrics.heartRate === "" && metrics.bmi === "" && metrics.hba1c === "" && metrics.glucoseFasting === "" && metrics.glucosePostPrandial === "" && (
                        <tr><td className="py-4 px-4 text-gray-400 text-center" colSpan={4}>No metric data recorded.</td></tr>
                      )}
                    </tbody>
                  </table>
                  {(metrics.glucoseFasting !== "" || metrics.glucosePostPrandial !== "") && (
                    <p className="text-xs text-gray-400 mt-2">
                      Glucose Trends: {metrics.glucoseFasting || "—"} mg/dL (fasting) to {metrics.glucosePostPrandial || "—"} mg/dL (postprandial).
                    </p>
                  )}
                </section>

                <section>
                  <h2 className="text-lg font-bold text-[#00647c] border-b-2 border-[#00647c] pb-1 mb-4">5. Clinical Summary & Observations</h2>
                  <div className="bg-[#f0f9fb] rounded-lg p-5 text-sm text-gray-800 leading-relaxed border-l-4 border-[#00647c]">
                    {clinicalSummary || "No clinical summary provided."}
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-bold text-[#00647c] border-b-2 border-[#00647c] pb-1 mb-4">6. Personalized Management & Action Plan</h2>
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50"><th className="text-left py-2.5 px-4 font-semibold text-gray-700 w-1/3">Intervention Area</th><th className="text-left py-2.5 px-4 font-semibold text-gray-700">Prescribed Action Plan</th></tr></thead>
                    <tbody>
                      {[
                        { label: "Continuous Monitoring", value: actionPlan.continuousMonitoring },
                        { label: "Dietary Optimization", value: actionPlan.dietaryOptimization },
                        { label: "Physical Activity", value: actionPlan.physicalActivityPlan },
                        { label: "Follow-up Schedule", value: actionPlan.followUpSchedule },
                      ].map((item) => (
                        <tr key={item.label} className="border-b border-gray-100"><td className="py-2.5 px-4 text-gray-500 align-top">{item.label}</td><td className="py-2.5 px-4">{item.value || "—"}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </section>

                <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-200 print:pt-2">
                  <p>Glymee Health Clinical Assessment Report Template | Confidential</p>
                  <p>Pune, Maharashtra, India | help@glymee.com</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && selectedPatient && (
            <div className="bg-surface rounded-xl border border-outline-variant/10 p-6 no-print">
              <h2 className="font-headline-md text-lg font-semibold text-on-surface mb-4">Report History</h2>
              {loadingReports ? (
                <p className="text-on-surface-variant text-sm">Loading reports...</p>
              ) : savedReports.length === 0 ? (
                <p className="text-on-surface-variant text-sm">No reports generated for this patient yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-outline-variant/10">
                        <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Clinician</th>
                        <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Summary</th>
                        <th className="text-right py-3 px-4 font-medium text-on-surface-variant">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedReports.map((r) => (
                        <tr key={r.id} className="border-b border-outline-variant/5 hover:bg-surface-container-low">
                          <td className="py-3 px-4 text-on-surface-variant text-xs">{formatDate(r.createdAt)}</td>
                          <td className="py-3 px-4 text-on-surface font-medium">{r.clinicianName || "—"}</td>
                          <td className="py-3 px-4 text-on-surface-variant text-xs truncate max-w-xs">{r.clinicalSummary?.slice(0, 80)}...</td>
                          <td className="py-3 px-4 text-right">
                            <button onClick={() => loadReportIntoView(r)} className="text-primary hover:text-primary/80 text-xs font-medium px-3 py-1 rounded hover:bg-primary/5 transition-colors">View</button>
                            <button onClick={() => handleDownloadPdf(r.id)} disabled={generatingPdf} className="text-secondary hover:text-secondary/80 text-xs font-medium px-3 py-1 rounded hover:bg-secondary/5 transition-colors ml-1 disabled:opacity-50">
                              {generatingPdf ? "..." : "Download"}
                            </button>
                            {r.pdfUrl && (
                              <a href={r.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-tertiary hover:text-tertiary/80 text-xs font-medium px-3 py-1 rounded hover:bg-tertiary/5 transition-colors ml-1">Open PDF</a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
