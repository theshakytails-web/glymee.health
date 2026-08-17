import { ScoreResult } from "../types";
import { createScoreResult } from "../scoring-engine";

export function calculateHeartScore(
  responses: Record<string, unknown>,
  profile: { age: number; gender: string; bmi: number }
): ScoreResult {
  let points = 0;
  let maxPoints = 0;
  const strengths: string[] = [];
  const concerns: string[] = [];
  const recommendations: string[] = [];

  // Age (0-15)
  maxPoints += 15;
  if (profile.age < 40) points += 15;
  else if (profile.age < 50) points += 12;
  else if (profile.age < 60) points += 9;
  else points += 5;

  // BP history (0-20)
  maxPoints += 20;
  const bp = responses.bp_history as string;
  if (bp === "No") { points += 20; strengths.push("No high blood pressure"); }
  else if (bp === "Not sure") { points += 10; recommendations.push("Get your blood pressure checked"); }
  else { points += 5; concerns.push("High blood pressure diagnosed"); recommendations.push("Keep BP well controlled with lifestyle and medication"); }

  // Cholesterol (0-15)
  maxPoints += 15;
  const chol = responses.cholesterol_history as string;
  if (chol === "No") { points += 15; strengths.push("No high cholesterol"); }
  else if (chol === "Not sure") { points += 8; recommendations.push("Get a lipid profile test"); }
  else { points += 4; concerns.push("High cholesterol"); recommendations.push("Monitor and manage cholesterol levels"); }

  // Diabetes (0-15)
  maxPoints += 15;
  const diabetes = responses.diabetes as string;
  if (diabetes === "No") { points += 15; strengths.push("No diabetes"); }
  else if (diabetes?.includes("prediabetes")) { points += 8; concerns.push("Prediabetes increases heart risk"); }
  else { points += 5; concerns.push("Diabetes increases cardiovascular risk"); }

  // Tobacco (0-15)
  maxPoints += 15;
  const tobacco = responses.tobacco_use as string;
  if (tobacco === "Never") { points += 15; strengths.push("Non-tobacco user"); }
  else if (tobacco === "Former user") { points += 10; strengths.push("Former tobacco user — good step"); }
  else { points += 3; concerns.push("Current tobacco use significantly increases heart risk"); recommendations.push("Quitting tobacco is one of the best things for heart health"); }

  // Exercise (0-10)
  maxPoints += 10;
  const exercise = responses.exercise_days as string;
  if (exercise?.includes("5-7")) { points += 10; strengths.push("Regular exercise"); }
  else if (exercise?.includes("3-4")) { points += 7; }
  else if (exercise?.includes("1-2")) { points += 4; }
  else { points += 2; concerns.push("Limited physical activity"); recommendations.push("Aim for at least 150 minutes of moderate activity per week"); }

  // Family history (0-10)
  maxPoints += 10;
  const familyHeart = responses.family_heart as string;
  if (familyHeart === "No") { points += 10; }
  else if (familyHeart === "Not sure") { points += 6; }
  else { points += 3; concerns.push("Family history of heart disease"); }

  const score = Math.round((points / maxPoints) * 100);
  return createScoreResult(score, strengths, concerns, recommendations);
}
