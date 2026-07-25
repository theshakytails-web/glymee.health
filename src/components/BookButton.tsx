"use client";

import { useConsultation } from "@/context/ConsultationContext";

interface BookButtonProps {
  variant?: "primary" | "secondary" | "white" | "outline";
  className?: string;
}

export default function BookButton({
  variant = "primary",
  className = "",
}: BookButtonProps) {
  const { open } = useConsultation();

  const baseStyles =
    "font-label-md text-[14px] leading-[20px] tracking-[0.01em] hover:opacity-80 transition-all active:scale-95 cursor-pointer";

  const variantStyles = {
    primary: "bg-primary text-on-primary px-6 py-2 rounded-lg",
    secondary:
      "bg-primary-container text-white px-10 py-4 rounded-lg font-headline-md text-[24px] leading-[32px] font-semibold hover:bg-opacity-90 border border-white/20",
    white: "bg-white text-primary px-10 py-4 rounded-lg font-headline-md text-[24px] leading-[32px] font-semibold hover:bg-surface-container shadow-lg",
    outline:
      "bg-white border border-primary/20 text-primary px-8 py-4 rounded-lg hover:bg-surface-container-low",
  };

  return (
    <button
      onClick={open}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      Book Consultation
    </button>
  );
}
