"use client";

import { useAssessment } from "@/context/AssessmentContext";
import QuestionCard from "../ui/QuestionCard";
import TextInput from "../ui/TextInput";

export default function ConditionSpecificStep() {
  const { state, setResponse } = useAssessment();
  const { responses } = state;

  const conditions = (responses.medical_conditions as string[]) || [];
  const hasDiabetes = conditions.includes("Diabetes");
  const hasBP = conditions.includes("High blood pressure");
  const hasCholesterol = conditions.includes("High cholesterol");

  if (!hasDiabetes && !hasBP && !hasCholesterol) {
    return (
      <div className="text-center py-8">
        <span className="material-symbols-outlined text-on-surface-variant/30 text-[48px] mb-4 block">
          check_circle
        </span>
        <p className="font-body-md text-[15px] text-on-surface-variant/60">
          No additional questions based on your medical history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasDiabetes && (
        <>
          <QuestionCard title="What is your latest HbA1c?" isRequired={false}>
            <TextInput
              value={(responses.detail_hba1c as string) || ""}
              onChange={(v) => setResponse("detail_hba1c", v)}
              placeholder="e.g., 7.2"
            />
          </QuestionCard>

          <QuestionCard title="What is your latest fasting glucose?" isRequired={false}>
            <TextInput
              value={(responses.detail_fasting_glucose as string) || ""}
              onChange={(v) => setResponse("detail_fasting_glucose", v)}
              placeholder="e.g., 126 mg/dL"
            />
          </QuestionCard>
        </>
      )}

      {hasBP && (
        <QuestionCard title="What is your current blood pressure reading?" isRequired={false}>
          <TextInput
            value={(responses.detail_bp as string) || ""}
            onChange={(v) => setResponse("detail_bp", v)}
            placeholder="e.g., 130/85 mmHg"
          />
        </QuestionCard>
      )}

      {hasCholesterol && (
        <>
          <QuestionCard title="What is your LDL cholesterol?" isRequired={false}>
            <TextInput
              value={(responses.detail_ldl as string) || ""}
              onChange={(v) => setResponse("detail_ldl", v)}
              placeholder="e.g., 140 mg/dL"
            />
          </QuestionCard>

          <QuestionCard title="What is your HDL cholesterol?" isRequired={false}>
            <TextInput
              value={(responses.detail_hdl as string) || ""}
              onChange={(v) => setResponse("detail_hdl", v)}
              placeholder="e.g., 45 mg/dL"
            />
          </QuestionCard>
        </>
      )}
    </div>
  );
}
