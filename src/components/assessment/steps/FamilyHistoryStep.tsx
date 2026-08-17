"use client";

import { useAssessment } from "@/context/AssessmentContext";
import { FAMILY_CONDITIONS } from "@/lib/assessment/constants";
import QuestionCard from "../ui/QuestionCard";
import OptionChips from "../ui/OptionChips";

export default function FamilyHistoryStep() {
  const { state, setResponse } = useAssessment();
  const conditions = (state.responses.family_conditions as string[]) || [];

  return (
    <div className="space-y-4">
      <QuestionCard
        title="Do any close family members have any of the following?"
        helperText="Parents, siblings, or grandparents"
        isRequired
      >
        <OptionChips
          options={FAMILY_CONDITIONS.map((c) => c.label)}
          selected={conditions}
          onChange={(v) => setResponse("family_conditions", v)}
          multi
        />
      </QuestionCard>
    </div>
  );
}
