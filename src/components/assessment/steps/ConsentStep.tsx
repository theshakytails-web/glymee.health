"use client";

import { useAssessment } from "@/context/AssessmentContext";
import { CONSENT_TEXT } from "@/lib/assessment/types";
import QuestionCard from "../ui/QuestionCard";
import YesNoToggle from "../ui/YesNoToggle";
import Disclaimer from "../results/Disclaimer";
import ReportUploader from "../ui/ReportUploader";

interface ConsentStepProps {
  submissionId?: string;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function ConsentStep({
  submissionId,
  onSubmit,
  isSubmitting,
}: ConsentStepProps) {
  const { state, setResponse } = useAssessment();
  const consent = state.responses.consent as string;

  return (
    <div className="space-y-4">
      {/* Report Upload */}
      {submissionId && (
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-5 sm:p-6 shadow-sm">
          <h3 className="font-headline-md text-[16px] sm:text-[18px] font-semibold text-on-background mb-3">
            Upload Reports (Optional)
          </h3>
          <p className="font-body-md text-[13px] text-on-surface-variant/70 mb-4">
            You can upload blood reports, HbA1c, lipid profile, or other medical reports.
          </p>
          <ReportUploader submissionId={submissionId} />
        </div>
      )}

      {/* Consent */}
      <QuestionCard title="Consent & Data Privacy" isRequired>
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-surface-container-low max-h-40 overflow-y-auto">
            <p className="font-body-md text-[13px] leading-[20px] text-on-surface-variant/70 whitespace-pre-line">
              {CONSENT_TEXT}
            </p>
          </div>
          <YesNoToggle
            value={consent || null}
            onChange={(v) => setResponse("consent", v)}
          />
          {consent === "yes" && (
            <p className="font-label-sm text-[12px] text-secondary flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              Thank you for your consent
            </p>
          )}
        </div>
      </QuestionCard>

      <Disclaimer />

      {/* Submit */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={consent !== "yes" || isSubmitting}
        className="w-full py-4 rounded-xl bg-primary text-on-primary font-headline-md text-[16px] font-semibold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <span className="material-symbols-outlined animate-spin text-[20px]">
              progress_activity
            </span>
            Submitting...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            Submit Assessment
          </>
        )}
      </button>
    </div>
  );
}
