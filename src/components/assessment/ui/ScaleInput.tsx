"use client";

import { SCALE_LABELS } from "@/lib/assessment/constants";

interface ScaleInputProps {
  value: number | null;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  helperText?: string;
}

export default function ScaleInput({
  value,
  onChange,
  min = 1,
  max = 10,
  helperText,
}: ScaleInputProps) {
  const labels = SCALE_LABELS[max] || SCALE_LABELS[10];
  const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {range.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl font-label-md text-[14px] font-medium transition-all border ${
              value === num
                ? "bg-primary text-on-primary border-primary shadow-sm"
                : "bg-surface-container-low text-on-surface-variant border-outline-variant/40 hover:border-primary/40"
            }`}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex justify-between">
        <span className="font-label-sm text-[11px] text-on-surface-variant/50">
          {labels?.[0] || min}
        </span>
        <span className="font-label-sm text-[11px] text-on-surface-variant/50">
          {labels?.[labels.length - 1] || max}
        </span>
      </div>
      {helperText && (
        <p className="font-body-md text-[13px] text-on-surface-variant/60 mt-2 text-center">
          {helperText}
        </p>
      )}
    </div>
  );
}
