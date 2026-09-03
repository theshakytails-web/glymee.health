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
import { calculateWeightScore } from "@/lib/assessment/scoring/weight";
import { calculateWeightedOverall } from "@/lib/assessment/scoring-engine";
import { CATEGORY_WEIGHTS, LIFESTYLE_STEP_REQUIRED } from "@/lib/assessment/constants";
import { useState, useCallback, useEffect, useRef } from "react";

export default function WeightAssessmentPage() {
  const router = useRouter();
  const config = ASSESSMENT_CONFIGS.weight;
  const { state, setAssessment, setResponse, setSubmitting } = useAssessment();
  const [currentStep, setCurrentStep] = useState(0);

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      setAssessment("weight", config.steps.length);
      initialized.current = true;
    }
  }, [setAssessment, config.steps.length]);

  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const calculateScores = useCallback(() => {
    const { responses, profile } = state;
    const bmi =
      profile.heightCm && profile.weightKg
        ? Math.round((profile.weightKg / Math.pow(profile.heightCm / 100, 2)) * 10) / 10
        : 0;
    const profileData = { age: profile.age, gender: profile.gender, bmi };
    const categories = {
      weight: calculateWeightScore(responses, profileData),
    };
    const overall = calculateWeightedOverall(categories, CATEGORY_WEIGHTS.weight);
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
      if (!responses.weight_change) return "Please answer: Has your weight changed significantly in the past year?";
      if (!responses.weight_goal) return "Please answer: What is your primary goal?";
      return null;
    }
    if (step === 2) {
      for (const key of LIFESTYLE_STEP_REQUIRED) {
        if (!responses[key]) {
          return "Please answer the required lifestyle questions above";
        }
      }
      return null;
    }
    if (step === 3) {
      if (!responses.exercise_days) return "Please answer: How many days per week do you exercise?";
      if (!responses.sleep_quality) return "Please answer: How would you rate your sleep quality?";
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
          assessmentSlug: "weight",
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

      router.push(`/assess/specific/weight/result/${data.id}`);
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
          <QuestionCard title="Has your weight changed significantly in the past year?" isRequired>
            <OptionChips
              options={["Gained more than 10 kg", "Gained 5-10 kg", "Stable (within 2 kg)", "Lost 5-10 kg", "Lost more than 10 kg"]}
              selected={(state.responses.weight_change as string) || ""}
              onChange={(v) => setResponse("weight_change", v)}
            />
          </QuestionCard>
          <QuestionCard title="What is your primary goal?" isRequired>
            <OptionChips
              options={["Lose weight", "Maintain weight", "Gain weight/muscle", "Improve overall health"]}
              selected={(state.responses.weight_goal as string) || ""}
              onChange={(v) => setResponse("weight_goal", v)}
            />
          </QuestionCard>
        </div>
      );
      case 2: return <LifestyleStep />;
      case 3: return (
        <div className="space-y-4">
          <QuestionCard title="How many days per week do you exercise?" isRequired>
            <OptionChips
              options={["0 days", "1-2 days", "3-4 days", "5-7 days"]}
              selected={(state.responses.exercise_days as string) || ""}
              onChange={(v) => setResponse("exercise_days", v)}
            />
          </QuestionCard>
          <QuestionCard title="How would you rate your sleep quality?" isRequired>
            <OptionChips
              options={["Very poor", "Poor", "Fair", "Good", "Very good"]}
              selected={(state.responses.sleep_quality as string) || ""}
              onChange={(v) => setResponse("sleep_quality", v)}
            />
          </QuestionCard>
        </div>
      );
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
