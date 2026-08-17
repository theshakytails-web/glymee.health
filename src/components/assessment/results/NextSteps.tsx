"use client";

interface NextStepsProps {
  items: string[];
}

export default function NextSteps({ items }: NextStepsProps) {
  if (items.length === 0) {
    items = [
      "Continue maintaining your healthy habits",
      "Consider a comprehensive health review with a Glymee professional",
      "Keep tracking your progress over time",
    ];
  }

  return (
    <div className="bg-white rounded-2xl border border-outline-variant/30 p-5 sm:p-6 shadow-sm">
      <h3 className="font-headline-md text-[16px] sm:text-[18px] font-semibold text-on-background mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[20px]">arrow_forward</span>
        What you can do next
      </h3>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 flex-shrink-0">
              {i === 0 ? "medical_services" : i === 1 ? "upload_file" : "trending_up"}
            </span>
            <span className="font-body-md text-[14px] text-on-background leading-[22px]">
              {item}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 p-3 rounded-xl bg-secondary/5 border border-secondary/10">
        <p className="font-body-md text-[13px] text-on-surface-variant leading-[20px]">
          <span className="font-semibold text-secondary">Talk to a Glymee Health Professional</span> —
          Get a personalised health review and plan based on your assessment results.
        </p>
      </div>
    </div>
  );
}
