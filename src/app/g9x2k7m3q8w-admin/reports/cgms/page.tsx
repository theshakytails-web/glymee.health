"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ReportsTabs from "@/components/admin/ReportsTabs";

interface PatientOption {
  id: string;
  fullName: string;
  email: string;
}

interface HourlyRow {
  time: string;
  avg: string;
}

interface ReportRecord {
  id: string;
  patientName: string;
  period: string | null;
  duration: string | null;
  createdAt: string;
}

const inputClass =
  "w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors";
const textareaClass =
  "w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors resize-y";
const labelClass = "block text-xs text-on-surface-variant mb-1";

const initialHourlyRows: HourlyRow[] = [
  { time: "12:00", avg: "" },
  { time: "13:00", avg: "" },
  { time: "14:00", avg: "" },
  { time: "15:00", avg: "" },
  { time: "16:00", avg: "" },
];

export default function CgmsReportPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [period, setPeriod] = useState("");
  const [duration, setDuration] = useState("");

  const [clinicalBackground, setClinicalBackground] = useState("");

  const [avgGlucose, setAvgGlucose] = useState("");
  const [gmi, setGmi] = useState("");
  const [tir, setTir] = useState("");
  const [tar, setTar] = useState("");
  const [tbr, setTbr] = useState("");
  const [cv, setCv] = useState("");
  const [lowest, setLowest] = useState("");
  const [highest, setHighest] = useState("");

  const [score, setScore] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [commentary, setCommentary] = useState("");

  const [morningPattern, setMorningPattern] = useState("");
  const [morningObservation, setMorningObservation] = useState("");
  const [afternoonHourly, setAfternoonHourly] = useState<HourlyRow[]>(initialHourlyRows);
  const [afternoonObservation, setAfternoonObservation] = useState("");
  const [nightPattern, setNightPattern] = useState("");
  const [nightObservation, setNightObservation] = useState("");

  const [dawnPhenomenon, setDawnPhenomenon] = useState("");

  const [goingWell, setGoingWell] = useState("");
  const [areasForAttention, setAreasForAttention] = useState("");

  const [foodGoal, setFoodGoal] = useState("");
  const [foodRecommendations, setFoodRecommendations] = useState("");
  const [walkingTarget, setWalkingTarget] = useState("");
  const [movement, setMovement] = useState("");
  const [strength, setStrength] = useState("");
  const [sleepTarget, setSleepTarget] = useState("");
  const [sleepRecommendations, setSleepRecommendations] = useState("");
  const [stressTarget, setStressTarget] = useState("");
  const [stressRecommendations, setStressRecommendations] = useState("");

  const [summary, setSummary] = useState("");
  const [nextGoals, setNextGoals] = useState("");
  const [conclusion, setConclusion] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [history, setHistory] = useState<ReportRecord[]>([]);

  useEffect(() => {
    fetch("/api/admin/auth/me")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(() => fetch("/api/admin/patients?limit=200"))
      .then((r) => r.json())
      .then((data) => {
        const list = data.patients || [];
        setPatients(list);
        const prefill = new URLSearchParams(window.location.search).get("patientId");
        if (prefill && list.find((p: PatientOption) => p.id === prefill)) {
          setPatientId(prefill);
          setPatientName(list.find((p: PatientOption) => p.id === prefill).fullName);
        }
      })
      .catch(() => router.push("/g9x2k7m3q8w-admin"));
  }, [router]);

  useEffect(() => {
    if (!patientId) return;
    fetch(`/api/admin/reports/cgms?patientId=${encodeURIComponent(patientId)}`)
      .then((r) => r.json())
      .then((data) => setHistory(data.reports || []))
      .catch(() => {});
  }, [patientId, success]);

  function handlePatientSelect(id: string) {
    setPatientId(id);
    const p = patients.find((pt) => pt.id === id);
    setPatientName(p ? p.fullName : "");
  }

  function setHourlyRow(index: number, field: keyof HourlyRow, value: string) {
    setAfternoonHourly((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  }

  function addHourlyRow() {
    setAfternoonHourly((prev) => [...prev, { time: "", avg: "" }]);
  }

  function removeHourlyRow(index: number) {
    setAfternoonHourly((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setError("");
    setSuccess("");
    if (!patientId) {
      setError("Please select a patient.");
      return;
    }
    setSaving(true);
    try {
      const reportData = {
        clinicalBackground,
        glucoseOverview: { avgGlucose, gmi, tir, tar, tbr, cv, lowest, highest },
        healthScore: { score, interpretation, commentary },
        patternAnalysis: {
          morningPattern,
          morningObservation,
          afternoonHourly: afternoonHourly.filter((h) => h.time || h.avg),
          afternoonObservation,
          nightPattern,
          nightObservation,
        },
        dawnPhenomenon,
        keyFindings: { goingWell, areasForAttention },
        actionPlan: {
          foodGoal,
          foodRecommendations,
          walkingTarget,
          movement,
          strength,
          sleepTarget,
          sleepRecommendations,
          stressTarget,
          stressRecommendations,
        },
        summary,
        nextGoals,
        conclusion,
      };

      const res = await fetch("/api/admin/reports/cgms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, period, duration, reportData }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save report");
        return;
      }
      setSuccess("Report saved successfully!");
      window.open(`/api/admin/reports/cgms/${data.id}/pdf`, "_blank");
    } catch {
      setError("Network error while saving report.");
    } finally {
      setSaving(false);
    }
  }

  function openPdf(id: string) {
    window.open(`/api/admin/reports/cgms/${id}/pdf`, "_blank");
  }

  return (
    <div className="min-h-screen bg-surface-container-low">
      <AdminSidebar />
      <main className="md:ml-64 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <ReportsTabs />
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-headline-md text-2xl font-bold text-on-surface">
              14-Day CGMS Insight Report
            </h1>
          </div>

          {success && (
            <div className="mb-4 bg-secondary/10 text-secondary px-4 py-3 rounded-lg text-sm font-medium">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 bg-error/10 text-error px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
              <h2 className="font-headline-md text-base font-semibold text-on-surface mb-4">
                Patient &amp; Monitoring
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className={labelClass}>Patient</label>
                  <select
                    value={patientId}
                    onChange={(e) => handlePatientSelect(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">— Choose a patient —</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Period (e.g. 23 Aug to 6 Sept)</label>
                  <input
                    type="text"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    placeholder="23 Aug to 6 Sept"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="14 Days"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
              <h2 className="font-headline-md text-base font-semibold text-on-surface mb-4">
                B. Clinical Background
              </h2>
              <textarea
                rows={4}
                value={clinicalBackground}
                onChange={(e) => setClinicalBackground(e.target.value)}
                placeholder="Patient's clinical background, medical history, current medications..."
                className={textareaClass}
              />
            </div>

            <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
              <h2 className="font-headline-md text-base font-semibold text-on-surface mb-4">
                C. Glucose Overview
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className={labelClass}>Average Glucose (mg/dL)</label>
                  <input type="text" value={avgGlucose} onChange={(e) => setAvgGlucose(e.target.value)} placeholder="e.g. 142" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>GMI / HbA1c (%)</label>
                  <input type="text" value={gmi} onChange={(e) => setGmi(e.target.value)} placeholder="e.g. 6.5" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Time in Range (%)</label>
                  <input type="text" value={tir} onChange={(e) => setTir(e.target.value)} placeholder="e.g. 72" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Time Above Range (%)</label>
                  <input type="text" value={tar} onChange={(e) => setTar(e.target.value)} placeholder="e.g. 22" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Time Below Range (%)</label>
                  <input type="text" value={tbr} onChange={(e) => setTbr(e.target.value)} placeholder="e.g. 6" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>CV (%)</label>
                  <input type="text" value={cv} onChange={(e) => setCv(e.target.value)} placeholder="e.g. 34" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Lowest Glucose (mg/dL)</label>
                  <input type="text" value={lowest} onChange={(e) => setLowest(e.target.value)} placeholder="e.g. 72" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Highest Glucose (mg/dL)</label>
                  <input type="text" value={highest} onChange={(e) => setHighest(e.target.value)} placeholder="e.g. 248" className={inputClass} />
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
              <h2 className="font-headline-md text-base font-semibold text-on-surface mb-4">
                D. Health Score
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Score (0–100)</label>
                  <input type="number" min="0" max="100" value={score} onChange={(e) => setScore(e.target.value)} placeholder="e.g. 78" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Interpretation</label>
                  <input type="text" value={interpretation} onChange={(e) => setInterpretation(e.target.value)} placeholder="e.g. Good" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Commentary</label>
                  <textarea rows={2} value={commentary} onChange={(e) => setCommentary(e.target.value)} placeholder="Brief commentary on the score..." className={textareaClass} />
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
              <h2 className="font-headline-md text-base font-semibold text-on-surface mb-4">
                E. Glucose Pattern Analysis
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Morning Pattern</label>
                    <textarea rows={3} value={morningPattern} onChange={(e) => setMorningPattern(e.target.value)} placeholder="Describe morning glucose patterns..." className={textareaClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Morning Observation</label>
                    <textarea rows={3} value={morningObservation} onChange={(e) => setMorningObservation(e.target.value)} placeholder="Observations for morning..." className={textareaClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Afternoon Hourly Averages</label>
                  <div className="space-y-2 mt-1">
                    {afternoonHourly.map((row, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={row.time}
                          onChange={(e) => setHourlyRow(i, "time", e.target.value)}
                          placeholder="Time"
                          className={`${inputClass} w-24`}
                        />
                        <input
                          type="text"
                          value={row.avg}
                          onChange={(e) => setHourlyRow(i, "avg", e.target.value)}
                          placeholder="Avg mg/dL"
                          className={`${inputClass} flex-1`}
                        />
                        <button
                          onClick={() => removeHourlyRow(i)}
                          className="text-on-surface-variant hover:text-error transition-colors"
                          title="Remove"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addHourlyRow}
                    className="mt-2 text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Add hour
                  </button>
                </div>

                <div>
                  <label className={labelClass}>Afternoon Observation</label>
                  <textarea rows={3} value={afternoonObservation} onChange={(e) => setAfternoonObservation(e.target.value)} placeholder="Observations for afternoon..." className={textareaClass} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Night Pattern</label>
                    <textarea rows={3} value={nightPattern} onChange={(e) => setNightPattern(e.target.value)} placeholder="Describe night glucose patterns..." className={textareaClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Night Observation</label>
                    <textarea rows={3} value={nightObservation} onChange={(e) => setNightObservation(e.target.value)} placeholder="Observations for night..." className={textareaClass} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
              <h2 className="font-headline-md text-base font-semibold text-on-surface mb-4">
                F. Dawn Phenomenon
              </h2>
              <textarea rows={3} value={dawnPhenomenon} onChange={(e) => setDawnPhenomenon(e.target.value)} placeholder="Dawn phenomenon analysis..." className={textareaClass} />
            </div>

            <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
              <h2 className="font-headline-md text-base font-semibold text-on-surface mb-4">
                G. Key Findings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>What Is Going Well (one per line)</label>
                  <textarea rows={3} value={goingWell} onChange={(e) => setGoingWell(e.target.value)} placeholder="Stable morning readings\nGood time in range\n..." className={textareaClass} />
                </div>
                <div>
                  <label className={labelClass}>Areas Requiring Attention (one per line)</label>
                  <textarea rows={4} value={areasForAttention} onChange={(e) => setAreasForAttention(e.target.value)} placeholder="Post-lunch spikes\nDawn phenomenon\n..." className={textareaClass} />
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
              <h2 className="font-headline-md text-base font-semibold text-on-surface mb-4">
                H. Personalised Action Plan
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-on-surface mb-3">1. Food &amp; Nutrition</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Primary Goal</label>
                      <input type="text" value={foodGoal} onChange={(e) => setFoodGoal(e.target.value)} placeholder="e.g. Reduce post-meal spikes" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Recommendations (one per line)</label>
                      <textarea rows={2} value={foodRecommendations} onChange={(e) => setFoodRecommendations(e.target.value)} placeholder="Avoid refined carbs\nInclude protein at breakfast\n..." className={textareaClass} />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-on-surface mb-3">2. Physical Activity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Daily Walking Target</label>
                      <textarea rows={2} value={walkingTarget} onChange={(e) => setWalkingTarget(e.target.value)} placeholder="e.g. 30 min brisk walk" className={textareaClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Movement</label>
                      <textarea rows={2} value={movement} onChange={(e) => setMovement(e.target.value)} placeholder="e.g. Take stairs, stretch hourly" className={textareaClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Strength Training</label>
                      <textarea rows={2} value={strength} onChange={(e) => setStrength(e.target.value)} placeholder="e.g. Resistance bands 3x/week" className={textareaClass} />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-on-surface mb-3">3. Sleep</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Target</label>
                      <input type="text" value={sleepTarget} onChange={(e) => setSleepTarget(e.target.value)} placeholder="e.g. 7-8 hours, 10:30 PM bedtime" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Recommendations (one per line)</label>
                      <textarea rows={2} value={sleepRecommendations} onChange={(e) => setSleepRecommendations(e.target.value)} placeholder="Avoid screens 1hr before bed\n..." className={textareaClass} />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-on-surface mb-3">4. Stress &amp; Mental Well-Being</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Daily Target</label>
                      <input type="text" value={stressTarget} onChange={(e) => setStressTarget(e.target.value)} placeholder="e.g. 10 min meditation daily" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Recommendations (one per line)</label>
                      <textarea rows={2} value={stressRecommendations} onChange={(e) => setStressRecommendations(e.target.value)} placeholder="Practice deep breathing\n..." className={textareaClass} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
              <h2 className="font-headline-md text-base font-semibold text-on-surface mb-4">
                I. Summary &amp; Conclusion
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Summary</label>
                  <textarea rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Overall summary of findings..." className={textareaClass} />
                </div>
                <div>
                  <label className={labelClass}>Next Goals (one per line)</label>
                  <textarea rows={4} value={nextGoals} onChange={(e) => setNextGoals(e.target.value)} placeholder="Improve time in range to >80%\nReduce dawn phenomenon\n..." className={textareaClass} />
                </div>
                <div>
                  <label className={labelClass}>Conclusion</label>
                  <textarea rows={3} value={conclusion} onChange={(e) => setConclusion(e.target.value)} placeholder="Closing remarks..." className={textareaClass} />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save & Generate PDF"}
              </button>
            </div>
          </div>

          {patientId && history.length > 0 && (
            <div className="mt-8 bg-surface rounded-xl border border-outline-variant/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-outline-variant/10">
                <h2 className="font-headline-md text-base font-semibold text-on-surface">
                  Report History — {patientName}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant/10 bg-surface-container-low">
                      <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Patient</th>
                      <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Period</th>
                      <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Saved At</th>
                      <th className="text-right py-3 px-4 font-medium text-on-surface-variant">PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((r) => (
                      <tr key={r.id} className="border-b border-outline-variant/5 hover:bg-surface-container-low">
                        <td className="py-3 px-4 text-on-surface font-medium">{r.patientName}</td>
                        <td className="py-3 px-4 text-on-surface-variant">{r.period || "—"}</td>
                        <td className="py-3 px-4 text-on-surface-variant">
                          {new Date(r.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => openPdf(r.id)}
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline px-2 py-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">download</span>
                            PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
