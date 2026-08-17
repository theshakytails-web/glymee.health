"use client";

import { useAssessment } from "@/context/AssessmentContext";
import { GENDER_OPTIONS } from "@/lib/assessment/constants";
import QuestionCard from "../ui/QuestionCard";
import TextInput from "../ui/TextInput";
import NumberInput from "../ui/NumberInput";
import OptionChips from "../ui/OptionChips";

export default function ProfileStep() {
  const { state, setProfile, calculateBMI } = useAssessment();
  const { profile } = state;
  const bmi = calculateBMI();

  return (
    <div className="space-y-4">
      <QuestionCard title="What is your full name?" isRequired>
        <TextInput
          value={profile.fullName}
          onChange={(v) => setProfile({ fullName: v })}
          placeholder="Enter your full name"
        />
      </QuestionCard>

      <QuestionCard title="How old are you?" isRequired>
        <NumberInput
          value={profile.age || ""}
          onChange={(v) => setProfile({ age: Number(v) || 0 })}
          unit="years"
          placeholder="Enter your age"
          min={1}
          max={120}
        />
      </QuestionCard>

      <QuestionCard title="What is your gender?" isRequired>
        <OptionChips
          options={GENDER_OPTIONS.map((g) => g.label)}
          selected={
            GENDER_OPTIONS.find((g) => g.value === profile.gender)?.label || ""
          }
          onChange={(v) => {
            const g = GENDER_OPTIONS.find((g) => g.label === v);
            if (g) setProfile({ gender: g.value });
          }}
        />
      </QuestionCard>

      <QuestionCard title="What is your height?" isRequired>
        <NumberInput
          value={profile.heightCm || ""}
          onChange={(v) => setProfile({ heightCm: Number(v) || 0 })}
          unit="cm"
          placeholder="e.g., 170"
          min={100}
          max={250}
        />
      </QuestionCard>

      <QuestionCard title="What is your current weight?" isRequired>
        <NumberInput
          value={profile.weightKg || ""}
          onChange={(v) => setProfile({ weightKg: Number(v) || 0 })}
          unit="kg"
          placeholder="e.g., 70"
          min={30}
          max={300}
        />
        {bmi > 0 && (
          <p className="mt-2 font-label-sm text-[12px] text-on-surface-variant/60">
            Your BMI: <span className="font-medium text-on-surface-variant">{bmi}</span>
          </p>
        )}
      </QuestionCard>

      <QuestionCard title="Which city do you live in?" isRequired>
        <TextInput
          value={profile.city}
          onChange={(v) => setProfile({ city: v })}
          placeholder="e.g., Pune"
        />
      </QuestionCard>

      <QuestionCard title="Phone number" isRequired={false}>
        <TextInput
          value={profile.phone}
          onChange={(v) => setProfile({ phone: v })}
          placeholder="+91 98765 43210"
        />
      </QuestionCard>

      <QuestionCard title="Email address" isRequired>
        <TextInput
          value={profile.email}
          onChange={(v) => setProfile({ email: v })}
          placeholder="you@example.com"
          type="email"
        />
      </QuestionCard>
    </div>
  );
}
