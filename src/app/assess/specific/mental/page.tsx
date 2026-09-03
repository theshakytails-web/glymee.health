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
import { calculateMentalScore } from "@/lib/assessment/scoring/mental";
import { calculateWeightedOverall } from "@/lib/assessment/scoring-engine";
import { CATEGORY_WEIGHTS, LIFESTYLE_STEP_REQUIRED } from "@/lib/assessment/constants";
import { useState, useCallback, useEffect, useRef } from "react";

export default function MentalAssessmentPage() {
  const router = useRouter();
  const config = ASSESSMENT_CONFIGS.mental;
  const { state, setAssessment, setResponse, setSubmitting } = useAssessment();
  const [currentStep, setCurrentStep] = useState(0);

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      setAssessment("mental", config.steps.length);
      initialized.current = true;
    }
  }, [setAssessment, config.steps.length]);

  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const calculateScores = useCallback(() => {
    const { responses } = state;
    const categories = {
      mental: calculateMentalScore(responses),
    };
    const overall = calculateWeightedOverall(categories, CATEGORY_WEIGHTS.mental);
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
      if (!responses.stress_level) return "Please answer: How would you rate your current stress level?";
      if (!responses.energy_level) return "Please answer: How is your energy level during the day?";
      if (!responses.feeling_overwhelmed) return "Please answer: How often do you feel overwhelmed?";
      return null;
    }
    if (step === 2) {
      if (!responses.anxiety_frequency) return "Please answer: How often do you experience anxiety or worry?";
      if (!responses.mood_overall) return "Please answer: How would you rate your mood overall?";
      if (!responses.motivation_frequency) return "Please answer: How often do you feel motivated to do things?";
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
    if (step === 4) {
      if (!responses.mental_health_diagnosis) return "Please answer: Have you been diagnosed with any mental health condition?";
      if (!responses.mental_health_medication) return "Please answer: Are you currently taking any medication for mental health?";
      return null;
    }
    if (step === 5) return null;
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
          assessmentSlug: "mental",
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

      router.push(`/assess/specific/mental/result/${data.id}`);
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
          <QuestionCard title="How would you rate your current stress level?" isRequired>
            <OptionChips
              options={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}
              selected={(state.responses.stress_level as string) || ""}
              onChange={(v) => setResponse("stress_level", v)}
            />
          </QuestionCard>
          <QuestionCard title="How is your energy level during the day?" isRequired>
            <OptionChips
              options={["Excellent", "Good", "Moderate", "Low", "Very low"]}
              selected={(state.responses.energy_level as string) || ""}
              onChange={(v) => setResponse("energy_level", v)}
            />
          </QuestionCard>
          <QuestionCard title="How often do you feel overwhelmed?" isRequired>
            <OptionChips
              options={["Rarely", "Sometimes", "Often", "Almost always"]}
              selected={(state.responses.feeling_overwhelmed as string) || ""}
              onChange={(v) => setResponse("feeling_overwhelmed", v)}
            />
          </QuestionCard>
        </div>
      );
      case 2: return (
        <div className="space-y-4">
          <QuestionCard title="How often do you experience anxiety or worry?" isRequired>
            <OptionChips
              options={["Rarely", "Sometimes", "Often", "Almost always"]}
              selected={(state.responses.anxiety_frequency as string) || ""}
              onChange={(v) => setResponse("anxiety_frequency", v)}
            />
          </QuestionCard>
          <QuestionCard title="How would you rate your mood overall?" isRequired>
            <OptionChips
              options={["Very positive", "Mostly positive", "Neutral", "Mostly negative", "Very negative"]}
              selected={(state.responses.mood_overall as string) || ""}
              onChange={(v) => setResponse("mood_overall", v)}
            />
          </QuestionCard>
          <QuestionCard title="How often do you feel motivated to do things?" isRequired>
            <OptionChips
              options={["Almost always", "Often", "Sometimes", "Rarely", "Never"]}
              selected={(state.responses.motivation_frequency as string) || ""}
              onChange={(v) => setResponse("motivation_frequency", v)}
            />
          </QuestionCard>
        </div>
      );
      case 3: return <LifestyleStep />;
      case 4: return (
        <div className="space-y-4">
          <QuestionCard title="Have you been diagnosed with any mental health condition?" isRequired>
            <OptionChips
              options={["Yes", "No", "Not sure"]}
              selected={(state.responses.mental_health_diagnosis as string) || ""}
              onChange={(v) => setResponse("mental_health_diagnosis", v)}
            />
          </QuestionCard>
          <QuestionCard title="Are you currently taking any medication for mental health?" isRequired>
            <OptionChips
              options={["Yes", "No"]}
              selected={(state.responses.mental_health_medication as string) || ""}
              onChange={(v) => setResponse("mental_health_medication", v)}
            />
          </QuestionCard>
        </div>
      );
      case 5: return <ConsentStep onSubmit={handleSubmit} isSubmitting={state.isSubmitting} />;
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
