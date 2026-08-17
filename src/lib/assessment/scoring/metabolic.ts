import { ScoreResult } from "../types";
import { createScoreResult } from "../scoring-engine";

export function calculateMetabolicScore(
  responses: Record<string, unknown>,
  profile: { age: number; gender: string; bmi: number }
): ScoreResult {
  let points = 0;
  let maxPoints = 0;
  const strengths: string[] = [];
  const concerns: string[] = [];
  const recommendations: string[] = [];

  // BMI factor (0-20 points)
  maxPoints += 20;
  if (profile.bmi > 0) {
    if (profile.bmi >= 18.5 && profile.bmi <= 24.9) {
      points += 20;
      strengths.push("Healthy BMI range");
    } else if (profile.bmi >= 25 && profile.bmi <= 29.9) {
      points += 10;
      concerns.push("BMI indicates overweight range");
      recommendations.push("Consider a personalised weight management plan");
    } else if (profile.bmi >= 30) {
      points += 5;
      concerns.push("BMI indicates obesity range");
      recommendations.push("Consult a healthcare professional for weight assessment");
    } else {
      points += 10;
      concerns.push("BMI indicates underweight range");
    }
  }

  // Medical conditions (0-25 points)
  maxPoints += 25;
  const conditions = (responses.medical_conditions as string[]) || [];
  const hasDiabetes = conditions.includes("Diabetes");
  const hasPrediabetes = conditions.includes("Prediabetes");
  const hasBP = conditions.includes("High blood pressure");

  if (!hasDiabetes && !hasPrediabetes) {
    points += 15;
    strengths.push("No diabetes or prediabetes diagnosis");
  } else if (hasPrediabetes) {
    points += 8;
    concerns.push("Prediabetes diagnosis");
    recommendations.push("Focus on diet and exercise to prevent progression");
  } else {
    points += 5;
    concerns.push("Diabetes diagnosis — management is important");
  }

  if (!hasBP) {
    points += 10;
  } else {
    concerns.push("High blood pressure may affect metabolic health");
  }

  // Lab values (0-25 points)
  maxPoints += 25;
  const hba1c = responses.lab_hba1c as number;
  const fastingGlucose = responses.lab_fasting_glucose as number;

  if (hba1c) {
    if (hba1c < 5.7) {
      points += 15;
      strengths.push("HbA1c in normal range");
    } else if (hba1c < 6.5) {
      points += 8;
      concerns.push("HbA1c in prediabetes range");
    } else {
      points += 3;
      concerns.push("HbA1c indicates diabetes range");
    }
  } else {
    points += 5;
    recommendations.push("Consider getting an HbA1c test");
  }

  if (fastingGlucose) {
    if (fastingGlucose < 100) {
      points += 10;
      strengths.push("Fasting glucose in normal range");
    } else if (fastingGlucose < 126) {
      points += 5;
      concerns.push("Fasting glucose in prediabetes range");
    } else {
      points += 2;
      concerns.push("Fasting glucose indicates diabetes range");
    }
  }

  // Age factor (0-15 points)
  maxPoints += 15;
  if (profile.age < 40) {
    points += 15;
  } else if (profile.age < 50) {
    points += 12;
  } else if (profile.age < 60) {
    points += 9;
  } else {
    points += 6;
    recommendations.push("Regular metabolic health screening recommended at your age");
  }

  // Symptoms (0-15 points)
  maxPoints += 15;
  const symptoms = (responses.current_symptoms as string[]) || [];
  const metabolicSymptoms = symptoms.filter((s) =>
    ["Excessive thirst", "Frequent urination", "Excessive tiredness", "Blurred vision", "Frequent hunger"].includes(s)
  );
  if (metabolicSymptoms.length === 0) {
    points += 15;
    strengths.push("No metabolic symptoms reported");
  } else if (metabolicSymptoms.length <= 2) {
    points += 8;
    concerns.push("Some symptoms that may relate to blood sugar");
  } else {
    points += 3;
    concerns.push("Multiple symptoms that may relate to blood sugar");
    recommendations.push("Consider discussing these symptoms with a healthcare professional");
  }

  const score = Math.round((points / maxPoints) * 100);
  return createScoreResult(score, strengths, concerns, recommendations);
}
