"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Share2, ExternalLink, CheckCircle2, AlertTriangle, Activity, Heart, Brain, Moon, Dumbbell, Utensils, Weight, Shield, Users, Leaf, SmilePlus, Stethoscope, FlaskConical } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ASSESSMENT_CONFIGS } from "@/lib/assessment/types";
import LabValuesUpload from "@/components/assessment/LabValuesUpload";

interface AssessmentResult {
  overallScore: number;
  overallStatus: "excellent" | "good" | "needs_attention" | "concerning";
  overallLabel: string;
  categories: Record<string, {
    score: number;
    status: "excellent" | "good" | "needs_attention" | "concerning";
    label: string;
    color: string;
    strengths: string[];
    concerns: string[];
    recommendations: string[];
  }>;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  assessmentName: string;
}

const statusColors: Record<string, string> = {
  excellent: "bg-emerald-500",
  good: "bg-amber-500",
  needs_attention: "bg-amber-500",
  concerning: "bg-rose-500",
};

const statusBadgeColors: Record<string, string> = {
  excellent: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  good: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  needs_attention: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  concerning: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  metabolic: Activity,
  heart: Heart,
  nutrition: Utensils,
  activity: Dumbbell,
  sleep: Moon,
  mental: Brain,
  liver: Shield,
  weight: Weight,
  lifestyle: Leaf,
  fitness: Dumbbell,
  brain: Brain,
  chronotype: Clock,
};

export default function SpecificResultPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = use(params);
  const config = ASSESSMENT_CONFIGS[type];
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLabValues, setShowLabValues] = useState(false);
  const [labValuesSaved, setLabValuesSaved] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(`assessment-result-${id}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setResult(parsed);
        sessionStorage.removeItem(`assessment-result-${id}`);
      } catch (e) {
        setError("Failed to load results");
      }
    } else {
      setError("Results not found. Please retake the assessment.");
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="font-body-md text-on-surface-variant">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !result || !config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <Stethoscope className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="font-headline-md text-[24px] font-semibold text-on-background mb-2">
            Results not available
          </h1>
          <p className="font-body-md text-on-surface-variant mb-6">
            {error || "Please retake the assessment to see your results."}
          </p>
          <Link href="/assess">
            <Button className="bg-primary text-on-primary hover:bg-primary/90">
              Go to Assessments
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const categoryEntries = Object.entries(result.categories);
  const Icon = categoryIcons[type] || Activity;

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 border-b border-outline-variant/20">
        <div className="max-w-4xl mx-auto h-full flex items-center justify-between px-4">
          <Link href="/assess" className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-label-md hidden sm:inline">Back</span>
          </Link>
          <h1 className="font-headline-sm text-[16px] font-semibold text-on-background truncate max-w-[200px] sm:max-w-none">
            {result.assessmentName} Results
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-on-surface-variant hover:text-on-surface">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero Score Card */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Icon className="h-6 w-6 text-primary" />
              <h2 className="font-headline-lg text-[28px] font-bold text-on-background">
                Your {config.name} Score
              </h2>
            </div>
            
            <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-8 text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center">
                    <span className="font-headline-lg text-[48px] font-bold text-primary">
                      {result.overallScore}
                    </span>
                  </div>
                  <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full ${statusColors[result.overallStatus]}`} />
                </div>
                
                <h3 className="font-headline-md text-[24px] font-semibold text-on-background mb-2">
                  {result.overallLabel}
                </h3>
                <Badge variant="outline" className={`${statusBadgeColors[result.overallStatus]} border font-label-sm`}>
                  {result.overallStatus.replace("_", " ")}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Strengths */}
          {result.strengths.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <h3 className="font-headline-sm text-[18px] font-semibold text-on-background">
                  Your Strengths
                </h3>
              </div>
              <div className="space-y-3">
                {result.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                    <p className="font-body-md text-on-surface">{strength}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Concerns */}
          {result.concerns.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="font-headline-sm text-[18px] font-semibold text-on-background">
                  Areas to Watch
                </h3>
              </div>
              <div className="space-y-3">
                {result.concerns.map((concern, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                    <p className="font-body-md text-on-surface">{concern}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Breakdown */}
          {categoryEntries.length > 0 && (
            <div className="mb-8">
              <h3 className="font-headline-sm text-[18px] font-semibold text-on-background mb-4">
                Detailed Breakdown
              </h3>
              <div className="space-y-4">
                {categoryEntries.map(([key, category]) => (
                  <Card key={key} className="border-0 shadow-lg">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-headline-sm text-[16px] font-semibold">
                          {category.label}
                        </CardTitle>
                        <Badge variant="outline" className={`${statusBadgeColors[category.status]} border font-label-sm`}>
                          {category.score}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Progress value={category.score} className="h-2 mb-3" />
                      
                      {category.strengths.length > 0 && (
                        <div className="mb-3">
                          <h4 className="font-label-sm text-[12px] font-medium text-emerald-600 mb-1">Strengths</h4>
                          <ul className="space-y-1">
                            {category.strengths.map((s, i) => (
                              <li key={i} className="flex items-start gap-2 text-[13px] text-on-surface-variant">
                                <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {category.concerns.length > 0 && (
                        <div>
                          <h4 className="font-label-sm text-[12px] font-medium text-amber-600 mb-1">Concerns</h4>
                          <ul className="space-y-1">
                            {category.concerns.map((c, i) => (
                              <li key={i} className="flex items-start gap-2 text-[13px] text-on-surface-variant">
                                <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          {result.recommendations.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <ExternalLink className="h-5 w-5 text-primary" />
                <h3 className="font-headline-sm text-[18px] font-semibold text-on-background">
                  Recommended Next Steps
                </h3>
              </div>
              <div className="space-y-3">
                {result.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <span className="font-headline-sm text-[14px] font-bold text-primary">{index + 1}</span>
                    <p className="font-body-md text-on-surface">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lab Values CTA */}
          {!labValuesSaved && ["blood_sugar", "heart", "liver", "weight", "full"].includes(type) && (
            <div className="mb-8">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <FlaskConical className="h-5 w-5 text-primary" />
                  <h3 className="font-headline-sm text-[18px] font-semibold text-on-background">
                    Improve Accuracy with Lab Values
                  </h3>
                </div>
                <p className="font-body-md text-on-surface-variant mb-4">
                  Have recent blood reports? Adding lab values like HbA1c, cholesterol, or blood pressure can provide more precise insights.
                </p>
                {showLabValues ? (
                  <LabValuesUpload
                    assessmentType={type}
                    onComplete={(values) => {
                      console.log("Lab values saved:", values);
                      setLabValuesSaved(true);
                      setShowLabValues(false);
                    }}
                    onSkip={() => setShowLabValues(false)}
                  />
                ) : (
                  <button
                    onClick={() => setShowLabValues(true)}
                    className="bg-primary text-on-primary px-6 py-3 rounded-lg font-label-lg hover:opacity-90 transition-opacity"
                  >
                    Add Lab Values
                  </button>
                )}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="text-center">
            <p className="font-body-md text-on-surface-variant mb-4">
              Want to explore other assessments?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/assess">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                  All Assessments
                </Button>
              </Link>
              <Link href="/assess/full">
                <Button className="bg-primary text-on-primary hover:bg-primary/90">
                  Try Full Assessment
                </Button>
              </Link>
            </div>
          </div>

          {/* Medical Disclaimer */}
          <div className="mt-8 p-4 rounded-xl bg-surface border border-outline-variant/20">
            <p className="font-body-xs text-on-surface-variant text-center">
              This assessment is for educational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for personal health decisions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
