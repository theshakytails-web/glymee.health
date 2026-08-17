"use client";

import { useAssessment } from "@/context/AssessmentContext";
import QuestionCard from "../ui/QuestionCard";
import NumberInput from "../ui/NumberInput";

const LAB_FIELDS = [
  { key: "lab_hba1c", title: "HbA1c (%)", min: 3, max: 20, placeholder: "e.g., 6.5" },
  { key: "lab_fasting_glucose", title: "Fasting glucose (mg/dL)", min: 50, max: 500, placeholder: "e.g., 110" },
  { key: "lab_postmeal_glucose", title: "Post-meal glucose (mg/dL)", min: 50, max: 500, placeholder: "e.g., 160" },
  { key: "lab_bp_systolic", title: "Blood pressure — systolic (mmHg)", min: 70, max: 250, placeholder: "e.g., 120" },
  { key: "lab_bp_diastolic", title: "Blood pressure — diastolic (mmHg)", min: 40, max: 150, placeholder: "e.g., 80" },
  { key: "lab_cholesterol_total", title: "Total cholesterol (mg/dL)", min: 50, max: 500, placeholder: "e.g., 200" },
  { key: "lab_ldl", title: "LDL cholesterol (mg/dL)", min: 20, max: 300, placeholder: "e.g., 100" },
  { key: "lab_hdl", title: "HDL cholesterol (mg/dL)", min: 10, max: 150, placeholder: "e.g., 50" },
  { key: "lab_triglycerides", title: "Triglycerides (mg/dL)", min: 20, max: 500, placeholder: "e.g., 150" },
];

export default function LabValuesStep() {
  const { state, setResponse } = useAssessment();
  const { responses } = state;

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
        <p className="font-label-sm text-[12px] text-primary">
          All fields in this section are optional. Enter your latest report values if available.
        </p>
      </div>

      {LAB_FIELDS.map((field) => (
        <QuestionCard key={field.key} title={field.title} isRequired={false}>
          <NumberInput
            value={(responses[field.key] as number) || ""}
            onChange={(v) => setResponse(field.key, v ? Number(v) : null)}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
          />
        </QuestionCard>
      ))}
    </div>
  );
}
