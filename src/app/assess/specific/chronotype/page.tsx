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

export default function ChronotypeAssessmentPage() {
  const router = useRouter();
  const config = ASSESSMENT_CONFIGS.chronotype;
  const { state, setAssessment, setResponse, setSubmitting } = useAssessment();
  const [currentStep, setCurrentStep] = useState(0);

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      setAssessment("chronotype", config.steps.length);
      initialized.current = true;
    }
  }, [setAssessment, config.steps.length]);

  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const calculateScores = useCallback(() => {
    const { responses } = state;
    // Chronotype assessment determines type rather than a health score
    const chronotypeResult = determineChronotype(responses);
    const baseResult = createScoreResult(75, chronotypeResult.strengths, chronotypeResult.weaknesses, chronotypeResult.recommendations);
    const categories = {
      chronotype: {
        ...baseResult,
        label: chronotypeResult.type,
      }
    };
    const overall = calculateWeightedOverall(categories, CATEGORY_WEIGHTS.chronotype);
    return { categories, overall };
  }, [state]);

  const determineChronotype = (responses: Record<string, unknown>) => {
    const wakeUpTime = responses.preferred_wake_time as string;
    const naturalWakeUp = responses.natural_wake_time as string;
    const peakPerformance = responses.peak_performance_time as string;
    const sleepiness = responses.morning_sleepiness as string;
    
    let lionScore = 0; // Early bird
    let bearScore = 0; // Middle
    let wolfScore = 0; // Night owl
    let dolphinScore = 0; // Light sleeper
    
    // Wake time preferences
    if (wakeUpTime === "5:00 - 6:00 AM" || wakeUpTime === "6:00 - 7:00 AM") lionScore += 2;
    else if (wakeUpTime === "7:00 - 8:00 AM" || wakeUpTime === "8:00 - 9:00 AM") bearScore += 2;
    else if (wakeUpTime === "9:00 - 10:00 AM" || wakeUpTime === "10:00 AM - 12:00 PM") wolfScore += 2;
    
    // Natural wake up
    if (naturalWakeUp === "Before 6 AM" || naturalWakeUp === "6-7 AM") lionScore += 2;
    else if (naturalWakeUp === "7-8 AM") bearScore += 2;
    else if (naturalWakeUp === "After 9 AM") wolfScore += 2;
    
    // Peak performance
    if (peakPerformance === "Early morning (6-10 AM)") lionScore += 2;
    else if (peakPerformance === "Mid-morning to afternoon (10 AM - 2 PM)") bearScore += 2;
    else if (peakPerformance === "Late afternoon to evening (2-6 PM)") wolfScore += 1;
    else if (peakPerformance === "Night (after 8 PM)") wolfScore += 2;
    
    // Morning sleepiness
    if (sleepiness === "Wide awake" || sleepiness === "Alert after one alarm") lionScore += 1;
    else if (sleepiness === "Need 2-3 alarms") bearScore += 1;
    else if (sleepiness === "Hit snooze multiple times") wolfScore += 1;
    else if (sleepiness === "Always groggy") dolphinScore += 1;
    
    // Determine type
    const maxScore = Math.max(lionScore, bearScore, wolfScore, dolphinScore);
    
    if (maxScore === lionScore) {
      return {
        type: "Lion (Early Bird)",
        strengths: ["Natural early riser", "Productive in mornings", "Good discipline"],
        weaknesses: ["Energy drops in evening", "May miss late social events", "Rigid schedule"],
        recommendations: ["Schedule important tasks in morning", "Wind down by 9-10 PM", "Use natural energy peak"],
      };
    } else if (maxScore === wolfScore) {
      return {
        type: "Wolf (Night Owl)",
        strengths: ["Creative in evening", "Flexible schedule", "Nighttime productivity"],
        weaknesses: ["Difficult mornings", "May struggle with early commitments", "Social jetlag"],
        recommendations: ["Negotiate flexible work hours", "Use evenings for creative work", "Create consistent sleep schedule"],
      };
    } else if (maxScore === bearScore) {
      return {
        type: "Bear (Middle Ground)",
        strengths: ["Flexible schedule", "Consistent energy", "Socially adaptable"],
        weaknesses: ["May lack peak productivity", "Routine-dependent", "Afternoon slumps"],
        recommendations: ["Work with solar cycle", "Take afternoon breaks", "Maintain regular sleep"],
      };
    } else {
      return {
        type: "Dolphin (Light Sleeper)",
        strengths: ["Alert and observant", "Detail-oriented", "Productive in bursts"],
        weaknesses: ["Insomnia tendency", "Anxiety prone", "Irregular energy"],
        recommendations: ["Create strict sleep routine", "Practice relaxation techniques", "Use short work bursts"],
      };
    }
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
      if (!responses.preferred_wake_time) return "Please answer: What time would you naturally wake up?";
      if (!responses.natural_wake_time) return "Please answer: When do you naturally wake up on weekends?";
      if (!responses.peak_performance_time) return "Please answer: When is your peak performance time?";
      return null;
    }
    if (step === 2) {
      if (!responses.morning_sleepiness) return "Please answer: How would you describe your morning alertness?";
      if (!responses.morning_caffeine) return "Please answer: How many cups of coffee/tea do you drink before noon?";
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
          assessmentSlug: "chronotype",
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

      router.push(`/assess/specific/chronotype/result/${data.id}`);
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
          <QuestionCard title="What time would you naturally wake up if free to choose?" isRequired>
            <OptionChips
              options={["5:00 - 6:00 AM", "6:00 - 7:00 AM", "7:00 - 8:00 AM", "8:00 - 9:00 AM", "9:00 - 10:00 AM", "10:00 AM - 12:00 PM"]}
              selected={(state.responses.preferred_wake_time as string) || ""}
              onChange={(v) => setResponse("preferred_wake_time", v)}
            />
          </QuestionCard>
          <QuestionCard title="When do you naturally wake up on weekends?" isRequired>
            <OptionChips
              options={["Before 6 AM", "6-7 AM", "7-8 AM", "8-9 AM", "After 9 AM"]}
              selected={(state.responses.natural_wake_time as string) || ""}
              onChange={(v) => setResponse("natural_wake_time", v)}
            />
          </QuestionCard>
          <QuestionCard title="When is your peak performance time?" isRequired>
            <OptionChips
              options={["Early morning (6-10 AM)", "Mid-morning to afternoon (10 AM - 2 PM)", "Late afternoon to evening (2-6 PM)", "Night (after 8 PM)"]}
              selected={(state.responses.peak_performance_time as string) || ""}
              onChange={(v) => setResponse("peak_performance_time", v)}
            />
          </QuestionCard>
        </div>
      );
      case 2: return (
        <div className="space-y-4">
          <QuestionCard title="How would you describe your morning alertness?" isRequired>
            <OptionChips
              options={["Wide awake", "Alert after one alarm", "Need 2-3 alarms", "Hit snooze multiple times", "Always groggy"]}
              selected={(state.responses.morning_sleepiness as string) || ""}
              onChange={(v) => setResponse("morning_sleepiness", v)}
            />
          </QuestionCard>
          <QuestionCard title="How many cups of coffee/tea do you drink before noon?" isRequired>
            <OptionChips
              options={["0", "1-2", "3-4", "5+"]}
              selected={(state.responses.morning_caffeine as string) || ""}
              onChange={(v) => setResponse("morning_caffeine", v)}
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
