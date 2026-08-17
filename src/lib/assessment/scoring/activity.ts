import { ScoreResult } from "../types";
import { createScoreResult } from "../scoring-engine";

export function calculateActivityScore(responses: Record<string, unknown>): ScoreResult {
  let points = 0;
  let maxPoints = 0;
  const strengths: string[] = [];
  const concerns: string[] = [];
  const recommendations: string[] = [];

  // Exercise days (0-30)
  maxPoints += 30;
  const exercise = responses.exercise_days as string;
  if (exercise?.includes("5-7")) { points += 30; strengths.push("Excellent exercise frequency"); }
  else if (exercise?.includes("3-4")) { points += 22; strengths.push("Good exercise frequency"); }
  else if (exercise?.includes("1-2")) { points += 12; concerns.push("Low exercise frequency"); recommendations.push("Aim for at least 3-4 days of exercise per week"); }
  else { points += 4; concerns.push("Very low physical activity"); recommendations.push("Start with 15-30 minutes of walking daily"); }

  // Steps (0-25)
  maxPoints += 25;
  const steps = responses.steps_per_day as string;
  if (steps?.includes("More than 8,000")) { points += 25; strengths.push("High daily step count"); }
  else if (steps?.includes("5,000-8,000")) { points += 18; strengths.push("Moderate daily steps"); }
  else if (steps?.includes("3,000-5,000")) { points += 10; concerns.push("Low daily step count"); }
  else { points += 4; concerns.push("Very low daily movement"); recommendations.push("Try to increase daily walking gradually"); }

  // Sitting (0-25)
  maxPoints += 25;
  const sitting = responses.sitting_hours as string;
  if (sitting?.includes("I break sitting")) { points += 25; strengths.push("Takes regular sitting breaks"); }
  else if (sitting?.includes("1-2 hours")) { points += 18; }
  else if (sitting?.includes("2-4 hours")) { points += 10; concerns.push("Long sitting periods"); recommendations.push("Take breaks every 30-60 minutes"); }
  else { points += 4; concerns.push("Extended sitting periods"); recommendations.push("Set reminders to move every hour"); }

  // Sleep quality (0-20)
  maxPoints += 20;
  const sleep = responses.sleep_quality as string;
  if (sleep === "Very good" || sleep === "Good") { points += 20; strengths.push("Good sleep quality"); }
  else if (sleep === "Fair") { points += 12; }
  else { points += 5; concerns.push("Poor sleep affects recovery and energy"); }

  const score = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 50;
  return createScoreResult(score, strengths, concerns, recommendations);
}
