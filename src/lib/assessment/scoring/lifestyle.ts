import { ScoreResult } from "../types";
import { createScoreResult } from "../scoring-engine";

export function calculateLifestyleScore(responses: Record<string, unknown>): ScoreResult {
  let points = 0;
  let maxPoints = 0;
  const strengths: string[] = [];
  const concerns: string[] = [];
  const recommendations: string[] = [];

  // Tobacco (0-20)
  maxPoints += 20;
  const tobacco = responses.tobacco_use as string;
  if (tobacco === "Never") { points += 20; strengths.push("Non-tobacco user"); }
  else if (tobacco === "Former user") { points += 14; strengths.push("Former tobacco user"); }
  else { points += 4; concerns.push("Current tobacco use"); recommendations.push("Quitting tobacco is the single best thing for health"); }

  // Alcohol (0-15)
  maxPoints += 15;
  const alcohol = responses.alcohol_use as string;
  if (alcohol?.includes("Never")) { points += 15; strengths.push("Non-drinker"); }
  else if (alcohol?.includes("Occasionally")) { points += 11; }
  else { points += 4; concerns.push("Regular alcohol consumption"); }

  // Sleep duration (0-15)
  maxPoints += 15;
  const sleep = responses.sleep_duration as string;
  if (sleep?.includes("7-8")) { points += 15; strengths.push("Optimal sleep duration"); }
  else if (sleep?.includes("6-7")) { points += 11; }
  else if (sleep?.includes("More than 8")) { points += 9; }
  else { points += 4; concerns.push("Insufficient sleep"); }

  // Exercise (0-15)
  maxPoints += 15;
  const exercise = responses.exercise_days as string;
  if (exercise?.includes("5-7")) { points += 15; strengths.push("Regular exercise"); }
  else if (exercise?.includes("3-4")) { points += 11; }
  else if (exercise?.includes("1-2")) { points += 6; }
  else { points += 2; concerns.push("Limited physical activity"); }

  // Stress (0-15)
  maxPoints += 15;
  const stress = responses.stress_level as string;
  if (stress === "low") { points += 15; strengths.push("Low stress"); }
  else if (stress === "moderate") { points += 11; }
  else if (stress === "high") { points += 6; concerns.push("High stress"); }
  else { points += 2; concerns.push("Very high stress"); }

  // Sitting (0-10)
  maxPoints += 10;
  const sitting = responses.sitting_hours as string;
  if (sitting?.includes("I break sitting")) { points += 10; strengths.push("Regular movement breaks"); }
  else if (sitting?.includes("1-2")) { points += 7; }
  else if (sitting?.includes("2-4")) { points += 4; }
  else { points += 2; concerns.push("Prolonged sitting"); }

  // Sugary drinks (0-10)
  maxPoints += 10;
  const drinks = responses.sugary_drinks as string;
  if (drinks?.includes("Rarely")) { points += 10; strengths.push("Low sugary drink intake"); }
  else if (drinks?.includes("1-3")) { points += 7; }
  else { points += 3; concerns.push("Frequent sugary drinks"); }

  const score = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 50;
  return createScoreResult(score, strengths, concerns, recommendations);
}
