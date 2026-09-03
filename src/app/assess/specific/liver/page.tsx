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
import { calculateLiverScore } from "@/lib/assessment/scoring/liver";
import { calculateWeightedOverall } from "@/lib/assessment/scoring-engine";
import { CATEGORY_WEIGHTS, LIFESTYLE_STEP_REQUIRED } from "@/lib/assessment/constants";
import { useState, useCallback, useEffect, useRef } from "react";

export default function LiverAssessmentPage() {
  const router = useRouter();
  const config = ASSESSMENT_CONFIGS.liver;
  const { state, setAssessment, setResponse, setSubmitting } = useAssessment();
  const [currentStep, setCurrentStep] = useState(0);

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      setAssessment("liver", config.steps.length);
      initialized.current = true;
    }
  }, [setAssessment, config.steps.length]);

  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const calculateScores = useCallback(() => {
    const { responses } = state;
    const categories = {
      liver: calculateLiverScore(responses),
    };
    const overall = calculateWeightedOverall(categories, CATEGORY_WEIGHTS.liver);
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
      if (!responses.liver_disease) return "Please answer: Have you been diagnosed with any liver disease?";
      if (!responses.alcohol_frequency) return "Please answer: How often do you consume alcohol?";
      if (!responses.alcohol_amount) return "Please answer: How many standard drinks do you have per occasion?";
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
      if (!Array.isArray(responses.liver_symptoms) || responses.liver_symptoms.length === 0)
        return "Please select at least one option (or 'None of the above')";
      if (!responses.fatty_liver) return "Please answer: Have you ever been told you have fatty liver?";
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
          assessmentSlug: "liver",
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

      router.push(`/assess/specific/liver/result/${data.id}`);
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
          <QuestionCard title="Have you been diagnosed with any liver disease?" isRequired>
            <OptionChips
              options={["Yes", "No", "Not sure"]}
              selected={(state.responses.liver_disease as string) || ""}
              onChange={(v) => setResponse("liver_disease", v)}
            />
          </QuestionCard>
          <QuestionCard title="How often do you consume alcohol?" isRequired>
            <OptionChips
              options={["Never", "Occasionally (1-2 times/month)", "Weekly (1-3 times)", "Frequently (4+ times/week)", "Daily"]}
              selected={(state.responses.alcohol_frequency as string) || ""}
              onChange={(v) => setResponse("alcohol_frequency", v)}
            />
          </QuestionCard>
          <QuestionCard title="How many standard drinks do you have per occasion?" isRequired>
            <OptionChips
              options={["0", "1-2", "3-4", "5-6", "7+"]}
              selected={(state.responses.alcohol_amount as string) || ""}
              onChange={(v) => setResponse("alcohol_amount", v)}
            />
          </QuestionCard>
        </div>
      );
      case 2: return <LifestyleStep />;
      case 3: return (
        <div className="space-y-4">
          <QuestionCard title="Do you experience any of the following symptoms?" isRequired>
            <OptionChips
              options={["Yellowing of skin/eyes", "Dark urine", "Pale stools", "Abdominal pain", "Nausea", "Fatigue", "None of the above"]}
              selected={(state.responses.liver_symptoms as string[]) || []}
              onChange={(v) => setResponse("liver_symptoms", v)}
              multi
            />
          </QuestionCard>
          <QuestionCard title="Have you ever been told you have fatty liver?" isRequired>
            <OptionChips
              options={["Yes", "No", "Not sure"]}
              selected={(state.responses.fatty_liver as string) || ""}
              onChange={(v) => setResponse("fatty_liver", v)}
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
