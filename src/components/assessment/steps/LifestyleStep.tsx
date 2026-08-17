"use client";

import { useAssessment } from "@/context/AssessmentContext";
import {
  SLEEP_DURATION_OPTIONS,
  SLEEP_QUALITY_OPTIONS,
  ACTIVITY_LEVEL_OPTIONS,
  TOBACCO_OPTIONS,
  ALCOHOL_OPTIONS,
  STRESS_OPTIONS,
} from "@/lib/assessment/constants";
import QuestionCard from "../ui/QuestionCard";
import OptionChips from "../ui/OptionChips";
import YesNoToggle from "../ui/YesNoToggle";

export default function LifestyleStep() {
  const { state, setResponse } = useAssessment();
  const { responses } = state;

  return (
    <div className="space-y-4">
      <QuestionCard title="How many hours of sleep do you usually get per night?" isRequired>
        <OptionChips
          options={SLEEP_DURATION_OPTIONS}
          selected={(responses.sleep_duration as string) || ""}
          onChange={(v) => setResponse("sleep_duration", v)}
        />
      </QuestionCard>

      <QuestionCard title="How would you rate your sleep quality?" isRequired>
        <OptionChips
          options={SLEEP_QUALITY_OPTIONS}
          selected={(responses.sleep_quality as string) || ""}
          onChange={(v) => setResponse("sleep_quality", v)}
        />
      </QuestionCard>

      <QuestionCard title="Do you have difficulty falling asleep?">
        <YesNoToggle
          value={(responses.sleep_difficulty as string) || null}
          onChange={(v) => setResponse("sleep_difficulty", v)}
        />
      </QuestionCard>

      <QuestionCard title="Do you wake up frequently during the night?">
        <YesNoToggle
          value={(responses.sleep_waking as string) || null}
          onChange={(v) => setResponse("sleep_waking", v)}
        />
      </QuestionCard>

      <QuestionCard title="How many days per week do you exercise for at least 30 minutes?" isRequired>
        <OptionChips
          options={ACTIVITY_LEVEL_OPTIONS.map((a) => a.label)}
          selected={
            ACTIVITY_LEVEL_OPTIONS.find((a) => a.label === responses.exercise_days)?.label ||
            (responses.exercise_days as string) ||
            ""
          }
          onChange={(v) => setResponse("exercise_days", v)}
        />
      </QuestionCard>

      <QuestionCard title="How many steps do you usually take per day?" isRequired>
        <OptionChips
          options={["Less than 3,000", "3,000-5,000", "5,000-8,000", "More than 8,000"]}
          selected={(responses.steps_per_day as string) || ""}
          onChange={(v) => setResponse("steps_per_day", v)}
        />
      </QuestionCard>

      <QuestionCard title="How many hours per day do you spend sitting continuously?" isRequired>
        <OptionChips
          options={[
            "More than 4 hours",
            "2-4 hours",
            "1-2 hours",
            "I break sitting every 30-60 minutes",
          ]}
          selected={(responses.sitting_hours as string) || ""}
          onChange={(v) => setResponse("sitting_hours", v)}
        />
      </QuestionCard>

      <QuestionCard title="Do you use tobacco?" isRequired>
        <OptionChips
          options={TOBACCO_OPTIONS.map((t) => t.label)}
          selected={
            TOBACCO_OPTIONS.find((t) => t.value === responses.tobacco_use)?.label ||
            (responses.tobacco_use as string) ||
            ""
          }
          onChange={(v) => {
            const t = TOBACCO_OPTIONS.find((t) => t.label === v);
            if (t) setResponse("tobacco_use", t.value);
          }}
        />
      </QuestionCard>

      <QuestionCard title="How often do you consume alcohol?" isRequired>
        <OptionChips
          options={ALCOHOL_OPTIONS.map((a) => a.label)}
          selected={
            ALCOHOL_OPTIONS.find((a) => a.value === responses.alcohol_use)?.label ||
            (responses.alcohol_use as string) ||
            ""
          }
          onChange={(v) => {
            const a = ALCOHOL_OPTIONS.find((a) => a.label === v);
            if (a) setResponse("alcohol_use", a.value);
          }}
        />
      </QuestionCard>

      <QuestionCard title="How would you rate your overall stress level?" isRequired>
        <OptionChips
          options={STRESS_OPTIONS.map((s) => s.label)}
          selected={
            STRESS_OPTIONS.find((s) => s.value === responses.stress_level)?.label ||
            (responses.stress_level as string) ||
            ""
          }
          onChange={(v) => {
            const s = STRESS_OPTIONS.find((s) => s.label === v);
            if (s) setResponse("stress_level", s.value);
          }}
        />
      </QuestionCard>
    </div>
  );
}
