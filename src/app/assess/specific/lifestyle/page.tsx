"use client";

import { useRouter } from "next/navigation";
import { useAssessment } from "@/context/AssessmentContext";
import { ASSESSMENT_CONFIGS } from "@/lib/assessment/types";
import AssessmentWizard from "@/components/assessment/AssessmentWizard";
import ProfileStep from "@/components/assessment/steps/ProfileStep";
import ConsentStep from "@/components/assessment/steps/ConsentStep";
import LifestyleStep from "@/components/assessment/steps/LifestyleStep";
import NutritionStep from "@/components/assessment/steps/NutritionStep";
import QuestionCard from "@/components/assessment/ui/QuestionCard";
import OptionChips from "@/components/assessment/ui/OptionChips";
import { calculateLifestyleScore } from "@/lib/assessment/scoring/lifestyle";
import { calculateWeightedOverall } from "@/lib/assessment/scoring-engine";
import { CATEGORY_WEIGHTS } from "@/lib/assessment/constants";
import { useState, useCallback, useEffect, useRef } from "react";

export default function LifestyleAssessmentPage() {
  const router = useRouter();
  const config = ASSESSMENT_CONFIGS.lifestyle;
  const { state, setAssessment, setResponse, setSubmitting } = useAssessment();
  const [currentStep, setCurrentStep] = useState(0);

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      setAssessment("lifestyle", config.steps.length);
      initialized.current = true;
    }
  }, [setAssessment, config.steps.length]);

  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const calculateScores = useCallback(() => {
    const { responses } = state;
    const categories = {
      lifestyle: calculateLifestyleScore(responses),
    };
    const overall = calculateWeightedOverall(categories, CATEGORY_WEIGHTS.lifestyle);
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
      if (!responses.sleep_duration) return "Please answer: How many hours of sleep do you get?";
      if (!responses.sleep_quality) return "Please answer: How would you rate your sleep quality?";
      if (!responses.exercise_days) return "Please answer: How many days per week do you exercise?";
      if (!responses.sitting_hours) return "Please answer: How many hours do you sit per day?";
      if (!responses.tobacco_use) return "Please answer: Do you use tobacco?";
      if (!responses.alcohol_use) return "Please answer: How often do you consume alcohol?";
      if (!responses.stress_level) return "Please answer: How would you rate your stress level?";
      return null;
    }
    if (step === 2) {
      if (!responses.meals_per_day) return "Please answer: How many meals do you eat per day?";
      if (!responses.vegetables) return "Please answer: How often do you eat vegetables?";
      if (!responses.fruits) return "Please answer: How often do you eat fruits?";
      if (!responses.whole_grains) return "Please answer: How often do you eat whole grains?";
      if (!responses.protein) return "Please answer: How would you rate your protein intake?";
      if (!responses.sugary_drinks) return "Please answer: How often do you drink sugary drinks?";
      if (!responses.water_intake) return "Please answer: How much water do you drink?";
      return null;
    }
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
          assessmentSlug: "lifestyle",
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

      router.push(`/assess/specific/lifestyle/result/${data.id}`);
    } catch (error) {
      console.error("Submit failed:", error);
    } finally {
      setSubmitting(false);
    }
  }, [state, config, calculateScores, router, setSubmitting]);

  const renderStep = useCallback(() => {
    switch (currentStep) {
      case 0: return <ProfileStep />;
      case 1: return <LifestyleStep />;
      case 2: return <NutritionStep />;
      case 3: return (
        <div className="space-y-4">
          <QuestionCard title="How many hours of screen time do you have daily (outside work)?" isRequired>
            <OptionChips
              options={["Less than 1 hour", "1-2 hours", "2-4 hours", "4+ hours"]}
              selected={(state.responses.screen_time as string) || ""}
              onChange={(v) => setResponse("screen_time", v)}
            />
          </QuestionCard>
          <QuestionCard title="How often do you spend time outdoors?" isRequired>
            <OptionChips
              options={["Daily", "4-6 times/week", "1-3 times/week", "Rarely / Never"]}
              selected={(state.responses.outdoor_time as string) || ""}
              onChange={(v) => setResponse("outdoor_time", v)}
            />
          </QuestionCard>
          <QuestionCard title="How would you rate your work-life balance?" isRequired>
            <OptionChips
              options={["Excellent", "Good", "Fair", "Poor", "Very poor"]}
              selected={(state.responses.work_life_balance as string) || ""}
              onChange={(v) => setResponse("work_life_balance", v)}
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
