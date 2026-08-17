"use client";

interface NumberInputProps {
  value: number | string;
  onChange: (value: number | string) => void;
  unit?: string;
  placeholder?: string;
  min?: number;
  max?: number;
}

export default function NumberInput({
  value,
  onChange,
  unit,
  placeholder,
  min,
  max,
}: NumberInputProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
        placeholder={placeholder}
        min={min}
        max={max}
        className="flex-1 px-4 py-3 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-[16px] leading-[24px] bg-white"
      />
      {unit && (
        <span className="font-label-md text-[14px] text-on-surface-variant/60 min-w-[40px]">
          {unit}
        </span>
      )}
    </div>
  );
}
