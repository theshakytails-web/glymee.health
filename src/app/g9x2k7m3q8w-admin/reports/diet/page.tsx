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

interface MealRow {
  name: string;
  timing: string;
  meal: string;
  calories: string;
  protein: string;
  carbs: string;
  fiber: string;
  fat: string;
  notes: string;
}

interface DietPlanRecord {
  id: string;
  patientId: string;
  patientName: string;
  planName: string | null;
  createdAt: string;
}

const DEFAULT_MEALS: MealRow[] = [
  { name: "Breakfast", timing: "7:30 – 8:30 AM", meal: "", calories: "", protein: "", carbs: "", fiber: "", fat: "", notes: "" },
  { name: "Mid-Morning Snack", timing: "10:30 – 11:00 AM", meal: "", calories: "", protein: "", carbs: "", fiber: "", fat: "", notes: "" },
  { name: "Lunch", timing: "1:00 – 2:00 PM", meal: "", calories: "", protein: "", carbs: "", fiber: "", fat: "", notes: "" },
  { name: "Evening Snack", timing: "5:00 – 5:30 PM", meal: "", calories: "", protein: "", carbs: "", fiber: "", fat: "", notes: "" },
  { name: "Dinner", timing: "8:00 – 9:00 PM", meal: "", calories: "", protein: "", carbs: "", fiber: "", fat: "", notes: "" },
];

const inputClass =
  "w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors";

const inputSmall =
  "w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors";

