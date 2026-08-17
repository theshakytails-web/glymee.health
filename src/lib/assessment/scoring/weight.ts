import { ScoreResult } from "../types";
import { createScoreResult } from "../scoring-engine";

export function calculateWeightScore(
  responses: Record<string, unknown>,
  profile: { age: number; gender: string; bmi: number }
): ScoreResult {
  let points = 0;
  let maxPoints = 0;
  const strengths: string[] = [];
  const concerns: string[] = [];
  const recommendations: string[] = [];

  // BMI (0-25)
  maxPoints += 25;
  if (profile.bmi > 0) {
    if (profile.bmi >= 18.5 && profile.bmi <= 24.9) {
      points += 25; strengths.push("BMI in healthy range");
    } else if (profile.bmi >= 25 && profile.bmi <= 29.9) {
      points += 15; concerns.push("BMI indicates overweight");
      recommendations.push("A modest weight reduction of 5-10% can significantly improve metabolic health");
    } else if (profile.bmi >= 30) {
      points += 8; concerns.push("BMI indicates obesity");
      recommendations.push("Consult a healthcare professional for a personalised weight management plan");
    } else {
      points += 12; concerns.push("BMI indicates underweight");
    }
  }

  // Weight change (0-15)
  maxPoints += 15;
  const change = responses.weight_change as string;
  if (change?.includes("Stable")) { points += 15; strengths.push("Stable weight"); }
  else if (change?.includes("Lost 5-10")) { points += 12; }
  else if (change?.includes("Lost more")) { points += 8; }
  else if (change?.includes("Gained 5-10")) { points += 8; concerns.push("Recent weight gain"); }
  else { points += 4; concerns.push("Significant weight gain"); }

  // Diabetes (0-20)
  maxPoints += 20;
  const diabetes = responses.diabetes as string;
  if (diabetes === "No") { points += 20; strengths.push("No diabetes"); }
  else if (diabetes?.includes("prediabetes")) { points += 10; concerns.push("Prediabetes affects metabolic health"); }
  else { points += 5; concerns.push("Diabetes management important"); }

  // BP (0-15)
  maxPoints += 15;
  const bp = responses.bp_history as string;
  if (bp === "No") { points += 15; strengths.push("Normal blood pressure"); }
  else { points += 6; concerns.push("High blood pressure"); }

  // Exercise (0-15)
  maxPoints += 15;
  const exercise = responses.exercise_days as string;
  if (exercise?.includes("5-7")) { points += 15; strengths.push("Regular exercise"); }
  else if (exercise?.includes("3-4")) { points += 11; }
  else if (exercise?.includes("1-2")) { points += 6; }
  else { points += 2; recommendations.push("Increase physical activity for weight management"); }

  // Sleep (0-10)
  maxPoints += 10;
  const sleep = responses.sleep_quality as string;
  if (sleep === "Very good" || sleep === "Good") { points += 10; strengths.push("Good sleep"); }
  else if (sleep === "Fair") { points += 6; }
  else { points += 2; }

  const score = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 50;
  return createScoreResult(score, strengths, concerns, recommendations);
}
