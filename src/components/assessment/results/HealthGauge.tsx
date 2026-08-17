"use client";

interface HealthGaugeProps {
  score: number;
  status: "good" | "needs_attention" | "higher_risk";
  label: string;
}

const STATUS_CONFIG = {
  good: { color: "#10B981", bgColor: "#ECFDF5", ringColor: "#34D399" },
  needs_attention: { color: "#F59E0B", bgColor: "#FFFBEB", ringColor: "#FBBF24" },
  higher_risk: { color: "#EF4444", bgColor: "#FEF2F2", ringColor: "#F87171" },
};

export default function HealthGauge({ score, status, label }: HealthGaugeProps) {
  const config = STATUS_CONFIG[status];
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-44 h-44 sm:w-52 sm:h-52">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="10"
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke={config.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display-lg text-[36px] sm:text-[42px] font-extrabold" style={{ color: config.color }}>
            {score}
          </span>
          <span className="font-label-sm text-[12px] text-on-surface-variant/60 -mt-1">
            out of 100
          </span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-md text-[13px] font-semibold"
          style={{ backgroundColor: config.bgColor, color: config.color }}
        >
          <span className="material-symbols-outlined text-[16px]">
            {status === "good" ? "check_circle" : status === "needs_attention" ? "warning" : "error"}
          </span>
          {label}
        </span>
      </div>
    </div>
  );
}
