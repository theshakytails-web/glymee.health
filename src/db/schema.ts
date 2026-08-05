import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

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
  address: text("address"),
  occupation: text("occupation"),
  maritalStatus: text("marital_status"),
  religion: text("religion"),
  education: text("education"),
  chiefComplaint: text("chief_complaint"),
  diagnosis: text("diagnosis"),
  diabetesType: text("diabetes_type"),
  diagnosisDuration: text("diagnosis_duration"),
  currentMedications: text("current_medications"),
  mainConcern: text("main_concern"),
  referralSource: text("referral_source"),
  additionalNotes: text("additional_notes"),
  fee: real("fee").notNull().default(0),
  nextFollowUp: text("next_follow_up"),
  status: text("status", { enum: ["active", "inactive", "pending", "completed"] })
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
  chiefComplaint: text("chief_complaint").notNull().default(""),
  metricsJson: text("metrics_json").notNull(),
  lifestyleJson: text("lifestyle_json").notNull(),
  clinicalHistoryJson: text("clinical_history_json").notNull().default("{}"),
  reviewOfSystemsJson: text("review_of_systems_json").notNull().default("{}"),
  ayurvedicAssessmentJson: text("ayurvedic_assessment_json").notNull().default("{}"),
  actionPlanJson: text("action_plan_json").notNull(),
  clinicalSummary: text("clinical_summary").notNull().default(""),
  previousInvestigations: text("previous_investigations").notNull().default(""),
  reportDataJson: text("report_data_json").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  amount: real("amount").notNull(),
  type: text("type", { enum: ["consultation", "treatment", "medicine", "other"] }).notNull().default("treatment"),
  paymentDate: text("payment_date").notNull(),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const invoices = sqliteTable("invoices", {
  id: text("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  patientId: text("patient_id").notNull(),
  itemsJson: text("items_json").notNull(),
  subtotal: real("subtotal").notNull().default(0),
  discount: real("discount").notNull().default(0),
  taxableAmount: real("taxable_amount").notNull().default(0),
  gstMode: text("gst_mode", {
    enum: ["cgst_sgst", "igst", "none"],
  })
    .notNull()
    .default("cgst_sgst"),
  cgst: real("cgst").notNull().default(0),
  sgst: real("sgst").notNull().default(0),
  igst: real("igst").notNull().default(0),
  grandTotal: real("grand_total").notNull().default(0),
  amountPaid: real("amount_paid").notNull().default(0),
  balanceDue: real("balance_due").notNull().default(0),
  paymentMethod: text("payment_method").notNull().default("UPI"),
  paymentNote: text("payment_note"),
  invoiceDate: text("invoice_date").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const appointments = sqliteTable("appointments", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  type: text("type", { enum: ["appointment", "follow_up"] }).notNull(),
  scheduledDate: text("scheduled_date").notNull(),
  status: text("status", { enum: ["scheduled", "completed", "cancelled"] })
    .notNull()
    .default("scheduled"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const otpCodes = sqliteTable("otp_codes", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  used: integer("used", { mode: "boolean" }).notNull().default(false),
});