export default function DietPlanPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [planName, setPlanName] = useState("");
  const [diabetesType, setDiabetesType] = useState("Type 2 Diabetes");
  const [dietaryGoals, setDietaryGoals] = useState("");
  const [targetCalories, setTargetCalories] = useState("");
  const [targetProtein, setTargetProtein] = useState("");
  const [targetCarbs, setTargetCarbs] = useState("");
  const [targetFiber, setTargetFiber] = useState("");
  const [targetFat, setTargetFat] = useState("");
  const [meals, setMeals] = useState<MealRow[]>(DEFAULT_MEALS);
  const [foodsRecommended, setFoodsRecommended] = useState("");
  const [foodsToAvoid, setFoodsToAvoid] = useState("");
  const [hydration, setHydration] = useState("");
  const [mealTimingGuidance, setMealTimingGuidance] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [savedPlans, setSavedPlans] = useState<DietPlanRecord[]>([]);

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
          setSelectedPatientId(prefill);
        }
      })
      .catch(() => router.push("/g9x2k7m3q8w-admin"));
  }, [router]);

  useEffect(() => {
    if (!selectedPatientId) {
      setSavedPlans([]);
      return;
    }
    fetch(`/api/admin/reports/diet?patientId=${encodeURIComponent(selectedPatientId)}`)
      .then((r) => r.json())
      .then((data) => setSavedPlans(data.plans || []))
      .catch(() => setSavedPlans([]));
  }, [selectedPatientId, success]);

  function updateMeal(index: number, field: keyof MealRow, value: string) {
    setMeals((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  }

  function addMeal() {
    setMeals((prev) => [...prev, { name: "", timing: "", meal: "", calories: "", protein: "", carbs: "", fiber: "", fat: "", notes: "" }]);
  }

  function removeMeal(index: number) {
    setMeals((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setError("");
    setSuccess(false);
    if (!selectedPatientId) {
      setError("Please select a patient.");
      return;
    }
    setSaving(true);
    try {
      const planData = {
        patientName: patients.find((p) => p.id === selectedPatientId)?.fullName || "",
        planName,
        diabetesType,
        dietaryGoals,
        dailyTargets: { calories: targetCalories, protein: targetProtein, carbs: targetCarbs, fiber: targetFiber, fat: targetFat },
        meals,
        foodsRecommended,
        foodsToAvoid,
        hydration,
        mealTimingGuidance,
        specialInstructions,
        followUp,
      };
      const res = await fetch("/api/admin/reports/diet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: selectedPatientId, planName, planData }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save diet plan");
        return;
      }
      setSuccess(true);
      window.open(`/api/admin/reports/diet/${data.id}/pdf`, "_blank");
    } catch {
      setError("Network error while saving diet plan.");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setPlanName("");
    setDiabetesType("Type 2 Diabetes");
    setDietaryGoals("");
    setTargetCalories("");
    setTargetProtein("");
    setTargetCarbs("");
    setTargetFiber("");
    setTargetFat("");
    setMeals(DEFAULT_MEALS);
    setFoodsRecommended("");
    setFoodsToAvoid("");
    setHydration("");
    setMealTimingGuidance("");
    setSpecialInstructions("");
    setFollowUp("");
    setSuccess(false);
    setError("");
  }

  function formatDate(ts: string) {
    return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="min-h-screen bg-surface-container-low">
      <AdminSidebar />
      <main className="md:ml-64 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <ReportsTabs />
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-headline-md text-2xl font-bold text-on-surface">
              Diabetes Diet Plan
            </h1>
          </div>

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center justify-between">
              <span>Diet plan saved and PDF downloaded.</span>
              <button onClick={resetForm} className="text-green-700 font-medium hover:underline text-sm">
                Create another
              </button>
            </div>
          )}

          {error && (
            <p className="text-error text-sm bg-error/10 px-4 py-2 rounded-lg mb-4">
              {error}
            </p>
          )}

          <div className="space-y-6">
            <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
              <h2 className="font-headline-md text-base font-semibold text-on-surface mb-4">
                Patient &amp; Plan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1">Patient</label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
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
                  <label className="block text-xs text-on-surface-variant mb-1">Plan Name</label>
                  <input
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="e.g. Prediabetes Diet Plan"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1">Diabetes Type</label>
                  <select
                    value={diabetesType}
                    onChange={(e) => setDiabetesType(e.target.value)}
                    className={inputClass}
                  >
                    <option>Type 2 Diabetes</option>
                    <option>Type 1 Diabetes</option>
                    <option>Prediabetes</option>
                    <option>Gestational Diabetes</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-on-surface-variant mb-1">Dietary Goals</label>
                  <textarea
                    value={dietaryGoals}
                    onChange={(e) => setDietaryGoals(e.target.value)}
                    rows={2}
                    placeholder="e.g. Maintain stable blood sugar, achieve healthy weight, reduce HbA1c"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
              <h2 className="font-headline-md text-base font-semibold text-on-surface mb-4">
                Daily Targets
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[
                  { label: "Calories", unit: "kcal", value: targetCalories, set: setTargetCalories },
                  { label: "Protein", unit: "g", value: targetProtein, set: setTargetProtein },
                  { label: "Carbs", unit: "g", value: targetCarbs, set: setTargetCarbs },
                  { label: "Fiber", unit: "g", value: targetFiber, set: setTargetFiber },
                  { label: "Fat", unit: "g", value: targetFat, set: setTargetFat },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-xs text-on-surface-variant mb-1">
                      {f.label} ({f.unit})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={f.value}
                      onChange={(e) => f.set(e.target.value)}
                      placeholder={f.unit}
                      className={inputSmall}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline-md text-base font-semibold text-on-surface">
                  Meal Plan
                </h2>
                <button
                  onClick={addMeal}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add meal
                </button>
              </div>
              <div className="space-y-4">
                {meals.map((m, i) => (
                  <div key={i} className="border border-outline-variant/20 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-on-surface-variant">
                        Meal {i + 1}
                      </span>
                      <button
                        onClick={() => removeMeal(i)}
                        disabled={meals.length <= 1}
                        className="text-on-surface-variant hover:text-error transition-colors disabled:opacity-30"
                        title="Remove meal"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-on-surface-variant mb-1">Meal Name</label>
                        <input
                          type="text"
                          value={m.name}
                          onChange={(e) => updateMeal(i, "name", e.target.value)}
                          placeholder="e.g. Breakfast"
                          className={inputSmall}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-on-surface-variant mb-1">Timing</label>
                        <input
                          type="text"
                          value={m.timing}
                          onChange={(e) => updateMeal(i, "timing", e.target.value)}
                          placeholder="e.g. 7:30 – 8:30 AM"
                          className={inputSmall}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-on-surface-variant mb-1">Meal Description</label>
                      <textarea
                        value={m.meal}
                        onChange={(e) => updateMeal(i, "meal", e.target.value)}
                        rows={2}
                        placeholder="Describe the meal contents..."
                        className={inputSmall}
                      />
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                      {(["calories", "protein", "carbs", "fiber", "fat"] as const).map((field) => (
                        <div key={field}>
                          <label className="block text-[10px] text-on-surface-variant mb-1 capitalize">
                            {field}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={m[field]}
                            onChange={(e) => updateMeal(i, field, e.target.value)}
                            className={inputSmall}
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-xs text-on-surface-variant mb-1">Notes</label>
                      <textarea
                        value={m.notes}
                        onChange={(e) => updateMeal(i, "notes", e.target.value)}
                        rows={2}
                        placeholder="Portion guidance or notes for this meal..."
                        className={inputSmall}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
              <h2 className="font-headline-md text-base font-semibold text-on-surface mb-4">
                Foods to Include
              </h2>
              <textarea
                value={foodsRecommended}
                onChange={(e) => setFoodsRecommended(e.target.value)}
                rows={4}
                placeholder="One food item per line, e.g.:\nLeafy green vegetables\nWhole grains (brown rice, quinoa)"
                className={inputClass}
              />
            </div>

            <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
              <h2 className="font-headline-md text-base font-semibold text-on-surface mb-4">
                Foods to Avoid
              </h2>
              <textarea
                value={foodsToAvoid}
                onChange={(e) => setFoodsToAvoid(e.target.value)}
                rows={4}
                placeholder="One food item per line, e.g.:\nRefined sugar and sweets\nWhite bread and pastries"
                className={inputClass}
              />
            </div>

            <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
              <h2 className="font-headline-md text-base font-semibold text-on-surface mb-4">
                Additional Guidance
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1">Hydration</label>
                  <textarea
                    value={hydration}
                    onChange={(e) => setHydration(e.target.value)}
                    rows={2}
                    placeholder="e.g. Drink 8-10 glasses of water daily. Limit sugary beverages."
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1">Meal Timing Guidance</label>
                  <textarea
                    value={mealTimingGuidance}
                    onChange={(e) => setMealTimingGuidance(e.target.value)}
                    rows={2}
                    placeholder="e.g. Eat meals at consistent times. Avoid skipping meals."
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1">Special Instructions</label>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    rows={3}
                    placeholder="e.g. Monitor blood glucose before and 2 hours after meals."
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1">Follow-Up</label>
                  <textarea
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    rows={2}
                    placeholder="e.g. Follow-up in 4 weeks for blood glucose review and diet adjustment."
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save & Generate PDF"}
              </button>
            </div>

            {savedPlans.length > 0 && (
              <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
                <h2 className="font-headline-md text-base font-semibold text-on-surface mb-4">
                  Saved Diet Plans
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-outline-variant/20">
                        <th className="text-left py-2 px-3 text-xs font-medium text-on-surface-variant">Patient</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-on-surface-variant">Plan Name</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-on-surface-variant">Saved At</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-on-surface-variant">PDF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedPlans.map((plan) => (
                        <tr key={plan.id} className="border-b border-outline-variant/10">
                          <td className="py-2 px-3">{plan.patientName}</td>
                          <td className="py-2 px-3">{plan.planName || "—"}</td>
                          <td className="py-2 px-3 text-on-surface-variant">{formatDate(plan.createdAt)}</td>
                          <td className="py-2 px-3 text-right">
                            <a
                              href={`/api/admin/reports/diet/${plan.id}/pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm font-medium"
                            >
                              Download PDF
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
