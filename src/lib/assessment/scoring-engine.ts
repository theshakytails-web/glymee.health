import { ScoreResult, ScoreStatus } from "./types";
import { SCORE_THRESHOLDS, STATUS_LABELS, STATUS_COLORS } from "./constants";

export function getStatus(score: number): ScoreStatus {
  if (score >= SCORE_THRESHOLDS.good) return "good";
  if (score >= SCORE_THRESHOLDS.needsAttention) return "needs_attention";
  return "higher_risk";
}

export function createScoreResult(
  score: number,
  strengths: string[] = [],
  concerns: string[] = [],
  recommendations: string[] = []
): ScoreResult {
  const status = getStatus(score);
  return {
    score: Math.round(score),
    status,
    label: STATUS_LABELS[status],
    color: STATUS_COLORS[status],
    strengths,
    concerns,
    recommendations,
  };
}

export function calculateWeightedOverall(
  categories: Record<string, ScoreResult>,
  weights: Record<string, number>
): ScoreResult {
  let totalWeight = 0;
  let weightedSum = 0;
  const allStrengths: string[] = [];
  const allConcerns: string[] = [];
  const allRecommendations: string[] = [];

  for (const [key, weight] of Object.entries(weights)) {
    if (categories[key]) {
      weightedSum += categories[key].score * weight;
      totalWeight += weight;
      allStrengths.push(...categories[key].strengths);
      allConcerns.push(...categories[key].concerns);
      allRecommendations.push(...categories[key].recommendations);
    }
  }

  const overallScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

  return createScoreResult(
    overallScore,
    [...new Set(allStrengths)].slice(0, 5),
    [...new Set(allConcerns)].slice(0, 5),
    [...new Set(allRecommendations)].slice(0, 4)
  );
}
