"use client";

import { use, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAssessment } from "@/context/AssessmentContext";
import { ASSESSMENT_CONFIGS } from "@/lib/assessment/types";
import AssessmentWizard from "@/components/assessment/AssessmentWizard";
import ProfileStep from "@/components/assessment/steps/ProfileStep";
import ConsentStep from "@/components/assessment/steps/ConsentStep";
import QuestionCard from "@/components/assessment/ui/QuestionCard";
import OptionChips from "@/components/assessment/ui/OptionChips";
import TextInput from "@/components/assessment/ui/TextInput";
import NumberInput from "@/components/assessment/ui/NumberInput";
import YesNoToggle from "@/components/assessment/ui/YesNoToggle";
import { calculateMetabolicScore } from "@/lib/assessment/scoring/metabolic";
import { calculateHeartScore } from "@/lib/assessment/scoring/heart";
import { calculateMentalScore } from "@/lib/assessment/scoring/mental";
import { calculateLiverScore } from "@/lib/assessment/scoring/liver";
import { calculateWeightScore } from "@/lib/assessment/scoring/weight";
import { calculateLifestyleScore } from "@/lib/assessment/scoring/lifestyle";
import { calculateNutritionScore } from "@/lib/assessment/scoring/nutrition";
import { calculateWeightedOverall } from "@/lib/assessment/scoring-engine";

