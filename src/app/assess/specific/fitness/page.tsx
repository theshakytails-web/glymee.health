"use client";

import { useRouter } from "next/navigation";
import { useAssessment } from "@/context/AssessmentContext";
import { ASSESSMENT_CONFIGS } from "@/lib/assessment/types";
import AssessmentWizard from "@/components/assessment/AssessmentWizard";
import ProfileStep from "@/components/assessment/steps/ProfileStep";
import ConsentStep from "@/components/assessment/steps/ConsentStep";
import LifestyleStep from "@/components/assessment/steps/LifestyleStep";
import QuestionCard from "@/components/assessment/ui/QuestionCard";
import OptionChips from "@/components/assessment/ui/OptionChips";
import NumberInput from "@/components/assessment/ui/NumberInput";
import { calculateActivityScore } from "@/lib/assessment/scoring/activity";
import { calculateWeightedOverall } from "@/lib/assessment/scoring-engine";
import { CATEGORY_WEIGHTS, LIFESTYLE_STEP_REQUIRED } from "@/lib/assessment/constants";
import { useState, useCallback, useEffect, useRef } from "react";

export default function FitnessAssessmentPage() {
  const router = useRouter();
  const config = ASSESSMENT_CONFIGS.fitness;
  const { state, setAssessment, setResponse, setSubmitting } = useAssessment();
  const [currentStep, setCurrentStep] = useState(0);

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      setAssessment("fitness", config.steps.length);
      initialized.current = true;
    }
  }, [setAssessment, config.steps.length]);

  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const calculateScores = useCallback(() => {
    const { responses } = state;
    const categories = {
      activity: calculateActivityScore(responses),
    };
    const overall = calculateWeightedOverall(categories, CATEGORY_WEIGHTS.fitness);
    return { categories, overall };
  }, [state]);

  const validateStep = useCallback((step: number): string | null => {
    const { profile, responses } = state;
    if (step === 0) {
      if (!profile.fullName) return "Please enter your full name";
      if (!profile.age || profile.age <= 0) return "Please enter a valid age";
      if (!profile.gender) return "Please select your gender";
      if (!profile.heightCm || profile.heightCm <= 0) return "Please enter your height";
      if (!profile.weightKg || profile.weightKg <= 0) return "Please enter your weight";
      if (!profile.city) return "Please enter your city";
      if (!profile.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) return "Please enter a valid email address";
      return null;
    }
    if (step === 1) {
      if (!responses.exercise_days) return "Please answer: How many days per week do you exercise?";
      if (!Array.isArray(responses.exercise_types) || responses.exercise_types.length === 0)
        return "Please select at least one type of exercise";
      if (!responses.workout_duration) return "Please answer: How long is a typical workout session?";
      return null;
    }
    if (step === 2) {
      if (!responses.fitness_level) return "Please answer: How would you rate your fitness level?";
      return null;
    }
    if (step === 3) {
      for (const key of LIFESTYLE_STEP_REQUIRED) {
        if (!responses[key]) {
          return "Please answer the required lifestyle questions above";
        }
      }
      return null;
    }
    if (step === 4) return null;
    return null;
  }, [state]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const { categories, overall } = calculateScores();
      const response = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentSlug: "fitness",
          fullName: state.profile.fullName,
          email: state.profile.email,
          phone: state.profile.phone,
          age: state.profile.age,
          gender: state.profile.gender,
          heightCm: state.profile.heightCm,
          weightKg: state.profile.weightKg,
          city: state.profile.city,
          responses: state.responses,
          consentGiven: true,
        }),
      });
      if (!response.ok) throw new Error("Failed to submit");
      const data = await response.json();

      sessionStorage.setItem(
        `assessment-result-${data.id}`,
        JSON.stringify({
          overallScore: overall.score,
          overallStatus: overall.status,
          overallLabel: overall.label,
          categories,
          strengths: overall.strengths,
          concerns: overall.concerns,
          recommendations: overall.recommendations,
          assessmentName: config.name,
        })
      );

      router.push(`/assess/specific/fitness/result/${data.id}`);
    } catch (error) {
      console.error("Submit failed:", error);
    } finally {
      setSubmitting(false);
    }
  }, [state, config, calculateScores, router, setSubmitting]);

  const renderStep = useCallback(() => {
    switch (currentStep) {
      case 0: return <ProfileStep />;
      case 1: return (
        <div className="space-y-4">
          <QuestionCard title="How many days per week do you exercise?" isRequired>
            <OptionChips
              options={["0 days", "1-2 days", "3-4 days", "5-7 days"]}
              selected={(state.responses.exercise_days as string) || ""}
              onChange={(v) => setResponse("exercise_days", v)}
            />
          </QuestionCard>
          <QuestionCard title="What types of exercise do you do?" isRequired>
            <OptionChips
              options={["Walking", "Running", "Swimming", "Cycling", "Weight training", "Yoga", "Sports", "None"]}
              selected={(state.responses.exercise_types as string[]) || []}
              onChange={(v) => setResponse("exercise_types", v)}
              multi
            />
          </QuestionCard>
          <QuestionCard title="How long is a typical workout session?" isRequired>
            <OptionChips
              options={["Less than 15 minutes", "15-30 minutes", "30-60 minutes", "More than 60 minutes"]}
              selected={(state.responses.workout_duration as string) || ""}
              onChange={(v) => setResponse("workout_duration", v)}
            />
          </QuestionCard>
        </div>
      );
      case 2: return (
        <div className="space-y-4">
          <QuestionCard title="How would you rate your fitness level?" isRequired>
            <OptionChips
              options={["Beginner", "Intermediate", "Advanced", "Elite"]}
              selected={(state.responses.fitness_level as string) || ""}
              onChange={(v) => setResponse("fitness_level", v)}
            />
          </QuestionCard>
          <QuestionCard title="How many push-ups can you do in one set?" isRequired={false}>
            <NumberInput
              value={(state.responses.push_ups as number) || ""}
              onChange={(v) => setResponse("push_ups", v ? Number(v) : null)}
              placeholder="e.g., 20"
              min={0}
              max={200}
            />
          </QuestionCard>
          <QuestionCard title="How long can you hold a plank?" isRequired={false}>
            <OptionChips
              options={["Less than 30 seconds", "30-60 seconds", "1-2 minutes", "More than 2 minutes"]}
              selected={(state.responses.plank_duration as string) || ""}
              onChange={(v) => setResponse("plank_duration", v)}
            />
          </QuestionCard>
        </div>
      );
      case 3: return <LifestyleStep />;
      case 4: return <ConsentStep onSubmit={handleSubmit} isSubmitting={state.isSubmitting} />;
      default: return <ProfileStep />;
    }
  }, [currentStep, state.responses, handleSubmit, state.isSubmitting, setResponse]);

  return (
    <AssessmentWizard
      assessmentName={config.name}
      steps={config.steps}
      currentStep={currentStep}
      onStepChange={handleStepChange}
      onSubmit={handleSubmit}
      isSubmitting={state.isSubmitting}
      validateStep={validateStep}
    >
      {renderStep()}
    </AssessmentWizard>
  );
}
