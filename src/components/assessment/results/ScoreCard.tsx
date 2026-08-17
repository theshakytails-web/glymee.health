"use client";

import { ScoreResult } from "@/lib/assessment/types";
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/assessment/constants";

interface ScoreCardProps {
  category: string;
  result: ScoreResult;
}

const STATUS_STYLES = {
  good: "border-l-emerald-500 bg-emerald-50/50",
  needs_attention: "border-l-amber-500 bg-amber-50/50",
  higher_risk: "border-l-red-500 bg-red-50/50",
};

const STATUS_TEXT = {
  good: "text-emerald-700",
  needs_attention: "text-amber-700",
  higher_risk: "text-red-700",
};

export default function ScoreCard({ category, result }: ScoreCardProps) {
  return (
    <div
      className={`rounded-xl border border-outline-variant/20 border-l-4 p-4 ${STATUS_STYLES[result.status]}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="material-symbols-outlined text-on-surface-variant/60 text-[20px]">
          {CATEGORY_ICONS[category] || "health_and_safety"}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-label-md text-[13px] font-semibold text-on-background truncate">
            {CATEGORY_LABELS[category] || category}
          </h3>
        </div>
        <span className={`font-headline-md text-[18px] font-bold ${STATUS_TEXT[result.status]}`}>
          {result.score}
        </span>
      </div>
      <div className="h-1.5 bg-white/80 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${result.score}%`,
            backgroundColor:
              result.status === "good" ? "#10B981" : result.status === "needs_attention" ? "#F59E0B" : "#EF4444",
          }}
        />
      </div>
      <p className={`mt-2 font-label-sm text-[11px] font-medium ${STATUS_TEXT[result.status]}`}>
        {result.label}
      </p>
    </div>
  );
}
