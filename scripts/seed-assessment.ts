import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../src/db/schema";
import { eq } from "drizzle-orm";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client, { schema });

function id(): string {
  return crypto.randomUUID();
}

async function seed() {
  console.log("Seeding assessment definitions...");

  // Clear existing assessment data
  await db.delete(schema.assessmentResponses);
  await db.delete(schema.assessmentUploads);
  await db.delete(schema.assessmentSubmissions);
  await db.delete(schema.assessmentQuestions);
  await db.delete(schema.assessmentSections);
  await db.delete(schema.assessmentDefinitions);

  // ─── Assessment Definitions ──────────────────────────────────────────────

  const definitions = [
    { slug: "full", name: "Full Health Assessment", description: "Get a broader view of your health, lifestyle and key risk areas.", icon: "health_and_safety", estimatedMinutes: 7 },
    { slug: "blood_sugar", name: "Blood Sugar & Diabetes", description: "Focus on blood sugar levels and diabetes risk factors.", icon: "bloodtype", estimatedMinutes: 3 },
    { slug: "heart", name: "Heart Health", description: "Assess your cardiovascular health risk factors.", icon: "favorite", estimatedMinutes: 3 },
    { slug: "mental", name: "Mental Wellbeing", description: "A general wellbeing check — not a psychiatric diagnosis.", icon: "psychology", estimatedMinutes: 2 },
    { slug: "liver", name: "Liver Health", description: "Assess risk factors and lifestyle that may affect liver health.", icon: "medical_information", estimatedMinutes: 3 },
    { slug: "weight", name: "Weight & Metabolic Health", description: "Understand factors affecting your weight and metabolism.", icon: "monitor_weight", estimatedMinutes: 3 },
    { slug: "lifestyle", name: "Lifestyle & Nutrition", description: "Evaluate your daily habits and dietary patterns.", icon: "restaurant", estimatedMinutes: 3 },
    { slug: "fitness", name: "Physical Fitness", description: "Assess your physical fitness and exercise capacity.", icon: "fitness_center", estimatedMinutes: 2 },
    { slug: "brain", name: "Brain Fitness", description: "Evaluate cognitive performance and brain-supporting lifestyle.", icon: "psychology_alt", estimatedMinutes: 2 },
    { slug: "chronotype", name: "Chronotype", description: "Discover your natural sleep and energy pattern — Lion, Bear, Wolf, or Dolphin.", icon: "bedtime", estimatedMinutes: 2 },
  ];

  const definitionIds: Record<string, string> = {};

  for (const def of definitions) {
    const defId = id();
    definitionIds[def.slug] = defId;
    await db.insert(schema.assessmentDefinitions).values({
      id: defId,
      slug: def.slug,
      name: def.name,
      description: def.description,
      icon: def.icon,
      estimatedMinutes: def.estimatedMinutes,
      isActive: true,
      createdAt: new Date(),
    });
  }

  console.log(`Created ${definitions.length} assessment definitions`);

  // ─── Helper to create sections and questions ──────────────────────────────

  async function createSection(
    assessmentSlug: string,
    slug: string,
    title: string,
    description: string,
    icon: string,
    order: number
  ): Promise<string> {
    const sectionId = id();
    await db.insert(schema.assessmentSections).values({
      id: sectionId,
      assessmentId: definitionIds[assessmentSlug],
      slug,
      title,
      description,
      icon,
      displayOrder: order,
      createdAt: new Date(),
    });
    return sectionId;
  }

  async function createQuestion(
    sectionId: string,
    key: string,
    text: string,
    type: string,
    options: string[] | null,
    order: number,
    extra: Record<string, unknown> = {}
  ): Promise<string> {
    const questionId = id();
    await db.insert(schema.assessmentQuestions).values({
      id: questionId,
      sectionId,
      questionKey: key,
      questionText: text,
      questionType: type as any,
      optionsJson: options ? JSON.stringify(options) : null,
      displayOrder: order,
      isRequired: (extra.isRequired as boolean) ?? true,
      unit: (extra.unit as string) ?? null,
      minValue: (extra.minValue as number) ?? null,
      maxValue: (extra.maxValue as number) ?? null,
      placeholder: (extra.placeholder as string) ?? null,
      helperText: (extra.helperText as string) ?? null,
      parentQuestionId: (extra.parentQuestionId as string) ?? null,
      conditionJson: extra.condition ? JSON.stringify(extra.condition) : null,
      weight: (extra.weight as number) ?? 1,
      scoringRulesJson: extra.scoringRules ? JSON.stringify(extra.scoringRules) : null,
      isActive: true,
      createdAt: new Date(),
    });
    return questionId;
  }

  // ─── FULL HEALTH ASSESSMENT ──────────────────────────────────────────────

  console.log("Seeding Full Health Assessment...");

  // Profile section
  const fullProfile = await createSection("full", "profile", "Your Profile", "Basic information about you", "person", 1);
  const profileQuestions = [
    { key: "full_name", text: "What is your full name?", type: "text", options: null },
    { key: "age", text: "How old are you?", type: "number", options: null, unit: "years", minValue: 1, maxValue: 120 },
    { key: "gender", text: "What is your gender?", type: "select", options: ["Male", "Female", "Other", "Prefer not to say"] },
    { key: "height", text: "What is your height?", type: "number", options: null, unit: "cm", minValue: 100, maxValue: 250 },
    { key: "weight", text: "What is your current weight?", type: "number", options: null, unit: "kg", minValue: 30, maxValue: 300 },
    { key: "city", text: "Which city do you live in?", type: "text", options: null },
    { key: "phone", text: "Phone number (optional)", type: "text", options: null, isRequired: false },
    { key: "email", text: "Email address", type: "text", options: null },
  ];
  for (let i = 0; i < profileQuestions.length; i++) {
    const q = profileQuestions[i];
    await createQuestion(fullProfile, q.key, q.text, q.type, q.options, i + 1, {
      unit: q.unit, minValue: q.minValue, maxValue: q.maxValue, isRequired: q.isRequired ?? true,
    });
  }

  // Medical History section
  const fullMedical = await createSection("full", "medical_history", "Medical History", "Your health conditions and medicines", "medical_information", 2);
  const medicalQ1 = await createQuestion(fullMedical, "medical_conditions", "Have you ever been diagnosed with any of the following?", "multi_select", [
    "Diabetes", "Prediabetes", "High blood pressure", "High cholesterol", "Heart disease",
    "Fatty liver / Liver disease", "Kidney disease", "Thyroid condition", "PCOS / PCOD",
    "Obesity / Overweight", "Digestive / Gut problems", "None of the above", "Other",
  ], 1);

  // Conditional diabetes questions
  await createQuestion(fullMedical, "diabetes_type", "What type of diabetes?", "select", [
    "Type 1", "Type 2", "Gestational", "Not sure",
  ], 2, { parentQuestionId: medicalQ1, condition: { contains: ["Diabetes"] } });

  await createQuestion(fullMedical, "diabetes_year", "When were you diagnosed?", "text", null, 3, {
    parentQuestionId: medicalQ1, condition: { contains: ["Diabetes"] }, placeholder: "e.g., 2020, about 3 years ago",
  });

  await createQuestion(fullMedical, "diabetes_medicines", "What diabetes medicines do you take?", "text", null, 4, {
    parentQuestionId: medicalQ1, condition: { contains: ["Diabetes"] }, placeholder: "e.g., Metformin 500mg", isRequired: false,
  });

  await createQuestion(fullMedical, "bp_medicines", "What blood pressure medicines do you take?", "text", null, 5, {
    parentQuestionId: medicalQ1, condition: { contains: ["High blood pressure"] }, isRequired: false,
  });

  await createQuestion(fullMedical, "cholesterol_medicines", "What cholesterol medicines do you take?", "text", null, 6, {
    parentQuestionId: medicalQ1, condition: { contains: ["High cholesterol"] }, isRequired: false,
  });

  // Current medicines
  const medQ2 = await createQuestion(fullMedical, "takes_medicines", "Are you currently taking any medicines?", "yes_no", null, 7);
  await createQuestion(fullMedical, "medicine_names", "Please list the medicines you take (name and dose if known)", "text", null, 8, {
    parentQuestionId: medQ2, condition: { equals: "yes" }, placeholder: "e.g., Amlodipine 5mg, Metformin 500mg", isRequired: false,
  });

  // Family History section
  const fullFamily = await createSection("full", "family_history", "Family History", "Health conditions in your family", "family_restroom", 3);
  await createQuestion(fullFamily, "family_conditions", "Do any close family members (parents, siblings, grandparents) have any of the following?", "multi_select", [
    "Diabetes", "Heart disease", "High blood pressure", "High cholesterol",
    "Liver disease", "Kidney disease", "Obesity", "Other relevant conditions", "None of the above",
  ], 1);

  // Lifestyle section
  const fullLifestyle = await createSection("full", "lifestyle", "Lifestyle", "Sleep, activity, and daily habits", "directions_walk", 4);
  await createQuestion(fullLifestyle, "sleep_duration", "How many hours of sleep do you usually get per night?", "select", [
    "Less than 5 hours", "5-6 hours", "6-7 hours", "7-8 hours", "More than 8 hours",
  ], 1);
  await createQuestion(fullLifestyle, "sleep_quality", "How would you rate your sleep quality?", "select", [
    "Very poor", "Poor", "Fair", "Good", "Very good",
  ], 2);
  await createQuestion(fullLifestyle, "sleep_difficulty", "Do you have difficulty falling asleep?", "yes_no", null, 3);
  await createQuestion(fullLifestyle, "sleep_waking", "Do you wake up frequently during the night?", "yes_no", null, 4);
  await createQuestion(fullLifestyle, "exercise_days", "How many days per week do you exercise for at least 30 minutes?", "select", [
    "0 days", "1-2 days", "3-4 days", "5-7 days",
  ], 5);
  await createQuestion(fullLifestyle, "steps_per_day", "How many steps do you usually take per day?", "select", [
    "Less than 3,000", "3,000-5,000", "5,000-8,000", "More than 8,000",
  ], 6);
  await createQuestion(fullLifestyle, "sitting_hours", "How many hours per day do you spend sitting continuously?", "select", [
    "More than 4 hours", "2-4 hours", "1-2 hours", "I break sitting every 30-60 minutes",
  ], 7);
  await createQuestion(fullLifestyle, "tobacco_use", "Do you use tobacco?", "select", [
    "Never", "Former user", "Current user",
  ], 8);
  await createQuestion(fullLifestyle, "alcohol_use", "How often do you consume alcohol?", "select", [
    "Never", "Occasionally (a few times a month)", "Regularly (few times a week)",
  ], 9);
  await createQuestion(fullLifestyle, "stress_level", "How would you rate your overall stress level?", "select", [
    "Low", "Moderate", "High", "Very high",
  ], 10);

  // Nutrition section
  const fullNutrition = await createSection("full", "nutrition", "Nutrition", "Your eating patterns and diet", "restaurant", 5);
  const nutritionQs = [
    { key: "meals_per_day", text: "How many meals do you eat per day?", options: ["2", "3", "4", "More than 4"] },
    { key: "breakfast_habit", text: "How often do you eat breakfast?", options: ["Every day", "Most days", "Sometimes", "Rarely / Never"] },
    { key: "vegetables", text: "How many servings of vegetables do you usually have per day?", options: ["Less than 1", "1-2", "2-3", "More than 3"] },
    { key: "fruits", text: "How often do you eat fruits?", options: ["Daily", "4-6 times/week", "1-3 times/week", "Rarely / Never"] },
    { key: "whole_grains", text: "How often do you eat whole grains or millets (ragi, jowar, bajra, brown rice)?", options: ["Every meal", "Most meals", "Sometimes", "Rarely / Never"] },
    { key: "protein", text: "Do you include a good protein source in your main meals (dal, paneer, eggs, chicken, fish, soy)?", options: ["Every main meal", "Usually", "Sometimes", "Rarely"] },
    { key: "sugary_drinks", text: "How often do you drink sugary drinks (cola, juice, sweet tea/coffee)?", options: ["Rarely / Never", "1-3 times/week", "4-6 times/week", "Daily or more"] },
    { key: "sweets", text: "How often do you eat sweets or desserts?", options: ["Rarely / Never", "1-3 times/week", "4-6 times/week", "Daily or more"] },
    { key: "fried_processed", text: "How often do you eat fried or heavily processed foods?", options: ["Rarely / Never", "1-3 times/week", "4-6 times/week", "Daily or more"] },
    { key: "late_night_eating", text: "How often do you eat late at night (within 2-3 hours of sleeping)?", options: ["Rarely / Never", "Sometimes", "Often", "Almost every day"] },
    { key: "snacking", text: "How often do you snack between meals?", options: ["Rarely / Never", "1-2 times/day", "3-4 times/day", "Almost constantly"] },
    { key: "outside_food", text: "How often do you eat outside food or order in?", options: ["Rarely / Never", "1-2 times/week", "3-4 times/week", "Almost daily"] },
    { key: "water_intake", text: "How much water do you usually drink daily?", options: ["Less than 1 litre", "1-1.5 litres", "1.5-2 litres", "More than 2 litres"] },
  ];
  for (let i = 0; i < nutritionQs.length; i++) {
    const q = nutritionQs[i];
    await createQuestion(fullNutrition, q.key, q.text, "select", q.options, i + 1);
  }

  // Symptoms section
  const fullSymptoms = await createSection("full", "symptoms", "Current Symptoms", "What you're experiencing right now", "sick", 6);
  await createQuestion(fullSymptoms, "current_symptoms", "Do you currently experience any of the following?", "multi_select", [
    "Excessive thirst", "Frequent urination", "Unexplained weight change", "Excessive tiredness",
    "Blurred vision", "Frequent hunger", "Poor sleep", "Digestive discomfort",
    "Bloating", "Constipation", "Diarrhea", "Breathlessness",
    "Chest discomfort", "Palpitations", "Headaches", "Dizziness",
    "Low mood", "Anxiety / Stress", "None of the above", "Other",
  ], 1);

  // Condition-specific section (empty — populated dynamically)
  await createSection("full", "condition_specific", "Condition Details", "Details about conditions you selected", "biotech", 7);

  // Consent section
  const fullConsent = await createSection("full", "consent", "Consent & Submit", "Review and submit your assessment", "check_circle", 8);
  await createQuestion(fullConsent, "consent", "I confirm that the information provided is accurate and I consent to Glymee storing this data for generating health insights.", "yes_no", null, 1);

  console.log("Full Health Assessment seeded");

  // ─── BLOOD SUGAR ASSESSMENT ──────────────────────────────────────────────

  console.log("Seeding Blood Sugar Assessment...");

  const bsProfile = await createSection("blood_sugar", "profile", "Your Profile", "Basic information about you", "person", 1);
  await createQuestion(bsProfile, "full_name", "What is your full name?", "text", null, 1);
  await createQuestion(bsProfile, "age", "How old are you?", "number", null, 2, { unit: "years", minValue: 1, maxValue: 120 });
  await createQuestion(bsProfile, "gender", "What is your gender?", "select", ["Male", "Female", "Other"], 3);
  await createQuestion(bsProfile, "height", "What is your height?", "number", null, 4, { unit: "cm", minValue: 100, maxValue: 250 });
  await createQuestion(bsProfile, "weight", "What is your current weight?", "number", null, 5, { unit: "kg", minValue: 30, maxValue: 300 });
  await createQuestion(bsProfile, "city", "Which city do you live in?", "text", null, 6);
  await createQuestion(bsProfile, "email", "Email address", "text", null, 7);

  const bsDiabetes = await createSection("blood_sugar", "diabetes_history", "Diabetes History", "Previous diagnoses and readings", "medical_information", 2);
  const bsDiagQ = await createQuestion(bsDiabetes, "diabetes_diagnosis", "Have you ever been told you have diabetes or prediabetes?", "select", [
    "Yes, diagnosed with diabetes", "Yes, diagnosed with prediabetes", "No, never diagnosed", "Not sure",
  ], 1);
  await createQuestion(bsDiabetes, "diabetes_type", "What type of diabetes?", "select", ["Type 1", "Type 2", "Gestational", "Not sure"], 2, {
    parentQuestionId: bsDiagQ, condition: { equals: "Yes, diagnosed with diabetes" },
  });
  await createQuestion(bsDiabetes, "diabetes_year", "When were you diagnosed?", "text", null, 3, {
    parentQuestionId: bsDiagQ, condition: { contains: ["Yes, diagnosed with diabetes", "Yes, diagnosed with prediabetes"] },
    placeholder: "e.g., 2020",
  });
  await createQuestion(bsDiabetes, "diabetes_medicines", "What medicines do you take for blood sugar?", "text", null, 4, {
    parentQuestionId: bsDiagQ, condition: { contains: ["Yes, diagnosed with diabetes", "Yes, diagnosed with prediabetes"] },
    isRequired: false,
  });
  await createQuestion(bsDiabetes, "hba1c", "Do you know your latest HbA1c?", "number", null, 5, { isRequired: false, minValue: 3, maxValue: 20, placeholder: "e.g., 6.5" });
  await createQuestion(bsDiabetes, "fasting_glucose", "Do you know your fasting glucose?", "number", null, 6, { isRequired: false, unit: "mg/dL", minValue: 50, maxValue: 500 });

  const bsRisk = await createSection("blood_sugar", "risk_factors", "Risk Factors", "Lifestyle and family factors", "warning", 3);
  const bsFamilyQ = await createQuestion(bsRisk, "family_diabetes", "Do any close family members have diabetes?", "select", ["Yes", "No", "Not sure"], 1);
  await createQuestion(bsRisk, "exercise_days", "How many days per week do you exercise for at least 30 minutes?", "select", ["0 days", "1-2 days", "3-4 days", "5-7 days"], 2);
  await createQuestion(bsRisk, "sugary_drinks", "How often do you drink sugary drinks?", "select", ["Rarely / Never", "1-3 times/week", "4-6 times/week", "Daily or more"], 3);
  await createQuestion(bsRisk, "sleep_duration", "How many hours of sleep do you usually get?", "select", ["Less than 5 hours", "5-6 hours", "6-7 hours", "7-8 hours", "More than 8 hours"], 4);
  await createQuestion(bsRisk, "stress_level", "How would you rate your stress level?", "select", ["Low", "Moderate", "High", "Very high"], 5);
  await createQuestion(bsRisk, "bp_history", "Do you have high blood pressure?", "select", ["Yes", "No", "Not sure"], 6);

  const bsSymptoms = await createSection("blood_sugar", "symptoms", "Symptoms", "Current symptoms you may have", "sick", 4);
  await createQuestion(bsSymptoms, "bs_symptoms", "Do you currently experience any of the following?", "multi_select", [
    "Excessive thirst", "Frequent urination", "Unexplained weight change", "Excessive tiredness",
    "Blurred vision", "Frequent hunger", "Slow wound healing", "None of the above",
  ], 1);

  const bsConsent = await createSection("blood_sugar", "consent", "Consent & Submit", "Review and submit", "check_circle", 5);
  await createQuestion(bsConsent, "consent", "I confirm that the information provided is accurate and I consent to Glymee storing this data.", "yes_no", null, 1);

  console.log("Blood Sugar Assessment seeded");

  // ─── HEART HEALTH ASSESSMENT ─────────────────────────────────────────────

  console.log("Seeding Heart Health Assessment...");

  const heartProfile = await createSection("heart", "profile", "Your Profile", "Basic information about you", "person", 1);
  await createQuestion(heartProfile, "full_name", "What is your full name?", "text", null, 1);
  await createQuestion(heartProfile, "age", "How old are you?", "number", null, 2, { unit: "years", minValue: 1, maxValue: 120 });
  await createQuestion(heartProfile, "gender", "What is your gender?", "select", ["Male", "Female", "Other"], 3);
  await createQuestion(heartProfile, "height", "What is your height?", "number", null, 4, { unit: "cm", minValue: 100, maxValue: 250 });
  await createQuestion(heartProfile, "weight", "What is your current weight?", "number", null, 5, { unit: "kg", minValue: 30, maxValue: 300 });
  await createQuestion(heartProfile, "city", "Which city do you live in?", "text", null, 6);
  await createQuestion(heartProfile, "email", "Email address", "text", null, 7);

  const heartHistory = await createSection("heart", "heart_history", "Heart Health History", "Blood pressure, cholesterol, and heart conditions", "favorite", 2);
  await createQuestion(heartHistory, "bp_history", "Have you been diagnosed with high blood pressure?", "select", ["Yes", "No", "Not sure"], 1);
  await createQuestion(heartHistory, "cholesterol_history", "Have you been told you have high cholesterol?", "select", ["Yes", "No", "Not sure"], 2);
  await createQuestion(heartHistory, "heart_disease", "Have you or a doctor ever identified any heart condition?", "select", ["Yes", "No", "Not sure"], 3);
  await createQuestion(heartHistory, "diabetes", "Do you have diabetes or prediabetes?", "select", ["Yes, diabetes", "Yes, prediabetes", "No", "Not sure"], 4);
  await createQuestion(heartHistory, "bp_medicines", "What blood pressure medicines do you take?", "text", null, 5, { isRequired: false });
  await createQuestion(heartHistory, "cholesterol_medicines", "What cholesterol medicines do you take?", "text", null, 6, { isRequired: false });

  const heartRisk = await createSection("heart", "risk_factors", "Risk Factors", "Lifestyle factors affecting heart health", "warning", 3);
  await createQuestion(heartRisk, "tobacco_use", "Do you use tobacco?", "select", ["Never", "Former user", "Current user"], 1);
  await createQuestion(heartRisk, "alcohol_use", "How often do you consume alcohol?", "select", ["Never", "Occasionally", "Regularly"], 2);
  await createQuestion(heartRisk, "exercise_days", "How many days per week do you exercise for at least 30 minutes?", "select", ["0 days", "1-2 days", "3-4 days", "5-7 days"], 3);
  await createQuestion(heartRisk, "sleep_duration", "How many hours of sleep do you usually get?", "select", ["Less than 5 hours", "5-6 hours", "6-7 hours", "7-8 hours", "More than 8 hours"], 4);
  await createQuestion(heartRisk, "stress_level", "How would you rate your stress level?", "select", ["Low", "Moderate", "High", "Very high"], 5);
  await createQuestion(heartRisk, "family_heart", "Do any close family members have heart disease?", "select", ["Yes", "No", "Not sure"], 6);

  const heartSymptoms = await createSection("heart", "symptoms", "Symptoms", "Current symptoms you may have", "sick", 4);
  await createQuestion(heartSymptoms, "heart_symptoms", "Do you currently experience any of the following?", "multi_select", [
    "Chest discomfort", "Breathlessness", "Palpitations", "Dizziness",
    "Swelling in legs/ankles", "Fatigue during activity", "None of the above",
  ], 1);

  const heartConsent = await createSection("heart", "consent", "Consent & Submit", "Review and submit", "check_circle", 5);
  await createQuestion(heartConsent, "consent", "I confirm that the information provided is accurate and I consent to Glymee storing this data.", "yes_no", null, 1);

  console.log("Heart Health Assessment seeded");

  // ─── MENTAL WELLBEING ASSESSMENT ─────────────────────────────────────────

  console.log("Seeding Mental Wellbeing Assessment...");

  const mentalProfile = await createSection("mental", "profile", "Your Profile", "Basic information about you", "person", 1);
  await createQuestion(mentalProfile, "full_name", "What is your full name?", "text", null, 1);
  await createQuestion(mentalProfile, "age", "How old are you?", "number", null, 2, { unit: "years", minValue: 1, maxValue: 120 });
  await createQuestion(mentalProfile, "gender", "What is your gender?", "select", ["Male", "Female", "Other"], 3);
  await createQuestion(mentalProfile, "city", "Which city do you live in?", "text", null, 4);
  await createQuestion(mentalProfile, "email", "Email address", "text", null, 5);

  const mentalWellbeing = await createSection("mental", "wellbeing", "Wellbeing Check", "Stress, mood, and energy levels", "psychology", 2);
  await createQuestion(mentalWellbeing, "stress_level", "How would you rate your current stress level?", "scale", ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], 1, { helperText: "1 = No stress, 10 = Extremely stressed" });
  await createQuestion(mentalWellbeing, "mood", "How would you describe your general mood over the past 2 weeks?", "select", ["Mostly positive", "Mix of positive and negative", "Mostly low or flat", "Varies a lot"], 2);
  await createQuestion(mentalWellbeing, "energy_level", "How is your energy level during the day?", "select", ["Excellent", "Good", "Moderate", "Low", "Very low"], 3);
  await createQuestion(mentalWellbeing, "feeling_overwhelmed", "How often do you feel overwhelmed by daily tasks?", "select", ["Rarely", "Sometimes", "Often", "Almost always"], 4);
  await createQuestion(mentalWellbeing, "motivation", "How would you describe your motivation to do things you usually enjoy?", "select", ["Strong", "Moderate", "Reduced", "Very low or absent"], 5);
  await createQuestion(mentalWellbeing, "enjoy_activities", "Are you able to enjoy normal daily activities?", "select", ["Yes, fully", "Yes, but less than before", "Sometimes", "Rarely or not at all"], 6);

  const mentalLifestyle = await createSection("mental", "lifestyle", "Lifestyle Factors", "Sleep, social connection, and daily habits", "directions_walk", 3);
  await createQuestion(mentalLifestyle, "sleep_quality", "How would you rate your sleep quality?", "select", ["Very poor", "Poor", "Fair", "Good", "Very good"], 1);
  await createQuestion(mentalLifestyle, "social_connection", "How often do you feel connected to friends or family?", "select", ["Most days", "A few times a week", "Once a week", "Rarely / Never"], 2);
  await createQuestion(mentalLifestyle, "work_pressure", "How would you rate your work or life pressure?", "select", ["Low", "Moderate", "High", "Very high"], 3);
  await createQuestion(mentalLifestyle, "exercise_days", "How many days per week do you exercise?", "select", ["0 days", "1-2 days", "3-4 days", "5-7 days"], 4);

  const mentalConsent = await createSection("mental", "consent", "Consent & Submit", "Review and submit", "check_circle", 4);
  await createQuestion(mentalConsent, "consent", "I confirm that the information provided is accurate and I consent to Glymee storing this data.", "yes_no", null, 1);

  console.log("Mental Wellbeing Assessment seeded");

  // ─── LIVER HEALTH ASSESSMENT ─────────────────────────────────────────────

  console.log("Seeding Liver Health Assessment...");

  const liverProfile = await createSection("liver", "profile", "Your Profile", "Basic information about you", "person", 1);
  await createQuestion(liverProfile, "full_name", "What is your full name?", "text", null, 1);
  await createQuestion(liverProfile, "age", "How old are you?", "number", null, 2, { unit: "years", minValue: 1, maxValue: 120 });
  await createQuestion(liverProfile, "gender", "What is your gender?", "select", ["Male", "Female", "Other"], 3);
  await createQuestion(liverProfile, "height", "What is your height?", "number", null, 4, { unit: "cm", minValue: 100, maxValue: 250 });
  await createQuestion(liverProfile, "weight", "What is your current weight?", "number", null, 5, { unit: "kg", minValue: 30, maxValue: 300 });
  await createQuestion(liverProfile, "email", "Email address", "text", null, 6);

  const liverHistory = await createSection("liver", "liver_history", "Liver Health History", "Previous liver conditions and alcohol use", "medical_information", 2);
  await createQuestion(liverHistory, "liver_disease", "Have you ever been diagnosed with liver disease or fatty liver?", "select", ["Yes", "No", "Not sure"], 1);
  await createQuestion(liverHistory, "alcohol_use", "How often do you consume alcohol?", "select", ["Never", "Occasionally (a few times a month)", "Regularly (few times a week)", "Daily"], 2);
  await createQuestion(liverHistory, "hepatitis", "Have you ever been diagnosed with hepatitis?", "select", ["Yes", "No", "Not sure"], 3);
  await createQuestion(liverHistory, "diabetes", "Do you have diabetes or prediabetes?", "select", ["Yes, diabetes", "Yes, prediabetes", "No", "Not sure"], 4);

  const liverLifestyle = await createSection("liver", "lifestyle", "Lifestyle Factors", "Diet, activity, and weight", "directions_walk", 3);
  await createQuestion(liverLifestyle, "exercise_days", "How many days per week do you exercise?", "select", ["0 days", "1-2 days", "3-4 days", "5-7 days"], 1);
  await createQuestion(liverLifestyle, "fried_processed", "How often do you eat fried or processed foods?", "select", ["Rarely / Never", "1-3 times/week", "4-6 times/week", "Daily or more"], 2);
  await createQuestion(liverLifestyle, "sugary_drinks", "How often do you drink sugary drinks?", "select", ["Rarely / Never", "1-3 times/week", "4-6 times/week", "Daily or more"], 3);

  // Liver symptoms section
  const liverSymptoms = await createSection("liver", "symptoms", "Symptoms", "Current symptoms you may have", "sick", 4);
  await createQuestion(liverSymptoms, "liver_symptoms", "Do you experience any of the following symptoms?", "multi_select", [
    "Yellowing of skin/eyes", "Dark urine", "Pale stools", "Abdominal pain",
    "Nausea", "Fatigue", "None of the above",
  ], 1);
  await createQuestion(liverSymptoms, "fatty_liver", "Have you ever been told you have fatty liver?", "select", ["Yes", "No", "Not sure"], 2);

  const liverConsent = await createSection("liver", "consent", "Consent & Submit", "Review and submit", "check_circle", 5);
  await createQuestion(liverConsent, "consent", "I confirm that the information provided is accurate and I consent to Glymee storing this data.", "yes_no", null, 1);

  console.log("Liver Health Assessment seeded");

  // ─── WEIGHT & METABOLIC ASSESSMENT ───────────────────────────────────────

  console.log("Seeding Weight & Metabolic Assessment...");

  const weightProfile = await createSection("weight", "profile", "Your Profile", "Basic information including height and weight", "person", 1);
  await createQuestion(weightProfile, "full_name", "What is your full name?", "text", null, 1);
  await createQuestion(weightProfile, "age", "How old are you?", "number", null, 2, { unit: "years", minValue: 1, maxValue: 120 });
  await createQuestion(weightProfile, "gender", "What is your gender?", "select", ["Male", "Female", "Other"], 3);
  await createQuestion(weightProfile, "height", "What is your height?", "number", null, 4, { unit: "cm", minValue: 100, maxValue: 250 });
  await createQuestion(weightProfile, "weight", "What is your current weight?", "number", null, 5, { unit: "kg", minValue: 30, maxValue: 300 });
  await createQuestion(weightProfile, "email", "Email address", "text", null, 6);

  const weightHistory = await createSection("weight", "weight_history", "Weight History", "Your weight patterns and history", "monitor_weight", 2);
  await createQuestion(weightHistory, "weight_change", "Has your weight changed significantly in the past year?", "select", ["Gained more than 10 kg", "Gained 5-10 kg", "Stable (within 2 kg)", "Lost 5-10 kg", "Lost more than 10 kg"], 1);
  await createQuestion(weightHistory, "weight_tried", "Have you tried to lose weight in the past?", "select", ["Yes, multiple times", "Yes, once or twice", "No, never"], 2);
  await createQuestion(weightHistory, "waist_circumference", "Do you know your waist circumference?", "number", null, 3, { isRequired: false, unit: "cm", minValue: 50, maxValue: 200, placeholder: "e.g., 90" });

  const weightMetabolic = await createSection("weight", "metabolic", "Metabolic Factors", "Blood sugar, blood pressure, and lipids", "biotech", 3);
  await createQuestion(weightMetabolic, "diabetes", "Do you have diabetes or prediabetes?", "select", ["Yes, diabetes", "Yes, prediabetes", "No", "Not sure"], 1);
  await createQuestion(weightMetabolic, "bp_history", "Do you have high blood pressure?", "select", ["Yes", "No", "Not sure"], 2);
  await createQuestion(weightMetabolic, "cholesterol_history", "Do you have high cholesterol?", "select", ["Yes", "No", "Not sure"], 3);

  const weightLifestyle = await createSection("weight", "lifestyle", "Lifestyle", "Diet, activity, sleep, and stress", "directions_walk", 4);
  await createQuestion(weightLifestyle, "exercise_days", "How many days per week do you exercise?", "select", ["0 days", "1-2 days", "3-4 days", "5-7 days"], 1);
  await createQuestion(weightLifestyle, "sleep_quality", "How would you rate your sleep quality?", "select", ["Very poor", "Poor", "Fair", "Good", "Very good"], 2);
  await createQuestion(weightLifestyle, "stress_level", "How would you rate your stress level?", "select", ["Low", "Moderate", "High", "Very high"], 3);
  await createQuestion(weightLifestyle, "sugary_drinks", "How often do you drink sugary drinks?", "select", ["Rarely / Never", "1-3 times/week", "4-6 times/week", "Daily or more"], 4);

  const weightConsent = await createSection("weight", "consent", "Consent & Submit", "Review and submit", "check_circle", 5);
  await createQuestion(weightConsent, "consent", "I confirm that the information provided is accurate and I consent to Glymee storing this data.", "yes_no", null, 1);

  console.log("Weight & Metabolic Assessment seeded");

  // ─── LIFESTYLE & NUTRITION ASSESSMENT ────────────────────────────────────

  console.log("Seeding Lifestyle & Nutrition Assessment...");

  const lifeProfile = await createSection("lifestyle", "profile", "Your Profile", "Basic information about you", "person", 1);
  await createQuestion(lifeProfile, "full_name", "What is your full name?", "text", null, 1);
  await createQuestion(lifeProfile, "age", "How old are you?", "number", null, 2, { unit: "years", minValue: 1, maxValue: 120 });
  await createQuestion(lifeProfile, "gender", "What is your gender?", "select", ["Male", "Female", "Other"], 3);
  await createQuestion(lifeProfile, "email", "Email address", "text", null, 4);

  const lifeLifestyle = await createSection("lifestyle", "lifestyle", "Daily Lifestyle", "Sleep, activity, tobacco, alcohol, stress", "directions_walk", 2);
  await createQuestion(lifeLifestyle, "sleep_duration", "How many hours of sleep do you usually get?", "select", ["Less than 5 hours", "5-6 hours", "6-7 hours", "7-8 hours", "More than 8 hours"], 1);
  await createQuestion(lifeLifestyle, "sleep_quality", "How would you rate your sleep quality?", "select", ["Very poor", "Poor", "Fair", "Good", "Very good"], 2);
  await createQuestion(lifeLifestyle, "exercise_days", "How many days per week do you exercise for at least 30 minutes?", "select", ["0 days", "1-2 days", "3-4 days", "5-7 days"], 3);
  await createQuestion(lifeLifestyle, "sitting_hours", "How many hours per day do you sit continuously?", "select", ["More than 4 hours", "2-4 hours", "1-2 hours", "I break sitting every 30-60 minutes"], 4);
  await createQuestion(lifeLifestyle, "tobacco_use", "Do you use tobacco?", "select", ["Never", "Former user", "Current user"], 5);
  await createQuestion(lifeLifestyle, "alcohol_use", "How often do you consume alcohol?", "select", ["Never", "Occasionally", "Regularly"], 6);
  await createQuestion(lifeLifestyle, "stress_level", "How would you rate your stress level?", "select", ["Low", "Moderate", "High", "Very high"], 7);

  const lifeNutrition = await createSection("lifestyle", "nutrition", "Nutrition", "Your eating patterns and diet", "restaurant", 3);
  for (let i = 0; i < nutritionQs.length; i++) {
    const q = nutritionQs[i];
    await createQuestion(lifeNutrition, q.key, q.text, "select", q.options, i + 1);
  }

  const lifeConsent = await createSection("lifestyle", "consent", "Consent & Submit", "Review and submit", "check_circle", 4);
  await createQuestion(lifeConsent, "consent", "I confirm that the information provided is accurate and I consent to Glymee storing this data.", "yes_no", null, 1);

  console.log("Lifestyle & Nutrition Assessment seeded");

  // ─── PHYSICAL FITNESS ASSESSMENT ─────────────────────────────────────────

  console.log("Seeding Physical Fitness Assessment...");

  const fitProfile = await createSection("fitness", "profile", "Your Profile", "Basic information about you", "person", 1);
  await createQuestion(fitProfile, "full_name", "What is your full name?", "text", null, 1);
  await createQuestion(fitProfile, "age", "How old are you?", "number", null, 2, { unit: "years", minValue: 1, maxValue: 120 });
  await createQuestion(fitProfile, "gender", "What is your gender?", "select", ["Male", "Female", "Other"], 3);
  await createQuestion(fitProfile, "email", "Email address", "text", null, 4);

  const fitMovement = await createSection("fitness", "movement", "Daily Movement", "Steps, exercise, and sitting habits", "directions_walk", 2);
  await createQuestion(fitMovement, "exercise_days", "How many days per week do you exercise for at least 30 minutes?", "select", ["0 days", "1-2 days", "3-4 days", "5-7 days"], 1);
  await createQuestion(fitMovement, "steps_per_day", "How many steps do you usually take per day?", "select", ["Less than 3,000", "3,000-5,000", "5,000-8,000", "More than 8,000"], 2);
  await createQuestion(fitMovement, "sitting_hours", "How much time do you spend continuously sitting?", "select", ["More than 4 hours", "2-4 hours", "1-2 hours", "I break sitting every 30-60 minutes"], 3);

  const fitCapacity = await createSection("fitness", "capacity", "Exercise Capacity", "Your physical energy and exercise ability", "fitness_center", 3);
  await createQuestion(fitCapacity, "walk_30min", "Can you walk continuously for 30 minutes without unusual breathlessness, chest discomfort, dizziness, or excessive fatigue?", "select", ["No", "With difficulty", "Yes"], 1);
  await createQuestion(fitCapacity, "strength_training", "How often do you perform resistance / strength training?", "select", ["Never", "Less than once a week", "1-2 times a week", "3 or more times a week"], 2);
  await createQuestion(fitCapacity, "energy_level", "How would you rate your overall physical energy?", "select", ["Very low", "Low", "Good", "Excellent"], 3);

  const fitConsent = await createSection("fitness", "consent", "Consent & Submit", "Review and submit", "check_circle", 4);
  await createQuestion(fitConsent, "consent", "I confirm that the information provided is accurate and I consent to Glymee storing this data.", "yes_no", null, 1);

  console.log("Physical Fitness Assessment seeded");

  // ─── BRAIN FITNESS ASSESSMENT ────────────────────────────────────────────

  console.log("Seeding Brain Fitness Assessment...");

  const brainProfile = await createSection("brain", "profile", "Your Profile", "Basic information about you", "person", 1);
  await createQuestion(brainProfile, "full_name", "What is your full name?", "text", null, 1);
  await createQuestion(brainProfile, "age", "How old are you?", "number", null, 2, { unit: "years", minValue: 1, maxValue: 120 });
  await createQuestion(brainProfile, "gender", "What is your gender?", "select", ["Male", "Female", "Other"], 3);
  await createQuestion(brainProfile, "email", "Email address", "text", null, 4);

  const brainCognitive = await createSection("brain", "cognitive", "Cognitive Performance", "Memory and attention exercises", "psychology", 2);
  await createQuestion(brainCognitive, "immediate_memory", "I will give you 3 words. Please remember them: APPLE — RIVER — CHAIR. How many can you recall right now?", "select", ["0", "1", "2", "3"], 1, { helperText: "Take your time. This is not a test — just an insight." });
  await createQuestion(brainCognitive, "delayed_recall", "After a few minutes, how many of the 3 words (APPLE, RIVER, CHAIR) can you recall?", "select", ["0", "1", "2", "3"], 2, { helperText: "Think back to the words from the previous question." });
  await createQuestion(brainCognitive, "attention_subtract", "Starting at 100, subtract 7. What do you get? (100 → 93 → 86 → 79 → 72)", "select", ["Could not do it", "Made several errors", "Completed with 1-2 errors", "Completed correctly"], 3, { helperText: "This tests attention and concentration." });
  await createQuestion(brainCognitive, "working_memory", "Can you repeat this sequence: 7 — 2 — 9 — 4 — 6? And then repeat it backwards?", "select", ["Could not do it", "Forward only", "Forward and backward with errors", "Forward and backward correctly"], 4, { helperText: "This tests working memory." });

  const brainLifestyle = await createSection("brain", "lifestyle", "Brain-Supporting Lifestyle", "Sleep, mental activity, and fatigue", "auto_stories", 3);
  await createQuestion(brainLifestyle, "mental_activity", "How often do you engage in mentally stimulating activities (reading, puzzles, learning new skills, music)?", "select", ["Rarely", "1-2 days/week", "3-4 days/week", "5 or more days/week"], 1);
  await createQuestion(brainLifestyle, "sleep_quality", "How would you rate your sleep quality?", "select", ["Poor", "Fair", "Good", "Excellent"], 2);
  await createQuestion(brainLifestyle, "mental_fatigue", "How often do you feel mentally fatigued or unable to concentrate during the day?", "select", ["Almost every day", "Frequently", "Occasionally", "Rarely"], 3);

  const brainConsent = await createSection("brain", "consent", "Consent & Submit", "Review and submit", "check_circle", 4);
  await createQuestion(brainConsent, "consent", "I confirm that the information provided is accurate and I consent to Glymee storing this data.", "yes_no", null, 1);

  console.log("Brain Fitness Assessment seeded");

  // ─── CHRONOTYPE ASSESSMENT ───────────────────────────────────────────────

  console.log("Seeding Chronotype Assessment...");

  const chronoProfile = await createSection("chronotype", "profile", "Your Profile", "Basic information about you", "person", 1);
  await createQuestion(chronoProfile, "full_name", "What is your full name?", "text", null, 1);
  await createQuestion(chronoProfile, "age", "How old are you?", "number", null, 2, { unit: "years", minValue: 1, maxValue: 120 });
  await createQuestion(chronoProfile, "gender", "What is your gender?", "select", ["Male", "Female", "Other"], 3);
  await createQuestion(chronoProfile, "email", "Email address", "text", null, 4);

  const chronoPrefs = await createSection("chronotype", "preferences", "Sleep Preferences", "Your natural sleep and energy patterns", "bedtime", 2);
  await createQuestion(chronoPrefs, "q1_natural_wake", "If you had no alarm and no obligations, when would you naturally wake up?", "select", ["Before 6:00 AM", "6:00–7:00 AM", "7:00–8:30 AM", "After 8:30 AM"], 1);
  await createQuestion(chronoPrefs, "q2_natural_sleep", "Without an alarm, when would you naturally feel ready to sleep?", "select", ["Before 9:30 PM", "9:30–10:30 PM", "10:30 PM–12:00 AM", "After midnight"], 2);
  await createQuestion(chronoPrefs, "q3_sharpest", "When do you feel mentally sharpest?", "select", ["5–9 AM", "9 AM–12 PM", "12–5 PM", "5 PM–10 PM"], 3);
  await createQuestion(chronoPrefs, "q4_exercise_easiest", "When is exercise easiest and most enjoyable for you?", "select", ["Early morning", "Late morning", "Afternoon", "Evening / night"], 4);
  await createQuestion(chronoPrefs, "q5_exam_time", "If you had an important exam with no scheduling restrictions, when would you prefer to take it?", "select", ["7–9 AM", "9–11 AM", "12–3 PM", "4–7 PM"], 5);
  await createQuestion(chronoPrefs, "q6_after_waking", "How do you feel during the first 30 minutes after waking?", "select", ["Immediately energetic", "Fairly alert", "A little sleepy", "Very sleepy / difficult to function"], 6);

  const chronoHabits = await createSection("chronotype", "habits", "Daily Habits", "Exercise timing, study habits, and social energy", "schedule", 3);
  await createQuestion(chronoHabits, "q7_energy_dip", "When do you usually experience your biggest energy dip?", "select", ["Before noon", "12–2 PM", "2–5 PM", "Rarely / mostly energetic throughout"], 1);
  await createQuestion(chronoHabits, "q8_stay_up_late", "If you stay up late one night, what happens the next morning?", "select", ["I can still wake early easily", "Slightly difficult", "Very difficult", "I naturally sleep much later"], 2);
  await createQuestion(chronoHabits, "q9_free_day_morning", "On a completely free day, what would your ideal morning look like?", "select", ["Wake early and start the day immediately", "Wake moderately early and take it easy", "Sleep in and start slowly", "Sleep late and have a late morning"], 3);
  await createQuestion(chronoHabits, "q10_social_energy", "When do you usually feel most socially energetic?", "select", ["Morning", "Late morning / afternoon", "Evening", "Night"], 4);
  await createQuestion(chronoHabits, "q11_study_timing", "If you had to do 2 hours of difficult studying, which timing would you choose naturally?", "select", ["6–8 AM", "9–11 AM", "2–4 PM", "8–10 PM"], 5);
  await createQuestion(chronoHabits, "q12_best_statement", "Which statement describes you best?", "select", [
    '"I love early mornings and dislike staying up late."',
    '"I function well at almost any normal daytime hour."',
    '"I need some time in the morning but become better later."',
    '"I come alive in the evening/night."',
  ], 6);

  const chronoConsent = await createSection("chronotype", "consent", "Consent & Submit", "Review and submit", "check_circle", 4);
  await createQuestion(chronoConsent, "consent", "I confirm that the information provided is accurate and I consent to Glymee storing this data.", "yes_no", null, 1);

  console.log("Chronotype Assessment seeded");

  // ─── Done ────────────────────────────────────────────────────────────────

  console.log("\n✓ All assessment questions seeded successfully!");
  console.log(`  Definitions: ${definitions.length}`);
  console.log("  Sections and questions for all 10 assessment types");

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
