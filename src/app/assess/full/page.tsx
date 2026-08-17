"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAssessment } from "@/context/AssessmentContext";
import { ASSESSMENT_CONFIGS } from "@/lib/assessment/types";
import AssessmentWizard from "@/components/assessment/AssessmentWizard";
import ProfileStep from "@/components/assessment/steps/ProfileStep";
import MedicalHistoryStep from "@/components/assessment/steps/MedicalHistoryStep";
import FamilyHistoryStep from "@/components/assessment/steps/FamilyHistoryStep";
import LifestyleStep from "@/components/assessment/steps/LifestyleStep";
import NutritionStep from "@/components/assessment/steps/NutritionStep";
import SymptomsStep from "@/components/assessment/steps/SymptomsStep";
import ConditionSpecificStep from "@/components/assessment/steps/ConditionSpecificStep";

import ConsentStep from "@/components/assessment/steps/ConsentStep";
import { calculateMetabolicScore } from "@/lib/assessment/scoring/metabolic";
import { calculateHeartScore } from "@/lib/assessment/scoring/heart";
import { calculateNutritionScore } from "@/lib/assessment/scoring/nutrition";
import { calculateActivityScore } from "@/lib/assessment/scoring/activity";
import { calculateSleepScore } from "@/lib/assessment/scoring/sleep";
import { calculateMentalScore } from "@/lib/assessment/scoring/mental";
import { calculateLiverScore } from "@/lib/assessment/scoring/liver";
import { calculateWeightScore } from "@/lib/assessment/scoring/weight";
import { calculateLifestyleScore } from "@/lib/assessment/scoring/lifestyle";
import { calculateWeightedOverall } from "@/lib/assessment/scoring-engine";
import { CATEGORY_WEIGHTS } from "@/lib/assessment/constants";

export default function FullAssessmentPage() {
  const router = useRouter();
  const config = ASSESSMENT_CONFIGS.full;
  const { state, setAssessment, setSubmitting } = useAssessment();
  const [currentStep, setCurrentStep] = useState(0);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      setAssessment("full", config.steps.length);
      initialized.current = true;
    }
  }, [config.steps.length, setAssessment]);

  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);

    try {
      const { responses, profile } = state;
      const bmi =
        profile.heightCm && profile.weightKg
          ? Math.round((profile.weightKg / Math.pow(profile.heightCm / 100, 2)) * 10) / 10
          : 0;
      const profileData = { age: profile.age, gender: profile.gender, bmi };

      const categories = {
        metabolic: calculateMetabolicScore(responses, profileData),
        heart: calculateHeartScore(responses, profileData),
        nutrition: calculateNutritionScore(responses),
        activity: calculateActivityScore(responses),
        sleep: calculateSleepScore(responses),
        mental: calculateMentalScore(responses),
        liver: calculateLiverScore(responses),
        weight: calculateWeightScore(responses, profileData),
        lifestyle: calculateLifestyleScore(responses),
      };

      const overall = calculateWeightedOverall(categories, CATEGORY_WEIGHTS.full);

      const response = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentSlug: "full",
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone,
          age: profile.age,
          gender: profile.gender,
          heightCm: profile.heightCm,
          weightKg: profile.weightKg,
          city: profile.city,
          responses: responses,
          consentGiven: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit assessment");
      }

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

      router.push(`/assess/full/result/${data.id}`);
    } catch (error) {
      console.error("Submit failed:", error);
    } finally {
      setSubmitting(false);
    }
  }, [state, router, setSubmitting, config.name]);

  // Full config has 8 steps: profile(0), medical(1), family(2), lifestyle(3), nutrition(4), symptoms(5), condition(6), consent(7)
  const renderStep = useCallback(() => {
    switch (currentStep) {
      case 0: return <ProfileStep />;
      case 1: return <MedicalHistoryStep />;
      case 2: return <FamilyHistoryStep />;
      case 3: return <LifestyleStep />;
      case 4: return <NutritionStep />;
      case 5: return <SymptomsStep />;
      case 6: return <ConditionSpecificStep />;
      case 7: return (
        <ConsentStep
          onSubmit={handleSubmit}
          isSubmitting={state.isSubmitting}
        />
      );
      default: return <ProfileStep />;
    }
  }, [currentStep, handleSubmit, state.isSubmitting]);

  return (
    <AssessmentWizard
      assessmentName={config.name}
      steps={config.steps}
      currentStep={currentStep}
      onStepChange={handleStepChange}
      onSubmit={handleSubmit}
      isSubmitting={state.isSubmitting}
    >
      {renderStep()}
    </AssessmentWizard>
  );
}
