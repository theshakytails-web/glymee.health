"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import { useAssessment } from "@/context/AssessmentContext";
import AssessmentHeader from "./shared/AssessmentHeader";
import ProgressIndicator from "./ProgressIndicator";
import { StepConfig } from "@/lib/assessment/types";

interface AssessmentWizardProps {
  assessmentName: string;
  steps: StepConfig[];
  currentStep: number;
  onStepChange: (step: number) => void;
  children: ReactNode;
  onSubmit: () => void;
  isSubmitting: boolean;
  validateStep?: (step: number) => string | null;
}

export default function AssessmentWizard({
  assessmentName,
  steps,
  currentStep,
  onStepChange,
  children,
  onSubmit,
  isSubmitting,
  validateStep,
}: AssessmentWizardProps) {
  const { state, prevStep } = useAssessment();
  const [error, setError] = useState<string | null>(null);
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Clear the validation error as soon as the user answers a question
  // (responses/profile change) so it does not linger after they select an option.
  useEffect(() => {
    setError(null);
  }, [state.responses, state.profile]);

  const handleBack = useCallback(() => {
    setError(null);
    if (!isFirstStep) {
      onStepChange(currentStep - 1);
    }
  }, [isFirstStep, currentStep, onStepChange]);

  const handleNext = useCallback(() => {
    if (validateStep) {
      const error = validateStep(currentStep);
      if (error) {
        setError(error);
        return;
      }
    }
    setError(null);
    if (!isLastStep) {
      onStepChange(currentStep + 1);
    }
  }, [isLastStep, currentStep, onStepChange, validateStep]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AssessmentHeader title={assessmentName} />

      <div className="flex-1 flex flex-col">
        {/* Progress */}
        <div className="sticky top-14 z-40 bg-surface/80 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-outline-variant/10">
          <ProgressIndicator
            currentStep={currentStep}
            totalSteps={steps.length}
            steps={steps}
          />
        </div>

        {/* Step Content */}
        <div className="flex-1 px-4 sm:px-6 py-6 max-w-[640px] mx-auto w-full">
          {children}

          {/* Validation Error */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-error/10 border border-error/20 flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-error mt-0.5">error</span>
              <p className="font-body-md text-[13px] text-error">{error}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        {!isLastStep && (
          <div className="sticky bottom-0 bg-surface/90 backdrop-blur-md border-t border-outline-variant/20 px-4 sm:px-6 py-4">
            <div className="max-w-[640px] mx-auto flex gap-3">
              {!isFirstStep && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-outline-variant/40 font-label-md text-[14px] font-medium text-on-surface-variant hover:bg-surface-container transition-all flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 px-6 py-3 rounded-xl bg-primary text-on-primary font-label-md text-[14px] font-semibold hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-1"
              >
                Next
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
