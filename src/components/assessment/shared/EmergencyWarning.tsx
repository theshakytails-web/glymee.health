"use client";

import { EMERGENCY_SYMPTOMS, EMERGENCY_WARNING } from "@/lib/assessment/types";

interface EmergencyWarningProps {
  symptoms: string[];
}

export default function EmergencyWarning({ symptoms }: EmergencyWarningProps) {
  const hasEmergency = symptoms.some((s) => EMERGENCY_SYMPTOMS.includes(s));

  if (!hasEmergency) return null;

  return (
    <div className="p-4 rounded-xl bg-red-50 border border-red-200 mb-6">
      <div className="flex gap-3">
        <span className="material-symbols-outlined text-red-600 text-[24px] flex-shrink-0">
          warning
        </span>
        <div>
          <h3 className="font-headline-md text-[16px] font-semibold text-red-800 mb-1">
            Medical Attention Recommended
          </h3>
          <p className="font-body-md text-[14px] leading-[22px] text-red-700">
            {EMERGENCY_WARNING}
          </p>
        </div>
      </div>
    </div>
  );
}
