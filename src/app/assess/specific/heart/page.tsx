"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAssessment } from "@/context/AssessmentContext";
import { ASSESSMENT_CONFIGS } from "@/lib/assessment/types";
import AssessmentWizard from "@/components/assessment/AssessmentWizard";
import ProfileStep from "@/components/assessment/steps/ProfileStep";
import ConsentStep from "@/components/assessment/steps/ConsentStep";

import QuestionCard from "@/components/assessment/ui/QuestionCard";
import OptionChips from "@/components/assessment/ui/OptionChips";
import { calculateHeartScore } from "@/lib/assessment/scoring/heart";
import { calculateWeightedOverall } from "@/lib/assessment/scoring-engine";
import { CATEGORY_WEIGHTS } from "@/lib/assessment/constants";
import { useState } from "react";

export default function HeartAssessmentPage() {
  const router = useRouter();
  const config = ASSESSMENT_CONFIGS.heart;
  const { state, setAssessment, setResponse, setSubmitting } = useAssessment();
  const [currentStep, setCurrentStep] = useState(0);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      setAssessment("heart", config.steps.length);
      initialized.current = true;
    }
  }, [config.steps.length, setAssessment]);

  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const validateStep = useCallback((step: number): string | null => {
    const { profile, responses } = state;

    switch (step) {
      case 0: // Profile
        if (!profile.fullName.trim()) return "Please enter your full name";
        if (!profile.age || profile.age < 1) return "Please enter your age";
        if (!profile.gender) return "Please select your gender";
        if (!profile.heightCm || profile.heightCm < 1) return "Please enter your height";
        if (!profile.weightKg || profile.weightKg < 1) return "Please enter your weight";
        if (!profile.city.trim()) return "Please enter your city";
        if (!profile.email.trim()) return "Please enter your email address";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) return "Please enter a valid email address";
        return null;

      case 1: // Heart Health History
        if (!responses.bp_history) return "Please answer: Do you have high blood pressure?";
        if (!responses.cholesterol_history) return "Please answer: Do you have high cholesterol?";
        if (!responses.heart_disease) return "Please answer: Have you been diagnosed with a heart condition?";
        if (!responses.diabetes) return "Please answer: Do you have diabetes?";
        return null;

      case 2: // Risk Factors
        if (!responses.tobacco_use) return "Please answer: Do you use tobacco?";
        if (!responses.alcohol_use) return "Please answer: How often do you consume alcohol?";
        if (!responses.exercise_days) return "Please answer: How many days per week do you exercise?";
        if (!responses.sleep_duration) return "Please answer: How many hours of sleep do you get?";
        if (!responses.stress_level) return "Please answer: How would you rate your stress level?";
        if (!responses.family_heart) return "Please answer: Do family members have heart disease?";
        return null;

      case 3: // Symptoms
        if (!responses.heart_symptoms || (Array.isArray(responses.heart_symptoms) && responses.heart_symptoms.length === 0)) {
          return "Please select at least one option (or 'None of the above')";
        }
        return null;

      case 4: // Consent
        return null;

      default:
        return null;
    }
  }, [state]);

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
        heart: calculateHeartScore(responses, profileData),
      };
      const overall = calculateWeightedOverall(categories, CATEGORY_WEIGHTS.heart);

      const response = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentSlug: "heart",
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
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to submit");
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

      router.push(`/assess/specific/heart/result/${data.id}`);
    } catch (error) {
      console.error("Submit failed:", error);
      alert(error instanceof Error ? error.message : "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [state, config, router, setSubmitting]);

  const renderStep = useCallback(() => {
    // Heart config steps: profile, heart-history, risk-factors, symptoms, consent
    switch (currentStep) {
      case 0: return <ProfileStep />;
      
      case 1: return (
        <div className="space-y-4">
          <QuestionCard title="Have you been diagnosed with high blood pressure?" isRequired>
            <OptionChips
              options={["Yes", "No", "Not sure"]}
              selected={(state.responses.bp_history as string) || ""}
              onChange={(v) => setResponse("bp_history", v)}
            />
          </QuestionCard>
          <QuestionCard title="Have you been told you have high cholesterol?" isRequired>
            <OptionChips
              options={["Yes", "No", "Not sure"]}
              selected={(state.responses.cholesterol_history as string) || ""}
              onChange={(v) => setResponse("cholesterol_history", v)}
            />
          </QuestionCard>
          <QuestionCard title="Have you or a doctor ever identified any heart condition?" isRequired>
            <OptionChips
              options={["Yes", "No", "Not sure"]}
              selected={(state.responses.heart_disease as string) || ""}
              onChange={(v) => setResponse("heart_disease", v)}
            />
          </QuestionCard>
          <QuestionCard title="Do you have diabetes or prediabetes?" isRequired>
            <OptionChips
              options={["Yes, diabetes", "Yes, prediabetes", "No", "Not sure"]}
              selected={(state.responses.diabetes as string) || ""}
              onChange={(v) => setResponse("diabetes", v)}
            />
          </QuestionCard>
        </div>
      );
      
      case 2: return (
        <div className="space-y-4">
          <QuestionCard title="Do you use tobacco?" isRequired>
            <OptionChips
              options={["Never", "Former user", "Current user"]}
              selected={(state.responses.tobacco_use as string) || ""}
              onChange={(v) => setResponse("tobacco_use", v)}
            />
          </QuestionCard>
          <QuestionCard title="How often do you consume alcohol?" isRequired>
            <OptionChips
              options={["Never", "Occasionally", "Regularly"]}
              selected={(state.responses.alcohol_use as string) || ""}
              onChange={(v) => setResponse("alcohol_use", v)}
            />
          </QuestionCard>
          <QuestionCard title="How many days per week do you exercise for at least 30 minutes?" isRequired>
            <OptionChips
              options={["0 days", "1-2 days", "3-4 days", "5-7 days"]}
              selected={(state.responses.exercise_days as string) || ""}
              onChange={(v) => setResponse("exercise_days", v)}
            />
          </QuestionCard>
          <QuestionCard title="How many hours of sleep do you usually get?" isRequired>
            <OptionChips
              options={["Less than 5 hours", "5-6 hours", "6-7 hours", "7-8 hours", "More than 8 hours"]}
              selected={(state.responses.sleep_duration as string) || ""}
              onChange={(v) => setResponse("sleep_duration", v)}
            />
          </QuestionCard>
          <QuestionCard title="How would you rate your stress level?" isRequired>
            <OptionChips
              options={["Low", "Moderate", "High", "Very high"]}
              selected={(state.responses.stress_level as string) || ""}
              onChange={(v) => setResponse("stress_level", v)}
            />
          </QuestionCard>
          <QuestionCard title="Do any close family members have heart disease?" isRequired>
            <OptionChips
              options={["Yes", "No", "Not sure"]}
              selected={(state.responses.family_heart as string) || ""}
              onChange={(v) => setResponse("family_heart", v)}
            />
          </QuestionCard>
        </div>
      );
      
      case 3: return (
        <div className="space-y-4">
          <QuestionCard title="Do you currently experience any of the following?" isRequired>
            <OptionChips
              options={["Chest discomfort", "Breathlessness", "Palpitations", "Dizziness", "Swelling in legs/ankles", "Fatigue during activity", "None of the above"]}
              selected={(state.responses.heart_symptoms as string[]) || []}
              onChange={(v) => setResponse("heart_symptoms", v)}
              multi
            />
          </QuestionCard>
        </div>
      );
      
      case 4: return <ConsentStep onSubmit={handleSubmit} isSubmitting={state.isSubmitting} />;
      
      default: return <ProfileStep />;
    }
  }, [currentStep, state.responses, state.isSubmitting, setResponse, handleSubmit]);

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
