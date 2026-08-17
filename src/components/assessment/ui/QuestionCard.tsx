"use client";

import { ReactNode } from "react";

interface QuestionCardProps {
  questionNumber?: number;
  totalQuestions?: number;
  title: string;
  helperText?: string;
  isRequired?: boolean;
  error?: string;
  children: ReactNode;
}

export default function QuestionCard({
  questionNumber,
  totalQuestions,
  title,
  helperText,
  isRequired = true,
  error,
  children,
}: QuestionCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-outline-variant/30 p-5 sm:p-6 shadow-sm">
      <div className="mb-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-headline-md text-[16px] sm:text-[18px] font-semibold text-on-background leading-tight">
            {title}
            {isRequired && <span className="text-error ml-1">*</span>}
          </h3>
          {questionNumber && totalQuestions && (
            <span className="font-label-sm text-[11px] text-on-surface-variant/50 flex-shrink-0">
              {questionNumber}/{totalQuestions}
            </span>
          )}
        </div>
        {helperText && (
          <p className="font-body-md text-[13px] text-on-surface-variant/70 mt-1">
            {helperText}
          </p>
        )}
      </div>
      {children}
      {error && (
        <p className="mt-2 font-label-sm text-[12px] text-error flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
    </div>
  );
}
