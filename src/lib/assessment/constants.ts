import { ScoreStatus } from "./types";

export const SCORE_THRESHOLDS = {
  good: 70,
  needsAttention: 40,
} as const;

export const CATEGORY_WEIGHTS: Record<string, Record<string, number>> = {
  full: {
    metabolic: 0.15,
    heart: 0.12,
    nutrition: 0.12,
    activity: 0.12,
    sleep: 0.10,
    mental: 0.10,
    weight: 0.10,
    liver: 0.09,
    lifestyle: 0.10,
  },
};

export const STATUS_LABELS: Record<ScoreStatus, string> = {
  good: "Good",
  needs_attention: "Needs Attention",
  higher_risk: "Higher Risk Indicators",
};

export const STATUS_COLORS: Record<ScoreStatus, "green" | "amber" | "red"> = {
  good: "green",
  needs_attention: "amber",
  higher_risk: "red",
};

export const CATEGORY_LABELS: Record<string, string> = {
  metabolic: "Metabolic Health",
  heart: "Heart Health",
  nutrition: "Nutrition",
  activity: "Physical Activity",
  sleep: "Sleep",
  mental: "Mental Wellbeing",
  liver: "Liver Health",
  weight: "Weight & Body Composition",
  lifestyle: "Lifestyle Risk Factors",
  fitness: "Physical Fitness",
  brain: "Brain Fitness",
  chronotype: "Chronotype",
};

export const CATEGORY_ICONS: Record<string, string> = {
  metabolic: "monitor_heart",
  heart: "favorite",
  nutrition: "restaurant",
  activity: "directions_walk",
  sleep: "bedtime",
  mental: "psychology",
  liver: "medical_information",
  weight: "monitor_weight",
  lifestyle: "health_and_safety",
  fitness: "fitness_center",
  brain: "psychology",
  chronotype: "schedule",
};

export const CHRONOTYPE_LABELS: Record<string, { name: string; animal: string; description: string; icon: string }> = {
  lion: {
    name: "Lion",
    animal: "Lion",
    description: "You are an early riser with peak energy in the morning. You prefer to start the day early and wind down in the evening.",
    icon: "🦁",
  },
  bear: {
    name: "Bear",
    animal: "Bear",
    description: "You follow the solar cycle and are most productive during regular daytime hours. This is the most common chronotype.",
    icon: "🐻",
  },
  wolf: {
    name: "Wolf",
    animal: "Wolf",
    description: "You are a night-oriented person. Your energy peaks in the afternoon and evening, and you naturally prefer a later schedule.",
    icon: "🐺",
  },
  dolphin: {
    name: "Dolphin",
    animal: "Dolphin",
    description: "You have an irregular sleep pattern and may struggle with falling or staying asleep. You tend to be a light sleeper.",
    icon: "🐬",
  },
};

export const MEDICAL_CONDITIONS = [
  { value: "diabetes", label: "Diabetes" },
  { value: "prediabetes", label: "Prediabetes" },
  { value: "high_bp", label: "High blood pressure" },
  { value: "high_cholesterol", label: "High cholesterol" },
  { value: "heart_disease", label: "Heart disease" },
  { value: "fatty_liver", label: "Fatty liver / Liver disease" },
  { value: "kidney_disease", label: "Kidney disease" },
  { value: "thyroid", label: "Thyroid condition" },
  { value: "pcos_pcod", label: "PCOS / PCOD" },
  { value: "obesity", label: "Obesity / Overweight" },
  { value: "gut_problems", label: "Digestive / Gut problems" },
  { value: "none", label: "None of the above" },
  { value: "other", label: "Other" },
];

export const FAMILY_CONDITIONS = [
  { value: "diabetes", label: "Diabetes" },
  { value: "heart_disease", label: "Heart disease" },
  { value: "high_bp", label: "High blood pressure" },
  { value: "high_cholesterol", label: "High cholesterol" },
  { value: "liver_disease", label: "Liver disease" },
  { value: "kidney_disease", label: "Kidney disease" },
  { value: "obesity", label: "Obesity" },
  { value: "other", label: "Other relevant conditions" },
];

export const SYMPTOMS_LIST = [
  { value: "excessive_thirst", label: "Excessive thirst" },
  { value: "frequent_urination", label: "Frequent urination" },
  { value: "weight_change", label: "Unexplained weight change" },
  { value: "excessive_tiredness", label: "Excessive tiredness" },
  { value: "blurred_vision", label: "Blurred vision" },
  { value: "frequent_hunger", label: "Frequent hunger" },
  { value: "poor_sleep", label: "Poor sleep" },
  { value: "digestive_discomfort", label: "Digestive discomfort" },
  { value: "bloating", label: "Bloating" },
  { value: "constipation", label: "Constipation" },
  { value: "diarrhea", label: "Diarrhea" },
  { value: "breathlessness", label: "Breathlessness" },
  { value: "chest_discomfort", label: "Chest discomfort" },
  { value: "palpitations", label: "Palpitations" },
  { value: "headaches", label: "Headaches" },
  { value: "dizziness", label: "Dizziness" },
  { value: "low_mood", label: "Low mood" },
  { value: "anxiety_stress", label: "Anxiety / Stress" },
  { value: "other", label: "Other" },
];

