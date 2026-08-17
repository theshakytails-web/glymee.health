export type QuestionType = "select" | "multi_select" | "number" | "text" | "scale" | "yes_no";

export type SubmissionStatus = "in_progress" | "completed";

export type ScoreStatus = "good" | "needs_attention" | "higher_risk";

export interface AssessmentDefinition {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  estimatedMinutes: number;
  isActive: boolean;
}

export interface AssessmentSection {
  id: string;
  assessmentId: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
  displayOrder: number;
}

export interface AssessmentQuestion {
  id: string;
  sectionId: string;
  questionKey: string;
  questionText: string;
  questionType: QuestionType;
  options: string[] | null;
  unit: string | null;
  minValue: number | null;
  maxValue: number | null;
  placeholder: string | null;
  helperText: string | null;
  isRequired: boolean;
  parentQuestionId: string | null;
  condition: QuestionCondition | null;
  weight: number;
  scoringRules: ScoringRule[] | null;
  displayOrder: number;
}

export interface QuestionCondition {
  contains?: string[];
  equals?: string;
  notEquals?: string;
  gt?: number;
  lt?: number;
}

export interface ScoringRule {
  type: "equals" | "contains" | "range" | "scale" | "bmi" | "custom";
  value?: string | number;
  min?: number;
  max?: number;
  points: number;
}

export interface AssessmentSubmission {
  id: string;
  assessmentSlug: string;
  fullName: string;
  email: string;
  phone: string | null;
  age: number;
  gender: string;
  heightCm: number | null;
  weightKg: number | null;
  bmi: number | null;
  city: string | null;
  status: SubmissionStatus;
  currentStep: number;
  overallScore: number | null;
  overallStatus: ScoreStatus | null;
  scoresJson: string | null;
  strengthsJson: string | null;
  concernsJson: string | null;
  recommendationsJson: string | null;
  consentGiven: boolean;
  consentText: string | null;
  createdAt: Date;
  completedAt: Date | null;
}

export interface AssessmentResponse {
  id: string;
  submissionId: string;
  questionId: string;
  questionKey: string;
  responseValue: string;
  createdAt: Date;
}

export interface AssessmentUpload {
  id: string;
  submissionId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
}

export interface ScoreResult {
  score: number;
  status: ScoreStatus;
  label: string;
  color: "green" | "amber" | "red";
  strengths: string[];
  concerns: string[];
  recommendations: string[];
}

export interface AssessmentResult {
  overall: ScoreResult;
  categories: Record<string, ScoreResult>;
  submissionId: string;
}

export interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  city: string;
}

export interface StepConfig {
  slug: string;
  title: string;
  description: string;
  icon: string;
  sectionSlug: string;
}

export interface AssessmentConfig {
  slug: string;
  name: string;
  description: string;
  steps: StepConfig[];
  categories: string[];
}

