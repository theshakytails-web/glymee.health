import { ScoreResult } from "../types";
import { createScoreResult } from "../scoring-engine";

export function calculateSleepScore(responses: Record<string, unknown>): ScoreResult {
  let points = 0;
  let maxPoints = 0;
  const strengths: string[] = [];
  const concerns: string[] = [];
  const recommendations: string[] = [];

  // Duration (0-30)
  maxPoints += 30;
  const duration = responses.sleep_duration as string;
  if (duration?.includes("7-8")) { points += 30; strengths.push("Optimal sleep duration"); }
  else if (duration?.includes("6-7")) { points += 22; strengths.push("Adequate sleep duration"); }
  else if (duration?.includes("More than 8")) { points += 18; }
  else if (duration?.includes("5-6")) { points += 10; concerns.push("Insufficient sleep"); recommendations.push("Aim for 7-8 hours of sleep"); }
  else { points += 4; concerns.push("Very insufficient sleep"); recommendations.push("Sleep deprivation significantly affects health"); }

  // Quality (0-30)
  maxPoints += 30;
  const quality = responses.sleep_quality as string;
  if (quality === "Very good") { points += 30; strengths.push("Excellent sleep quality"); }
  else if (quality === "Good") { points += 24; strengths.push("Good sleep quality"); }
  else if (quality === "Fair") { points += 15; }
  else if (quality === "Poor") { points += 8; concerns.push("Poor sleep quality"); recommendations.push("Consider sleep hygiene improvements"); }
  else { points += 4; concerns.push("Very poor sleep quality"); recommendations.push("Consult a healthcare professional about sleep issues"); }

  // Difficulty falling asleep (0-20)
  maxPoints += 20;
  const difficulty = responses.sleep_difficulty as string;
  if (difficulty === "no") { points += 20; strengths.push("Falls asleep easily"); }
  else if (difficulty === "yes") { points += 8; concerns.push("Difficulty falling asleep"); recommendations.push("Try a consistent bedtime routine"); }
  else { points += 12; }

  // Frequent waking (0-20)
  maxPoints += 20;
  const waking = responses.sleep_waking as string;
  if (waking === "no") { points += 20; strengths.push("Sleeps through the night"); }
  else if (waking === "yes") { points += 8; concerns.push("Frequent nighttime waking"); }
  else { points += 12; }

  const score = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 50;
  return createScoreResult(score, strengths, concerns, recommendations);
}
