"use client";

interface YesNoToggleProps {
  value: string | null;
  onChange: (value: string) => void;
}

export default function YesNoToggle({ value, onChange }: YesNoToggleProps) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => onChange("yes")}
        className={`flex-1 py-3 rounded-xl font-label-md text-[14px] font-medium transition-all border ${
          value === "yes"
            ? "bg-primary text-on-primary border-primary shadow-sm"
            : "bg-surface-container-low text-on-surface-variant border-outline-variant/40 hover:border-primary/40"
        }`}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => onChange("no")}
        className={`flex-1 py-3 rounded-xl font-label-md text-[14px] font-medium transition-all border ${
          value === "no"
            ? "bg-primary text-on-primary border-primary shadow-sm"
            : "bg-surface-container-low text-on-surface-variant border-outline-variant/40 hover:border-primary/40"
        }`}
      >
        No
      </button>
    </div>
  );
}
