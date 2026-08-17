import { ScoreResult } from "../types";
import { createScoreResult } from "../scoring-engine";

export function calculateBrainScore(responses: Record<string, unknown>): ScoreResult {
  let points = 0;
  let maxPoints = 0;
  const strengths: string[] = [];
  const concerns: string[] = [];
  const recommendations: string[] = [];

  // Immediate memory (0-3)
  maxPoints += 3;
  const memory = responses.immediate_memory as string;
  if (memory === "3") { points += 3; strengths.push("Good immediate memory"); }
  else if (memory === "2") { points += 2; }
  else if (memory === "1") { points += 1; }
  else { points += 0; }

  // Delayed recall (0-3)
  maxPoints += 3;
  const recall = responses.delayed_recall as string;
  if (recall === "3") { points += 3; strengths.push("Good delayed recall"); }
  else if (recall === "2") { points += 2; }
  else if (recall === "1") { points += 1; }
  else { points += 0; }

  // Attention (0-3)
  maxPoints += 3;
  const attention = responses.attention_subtract as string;
  if (attention?.includes("correctly")) { points += 3; strengths.push("Good attention and concentration"); }
  else if (attention?.includes("1-2 errors")) { points += 2; }
  else if (attention?.includes("several errors")) { points += 1; }
  else { points += 0; }

  // Working memory (0-3)
  maxPoints += 3;
  const working = responses.working_memory as string;
  if (working?.includes("correctly")) { points += 3; strengths.push("Good working memory"); }
  else if (working?.includes("Forward and backward")) { points += 2; }
  else if (working?.includes("Forward only")) { points += 1; }
  else { points += 0; }

  // Mental activity (0-3)
  maxPoints += 3;
  const activity = responses.mental_activity as string;
  if (activity?.includes("5 or more")) { points += 3; strengths.push("Regular mental stimulation"); }
  else if (activity?.includes("3-4")) { points += 2; }
  else if (activity?.includes("1-2")) { points += 1; }
  else { points += 0; recommendations.push("Engage in regular mentally stimulating activities"); }

  // Sleep quality (0-3)
  maxPoints += 3;
  const sleep = responses.sleep_quality as string;
  if (sleep === "Excellent") { points += 3; strengths.push("Excellent sleep supports brain health"); }
  else if (sleep === "Good") { points += 2; }
  else if (sleep === "Fair") { points += 1; }
  else { points += 0; concerns.push("Poor sleep affects cognitive function"); }

  // Mental fatigue (0-3)
  maxPoints += 3;
  const fatigue = responses.mental_fatigue as string;
  if (fatigue === "Rarely") { points += 3; strengths.push("Rarely feels mentally fatigued"); }
  else if (fatigue === "Occasionally") { points += 2; }
  else if (fatigue === "Frequently") { points += 1; }
  else { points += 0; concerns.push("Frequent mental fatigue"); recommendations.push("Ensure adequate sleep and take mental breaks"); }

  const score = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 50;
  return createScoreResult(score, strengths, concerns, recommendations);
}
