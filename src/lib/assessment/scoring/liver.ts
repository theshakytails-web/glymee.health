import { ScoreResult } from "../types";
import { createScoreResult } from "../scoring-engine";

export function calculateLiverScore(responses: Record<string, unknown>): ScoreResult {
  let points = 0;
  let maxPoints = 0;
  const strengths: string[] = [];
  const concerns: string[] = [];
  const recommendations: string[] = [];

  // Liver disease (0-25)
  maxPoints += 25;
  const liver = responses.liver_disease as string;
  if (liver === "No") { points += 25; strengths.push("No liver disease diagnosis"); }
  else if (liver === "Not sure") { points += 12; recommendations.push("Consider a liver function test"); }
  else { points += 5; concerns.push("Previous liver disease diagnosis"); recommendations.push("Regular monitoring recommended"); }

  // Alcohol (0-25)
  maxPoints += 25;
  const alcohol = responses.alcohol_use as string;
  if (alcohol?.includes("Never")) { points += 25; strengths.push("Non-drinker"); }
  else if (alcohol?.includes("Occasionally")) { points += 18; }
  else if (alcohol?.includes("Regularly")) { points += 8; concerns.push("Regular alcohol consumption affects liver health"); recommendations.push("Consider reducing alcohol intake"); }
  else { points += 3; concerns.push("Frequent alcohol consumption"); recommendations.push("Alcohol is a major risk factor for liver disease"); }

  // Hepatitis (0-15)
  maxPoints += 15;
  const hep = responses.hepatitis as string;
  if (hep === "No") { points += 15; }
  else if (hep === "Not sure") { points += 8; }
  else { points += 3; concerns.push("Hepatitis history"); }

  // Diabetes (0-15)
  maxPoints += 15;
  const diabetes = responses.diabetes as string;
  if (diabetes === "No") { points += 15; }
  else { points += 6; concerns.push("Diabetes is a risk factor for fatty liver"); }

  // Exercise (0-10)
  maxPoints += 10;
  const exercise = responses.exercise_days as string;
  if (exercise?.includes("5-7")) { points += 10; strengths.push("Regular exercise supports liver health"); }
  else if (exercise?.includes("3-4")) { points += 7; }
  else { points += 3; }

  // Fried food (0-10)
  maxPoints += 10;
  const fried = responses.fried_processed as string;
  if (fried?.includes("Rarely")) { points += 10; strengths.push("Low processed food intake"); }
  else if (fried?.includes("1-3")) { points += 7; }
  else { points += 3; concerns.push("High processed food intake may affect liver"); }

  const score = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 50;
  return createScoreResult(score, strengths, concerns, recommendations);
}
