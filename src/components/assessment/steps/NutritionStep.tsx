"use client";

import { useAssessment } from "@/context/AssessmentContext";
import { NUTRITION_QUESTIONS } from "@/lib/assessment/constants";
import QuestionCard from "../ui/QuestionCard";
import OptionChips from "../ui/OptionChips";

export default function NutritionStep() {
  const { state, setResponse } = useAssessment();
  const { responses } = state;

  return (
    <div className="space-y-4">
      {NUTRITION_QUESTIONS.map((q, i) => (
        <QuestionCard key={q.key} title={q.label} isRequired>
          <OptionChips
            options={q.options}
            selected={(responses[q.key] as string) || ""}
            onChange={(v) => setResponse(q.key, v)}
          />
        </QuestionCard>
      ))}
    </div>
  );
}