export const DIABETES_TYPES = [
  "Type 1 Diabetes",
  "Type 2 Diabetes",
  "Gestational Diabetes",
  "Not sure / Undiagnosed",
];

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

export const SLEEP_DURATION_OPTIONS = [
  "Less than 5 hours",
  "5-6 hours",
  "6-7 hours",
  "7-8 hours",
  "More than 8 hours",
];

export const SLEEP_QUALITY_OPTIONS = [
  "Very poor",
  "Poor",
  "Fair",
  "Good",
  "Very good",
];

export const ACTIVITY_LEVEL_OPTIONS = [
  { value: "inactive", label: "Mostly inactive (desk job, little movement)" },
  { value: "light", label: "Light activity ( occasional walks, light chores)" },
  { value: "moderate", label: "Moderate activity (regular walks, some exercise)" },
  { value: "regular", label: "Regular exercise (structured workouts 3+ times/week)" },
];

export const TOBACCO_OPTIONS = [
  { value: "never", label: "Never" },
  { value: "former", label: "Former user" },
  { value: "current", label: "Current user" },
];

export const ALCOHOL_OPTIONS = [
  { value: "never", label: "Never" },
  { value: "occasionally", label: "Occasionally (a few times a month)" },
  { value: "regularly", label: "Regularly (few times a week)" },
];

export const STRESS_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "moderate", label: "Moderate" },
  { value: "high", label: "High" },
  { value: "very_high", label: "Very high" },
];

export const NUTRITION_QUESTIONS = [
  { key: "meals_per_day", label: "How many meals do you eat per day?", options: ["2", "3", "4", "More than 4"] },
  { key: "breakfast_habit", label: "How often do you eat breakfast?", options: ["Every day", "Most days", "Sometimes", "Rarely / Never"] },
  { key: "vegetables", label: "How many servings of vegetables do you usually have per day?", options: ["Less than 1", "1-2", "2-3", "More than 3"] },
  { key: "fruits", label: "How often do you eat fruits?", options: ["Daily", "4-6 times/week", "1-3 times/week", "Rarely / Never"] },
  { key: "whole_grains", label: "How often do you eat whole grains or millets (ragi, jowar, bajra, brown rice)?", options: ["Every meal", "Most meals", "Sometimes", "Rarely / Never"] },
  { key: "protein", label: "Do you include a good protein source in your main meals (dal, paneer, eggs, chicken, fish, soy)?", options: ["Every main meal", "Usually", "Sometimes", "Rarely"] },
  { key: "sugary_drinks", label: "How often do you drink sugary drinks (cola, juice, sweet tea/coffee)?", options: ["Rarely / Never", "1-3 times/week", "4-6 times/week", "Daily or more"] },
  { key: "sweets", label: "How often do you eat sweets or desserts?", options: ["Rarely / Never", "1-3 times/week", "4-6 times/week", "Daily or more"] },
  { key: "fried_processed", label: "How often do you eat fried or heavily processed foods?", options: ["Rarely / Never", "1-3 times/week", "4-6 times/week", "Daily or more"] },
  { key: "late_night_eating", label: "How often do you eat late at night (within 2-3 hours of sleeping)?", options: ["Rarely / Never", "Sometimes", "Often", "Almost every day"] },
  { key: "snacking", label: "How often do you snack between meals?", options: ["Rarely / Never", "1-2 times/day", "3-4 times/day", "Almost constantly"] },
  { key: "outside_food", label: "How often do you eat outside food or order in?", options: ["Rarely / Never", "1-2 times/week", "3-4 times/week", "Almost daily"] },
  { key: "water_intake", label: "How much water do you usually drink daily?", options: ["Less than 1 litre", "1-1.5 litres", "1.5-2 litres", "More than 2 litres"] },
];

export const FILE_TYPES = [
  { value: "blood_report", label: "Blood report" },
  { value: "hba1c", label: "HbA1c" },
  { value: "lipid_profile", label: "Lipid profile" },
  { value: "liver_function", label: "Liver function test" },
  { value: "kidney_function", label: "Kidney function test" },
  { value: "thyroid", label: "Thyroid report" },
  { value: "other", label: "Other medical report" },
];

export const SCALE_LABELS: Record<number, string[]> = {
  5: ["Very poor", "Poor", "Fair", "Good", "Excellent"],
  10: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
};

export const MAX_FILE_SIZE_MB = 10;
export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];