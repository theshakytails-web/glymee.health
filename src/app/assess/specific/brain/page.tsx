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
import { calculateWeightedOverall, createScoreResult } from "@/lib/assessment/scoring-engine";
import { CATEGORY_WEIGHTS, LIFESTYLE_STEP_REQUIRED } from "@/lib/assessment/constants";
import { useState, useCallback, useEffect, useRef } from "react";

export default function BrainAssessmentPage() {
  const router = useRouter();
  const config = ASSESSMENT_CONFIGS.brain;
  const { state, setAssessment, setResponse, setSubmitting } = useAssessment();
  const [currentStep, setCurrentStep] = useState(0);

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      setAssessment("brain", config.steps.length);
      initialized.current = true;
    }
  }, [setAssessment, config.steps.length]);

  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const calculateScores = useCallback(() => {
    const { responses } = state;
    // Brain fitness uses a simple scoring based on cognitive health questions
    const cognitiveScore = calculateCognitiveScore(responses);
    const brainResult = createScoreResult(cognitiveScore);
    const categories = {
      brain: {
        ...brainResult,
        label: "Brain Fitness",
      }
    };
    const overall = calculateWeightedOverall(categories, CATEGORY_WEIGHTS.brain);
    return { categories, overall };
  }, [state]);

  const calculateCognitiveScore = (responses: Record<string, unknown>) => {
    let score = 70; // Base score
    
    // Mental stimulation
    const mentalStimulation = responses.mental_stimulation as string;
    if (mentalStimulation === "Daily") score += 15;
    else if (mentalStimulation === "4-6 times/week") score += 10;
    else if (mentalStimulation === "1-3 times/week") score += 5;
    
    // Social interaction
    const socialInteraction = responses.social_interaction as string;
    if (socialInteraction === "Daily") score += 10;
    else if (socialInteraction === "4-6 times/week") score += 5;
    
    // Sleep quality
    const sleepQuality = responses.sleep_quality as string;
    if (sleepQuality === "Very good") score += 10;
    else if (sleepQuality === "Good") score += 5;
    else if (sleepQuality === "Poor" || sleepQuality === "Very poor") score -= 10;
    
    // Stress level
    const stressLevel = responses.stress_level as string;
    if (stressLevel === "Low") score += 5;
    else if (stressLevel === "Very high") score -= 10;
    
    return Math.max(0, Math.min(100, score));
  };

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
      if (!responses.mental_stimulation) return "Please answer: How often do you engage in mentally stimulating activities?";
      if (!responses.social_interaction) return "Please answer: How often do you have meaningful social interactions?";
      if (!responses.memory_rating) return "Please answer: How would you rate your memory?";
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
      if (!Array.isArray(responses.cognitive_concerns) || responses.cognitive_concerns.length === 0)
        return "Please select at least one option";
      if (!responses.sleep_hours) return "Please answer: How many hours of sleep do you get?";
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
          assessmentSlug: "brain",
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

      router.push(`/assess/specific/brain/result/${data.id}`);
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
          <QuestionCard title="How often do you engage in mentally stimulating activities?" isRequired>
            <OptionChips
              options={["Daily", "4-6 times/week", "1-3 times/week", "Rarely", "Never"]}
              selected={(state.responses.mental_stimulation as string) || ""}
              onChange={(v) => setResponse("mental_stimulation", v)}
            />
          </QuestionCard>
          <QuestionCard title="How often do you have meaningful social interactions?" isRequired>
            <OptionChips
              options={["Daily", "4-6 times/week", "1-3 times/week", "Rarely", "Never"]}
              selected={(state.responses.social_interaction as string) || ""}
              onChange={(v) => setResponse("social_interaction", v)}
            />
          </QuestionCard>
          <QuestionCard title="How would you rate your memory?" isRequired>
            <OptionChips
              options={["Excellent", "Good", "Fair", "Poor", "Very poor"]}
              selected={(state.responses.memory_rating as string) || ""}
              onChange={(v) => setResponse("memory_rating", v)}
            />
          </QuestionCard>
        </div>
      );
      case 2: return <LifestyleStep />;
      case 3: return (
        <div className="space-y-4">
          <QuestionCard title="Do you experience any cognitive concerns?" isRequired>
            <OptionChips
              options={["Difficulty concentrating", "Memory lapses", "Trouble finding words", "Mental fog", "None of the above"]}
              selected={(state.responses.cognitive_concerns as string[]) || []}
              onChange={(v) => setResponse("cognitive_concerns", v)}
              multi
            />
          </QuestionCard>
          <QuestionCard title="How many hours of sleep do you get on average?" isRequired>
            <OptionChips
              options={["Less than 5 hours", "5-6 hours", "7-8 hours", "More than 8 hours"]}
              selected={(state.responses.sleep_hours as string) || ""}
              onChange={(v) => setResponse("sleep_hours", v)}
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
