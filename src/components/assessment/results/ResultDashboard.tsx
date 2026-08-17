"use client";

import { ScoreResult } from "@/lib/assessment/types";
import { CATEGORY_LABELS } from "@/lib/assessment/constants";
import HealthGauge from "./HealthGauge";
import ScoreCard from "./ScoreCard";
import StrengthsList from "./StrengthsList";
import ConcernsList from "./ConcernsList";
import NextSteps from "./NextSteps";
import Disclaimer from "./Disclaimer";
import Link from "next/link";

interface ResultDashboardProps {
  assessmentName: string;
  overallScore: number;
  overallStatus: "good" | "needs_attention" | "higher_risk";
  overallLabel: string;
  categories: Record<string, ScoreResult>;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
}

export default function ResultDashboard({
  assessmentName,
  overallScore,
  overallStatus,
  overallLabel,
  categories,
  strengths,
  concerns,
  recommendations,
}: ResultDashboardProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/assess"
            className="font-label-md text-[14px] text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            New Assessment
          </Link>
          <Link href="/" className="font-label-md text-[14px] text-on-surface-variant hover:text-primary transition-colors">
            Home
          </Link>
        </div>
      </header>

      <main className="max-w-[640px] mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-display-lg text-[24px] sm:text-[28px] md:text-[32px] font-extrabold text-on-background mb-2">
            Your Glymee Health Snapshot
          </h1>
          <p className="font-body-md text-[14px] text-on-surface-variant">
            {assessmentName}
          </p>
        </div>

        {/* Overall Score */}
        <div className="flex justify-center mb-10">
          <HealthGauge score={overallScore} status={overallStatus} label={overallLabel} />
        </div>

        {/* Category Scores */}
        {Object.keys(categories).length > 0 && (
          <div className="mb-8">
            <h2 className="font-headline-md text-[18px] font-semibold text-on-background mb-4">
              Category Breakdown
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(categories).map(([key, result]) => (
                <ScoreCard key={key} category={key} result={result} />
              ))}
            </div>
          </div>
        )}

        {/* Strengths */}
        <div className="mb-6">
          <StrengthsList items={strengths} />
        </div>

        {/* Concerns */}
        <div className="mb-6">
          <ConcernsList items={concerns} />
        </div>

        {/* Next Steps */}
        <div className="mb-8">
          <NextSteps items={recommendations} />
        </div>

        {/* Disclaimer */}
        <Disclaimer />

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/assess"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-on-primary font-headline-md text-[16px] font-semibold hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">refresh</span>
            Take Another Assessment
          </Link>
        </div>
      </main>
    </div>
  );
}
