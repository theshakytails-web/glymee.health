"use client";

import { useRouter } from "next/navigation";
import { useAssessment } from "@/context/AssessmentContext";
import { ASSESSMENT_CONFIGS } from "@/lib/assessment/types";
import AssessmentWizard from "@/components/assessment/AssessmentWizard";
import ProfileStep from "@/components/assessment/steps/ProfileStep";
import ConsentStep from "@/components/assessment/steps/ConsentStep";
import MedicalHistoryStep from "@/components/assessment/steps/MedicalHistoryStep";
import FamilyHistoryStep from "@/components/assessment/steps/FamilyHistoryStep";
import LifestyleStep from "@/components/assessment/steps/LifestyleStep";
import LabValuesStep from "@/components/assessment/steps/LabValuesStep";
import QuestionCard from "@/components/assessment/ui/QuestionCard";
import OptionChips from "@/components/assessment/ui/OptionChips";
import NumberInput from "@/components/assessment/ui/NumberInput";
import { calculateMetabolicScore } from "@/lib/assessment/scoring/metabolic";
import { calculateWeightedOverall } from "@/lib/assessment/scoring-engine";
import { CATEGORY_WEIGHTS, LIFESTYLE_STEP_REQUIRED } from "@/lib/assessment/constants";
import { useState, useCallback, useEffect, useRef } from "react";

export default function BloodSugarAssessmentPage() {
  const router = useRouter();
  const config = ASSESSMENT_CONFIGS.blood_sugar;
  const { state, setAssessment, setResponse, setSubmitting } = useAssessment();
  const [currentStep, setCurrentStep] = useState(0);

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      setAssessment("blood_sugar", config.steps.length);
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

    const scoringResponses = {
      ...responses,
      current_symptoms: responses.bs_symptoms,
    };

    const categories = {
      metabolic: calculateMetabolicScore(scoringResponses, profileData),
    };

    const overall = calculateWeightedOverall(categories, CATEGORY_WEIGHTS.blood_sugar);

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
      if (!Array.isArray(responses.medical_conditions) || responses.medical_conditions.length === 0)
        return "Please select at least one condition";
      return null;
    }
    if (step === 2) {
      if (!Array.isArray(responses.family_conditions) || responses.family_conditions.length === 0)
        return "Please select at least one family condition";
      return null;
    }
    if (step === 3) {
      if (!Array.isArray(responses.bs_symptoms) || responses.bs_symptoms.length === 0)
        return "Please select at least one option (or 'None of the above')";
      return null;
    }
    if (step === 4) {
      for (const key of LIFESTYLE_STEP_REQUIRED) {
        if (!responses[key]) {
          return "Please answer the required lifestyle questions above";
        }
      }
      return null;
    }
    if (step === 5) {
      if (!responses.exercise_days) return "Please answer: How many days per week do you exercise?";
      if (!responses.sugary_drinks) return "Please answer: How often do you drink sugary drinks?";
      return null;
    }
    if (step === 6) return null;
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
          assessmentSlug: "blood_sugar",
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

      router.push(`/assess/specific/blood_sugar/result/${data.id}`);
    } catch (error) {
      console.error("Submit failed:", error);
    } finally {
      setSubmitting(false);
    }
  }, [state, config, calculateScores, router, setSubmitting]);

  const renderStep = useCallback(() => {
    switch (currentStep) {
      case 0: return <ProfileStep />;
      case 1: return <MedicalHistoryStep />;
      case 2: return <FamilyHistoryStep />;
      case 3: return (
        <div className="space-y-4">
          <QuestionCard title="Do you currently experience any of the following?" isRequired>
            <OptionChips
              options={["Excessive thirst", "Frequent urination", "Unexplained weight change", "Excessive tiredness", "Blurred vision", "Frequent hunger", "None of the above"]}
              selected={(state.responses.bs_symptoms as string[]) || []}
              onChange={(v) => setResponse("bs_symptoms", v)}
              multi
            />
          </QuestionCard>
        </div>
      );
      case 4: return <LifestyleStep />;
      case 5: return (
        <div className="space-y-4">
          <QuestionCard title="How many days per week do you exercise?" isRequired>
            <OptionChips
              options={["0 days", "1-2 days", "3-4 days", "5-7 days"]}
              selected={(state.responses.exercise_days as string) || ""}
              onChange={(v) => setResponse("exercise_days", v)}
            />
          </QuestionCard>
          <QuestionCard title="How often do you drink sugary drinks?" isRequired>
            <OptionChips
              options={["Rarely / Never", "1-3 times/week", "4-6 times/week", "Daily or more"]}
              selected={(state.responses.sugary_drinks as string) || ""}
              onChange={(v) => setResponse("sugary_drinks", v)}
            />
          </QuestionCard>
        </div>
      );
      case 6: return <ConsentStep onSubmit={handleSubmit} isSubmitting={state.isSubmitting} />;
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