export default function SpecificAssessmentPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = use(params);
  const router = useRouter();
  const config = ASSESSMENT_CONFIGS[type];
  const { state, setAssessment, setResponse, setSubmitting } = useAssessment();
  const [currentStep, setCurrentStep] = useState(0);

  useState(() => {
    if (config) {
      setAssessment(type, config.steps.length);
    }
  });

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

    const scorers: Record<string, () => ReturnType<typeof calculateMetabolicScore>> = {
      blood_sugar: () => calculateMetabolicScore(responses, profileData),
      heart: () => calculateHeartScore(responses, profileData),
      mental: () => calculateMentalScore(responses),
      liver: () => calculateLiverScore(responses),
      weight: () => calculateWeightScore(responses, profileData),
      lifestyle: () => calculateLifestyleScore(responses),
    };

    const scorer = scorers[type];
    if (!scorer) return { categories: {}, overall: { score: 50, status: "needs_attention" as const, label: "Needs Attention", color: "amber" as const, strengths: [], concerns: [], recommendations: [] } };

    const categoryResult = scorer();
    const categories = { [config.categories[0]]: categoryResult };
    const overall = calculateWeightedOverall(categories, { [config.categories[0]]: 1 });

    return { categories, overall };
  }, [state, type, config]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const { categories, overall } = calculateScores();
      const response = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentSlug: type,
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

      router.push(`/assess/specific/${type}/result/${data.id}`);
    } catch (error) {
      console.error("Submit failed:", error);
    } finally {
      setSubmitting(false);
    }
  }, [state, type, config, calculateScores, router, setSubmitting]);

  const renderStep = useMemo(() => {
    if (!config) return <div>Assessment not found</div>;
    const step = config.steps[currentStep];
    if (!step) return <ProfileStep />;

    if (step.sectionSlug === "profile") return <ProfileStep />;
    if (step.sectionSlug === "consent") return <ConsentStep onSubmit={handleSubmit} isSubmitting={state.isSubmitting} />;

    // Dynamic step rendering for specific assessments
    const { responses } = state;

    if (step.sectionSlug === "diabetes_history" || step.sectionSlug === "heart_history" || step.sectionSlug === "liver_history") {
      return (
        <div className="space-y-4">
          <QuestionCard title="Have you been diagnosed with this condition?" isRequired>
            <OptionChips
              options={["Yes", "No", "Not sure"]}
              selected={(responses.diabetes_diagnosis as string) || (responses.liver_disease as string) || ""}
              onChange={(v) => {
                if (step.sectionSlug === "diabetes_history") setResponse("diabetes_diagnosis", v);
                else if (step.sectionSlug === "liver_history") setResponse("liver_disease", v);
              }}
            />
          </QuestionCard>
        </div>
      );
    }

    if (step.sectionSlug === "risk_factors") {
      return (
        <div className="space-y-4">
          <QuestionCard title="Do any close family members have this condition?" isRequired>
            <OptionChips
              options={["Yes", "No", "Not sure"]}
              selected={(responses.family_diabetes as string) || (responses.family_heart as string) || ""}
              onChange={(v) => {
                setResponse(type === "heart" ? "family_heart" : "family_diabetes", v);
              }}
            />
          </QuestionCard>
          <QuestionCard title="How many days per week do you exercise?" isRequired>
            <OptionChips
              options={["0 days", "1-2 days", "3-4 days", "5-7 days"]}
              selected={(responses.exercise_days as string) || ""}
              onChange={(v) => setResponse("exercise_days", v)}
            />
          </QuestionCard>
          <QuestionCard title="How often do you drink sugary drinks?" isRequired>
            <OptionChips
              options={["Rarely / Never", "1-3 times/week", "4-6 times/week", "Daily or more"]}
              selected={(responses.sugary_drinks as string) || ""}
              onChange={(v) => setResponse("sugary_drinks", v)}
            />
          </QuestionCard>
          <QuestionCard title="How would you rate your stress level?" isRequired>
            <OptionChips
              options={["Low", "Moderate", "High", "Very high"]}
              selected={(responses.stress_level as string) || ""}
              onChange={(v) => setResponse("stress_level", v)}
            />
          </QuestionCard>
        </div>
      );
    }

    if (step.sectionSlug === "symptoms") {
      return (
        <div className="space-y-4">
          <QuestionCard title="Do you currently experience any of the following?" isRequired>
            <OptionChips
              options={["Excessive thirst", "Frequent urination", "Unexplained weight change", "Excessive tiredness", "Blurred vision", "Frequent hunger", "None of the above"]}
              selected={(responses.bs_symptoms as string[]) || (responses.heart_symptoms as string[]) || []}
              onChange={(v) => setResponse(type === "heart" ? "heart_symptoms" : "bs_symptoms", v)}
              multi
            />
          </QuestionCard>
        </div>
      );
    }

    if (step.sectionSlug === "wellbeing") {
      return (
        <div className="space-y-4">
          <QuestionCard title="How would you rate your current stress level?" isRequired>
            <OptionChips
              options={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}
              selected={(responses.stress_level as string) || ""}
              onChange={(v) => setResponse("stress_level", v)}
            />
          </QuestionCard>
          <QuestionCard title="How is your energy level during the day?" isRequired>
            <OptionChips
              options={["Excellent", "Good", "Moderate", "Low", "Very low"]}
              selected={(responses.energy_level as string) || ""}
              onChange={(v) => setResponse("energy_level", v)}
            />
          </QuestionCard>
          <QuestionCard title="How often do you feel overwhelmed?" isRequired>
            <OptionChips
              options={["Rarely", "Sometimes", "Often", "Almost always"]}
              selected={(responses.feeling_overwhelmed as string) || ""}
              onChange={(v) => setResponse("feeling_overwhelmed", v)}
            />
          </QuestionCard>
        </div>
      );
    }

    if (step.sectionSlug === "weight_history") {
      return (
        <div className="space-y-4">
          <QuestionCard title="Has your weight changed significantly in the past year?" isRequired>
            <OptionChips
              options={["Gained more than 10 kg", "Gained 5-10 kg", "Stable (within 2 kg)", "Lost 5-10 kg", "Lost more than 10 kg"]}
              selected={(responses.weight_change as string) || ""}
              onChange={(v) => setResponse("weight_change", v)}
            />
          </QuestionCard>
        </div>
      );
    }

    if (step.sectionSlug === "metabolic") {
      return (
        <div className="space-y-4">
          <QuestionCard title="Do you have diabetes or prediabetes?" isRequired>
            <OptionChips
              options={["Yes, diabetes", "Yes, prediabetes", "No", "Not sure"]}
              selected={(responses.diabetes as string) || ""}
              onChange={(v) => setResponse("diabetes", v)}
            />
          </QuestionCard>
          <QuestionCard title="Do you have high blood pressure?" isRequired>
            <OptionChips
              options={["Yes", "No", "Not sure"]}
              selected={(responses.bp_history as string) || ""}
              onChange={(v) => setResponse("bp_history", v)}
            />
          </QuestionCard>
        </div>
      );
    }

    if (step.sectionSlug === "lifestyle") {
      return (
        <div className="space-y-4">
          <QuestionCard title="How many days per week do you exercise?" isRequired>
            <OptionChips
              options={["0 days", "1-2 days", "3-4 days", "5-7 days"]}
              selected={(responses.exercise_days as string) || ""}
              onChange={(v) => setResponse("exercise_days", v)}
            />
          </QuestionCard>
          <QuestionCard title="How would you rate your sleep quality?" isRequired>
            <OptionChips
              options={["Very poor", "Poor", "Fair", "Good", "Very good"]}
              selected={(responses.sleep_quality as string) || ""}
              onChange={(v) => setResponse("sleep_quality", v)}
            />
          </QuestionCard>
          <QuestionCard title="How often do you drink sugary drinks?" isRequired>
            <OptionChips
              options={["Rarely / Never", "1-3 times/week", "4-6 times/week", "Daily or more"]}
              selected={(responses.sugary_drinks as string) || ""}
              onChange={(v) => setResponse("sugary_drinks", v)}
            />
          </QuestionCard>
        </div>
      );
    }

    if (step.sectionSlug === "nutrition") {
      const nutritionQs = [
        { key: "vegetables", text: "How many servings of vegetables per day?", options: ["Less than 1", "1-2", "2-3", "More than 3"] },
        { key: "fruits", text: "How often do you eat fruits?", options: ["Daily", "4-6 times/week", "1-3 times/week", "Rarely / Never"] },
        { key: "protein", text: "Do you include protein in main meals?", options: ["Every main meal", "Usually", "Sometimes", "Rarely"] },
        { key: "sugary_drinks", text: "How often do you drink sugary drinks?", options: ["Rarely / Never", "1-3 times/week", "4-6 times/week", "Daily or more"] },
      ];
      return (
        <div className="space-y-4">
          {nutritionQs.map((q) => (
            <QuestionCard key={q.key} title={q.text} isRequired>
              <OptionChips
                options={q.options}
                selected={(responses[q.key] as string) || ""}
                onChange={(v) => setResponse(q.key, v)}
              />
            </QuestionCard>
          ))}
        </div>
      );
    }

    if (step.sectionSlug === "lab_values") {
      return (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <p className="font-label-sm text-[12px] text-primary">All fields are optional.</p>
          </div>
          <QuestionCard title="HbA1c (%)" isRequired={false}>
            <NumberInput value={(responses.lab_hba1c as number) || ""} onChange={(v) => setResponse("lab_hba1c", v ? Number(v) : null)} placeholder="e.g., 6.5" min={3} max={20} />
          </QuestionCard>
          <QuestionCard title="Fasting glucose (mg/dL)" isRequired={false}>
            <NumberInput value={(responses.lab_fasting_glucose as number) || ""} onChange={(v) => setResponse("lab_fasting_glucose", v ? Number(v) : null)} placeholder="e.g., 110" min={50} max={500} />
          </QuestionCard>
        </div>
      );
    }

    return <ProfileStep />;
  }, [currentStep, config, state, type, handleSubmit, setResponse]);

  if (!config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-headline-md text-[24px] font-semibold text-on-background mb-2">
            Assessment not found
          </h1>
          <p className="font-body-md text-[14px] text-on-surface-variant mb-4">
            The assessment you&apos;re looking for doesn&apos;t exist.
          </p>
          <a href="/assess" className="text-primary font-label-md text-[14px] font-medium">
            Go back to assessments
          </a>
        </div>
      </div>
    );
  }

  return (
    <AssessmentWizard
      assessmentName={config.name}
      steps={config.steps}
      currentStep={currentStep}
      onStepChange={handleStepChange}
      onSubmit={handleSubmit}
      isSubmitting={state.isSubmitting}
    >
      {renderStep}
    </AssessmentWizard>
  );
}
