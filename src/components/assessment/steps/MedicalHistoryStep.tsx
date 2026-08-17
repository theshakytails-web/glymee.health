"use client";

import { useAssessment } from "@/context/AssessmentContext";
import { MEDICAL_CONDITIONS } from "@/lib/assessment/constants";
import QuestionCard from "../ui/QuestionCard";
import OptionChips from "../ui/OptionChips";
import TextInput from "../ui/TextInput";
import YesNoToggle from "../ui/YesNoToggle";

export default function MedicalHistoryStep() {
  const { state, setResponse } = useAssessment();
  const { responses } = state;

  const conditions = (responses.medical_conditions as string[]) || [];
  const hasDiabetes = conditions.includes("Diabetes");
  const hasBP = conditions.includes("High blood pressure");
  const hasCholesterol = conditions.includes("High cholesterol");
  const takesMedicines = responses.takes_medicines as string;

  return (
    <div className="space-y-4">
      <QuestionCard title="Have you ever been diagnosed with any of the following?" isRequired>
        <OptionChips
          options={MEDICAL_CONDITIONS.map((c) => c.label)}
          selected={conditions}
          onChange={(v) => setResponse("medical_conditions", v)}
          multi
        />
      </QuestionCard>

      {hasDiabetes && (
        <>
          <QuestionCard title="What type of diabetes?">
            <OptionChips
              options={["Type 1", "Type 2", "Gestational", "Not sure"]}
              selected={(responses.diabetes_type as string) || ""}
              onChange={(v) => setResponse("diabetes_type", v)}
            />
          </QuestionCard>

          <QuestionCard title="When were you diagnosed?" isRequired={false}>
            <TextInput
              value={(responses.diabetes_year as string) || ""}
              onChange={(v) => setResponse("diabetes_year", v)}
              placeholder="e.g., 2020"
            />
          </QuestionCard>

          <QuestionCard title="What diabetes medicines do you take?" isRequired={false}>
            <TextInput
              value={(responses.diabetes_medicines as string) || ""}
              onChange={(v) => setResponse("diabetes_medicines", v)}
              placeholder="e.g., Metformin 500mg"
            />
          </QuestionCard>
        </>
      )}

      {hasBP && (
        <QuestionCard title="What blood pressure medicines do you take?" isRequired={false}>
          <TextInput
            value={(responses.bp_medicines as string) || ""}
            onChange={(v) => setResponse("bp_medicines", v)}
            placeholder="e.g., Amlodipine 5mg"
          />
        </QuestionCard>
      )}

      {hasCholesterol && (
        <QuestionCard title="What cholesterol medicines do you take?" isRequired={false}>
          <TextInput
            value={(responses.cholesterol_medicines as string) || ""}
            onChange={(v) => setResponse("cholesterol_medicines", v)}
            placeholder="e.g., Atorvastatin"
          />
        </QuestionCard>
      )}

      <QuestionCard title="Are you currently taking any medicines?">
        <YesNoToggle
          value={(takesMedicines as string) || null}
          onChange={(v) => setResponse("takes_medicines", v)}
        />
      </QuestionCard>

      {takesMedicines === "yes" && (
        <QuestionCard title="Please list the medicines you take" isRequired={false}>
          <TextInput
            value={(responses.medicine_names as string) || ""}
            onChange={(v) => setResponse("medicine_names", v)}
            placeholder="e.g., Amlodipine 5mg, Metformin 500mg"
          />
        </QuestionCard>
      )}
    </div>
  );
}
