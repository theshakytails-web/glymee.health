"use client";

import { useState } from "react";
import QuestionCard from "./ui/QuestionCard";
import NumberInput from "./ui/NumberInput";
import OptionChips from "./ui/OptionChips";

interface LabValuesUploadProps {
  assessmentType: string;
  onComplete: (labValues: Record<string, unknown>) => void;
  onSkip: () => void;
}

const LAB_FIELDS: Record<string, Array<{
  key: string;
  label: string;
  unit: string;
  type: "number" | "select";
  options?: string[];
  normalRange?: string;
}>> = {
  blood_sugar: [
    { key: "hba1c", label: "HbA1c (if known)", unit: "%", type: "number", normalRange: "Below 5.7%" },
    { key: "fasting_glucose", label: "Fasting Blood Sugar", unit: "mg/dL", type: "number", normalRange: "70-100 mg/dL" },
    { key: "post_meal_glucose", label: "Post-meal Blood Sugar", unit: "mg/dL", type: "number", normalRange: "Below 140 mg/dL" },
  ],
  heart: [
    { key: "systolic_bp", label: "Blood Pressure (Systolic)", unit: "mmHg", type: "number", normalRange: "Below 120 mmHg" },
    { key: "diastolic_bp", label: "Blood Pressure (Diastolic)", unit: "mmHg", type: "number", normalRange: "Below 80 mmHg" },
    { key: "total_cholesterol", label: "Total Cholesterol", unit: "mg/dL", type: "number", normalRange: "Below 200 mg/dL" },
    { key: "ldl", label: "LDL (Bad Cholesterol)", unit: "mg/dL", type: "number", normalRange: "Below 100 mg/dL" },
    { key: "hdl", label: "HDL (Good Cholesterol)", unit: "mg/dL", type: "number", normalRange: "Above 40 mg/dL" },
  ],
  liver: [
    { key: "alt", label: "ALT (Alanine Aminotransferase)", unit: "U/L", type: "number", normalRange: "7-56 U/L" },
    { key: "ast", label: "AST (Aspartate Aminotransferase)", unit: "U/L", type: "number", normalRange: "10-40 U/L" },
    { key: "ggt", label: "GGT (Gamma-Glutamyl Transferase)", unit: "U/L", type: "number", normalRange: "9-48 U/L" },
  ],
  weight: [
    { key: "hba1c", label: "HbA1c (if known)", unit: "%", type: "number", normalRange: "Below 5.7%" },
    { key: "fasting_glucose", label: "Fasting Blood Sugar", unit: "mg/dL", type: "number", normalRange: "70-100 mg/dL" },
    { key: "total_cholesterol", label: "Total Cholesterol", unit: "mg/dL", type: "number", normalRange: "Below 200 mg/dL" },
    { key: "triglycerides", label: "Triglycerides", unit: "mg/dL", type: "number", normalRange: "Below 150 mg/dL" },
  ],
  full: [
    { key: "hba1c", label: "HbA1c (if known)", unit: "%", type: "number", normalRange: "Below 5.7%" },
    { key: "fasting_glucose", label: "Fasting Blood Sugar", unit: "mg/dL", type: "number", normalRange: "70-100 mg/dL" },
    { key: "systolic_bp", label: "Blood Pressure (Systolic)", unit: "mmHg", type: "number", normalRange: "Below 120 mmHg" },
    { key: "diastolic_bp", label: "Blood Pressure (Diastolic)", unit: "mmHg", type: "number", normalRange: "Below 80 mmHg" },
    { key: "total_cholesterol", label: "Total Cholesterol", unit: "mg/dL", type: "number", normalRange: "Below 200 mg/dL" },
  ],
};

export default function LabValuesUpload({ assessmentType, onComplete, onSkip }: LabValuesUploadProps) {
  const [labValues, setLabValues] = useState<Record<string, string>>({});
  const fields = LAB_FIELDS[assessmentType] || [];

  if (fields.length === 0) {
    return null;
  }

  const handleSave = () => {
    const numericValues: Record<string, unknown> = {};
    Object.entries(labValues).forEach(([key, value]) => {
      if (value && value.trim()) {
        numericValues[key] = parseFloat(value);
      }
    });
    onComplete(numericValues);
  };

  const filledCount = Object.values(labValues).filter((v): v is string => Boolean(v && v.trim())).length;

  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-xl p-6 border border-outline-variant/20">
        <div className="flex items-center gap-3 mb-3">
          <span className="material-symbols-outlined text-primary">science</span>
          <h3 className="font-headline-md text-on-surface">Add Lab Values (Optional)</h3>
        </div>
        <p className="text-body-md text-on-surface-variant mb-4">
          If you have recent blood reports, adding these values will improve the accuracy of your results. 
          You can skip this — your assessment is already complete.
        </p>
        <p className="text-body-sm text-on-surface-variant/70">
          Enter values from your latest report. All fields are optional.
        </p>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <QuestionCard key={field.key} title={field.label}>
            <div className="flex items-center gap-3">
              <NumberInput
                value={labValues[field.key] || ""}
                onChange={(v) => setLabValues(prev => ({ ...prev, [field.key]: String(v) }))}
                placeholder={`e.g. ${field.normalRange?.split(" ")[0] || ""}`}
                min={0}
                max={field.key.includes("bp") ? 300 : field.key.includes("cholesterol") || field.key.includes("glucose") || field.key.includes("triglycerides") ? 500 : field.key.includes("hba1c") ? 15 : 200}
              />
              <span className="text-body-sm text-on-surface-variant whitespace-nowrap">{field.unit}</span>
            </div>
            {field.normalRange && (
              <p className="text-body-xs text-on-surface-variant/60 mt-1">Normal: {field.normalRange}</p>
            )}
          </QuestionCard>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={handleSave}
          className="flex-1 bg-primary text-on-primary py-3 rounded-lg font-label-lg transition-opacity hover:opacity-90"
        >
          {filledCount > 0 ? `Save ${filledCount} Value${filledCount > 1 ? "s" : ""}` : "Skip for Now"}
        </button>
        <button
          onClick={onSkip}
          className="px-6 py-3 rounded-lg border border-outline-variant text-on-surface font-label-lg hover:bg-surface-container transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
