"use client";

interface StrengthsListProps {
  items: string[];
}

export default function StrengthsList({ items }: StrengthsListProps) {
  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-outline-variant/30 p-5 sm:p-6 shadow-sm">
      <h3 className="font-headline-md text-[16px] sm:text-[18px] font-semibold text-on-background mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
        What looks good
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5 flex-shrink-0">
              check
            </span>
            <span className="font-body-md text-[14px] text-on-surface-variant leading-[22px]">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
