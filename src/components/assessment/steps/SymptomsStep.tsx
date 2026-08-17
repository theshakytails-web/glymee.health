"use client";

import { useAssessment } from "@/context/AssessmentContext";
import { SYMPTOMS_LIST } from "@/lib/assessment/constants";
import QuestionCard from "../ui/QuestionCard";
import OptionChips from "../ui/OptionChips";
import EmergencyWarning from "../shared/EmergencyWarning";

export default function SymptomsStep() {
  const { state, setResponse } = useAssessment();
  const symptoms = (state.responses.current_symptoms as string[]) || [];

  return (
    <div className="space-y-4">
      <EmergencyWarning symptoms={symptoms} />

      <QuestionCard
        title="Do you currently experience any of the following?"
        isRequired
      >
        <OptionChips
          options={SYMPTOMS_LIST.map((s) => s.label)}
          selected={symptoms}
          onChange={(v) => setResponse("current_symptoms", v)}
          multi
        />
      </QuestionCard>
    </div>
  );
}
