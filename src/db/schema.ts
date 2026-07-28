import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const admins = sqliteTable("admins", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const patients = sqliteTable("patients", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  diabetesType: text("diabetes_type"),
  diagnosisDuration: text("diagnosis_duration"),
  currentMedications: text("current_medications"),
  mainConcern: text("main_concern"),
  referralSource: text("referral_source"),
  additionalNotes: text("additional_notes"),
  status: text("status", { enum: ["active", "inactive", "pending"] })
    .notNull()
    .default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const consultations = sqliteTable("consultations", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  diabetesType: text("diabetes_type"),
  diagnosisDuration: text("diagnosis_duration"),
  currentMedications: text("current_medications"),
  mainConcern: text("main_concern"),
  referralSource: text("referral_source"),
  additionalNotes: text("additional_notes"),
  emailSent: integer("email_sent", { mode: "boolean" }).notNull().default(false),
  status: text("status", { enum: ["new", "contacted", "converted", "closed"] })
    .notNull()
    .default("new"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const clinicalReports = sqliteTable("clinical_reports", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  pdfUrl: text("pdf_url"),
  clinicianName: text("clinician_name").notNull().default(""),
  metricsJson: text("metrics_json").notNull(),
  lifestyleJson: text("lifestyle_json").notNull(),
  actionPlanJson: text("action_plan_json").notNull(),
  clinicalSummary: text("clinical_summary").notNull().default(""),
  previousInvestigations: text("previous_investigations").notNull().default(""),
  reportDataJson: text("report_data_json").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const otpCodes = sqliteTable("otp_codes", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  used: integer("used", { mode: "boolean" }).notNull().default(false),
});
