import { ScoreResult } from "../types";
import { createScoreResult } from "../scoring-engine";

export function calculateMentalScore(responses: Record<string, unknown>): ScoreResult {
  let points = 0;
  let maxPoints = 0;
  const strengths: string[] = [];
  const concerns: string[] = [];
  const recommendations: string[] = [];

  // Stress (0-25)
  maxPoints += 25;
  const stress = responses.stress_level as string;
  if (stress === "low") { points += 25; strengths.push("Low stress level"); }
  else if (stress === "moderate") { points += 18; }
  else if (stress === "high") { points += 8; concerns.push("High stress level"); recommendations.push("Consider stress management techniques"); }
  else { points += 3; concerns.push("Very high stress"); recommendations.push("Please consider speaking with a mental health professional"); }

  // Sleep quality (0-25)
  maxPoints += 25;
  const sleep = responses.sleep_quality as string;
  if (sleep === "Very good" || sleep === "Good") { points += 25; strengths.push("Good sleep supports mental wellbeing"); }
  else if (sleep === "Fair") { points += 15; }
  else { points += 5; concerns.push("Poor sleep affects mental wellbeing"); }

  // Exercise (0-20)
  maxPoints += 20;
  const exercise = responses.exercise_days as string;
  if (exercise?.includes("5-7")) { points += 20; strengths.push("Regular exercise supports mental health"); }
  else if (exercise?.includes("3-4")) { points += 15; }
  else if (exercise?.includes("1-2")) { points += 8; }
  else { points += 3; recommendations.push("Physical activity can significantly improve mood"); }

  // Social connection (0-15) - only scored if collected
  const social = responses.social_connection as string;
  if (social) {
    maxPoints += 15;
    if (social?.includes("Most days")) { points += 15; strengths.push("Strong social connection"); }
    else if (social?.includes("few times")) { points += 10; }
    else if (social?.includes("Once a week")) { points += 6; }
    else { points += 2; concerns.push("Limited social connection"); recommendations.push("Try to connect with friends or family regularly"); }
  }

  // Work pressure (0-15) - only scored if collected
  const work = responses.work_pressure as string;
  if (work) {
    maxPoints += 15;
    if (work === "Low") { points += 15; }
    else if (work === "Moderate") { points += 11; }
    else if (work === "High") { points += 6; concerns.push("High work/life pressure"); }
    else { points += 2; concerns.push("Very high work pressure"); }
  }

  const score = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 50;
  return createScoreResult(score, strengths, concerns, recommendations);
}
