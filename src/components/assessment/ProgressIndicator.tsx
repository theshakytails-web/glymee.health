"use client";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: { title: string; icon: string }[];
}

export default function ProgressIndicator({
  currentStep,
  totalSteps,
  steps,
}: ProgressIndicatorProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="h-1 bg-surface-container-high rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step info */}
      <div className="flex items-center justify-between">
        <p className="font-label-sm text-[12px] text-on-surface-variant/60">
          Step {currentStep + 1} of {totalSteps}
        </p>
        {steps[currentStep] && (
          <p className="font-label-sm text-[12px] text-on-surface-variant/80 font-medium">
            {steps[currentStep].title}
          </p>
        )}
      </div>
    </div>
  );
}
