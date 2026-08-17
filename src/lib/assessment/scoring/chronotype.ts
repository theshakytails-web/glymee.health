import { ScoreResult } from "../types";
import { createScoreResult } from "../scoring-engine";

export function calculateChronotypeScore(responses: Record<string, unknown>): ScoreResult {
  const chronotype = determineChronotype(responses);
  const strengths: string[] = [];
  const recommendations: string[] = [];

  switch (chronotype) {
    case "lion":
      strengths.push("Morning-type — naturally productive early");
      recommendations.push("Schedule important tasks in the morning");
      recommendations.push("Avoid forcing a late schedule");
      break;
    case "bear":
      strengths.push("Daytime-type — follows a conventional schedule");
      recommendations.push("Maintain a consistent sleep-wake schedule");
      recommendations.push("Optimise meal and exercise timing based on your response");
      break;
    case "wolf":
      strengths.push("Evening-type — creative and productive later in the day");
      recommendations.push("Don't force an excessively early schedule");
      recommendations.push("Reduce late-night eating and screen exposure");
      recommendations.push("Schedule exercise at a sustainable time");
      break;
    case "dolphin":
      strengths.push("Unique sleep pattern — may benefit from routine optimisation");
      recommendations.push("Focus on sleep regularity");
      recommendations.push("Create a calming bedtime routine");
      recommendations.push("Consider consulting a sleep specialist if issues persist");
      break;
  }

  return createScoreResult(75, strengths, [], recommendations);
}

function determineChronotype(responses: Record<string, unknown>): string {
  let lionScore = 0;
  let bearScore = 0;
  let wolfScore = 0;
  let dolphinScore = 0;

  // Q1: Natural wake time
  const q1 = responses.q1_natural_wake as string;
  if (q1?.includes("Before 6")) lionScore += 3;
  else if (q1?.includes("6:00–7:00")) { lionScore += 2; bearScore += 1; }
  else if (q1?.includes("7:00–8:30")) bearScore += 2;
  else wolfScore += 3;

  // Q2: Natural sleep time
  const q2 = responses.q2_natural_sleep as string;
  if (q2?.includes("Before 9:30")) lionScore += 3;
  else if (q2?.includes("9:30–10:30")) bearScore += 3;
  else if (q2?.includes("10:30")) wolfScore += 2;
  else wolfScore += 3;

  // Q3: Sharpest time
  const q3 = responses.q3_sharpest as string;
  if (q3?.includes("5–9 AM")) lionScore += 3;
  else if (q3?.includes("9 AM–12 PM")) bearScore += 3;
  else if (q3?.includes("12–5 PM")) wolfScore += 2;
  else wolfScore += 3;

  // Q4: Exercise
  const q4 = responses.q4_exercise_easiest as string;
  if (q4?.includes("Early morning")) lionScore += 2;
  else if (q4?.includes("Late morning")) bearScore += 2;
  else if (q4?.includes("Afternoon")) wolfScore += 2;
  else wolfScore += 3;

  // Q5: Exam time
  const q5 = responses.q5_exam_time as string;
  if (q5?.includes("7–9")) lionScore += 3;
  else if (q5?.includes("9–11")) bearScore += 3;
  else if (q5?.includes("12–3")) { bearScore += 1; wolfScore += 1; }
  else wolfScore += 3;

  // Q6: After waking
  const q6 = responses.q6_after_waking as string;
  if (q6?.includes("Immediately")) lionScore += 3;
  else if (q6?.includes("Fairly alert")) bearScore += 3;
  else if (q6?.includes("little sleepy")) wolfScore += 2;
  else { dolphinScore += 2; wolfScore += 1; }

  // Q7: Energy dip
  const q7 = responses.q7_energy_dip as string;
  if (q7?.includes("Before noon")) dolphinScore += 2;
  else if (q7?.includes("12–2")) bearScore += 2;
  else if (q7?.includes("2–5")) wolfScore += 2;
  else lionScore += 2;

  // Q8: Stay up late
  const q8 = responses.q8_stay_up_late as string;
  if (q8?.includes("still wake early")) lionScore += 3;
  else if (q8?.includes("Slightly")) bearScore += 2;
  else if (q8?.includes("Very difficult")) { bearScore += 1; dolphinScore += 1; }
  else wolfScore += 3;

  // Q9: Free day morning
  const q9 = responses.q9_free_day_morning as string;
  if (q9?.includes("Wake early")) lionScore += 3;
  else if (q9?.includes("moderately early")) bearScore += 3;
  else if (q9?.includes("Sleep in")) wolfScore += 2;
  else wolfScore += 3;

  // Q10: Social energy
  const q10 = responses.q10_social_energy as string;
  if (q10?.includes("Morning")) lionScore += 3;
  else if (q10?.includes("Late morning")) bearScore += 2;
  else if (q10?.includes("Evening")) wolfScore += 2;
  else wolfScore += 3;

  // Q11: Study timing
  const q11 = responses.q11_study_timing as string;
  if (q11?.includes("6–8")) lionScore += 3;
  else if (q11?.includes("9–11")) bearScore += 3;
  else if (q11?.includes("2–4")) wolfScore += 2;
  else wolfScore += 3;

  // Q12: Best statement
  const q12 = responses.q12_best_statement as string;
  if (q12?.includes("early mornings")) lionScore += 3;
  else if (q12?.includes("almost any")) bearScore += 3;
  else if (q12?.includes("need some time")) wolfScore += 2;
  else wolfScore += 3;

  const scores = { lion: lionScore, bear: bearScore, wolf: wolfScore, dolphin: dolphinScore };
  return Object.entries(scores).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
}