export const ASSESSMENT_CONFIGS: Record<string, AssessmentConfig> = {
  full: {
    slug: "full",
    name: "Full Health Assessment",
    description: "Get a broader view of your health, lifestyle and key risk areas.",
    steps: [
      { slug: "profile", title: "Your Profile", description: "Basic information about you", icon: "person", sectionSlug: "profile" },
      { slug: "medical-history", title: "Medical History", description: "Your health conditions and medicines", icon: "medical_information", sectionSlug: "medical_history" },
      { slug: "family-history", title: "Family History", description: "Health conditions in your family", icon: "family_restroom", sectionSlug: "family_history" },
      { slug: "lifestyle", title: "Lifestyle", description: "Sleep, activity, and daily habits", icon: "directions_walk", sectionSlug: "lifestyle" },
      { slug: "nutrition", title: "Nutrition", description: "Your eating patterns and diet", icon: "restaurant", sectionSlug: "nutrition" },
      { slug: "symptoms", title: "Current Symptoms", description: "What you're experiencing right now", icon: "symptom_check", sectionSlug: "symptoms" },
      { slug: "condition-specific", title: "Condition Details", description: "Details about conditions you selected", icon: "biotech", sectionSlug: "condition_specific" },
      { slug: "consent", title: "Consent & Submit", description: "Review and submit your assessment", icon: "check_circle", sectionSlug: "consent" },
    ],
    categories: ["metabolic", "heart", "nutrition", "activity", "sleep", "mental", "liver", "weight", "lifestyle"],
  },
  blood_sugar: {
    slug: "blood_sugar",
    name: "Blood Sugar & Diabetes",
    description: "Focus on blood sugar levels and diabetes risk factors.",
    steps: [
      { slug: "profile", title: "Your Profile", description: "Basic information about you", icon: "person", sectionSlug: "profile" },
      { slug: "diabetes-history", title: "Diabetes History", description: "Previous diagnoses and readings", icon: "medical_information", sectionSlug: "diabetes_history" },
      { slug: "risk-factors", title: "Risk Factors", description: "Lifestyle and family factors", icon: "warning", sectionSlug: "risk_factors" },
      { slug: "symptoms", title: "Symptoms", description: "Current symptoms you may have", icon: "symptom_check", sectionSlug: "symptoms" },
      { slug: "consent", title: "Consent & Submit", description: "Review and submit", icon: "check_circle", sectionSlug: "consent" },
    ],
    categories: ["metabolic"],
  },
  heart: {
    slug: "heart",
    name: "Heart Health",
    description: "Assess your cardiovascular health risk factors.",
    steps: [
      { slug: "profile", title: "Your Profile", description: "Basic information about you", icon: "person", sectionSlug: "profile" },
      { slug: "heart-history", title: "Heart Health History", description: "Blood pressure, cholesterol, and heart conditions", icon: "favorite", sectionSlug: "heart_history" },
      { slug: "risk-factors", title: "Risk Factors", description: "Lifestyle factors affecting heart health", icon: "warning", sectionSlug: "risk_factors" },
      { slug: "symptoms", title: "Symptoms", description: "Current symptoms you may have", icon: "symptom_check", sectionSlug: "symptoms" },
      { slug: "consent", title: "Consent & Submit", description: "Review and submit", icon: "check_circle", sectionSlug: "consent" },
    ],
    categories: ["heart"],
  },
  mental: {
    slug: "mental",
    name: "Mental Wellbeing",
    description: "A general wellbeing check — not a psychiatric diagnosis.",
    steps: [
      { slug: "profile", title: "Your Profile", description: "Basic information about you", icon: "person", sectionSlug: "profile" },
      { slug: "wellbeing", title: "Wellbeing Check", description: "Stress, mood, and energy levels", icon: "psychology", sectionSlug: "wellbeing" },
      { slug: "lifestyle", title: "Lifestyle Factors", description: "Sleep, social connection, and daily habits", icon: "directions_walk", sectionSlug: "lifestyle" },
      { slug: "consent", title: "Consent & Submit", description: "Review and submit", icon: "check_circle", sectionSlug: "consent" },
    ],
    categories: ["mental"],
  },
  liver: {
    slug: "liver",
    name: "Liver Health",
    description: "Assess risk factors and lifestyle that may affect liver health.",
    steps: [
      { slug: "profile", title: "Your Profile", description: "Basic information about you", icon: "person", sectionSlug: "profile" },
      { slug: "liver-history", title: "Liver Health History", description: "Previous liver conditions and alcohol use", icon: "medical_information", sectionSlug: "liver_history" },
      { slug: "lifestyle", title: "Lifestyle Factors", description: "Diet, activity, and weight", icon: "directions_walk", sectionSlug: "lifestyle" },
      { slug: "symptoms", title: "Symptoms", description: "Current symptoms you may have", icon: "symptom_check", sectionSlug: "symptoms" },
      { slug: "consent", title: "Consent & Submit", description: "Review and submit", icon: "check_circle", sectionSlug: "consent" },
    ],
    categories: ["liver"],
  },
  weight: {
    slug: "weight",
    name: "Weight & Metabolic Health",
    description: "Understand factors affecting your weight and metabolism.",
    steps: [
      { slug: "profile", title: "Your Profile", description: "Basic information including height and weight", icon: "person", sectionSlug: "profile" },
      { slug: "weight-history", title: "Weight History", description: "Your weight patterns and history", icon: "monitor_weight", sectionSlug: "weight_history" },
      { slug: "metabolic", title: "Metabolic Factors", description: "Blood sugar, blood pressure, and lipids", icon: "biotech", sectionSlug: "metabolic" },
      { slug: "lifestyle", title: "Lifestyle", description: "Diet, activity, sleep, and stress", icon: "directions_walk", sectionSlug: "lifestyle" },
      { slug: "consent", title: "Consent & Submit", description: "Review and submit", icon: "check_circle", sectionSlug: "consent" },
    ],
    categories: ["weight"],
  },
  lifestyle: {
    slug: "lifestyle",
    name: "Lifestyle & Nutrition",
    description: "Evaluate your daily habits and dietary patterns.",
    steps: [
      { slug: "profile", title: "Your Profile", description: "Basic information about you", icon: "person", sectionSlug: "profile" },
      { slug: "lifestyle", title: "Daily Lifestyle", description: "Sleep, activity, tobacco, alcohol, stress", icon: "directions_walk", sectionSlug: "lifestyle" },
      { slug: "nutrition", title: "Nutrition", description: "Your eating patterns and diet", icon: "restaurant", sectionSlug: "nutrition" },
      { slug: "consent", title: "Consent & Submit", description: "Review and submit", icon: "check_circle", sectionSlug: "consent" },
    ],
    categories: ["lifestyle"],
  },
  fitness: {
    slug: "fitness",
    name: "Physical Fitness",
    description: "Assess your physical fitness and exercise capacity.",
    steps: [
      { slug: "profile", title: "Your Profile", description: "Basic information about you", icon: "person", sectionSlug: "profile" },
      { slug: "movement", title: "Daily Movement", description: "Steps, exercise, and sitting habits", icon: "directions_walk", sectionSlug: "movement" },
      { slug: "capacity", title: "Exercise Capacity", description: "Your physical energy and exercise ability", icon: "fitness_center", sectionSlug: "capacity" },
      { slug: "consent", title: "Consent & Submit", description: "Review and submit", icon: "check_circle", sectionSlug: "consent" },
    ],
    categories: ["fitness"],
  },
  brain: {
    slug: "brain",
    name: "Brain Fitness",
    description: "Evaluate cognitive performance and brain-supporting lifestyle.",
    steps: [
      { slug: "profile", title: "Your Profile", description: "Basic information about you", icon: "person", sectionSlug: "profile" },
      { slug: "cognitive", title: "Cognitive Performance", description: "Memory and attention exercises", icon: "psychology", sectionSlug: "cognitive" },
      { slug: "lifestyle", title: "Brain-Supporting Lifestyle", description: "Sleep, mental activity, and fatigue", icon: "auto_stories", sectionSlug: "lifestyle" },
      { slug: "consent", title: "Consent & Submit", description: "Review and submit", icon: "check_circle", sectionSlug: "consent" },
    ],
    categories: ["brain"],
  },
  chronotype: {
    slug: "chronotype",
    name: "Chronotype",
    description: "Discover your natural sleep and energy pattern — Lion, Bear, Wolf, or Dolphin.",
    steps: [
      { slug: "profile", title: "Your Profile", description: "Basic information about you", icon: "person", sectionSlug: "profile" },
      { slug: "preferences", title: "Sleep Preferences", description: "Your natural sleep and energy patterns", icon: "bedtime", sectionSlug: "preferences" },
      { slug: "habits", title: "Daily Habits", description: "Exercise timing, study habits, and social energy", icon: "schedule", sectionSlug: "habits" },
      { slug: "consent", title: "Consent & Submit", description: "Review and submit", icon: "check_circle", sectionSlug: "consent" },
    ],
    categories: ["chronotype"],
  },
};

export const CONSENT_TEXT = `By submitting this assessment, you agree that the information provided will be used to generate health insights. This assessment provides educational health insights based on the information you provided. It is not a medical diagnosis or a substitute for professional medical advice. Please consult a qualified healthcare professional for diagnosis, treatment or medication decisions.

Your data will be stored securely and will only be accessible to authorised Glymee health professionals. You may request deletion of your data at any time by contacting help@glymee.com.`;

export const DISCLAIMER_TEXT = `This assessment provides health insights based on the information you provided. It is not a medical diagnosis. Please consult a qualified healthcare professional for diagnosis, treatment or medication decisions.`;

export const EMERGENCY_SYMPTOMS = ["chest_discomfort", "breathlessness", "palpitations"];

export const EMERGENCY_WARNING = `Some symptoms you selected may need medical attention. Please consult a qualified healthcare professional, especially if symptoms are severe, sudden or worsening. If you are experiencing a medical emergency, please call emergency services immediately.`;