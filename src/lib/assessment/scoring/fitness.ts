import { ScoreResult } from "../types";
import { createScoreResult } from "../scoring-engine";

export function calculateFitnessScore(responses: Record<string, unknown>): ScoreResult {
  let points = 0;
  let maxPoints = 0;
  const strengths: string[] = [];
  const concerns: string[] = [];
  const recommendations: string[] = [];

  // Exercise days (0-3)
  maxPoints += 3;
  const exercise = responses.exercise_days as string;
  if (exercise?.includes("5-7")) { points += 3; strengths.push("Exercises 5+ days/week"); }
  else if (exercise?.includes("3-4")) { points += 2; strengths.push("Exercises 3-4 days/week"); }
  else if (exercise?.includes("1-2")) { points += 1; }
  else { points += 0; concerns.push("No regular exercise"); }

  // Steps (0-3)
  maxPoints += 3;
  const steps = responses.steps_per_day as string;
  if (steps?.includes("More than 8,000")) { points += 3; strengths.push("High daily steps"); }
  else if (steps?.includes("5,000-8,000")) { points += 2; }
  else if (steps?.includes("3,000-5,000")) { points += 1; }
  else { points += 0; concerns.push("Low daily steps"); }

  // Sitting (0-3)
  maxPoints += 3;
  const sitting = responses.sitting_hours as string;
  if (sitting?.includes("I break sitting")) { points += 3; strengths.push("Takes sitting breaks"); }
  else if (sitting?.includes("1-2")) { points += 2; }
  else if (sitting?.includes("2-4")) { points += 1; }
  else { points += 0; concerns.push("Prolonged sitting"); }

  // Walk 30 min (0-2)
  maxPoints += 2;
  const walk = responses.walk_30min as string;
  if (walk === "Yes") { points += 2; strengths.push("Can walk 30 minutes continuously"); }
  else if (walk === "With difficulty") { points += 1; concerns.push("Walking 30 min is difficult"); }
  else { points += 0; concerns.push("Cannot walk 30 minutes"); recommendations.push("Consult a doctor before starting exercise"); }

  // Strength training (0-3)
  maxPoints += 3;
  const strength = responses.strength_training as string;
  if (strength?.includes("3 or more")) { points += 3; strengths.push("Regular strength training"); }
  else if (strength?.includes("1-2")) { points += 2; strengths.push("Some strength training"); }
  else if (strength?.includes("Less than")) { points += 1; }
  else { points += 0; recommendations.push("Add strength training 2-3 times per week"); }

  // Energy level (0-3)
  maxPoints += 3;
  const energy = responses.energy_level as string;
  if (energy === "Excellent") { points += 3; strengths.push("Excellent physical energy"); }
  else if (energy === "Good") { points += 2; strengths.push("Good physical energy"); }
  else if (energy === "Low") { points += 1; }
  else { points += 0; concerns.push("Low physical energy"); }

  // Convert to 100 scale (max 17 points)
  const score = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 50;
  return createScoreResult(score, strengths, concerns, recommendations);
}
