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
  chiefComplaint: string | null;
  diagnosis: string | null;
  referralSource: string | null;
  additionalNotes: string | null;
}

interface SavedReport {
  id: string;
  patientId: string;
  pdfUrl: string | null;
  clinicianName: string;
  clinicalSummary: string;
  chiefComplaint: string;
  previousInvestigations: string;
  createdAt: string;
  metricsJson: string;
  lifestyleJson: string;
  clinicalHistoryJson: string;
  reviewOfSystemsJson: string;
  ayurvedicAssessmentJson: string;
  actionPlanJson: string;
  reportDataJson: string;
}

function pdfHref(value: string | null): string | null {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `/api/admin/reports/pdf?path=${encodeURIComponent(value)}`;
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

interface ClinicalHistory {
  historyOfPresentIllness: string;
  pastMedicalHistory: string;
  pastSurgicalHistory: string;
  drugHistory: string;
  menstrualObstetricsHistory: string;
  immunizationHistory: string;
  occupationalHistory: string;
}

interface ReviewOfSystems {
  general: string;
  skin: string;
  cns: string;
  cvs: string;
  respiratory: string;
  gastrointestinal: string;
  genitourinary: string;
  endocrine: string;
  musculoskeletal: string;
  psychiatric: string;
}

interface AyurvedicAssessment {
  dashvida: {
    prakurti: string;
    vikriti: string;
    sara: string;
    samhanana: string;
    pramanat: string;
    satmya: string;
    sarva: string;
    aharShakti: string;
    vyayamaShakti: string;
    vaya: string;
  };
  ashtavida: {
    nadi: string;
    mutra: string;
    mala: string;
    jihva: string;
    shabda: string;
    sparsh: string;
    drik: string;
    akruti: string;
  };
  doshaAssessment: string;
  agniAssessment: string;
  amaAssessment: string;
  koshta: string;
  nidra: string;
  ahara: string;
  vihara: string;
  mansikBhava: string;
  malaExamination: string;
  modalities: string;
  personality: string;
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
  bloodPressureSystolic: "", bloodPressureDiastolic: "", heartRate: "",
  bmi: "", weight: "", hba1c: "", glucoseFasting: "", glucosePostPrandial: "",
};

const EMPTY_LIFESTYLE: LifestyleAssessment = {
  dietaryPattern: "", hydrationStatus: "", physicalActivity: "", substanceUse: "", sleepStress: "",
};

const EMPTY_ACTION_PLAN: ActionPlan = {
  continuousMonitoring: "", dietaryOptimization: "", physicalActivityPlan: "", followUpSchedule: "",
};

const EMPTY_CLINICAL_HISTORY: ClinicalHistory = {
  historyOfPresentIllness: "", pastMedicalHistory: "", pastSurgicalHistory: "",
  drugHistory: "", menstrualObstetricsHistory: "", immunizationHistory: "", occupationalHistory: "",
};

const EMPTY_ROS: ReviewOfSystems = {
  general: "", skin: "", cns: "", cvs: "", respiratory: "",
  gastrointestinal: "", genitourinary: "", endocrine: "", musculoskeletal: "", psychiatric: "",
};

const EMPTY_AYURVEDIC: AyurvedicAssessment = {
  dashvida: { prakurti: "", vikriti: "", sara: "", samhanana: "", pramanat: "", satmya: "", sarva: "", aharShakti: "", vyayamaShakti: "", vaya: "" },
  ashtavida: { nadi: "", mutra: "", mala: "", jihva: "", shabda: "", sparsh: "", drik: "", akruti: "" },
  doshaAssessment: "", agniAssessment: "", amaAssessment: "", koshta: "", nidra: "", ahara: "", vihara: "",
  mansikBhava: "", malaExamination: "", modalities: "", personality: "",
};

const inputSubTabs = ["Basic & Metrics", "Clinical History", "Review of Systems", "Previous Investigations", "Ayurvedic Assessment", "Action Plan & Summary"] as const;
type InputSubTab = typeof inputSubTabs[number];

export default function ClinicalReportPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [clinicianName, setClinicianName] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState<"input" | "report" | "history">("input");
  const [inputSubTab, setInputSubTab] = useState<InputSubTab>("Basic & Metrics");
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
  const [clinicalHistory, setClinicalHistory] = useState<ClinicalHistory>({ ...EMPTY_CLINICAL_HISTORY });
  const [reviewOfSystems, setReviewOfSystems] = useState<ReviewOfSystems>({ ...EMPTY_ROS });
  const [ayurvedic, setAyurvedic] = useState<AyurvedicAssessment>({ ...EMPTY_AYURVEDIC });

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

  function loadSavedReports(pid: string): Promise<SavedReport[]> {
    setLoadingReports(true);
    return fetch("/api/admin/reports?patientId=" + encodeURIComponent(pid))
      .then((r) => r.json())
      .then((data) => {
        const reports = data.reports || [];
        setSavedReports(reports);
        return reports;
      })
      .catch(() => {
        setSavedReports([]);
        return [];
      })
      .finally(() => setLoadingReports(false));
  }

  useEffect(() => {
    if (!selectedPatient) {
      setPatient(null);
      setSavedReports([]);
      return;
    }
    resetForm();
    Promise.all([
      fetch("/api/admin/patients/" + selectedPatient)
        .then((r) => r.json())
        .catch(() => ({ patient: null })),
      loadSavedReports(selectedPatient),
    ]).then(([patientRes, reports]) => {
      const p = patientRes.patient;
      setPatient(p);
      if (reports.length > 0) {
        applyReportToForm(reports[0]);
      } else if (p) {
        setChiefComplaint(p.chiefComplaint || p.mainConcern || "");
      }
    });
  }, [selectedPatient]);

  function handleMetricChange(key: keyof ClinicalMetrics, value: string) {
    if (value === "") { setMetrics((prev) => ({ ...prev, [key]: "" })); return; }
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
        chiefComplaint,
        metrics,
        lifestyle,
        clinicalHistory,
        reviewOfSystems,
        ayurvedicAssessment: ayurvedic,
        actionPlan,
        clinicalSummary,
        previousInvestigations,
        reportData: {
          patientName: patient.fullName,
          age: patient.age,
          gender: patient.gender,
          chiefComplaint: chiefComplaint || patient.mainConcern || "Not specified",
          diagnoses: patient.diagnosis || patient.diabetesType || "Not specified",
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

  function handlePrint() { window.print(); }

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
        const href = pdfHref(data.pdfUrl);
        if (href) window.open(href, "_blank");
        loadSavedReports(selectedPatient);
      }
      else { alert("PDF generation succeeded but no URL returned."); }
    } catch (err) { console.error(err); alert("Failed to generate PDF."); }
    finally { setGeneratingPdf(false); }
  }

  function applyReportToForm(report: SavedReport) {
    try {
      const m = JSON.parse(report.metricsJson || "{}");
      const l = JSON.parse(report.lifestyleJson || "{}");
      const a = JSON.parse(report.actionPlanJson || "{}");
      const ch = JSON.parse(report.clinicalHistoryJson || "{}");
      const ros = JSON.parse(report.reviewOfSystemsJson || "{}");
      const ayu = JSON.parse(report.ayurvedicAssessmentJson || "{}");

      setClinicianName(report.clinicianName || "");
      setChiefComplaint(report.chiefComplaint || "");
      if (m.bloodPressureSystolic != null) setMetrics(m);
      if (l.dietaryPattern != null) setLifestyle(l);
      if (a.continuousMonitoring != null) setActionPlan(a);
      if (ch.historyOfPresentIllness != null) setClinicalHistory(ch);
      if (ros.general != null) setReviewOfSystems(ros);
      if (ayu.dashvida != null) setAyurvedic(ayu);
      setClinicalSummary(report.clinicalSummary || "");
      setPreviousInvestigations(report.previousInvestigations || "");
    } catch { /* ignore malformed report data */ }
  }

  function resetForm() {
    setClinicianName("");
    setChiefComplaint("");
    setMetrics({ ...EMPTY_METRICS });
    setLifestyle({ ...EMPTY_LIFESTYLE });
    setActionPlan({ ...EMPTY_ACTION_PLAN });
    setClinicalHistory({ ...EMPTY_CLINICAL_HISTORY });
    setReviewOfSystems({ ...EMPTY_ROS });
    setAyurvedic(JSON.parse(JSON.stringify(EMPTY_AYURVEDIC)));
    setClinicalSummary("");
    setPreviousInvestigations("");
    setGenerated(false);
    setLastReportId(null);
    setActiveTab("input");
  }

  function loadReportIntoView(report: SavedReport) {
    applyReportToForm(report);
    setGenerated(true);
    setActiveTab("report");
  }

  function formatDate(ts: string) {
    return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  function updateAyurvedicDashvida(field: keyof AyurvedicAssessment["dashvida"], value: string) {
    setAyurvedic((prev) => ({ ...prev, dashvida: { ...prev.dashvida, [field]: value } }));
  }

  function updateAyurvedicAshtavida(field: keyof AyurvedicAssessment["ashtavida"], value: string) {
    setAyurvedic((prev) => ({ ...prev, ashtavida: { ...prev.ashtavida, [field]: value } }));
  }

  const SubTabBtn = ({ tab, label }: { tab: InputSubTab; label?: string }) => (
    <button onClick={() => setInputSubTab(tab)} className={"px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap " + (inputSubTab === tab ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface bg-surface-container-low")}>{label || tab}</button>
  );

  if (loading || settingsLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-on-surface-variant">Loading...</div></div>;
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
                    <span className="material-symbols-outlined text-[18px]">print</span> Print
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
              <button onClick={() => setActiveTab("input")} className={"px-4 py-2 text-sm font-medium rounded-lg transition-colors " + (activeTab === "input" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface")}>Input</button>
              <button onClick={() => setActiveTab("report")} disabled={!generated} className={"px-4 py-2 text-sm font-medium rounded-lg transition-colors " + (activeTab === "report" ? "bg-primary text-on-primary" : generated ? "text-on-surface-variant hover:text-on-surface" : "text-gray-300 cursor-not-allowed")}>Generated Report</button>
              <button onClick={() => setActiveTab("history")} disabled={!selectedPatient} className={"px-4 py-2 text-sm font-medium rounded-lg transition-colors " + (activeTab === "history" ? "bg-primary text-on-primary" : selectedPatient ? "text-on-surface-variant hover:text-on-surface" : "text-gray-300 cursor-not-allowed")}>History</button>
            </div>
          </div>

          {saveSuccess && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 no-print">Report saved successfully.</div>}
          {saveError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 no-print">{saveError}</div>}

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
                    <div><span className="text-on-surface-variant">Diagnosis:</span> <span className="font-medium">{patient.diagnosis || patient.diabetesType || "—"}</span></div>
                    <div><span className="text-on-surface-variant">Duration:</span> <span className="font-medium">{patient.diagnosisDuration || "—"}</span></div>
                  </div>
                )}
              </div>

              {patient && (
                <>
                  <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
                    <div className="flex gap-1 bg-surface-container-low rounded-lg p-1 w-fit mb-4 overflow-x-auto">
                      {inputSubTabs.map((tab) => (
                        <SubTabBtn key={tab} tab={tab} />
                      ))}
                    </div>

                    {inputSubTab === "Basic & Metrics" && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-headline-md text-sm font-semibold text-on-surface mb-3 uppercase tracking-wider">Clinician Details</h3>
                          <input type="text" value={clinicianName} onChange={(e) => setClinicianName(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="e.g. Dr. Adhar Battulwar, MD (General Medicine)" />
                        </div>

                        <div>
                          <h3 className="font-headline-md text-sm font-semibold text-on-surface mb-3 uppercase tracking-wider">Chief Complaint</h3>
                          <textarea value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} rows={2} placeholder="Patient's primary complaints / reason for visit" className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                        </div>

                        <div>
                          <h3 className="font-headline-md text-sm font-semibold text-on-surface mb-3 uppercase tracking-wider">Clinical Metrics & Vitals</h3>
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
                              if (val === "" || val == null) return <div key={key} className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-100"><p className="text-xs text-gray-400 py-8">Enter {t.label} to see gauge</p></div>;
                              return <MetricGauge key={key} label={t.label} value={val as number} min={"min" in t ? t.min : undefined} max={"max" in t ? t.max : undefined} unit={t.unit} />;
                            })}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-headline-md text-sm font-semibold text-on-surface mb-3 uppercase tracking-wider">Lifestyle & Behavioral Assessment</h3>
                          <div className="space-y-4">
                            {[
                              { key: "dietaryPattern" as const, label: "Dietary Pattern", placeholder: "e.g. Mixed diet with occasional high-carb meals." },
                              { key: "hydrationStatus" as const, label: "Hydration Status", placeholder: "e.g. Approximately 1.5L daily water intake." },
                              { key: "physicalActivity" as const, label: "Physical Activity", placeholder: "e.g. Sedentary desk job. Walks 2-3 times per week." },
                              { key: "substanceUse" as const, label: "Substance Use", placeholder: "e.g. Non-smoker. Occasional social alcohol." },
                              { key: "sleepStress" as const, label: "Sleep & Stress", placeholder: "e.g. Reports 6-7 hours sleep. Moderate fatigue." },
                            ].map(({ key, label, placeholder }) => (
                              <div key={key}>
                                <label className="block text-xs text-on-surface-variant mb-1">{label}</label>
                                <textarea value={lifestyle[key]} onChange={(e) => setLifestyle((prev) => ({ ...prev, [key]: e.target.value }))} rows={2} placeholder={placeholder} className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {inputSubTab === "Clinical History" && (
                      <div className="space-y-4">
                        {[
                          { key: "historyOfPresentIllness" as const, label: "History of Present Illness", placeholder: "e.g. Patient reports gradual onset of increased thirst and frequent urination over past 3 months." },
                          { key: "pastMedicalHistory" as const, label: "Past Medical History", placeholder: "e.g. Hypertension (diagnosed 5 years ago), Dyslipidemia." },
                          { key: "pastSurgicalHistory" as const, label: "Past Surgical History", placeholder: "e.g. Appendectomy (2018), Cholecystectomy (2020)." },
                          { key: "drugHistory" as const, label: "Drug History", placeholder: "e.g. Metformin 500mg BD, Amlodipine 5mg OD. No known drug allergies." },
                          { key: "menstrualObstetricsHistory" as const, label: "Menstrual & Obstetrics History (if applicable)", placeholder: "e.g. Menarche at 13, regular cycles, G2P1L1." },
                          { key: "immunizationHistory" as const, label: "Immunization History", placeholder: "e.g. COVID-19 vaccinated (3 doses). Tetanus booster 2023." },
                          { key: "occupationalHistory" as const, label: "Occupational History", placeholder: "e.g. Software engineer. Sedentary desk job. No known occupational hazards." },
                        ].map(({ key, label, placeholder }) => (
                          <div key={key}>
                            <label className="block text-xs text-on-surface-variant mb-1">{label}</label>
                            <textarea value={clinicalHistory[key]} onChange={(e) => setClinicalHistory((prev) => ({ ...prev, [key]: e.target.value }))} rows={3} placeholder={placeholder} className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                          </div>
                        ))}
                      </div>
                    )}

                    {inputSubTab === "Review of Systems" && (
                      <div className="space-y-4">
                        {[
                          { key: "general" as const, label: "General", placeholder: "e.g. No fever, weight stable, appetite normal." },
                          { key: "skin" as const, label: "Skin", placeholder: "e.g. No rashes, itching, or discoloration." },
                          { key: "cns" as const, label: "CNS (Central Nervous System)", placeholder: "e.g. No headache, dizziness, numbness, or tingling." },
                          { key: "cvs" as const, label: "CVS (Cardiovascular System)", placeholder: "e.g. No chest pain, palpitations, or orthopnea." },
                          { key: "respiratory" as const, label: "Respiratory", placeholder: "e.g. No cough, dyspnea, or wheezing." },
                          { key: "gastrointestinal" as const, label: "Gastrointestinal Tract", placeholder: "e.g. No abdominal pain, nausea, or altered bowel habits." },
                          { key: "genitourinary" as const, label: "Genitourinary", placeholder: "e.g. No burning micturition, frequency, or urgency." },
                          { key: "endocrine" as const, label: "Endocrine", placeholder: "e.g. No heat/cold intolerance, no excessive sweating." },
                          { key: "musculoskeletal" as const, label: "Musculoskeletal", placeholder: "e.g. No joint pain, swelling, or muscle weakness." },
                          { key: "psychiatric" as const, label: "Psychiatric", placeholder: "e.g. No anxiety, depression, or sleep disturbances." },
                        ].map(({ key, label, placeholder }) => (
                          <div key={key}>
                            <label className="block text-xs text-on-surface-variant mb-1">{label}</label>
                            <textarea value={reviewOfSystems[key]} onChange={(e) => setReviewOfSystems((prev) => ({ ...prev, [key]: e.target.value }))} rows={2} placeholder={placeholder} className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                          </div>
                        ))}
                      </div>
                    )}

                    {inputSubTab === "Previous Investigations" && (
                      <div>
                        <h3 className="font-headline-md text-sm font-semibold text-on-surface mb-3 uppercase tracking-wider">Previous Investigations</h3>
                        <textarea value={previousInvestigations} onChange={(e) => setPreviousInvestigations(e.target.value)} rows={6} placeholder="e.g. HbA1c (3 months ago): 7.2% — Fasting Glucose (1 month ago): 128 mg/dL — Lipid Profile: TC 210, LDL 130, HDL 38, TG 180 — Reports from endocrinologist dated Jan 2026..." className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                      </div>
                    )}

                    {inputSubTab === "Ayurvedic Assessment" && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-headline-md text-sm font-semibold text-on-surface mb-3 uppercase tracking-wider">Dashvida Pariksha (Ten-fold Examination)</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              { key: "prakurti" as const, label: "Prakurti (Constitution)", placeholder: "e.g. Vata-Pitta" },
                              { key: "vikriti" as const, label: "Vikriti (Current State)", placeholder: "e.g. Vata imbalance" },
                              { key: "sara" as const, label: "Sara (Tissue Quality)", placeholder: "e.g. Madhyama" },
                              { key: "samhanana" as const, label: "Samhanana (Body Build)", placeholder: "e.g. Madhyama" },
                              { key: "pramanat" as const, label: "Pramanat (Body Measurement)", placeholder: "e.g. Appropriate" },
                              { key: "satmya" as const, label: "Satmya (Homologation)", placeholder: "e.g. Sarva rasa satmya" },
                              { key: "sarva" as const, label: "Satva (Mental Strength)", placeholder: "e.g. Madhyama" },
                              { key: "aharShakti" as const, label: "Ahar Shakti (Food Capacity)", placeholder: "e.g. Abhyavaharana - Madhyama, Jarana - Avara" },
                              { key: "vyayamaShakti" as const, label: "Vyayama Shakti (Exercise Capacity)", placeholder: "e.g. Madhyama" },
                              { key: "vaya" as const, label: "Vaya (Age)", placeholder: "e.g. Madhyama (Middle age)" },
                            ].map(({ key, label, placeholder }) => (
                              <div key={key}>
                                <label className="block text-xs text-on-surface-variant mb-1">{label}</label>
                                <input type="text" value={ayurvedic.dashvida[key]} onChange={(e) => updateAyurvedicDashvida(key, e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-outline-variant/10 pt-6">
                          <h3 className="font-headline-md text-sm font-semibold text-on-surface mb-3 uppercase tracking-wider">Ashtavida Pariksha (Eight-fold Examination)</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              { key: "nadi" as const, label: "Nadi (Pulse)", placeholder: "e.g. Vata-pulse" },
                              { key: "mutra" as const, label: "Mutra (Urine)", placeholder: "e.g. Normal color & frequency" },
                              { key: "mala" as const, label: "Mala (Stool)", placeholder: "e.g. Regular, well-formed" },
                              { key: "jihva" as const, label: "Jihva (Tongue)", placeholder: "e.g. Slight coating" },
                              { key: "shabda" as const, label: "Shabda (Voice/Speech)", placeholder: "e.g. Normal" },
                              { key: "sparsh" as const, label: "Sparsha (Touch/Skin)", placeholder: "e.g. Warm, dry" },
                              { key: "drik" as const, label: "Drik (Eyes/Vision)", placeholder: "e.g. Clear, no pallor" },
                              { key: "akruti" as const, label: "Akruti (General Appearance)", placeholder: "e.g. Well-nourished" },
                            ].map(({ key, label, placeholder }) => (
                              <div key={key}>
                                <label className="block text-xs text-on-surface-variant mb-1">{label}</label>
                                <input type="text" value={ayurvedic.ashtavida[key]} onChange={(e) => updateAyurvedicAshtavida(key, e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-outline-variant/10 pt-6">
                          <h3 className="font-headline-md text-sm font-semibold text-on-surface mb-3 uppercase tracking-wider">Other Assessments</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              { key: "doshaAssessment" as const, label: "Dosha Assessment", placeholder: "e.g. Vata-Pitta predominant" },
                              { key: "agniAssessment" as const, label: "Agni Assessment (Digestive Fire)", placeholder: "e.g. Vishama Agni (Irregular)" },
                              { key: "amaAssessment" as const, label: "Ama Assessment (Toxins)", placeholder: "e.g. Presence of ama - mild" },
                              { key: "koshta" as const, label: "Koshta (Bowel Habit)", placeholder: "e.g. Madhyama Koshta" },
                              { key: "nidra" as const, label: "Nidra (Sleep)", placeholder: "e.g. Sound sleep, 7 hours" },
                              { key: "ahara" as const, label: "Ahara (Diet)", placeholder: "e.g. Mixed diet, 3 meals/day" },
                              { key: "vihara" as const, label: "Vihara (Lifestyle)", placeholder: "e.g. Sedentary, digital work" },
                              { key: "mansikBhava" as const, label: "Mansik Bhava (Mental State)", placeholder: "e.g. Calm, occasionally anxious" },
                              { key: "malaExamination" as const, label: "Mala Examination", placeholder: "e.g. Normal consistency, regular" },
                              { key: "modalities" as const, label: "Modalities", placeholder: "e.g. Panchakarma, Shamana" },
                              { key: "personality" as const, label: "Personality", placeholder: "e.g. Sattvic" },
                            ].map(({ key, label, placeholder }) => (
                              <div key={key}>
                                <label className="block text-xs text-on-surface-variant mb-1">{label}</label>
                                <input type="text" value={(ayurvedic as any)[key]} onChange={(e) => setAyurvedic((prev) => ({ ...prev, [key]: e.target.value }))} placeholder={placeholder} className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {inputSubTab === "Action Plan & Summary" && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-headline-md text-sm font-semibold text-on-surface mb-3 uppercase tracking-wider">Management & Action Plan</h3>
                          <div className="space-y-4">
                            {[
                              { key: "continuousMonitoring" as const, label: "Continuous Monitoring", placeholder: "e.g. Daily fasting and postprandial glucose logging." },
                              { key: "dietaryOptimization" as const, label: "Dietary Optimization", placeholder: "e.g. Reduce refined carbohydrates. Increase fiber." },
                              { key: "physicalActivityPlan" as const, label: "Physical Activity", placeholder: "e.g. 150 min/week moderate aerobic activity." },
                              { key: "followUpSchedule" as const, label: "Follow-up Schedule", placeholder: "e.g. Follow-up in 3 months for HbA1c review." },
                            ].map(({ key, label, placeholder }) => (
                              <div key={key}>
                                <label className="block text-xs text-on-surface-variant mb-1">{label}</label>
                                <textarea value={actionPlan[key]} onChange={(e) => setActionPlan((prev) => ({ ...prev, [key]: e.target.value }))} rows={2} placeholder={placeholder} className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-headline-md text-sm font-semibold text-on-surface mb-3 uppercase tracking-wider">Clinical Summary & Observations</h3>
                          <textarea value={clinicalSummary} onChange={(e) => setClinicalSummary(e.target.value)} rows={4} placeholder="e.g. Patient presents with Type 2 diabetes managed on Metformin 500 mg BD. Metabolic control is moderate with HbA1c at 7.2%." className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                        </div>
                      </div>
                    )}
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
                  <p className="text-gray-900 font-medium">{chiefComplaint || patient.mainConcern || "Not specified"}</p>
                </div>

                <section>
                  <h2 className="text-lg font-bold text-[#00647c] border-b-2 border-[#00647c] pb-1 mb-4">1. Clinical & Medical History</h2>
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50"><th className="text-left py-2.5 px-4 font-semibold text-gray-700 w-1/3">Condition / Parameter</th><th className="text-left py-2.5 px-4 font-semibold text-gray-700">Clinical Status & Details</th></tr></thead>
                    <tbody>
                      <tr className="border-b border-gray-100"><td className="py-2.5 px-4 text-gray-500">Primary Diagnoses</td><td className="py-2.5 px-4 font-medium">{patient.diagnosis || patient.diabetesType || "Not specified"} — {patient.diagnosisDuration || ""}</td></tr>
                      <tr className="border-b border-gray-100"><td className="py-2.5 px-4 text-gray-500">Current Medications</td><td className="py-2.5 px-4 font-medium">{patient.currentMedications || "None reported"}</td></tr>
                      <tr className="border-b border-gray-100"><td className="py-2.5 px-4 text-gray-500">Significant History</td><td className="py-2.5 px-4 font-medium">{patient.additionalNotes || "None reported"}</td></tr>
                    </tbody>
                  </table>
                </section>

                {clinicalHistory.historyOfPresentIllness && (
                  <section>
                    <h2 className="text-lg font-bold text-[#00647c] border-b-2 border-[#00647c] pb-1 mb-4">2. Clinical History</h2>
                    <table className="w-full text-sm">
                      <thead><tr className="bg-gray-50"><th className="text-left py-2.5 px-4 font-semibold text-gray-700 w-1/3">History</th><th className="text-left py-2.5 px-4 font-semibold text-gray-700">Details</th></tr></thead>
                      <tbody>
                        {[
                          { label: "History of Present Illness", value: clinicalHistory.historyOfPresentIllness },
                          { label: "Past Medical History", value: clinicalHistory.pastMedicalHistory },
                          { label: "Past Surgical History", value: clinicalHistory.pastSurgicalHistory },
                          { label: "Drug History", value: clinicalHistory.drugHistory },
                          { label: "Menstrual & Obstetrics History", value: clinicalHistory.menstrualObstetricsHistory },
                          { label: "Immunization History", value: clinicalHistory.immunizationHistory },
                          { label: "Occupational History", value: clinicalHistory.occupationalHistory },
                        ].filter((r) => r.value).map((item) => (
                          <tr key={item.label} className="border-b border-gray-100"><td className="py-2.5 px-4 text-gray-500 align-top">{item.label}</td><td className="py-2.5 px-4">{item.value}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                )}

                <section>
                  <h2 className="text-lg font-bold text-[#00647c] border-b-2 border-[#00647c] pb-1 mb-4">3. Lifestyle & Behavioral Assessment</h2>
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

                {reviewOfSystems.general && (
                  <section>
                    <h2 className="text-lg font-bold text-[#00647c] border-b-2 border-[#00647c] pb-1 mb-4">4. Review of Systems</h2>
                    <table className="w-full text-sm">
                      <thead><tr className="bg-gray-50"><th className="text-left py-2.5 px-4 font-semibold text-gray-700 w-1/3">System</th><th className="text-left py-2.5 px-4 font-semibold text-gray-700">Findings</th></tr></thead>
                      <tbody>
                        {[
                          { label: "General", value: reviewOfSystems.general },
                          { label: "Skin", value: reviewOfSystems.skin },
                          { label: "CNS", value: reviewOfSystems.cns },
                          { label: "CVS", value: reviewOfSystems.cvs },
                          { label: "Respiratory", value: reviewOfSystems.respiratory },
                          { label: "Gastrointestinal Tract", value: reviewOfSystems.gastrointestinal },
                          { label: "Genitourinary", value: reviewOfSystems.genitourinary },
                          { label: "Endocrine", value: reviewOfSystems.endocrine },
                          { label: "Musculoskeletal", value: reviewOfSystems.musculoskeletal },
                          { label: "Psychiatric", value: reviewOfSystems.psychiatric },
                        ].filter((r) => r.value).map((item) => (
                          <tr key={item.label} className="border-b border-gray-100"><td className="py-2.5 px-4 text-gray-500 align-top">{item.label}</td><td className="py-2.5 px-4">{item.value}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                )}

                <section>
                  <h2 className="text-lg font-bold text-[#00647c] border-b-2 border-[#00647c] pb-1 mb-4">5. Previous Investigations</h2>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">{previousInvestigations || "None reported"}</div>
                </section>

                <section>
                  <h2 className="text-lg font-bold text-[#00647c] border-b-2 border-[#00647c] pb-1 mb-4">6. Clinical Metrics & Vitals</h2>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {(["bloodPressureSystolic", "heartRate", "bmi", "hba1c"] as const).map((key) => {
                      const t = T[key]; const val = metrics[key];
                      if (val === "" || val == null) return null;
                      return <MetricGauge key={key} label={t.label} value={val as number} min={"min" in t ? t.min : undefined} max={"max" in t ? t.max : undefined} unit={t.unit} />;
                    })}
                  </div>
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50"><th className="text-left py-2.5 px-4 font-semibold text-gray-700">Metric</th><th className="text-left py-2.5 px-4 font-semibold text-gray-700">Recorded Value</th><th className="text-left py-2.5 px-4 font-semibold text-gray-700">Target Range</th><th className="text-left py-2.5 px-4 font-semibold text-gray-700">Status</th></tr></thead>
                    <tbody>
                      {(metrics.bloodPressureSystolic !== "" || metrics.bloodPressureDiastolic !== "") && (() => {
                        const sys = metrics.bloodPressureSystolic || 0; const dia = metrics.bloodPressureDiastolic || 0;
                        const st = getMetricStatus("bloodPressureSystolic", sys as number);
                        const sc = st === "Normal" ? "text-green-700 bg-green-50" : st === "High" ? "text-red-700 bg-red-50" : "text-amber-700 bg-amber-50";
                        return <tr className="border-b border-gray-100"><td className="py-2.5 px-4 text-gray-500">Blood Pressure</td><td className="py-2.5 px-4 font-medium">{sys}/{dia} mmHg</td><td className="py-2.5 px-4 text-gray-500">&lt; {T.bloodPressureSystolic.max}/{T.bloodPressureDiastolic.max} mmHg</td><td className="py-2.5 px-4"><span className={"inline-block px-2 py-0.5 rounded-full text-xs font-medium " + sc}>{st}</span></td></tr>;
                      })()}
                      {(metrics.heartRate !== "") && (() => {
                        const hr = metrics.heartRate as number; const st = getMetricStatus("heartRate", hr);
                        const sc = st === "Normal" ? "text-green-700 bg-green-50" : st === "High" ? "text-red-700 bg-red-50" : "text-amber-700 bg-amber-50";
                        return <tr className="border-b border-gray-100"><td className="py-2.5 px-4 text-gray-500">Heart Rate</td><td className="py-2.5 px-4 font-medium">{hr} bpm</td><td className="py-2.5 px-4 text-gray-500">{T.heartRate.min}-{T.heartRate.max} bpm</td><td className="py-2.5 px-4"><span className={"inline-block px-2 py-0.5 rounded-full text-xs font-medium " + sc}>{st}</span></td></tr>;
                      })()}
                      {(metrics.bmi !== "" || metrics.weight !== "") && (() => {
                        const bmi = (metrics.bmi as number) || 0; const st = getMetricStatus("bmi", bmi);
                        const sc = st === "Normal" ? "text-green-700 bg-green-50" : st === "High" ? "text-red-700 bg-red-50" : "text-amber-700 bg-amber-50";
                        return <tr className="border-b border-gray-100"><td className="py-2.5 px-4 text-gray-500">BMI / Weight</td><td className="py-2.5 px-4 font-medium">{bmi} kg/m2{metrics.weight !== "" ? ` (${metrics.weight} kg)` : ""}</td><td className="py-2.5 px-4 text-gray-500">{T.bmi.min}-{T.bmi.max} kg/m2</td><td className="py-2.5 px-4"><span className={"inline-block px-2 py-0.5 rounded-full text-xs font-medium " + sc}>{st}</span></td></tr>;
                      })()}
                      {(metrics.hba1c !== "") && (() => {
                        const hba = metrics.hba1c as number; const st = getMetricStatus("hba1c", hba);
                        const sc = st === "Normal" ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50";
                        return <tr className="border-b border-gray-100"><td className="py-2.5 px-4 text-gray-500">HbA1c</td><td className="py-2.5 px-4 font-medium">{hba}%</td><td className="py-2.5 px-4 text-gray-500">&lt; {T.hba1c.max}%</td><td className="py-2.5 px-4"><span className={"inline-block px-2 py-0.5 rounded-full text-xs font-medium " + sc}>{st}</span></td></tr>;
                      })()}
                      {(metrics.glucoseFasting !== "") && (() => {
                        const gl = metrics.glucoseFasting as number; const st = getMetricStatus("glucoseFasting", gl);
                        const sc = st === "Normal" ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50";
                        return <tr className="border-b border-gray-100"><td className="py-2.5 px-4 text-gray-500">Fasting Glucose</td><td className="py-2.5 px-4 font-medium">{gl} mg/dL</td><td className="py-2.5 px-4 text-gray-500">&lt; {T.glucoseFasting.max} mg/dL</td><td className="py-2.5 px-4"><span className={"inline-block px-2 py-0.5 rounded-full text-xs font-medium " + sc}>{st}</span></td></tr>;
                      })()}
                      {(metrics.glucosePostPrandial !== "") && (() => {
                        const gl = metrics.glucosePostPrandial as number; const st = getMetricStatus("glucosePostPrandial", gl);
                        const sc = st === "Normal" ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50";
                        return <tr className="border-b border-gray-100"><td className="py-2.5 px-4 text-gray-500">Postprandial Glucose</td><td className="py-2.5 px-4 font-medium">{gl} mg/dL</td><td className="py-2.5 px-4 text-gray-500">&lt; {T.glucosePostPrandial.max} mg/dL</td><td className="py-2.5 px-4"><span className={"inline-block px-2 py-0.5 rounded-full text-xs font-medium " + sc}>{st}</span></td></tr>;
                      })()}
                      {metrics.bloodPressureSystolic === "" && metrics.heartRate === "" && metrics.bmi === "" && metrics.hba1c === "" && metrics.glucoseFasting === "" && metrics.glucosePostPrandial === "" && (
                        <tr><td className="py-4 px-4 text-gray-400 text-center" colSpan={4}>No metric data recorded.</td></tr>
                      )}
                    </tbody>
                  </table>
                </section>

                {ayurvedic.dashvida.prakurti && (
                  <section>
                    <h2 className="text-lg font-bold text-[#00647c] border-b-2 border-[#00647c] pb-1 mb-4">7. Ayurvedic Assessment</h2>
                    <table className="w-full text-sm mb-4">
                      <thead><tr className="bg-gray-50"><th className="text-left py-2.5 px-4 font-semibold text-gray-700 w-1/3">Dashvida Pariksha</th><th className="text-left py-2.5 px-4 font-semibold text-gray-700">Finding</th></tr></thead>
                      <tbody>
                        {[
                          { label: "Prakurti", value: ayurvedic.dashvida.prakurti },
                          { label: "Vikriti", value: ayurvedic.dashvida.vikriti },
                          { label: "Sara", value: ayurvedic.dashvida.sara },
                          { label: "Samhanana", value: ayurvedic.dashvida.samhanana },
                          { label: "Pramanat", value: ayurvedic.dashvida.pramanat },
                          { label: "Satmya", value: ayurvedic.dashvida.satmya },
                          { label: "Satva", value: ayurvedic.dashvida.sarva },
                          { label: "Ahar Shakti", value: ayurvedic.dashvida.aharShakti },
                          { label: "Vyayama Shakti", value: ayurvedic.dashvida.vyayamaShakti },
                          { label: "Vaya", value: ayurvedic.dashvida.vaya },
                        ].filter((r) => r.value).map((item) => (
                          <tr key={item.label} className="border-b border-gray-100"><td className="py-2.5 px-4 text-gray-500">{item.label}</td><td className="py-2.5 px-4 font-medium">{item.value}</td></tr>
                        ))}
                      </tbody>
                    </table>
                    <table className="w-full text-sm mb-4">
                      <thead><tr className="bg-gray-50"><th className="text-left py-2.5 px-4 font-semibold text-gray-700 w-1/3">Ashtavida Pariksha</th><th className="text-left py-2.5 px-4 font-semibold text-gray-700">Finding</th></tr></thead>
                      <tbody>
                        {[
                          { label: "Nadi", value: ayurvedic.ashtavida.nadi },
                          { label: "Mutra", value: ayurvedic.ashtavida.mutra },
                          { label: "Mala", value: ayurvedic.ashtavida.mala },
                          { label: "Jihva", value: ayurvedic.ashtavida.jihva },
                          { label: "Shabda", value: ayurvedic.ashtavida.shabda },
                          { label: "Sparsha", value: ayurvedic.ashtavida.sparsh },
                          { label: "Drik", value: ayurvedic.ashtavida.drik },
                          { label: "Akruti", value: ayurvedic.ashtavida.akruti },
                        ].filter((r) => r.value).map((item) => (
                          <tr key={item.label} className="border-b border-gray-100"><td className="py-2.5 px-4 text-gray-500">{item.label}</td><td className="py-2.5 px-4 font-medium">{item.value}</td></tr>
                        ))}
                      </tbody>
                    </table>
                    <table className="w-full text-sm">
                      <thead><tr className="bg-gray-50"><th className="text-left py-2.5 px-4 font-semibold text-gray-700 w-1/3">Assessment</th><th className="text-left py-2.5 px-4 font-semibold text-gray-700">Finding</th></tr></thead>
                      <tbody>
                        {[
                          { label: "Dosha Assessment", value: ayurvedic.doshaAssessment },
                          { label: "Agni Assessment", value: ayurvedic.agniAssessment },
                          { label: "Ama Assessment", value: ayurvedic.amaAssessment },
                          { label: "Koshta", value: ayurvedic.koshta },
                          { label: "Nidra", value: ayurvedic.nidra },
                          { label: "Ahara", value: ayurvedic.ahara },
                          { label: "Vihara", value: ayurvedic.vihara },
                          { label: "Mansik Bhava", value: ayurvedic.mansikBhava },
                          { label: "Mala Examination", value: ayurvedic.malaExamination },
                          { label: "Modalities", value: ayurvedic.modalities },
                          { label: "Personality", value: ayurvedic.personality },
                        ].filter((r) => r.value).map((item) => (
                          <tr key={item.label} className="border-b border-gray-100"><td className="py-2.5 px-4 text-gray-500">{item.label}</td><td className="py-2.5 px-4 font-medium">{item.value}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                )}

                <section>
                  <h2 className="text-lg font-bold text-[#00647c] border-b-2 border-[#00647c] pb-1 mb-4">8. Clinical Summary & Observations</h2>
                  <div className="bg-[#f0f9fb] rounded-lg p-5 text-sm text-gray-800 leading-relaxed border-l-4 border-[#00647c]">
                    {clinicalSummary || "No clinical summary provided."}
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-bold text-[#00647c] border-b-2 border-[#00647c] pb-1 mb-4">9. Personalized Management & Action Plan</h2>
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
                            <button onClick={() => handleDownloadPdf(r.id)} disabled={generatingPdf} className="text-secondary hover:text-secondary/80 text-xs font-medium px-3 py-1 rounded hover:bg-secondary/5 transition-colors ml-1 disabled:opacity-50">{generatingPdf ? "..." : "Download"}</button>
                            {r.pdfUrl && <a href={pdfHref(r.pdfUrl) || "#"} target="_blank" rel="noopener noreferrer" className="text-tertiary hover:text-tertiary/80 text-xs font-medium px-3 py-1 rounded hover:bg-tertiary/5 transition-colors ml-1">Open PDF</a>}
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
