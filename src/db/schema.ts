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

export const deleteInvoices = sqliteTable("delete_invoices", {
  id: text("id").primaryKey(),
  originalInvoiceId: text("original_invoice_id"),
  invoiceNumber: text("invoice_number"),
  patientId: text("patient_id"),
  patientName: text("patient_name"),
  patientPhone: text("patient_phone"),
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
  invoiceDate: text("invoice_date"),
  deletedBy: text("deleted_by"),
  deletedAt: integer("deleted_at", { mode: "timestamp" }).notNull(),
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

export const inventoryItems = sqliteTable("inventory_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull().default("general"),
  quantity: real("quantity").notNull().default(0),
  unit: text("unit").notNull().default("pcs"),
  minQuantity: real("min_quantity").notNull().default(0),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const inventoryUsage = sqliteTable("inventory_usage", {
  id: text("id").primaryKey(),
  itemId: text("item_id").notNull(),
  quantityUsed: real("quantity_used").notNull(),
  notes: text("notes"),
  usedAt: integer("used_at", { mode: "timestamp" }).notNull(),
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
  attempts: integer("attempts").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const rateLimits = sqliteTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: integer("window_start", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const refreshTokens = sqliteTable("refresh_tokens", {
  id: text("id").primaryKey(),
  adminId: text("admin_id").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ─── Assessment System Tables ────────────────────────────────────────────────

export const assessmentDefinitions = sqliteTable("assessment_definitions", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull().default("health_and_safety"),
  estimatedMinutes: integer("estimated_minutes").notNull().default(5),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const assessmentSections = sqliteTable("assessment_sections", {
  id: text("id").primaryKey(),
  assessmentId: text("assessment_id").notNull(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  icon: text("icon"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const assessmentQuestions = sqliteTable("assessment_questions", {
  id: text("id").primaryKey(),
  sectionId: text("section_id").notNull(),
  questionKey: text("question_key").notNull(),
  questionText: text("question_text").notNull(),
  questionType: text("question_type", {
    enum: ["select", "multi_select", "number", "text", "scale", "yes_no"],
  }).notNull(),
  optionsJson: text("options_json"),
  unit: text("unit"),
  minValue: real("min_value"),
  maxValue: real("max_value"),
  placeholder: text("placeholder"),
  helperText: text("helper_text"),
  isRequired: integer("is_required", { mode: "boolean" }).notNull().default(true),
  parentQuestionId: text("parent_question_id"),
  conditionJson: text("condition_json"),
  weight: real("weight").notNull().default(1),
  scoringRulesJson: text("scoring_rules_json"),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const assessmentSubmissions = sqliteTable("assessment_submissions", {
  id: text("id").primaryKey(),
  assessmentSlug: text("assessment_slug").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  heightCm: real("height_cm"),
  weightKg: real("weight_kg"),
  bmi: real("bmi"),
  city: text("city"),
  status: text("status", { enum: ["in_progress", "completed"] })
    .notNull()
    .default("in_progress"),
  currentStep: integer("current_step").notNull().default(0),
  overallScore: real("overall_score"),
  overallStatus: text("overall_status", {
    enum: ["good", "needs_attention", "higher_risk"],
  }),
  scoresJson: text("scores_json"),
  strengthsJson: text("strengths_json"),
  concernsJson: text("concerns_json"),
  recommendationsJson: text("recommendations_json"),
  consentGiven: integer("consent_given", { mode: "boolean" }).notNull().default(false),
  consentText: text("consent_text"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

export const assessmentResponses = sqliteTable("assessment_responses", {
  id: text("id").primaryKey(),
  submissionId: text("submission_id").notNull(),
  questionId: text("question_id").notNull(),
  questionKey: text("question_key").notNull(),
  responseValue: text("response_value").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const assessmentUploads = sqliteTable("assessment_uploads", {
  id: text("id").primaryKey(),
  submissionId: text("submission_id").notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
