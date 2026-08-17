CREATE TABLE `admins` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admins_email_unique` ON `admins` (`email`);--> statement-breakpoint
CREATE TABLE `appointments` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`type` text NOT NULL,
	`scheduled_date` text NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `assessment_definitions` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`icon` text DEFAULT 'health_and_safety' NOT NULL,
	`estimated_minutes` integer DEFAULT 5 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assessment_definitions_slug_unique` ON `assessment_definitions` (`slug`);--> statement-breakpoint
CREATE TABLE `assessment_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`section_id` text NOT NULL,
	`question_key` text NOT NULL,
	`question_text` text NOT NULL,
	`question_type` text NOT NULL,
	`options_json` text,
	`unit` text,
	`min_value` real,
	`max_value` real,
	`placeholder` text,
	`helper_text` text,
	`is_required` integer DEFAULT true NOT NULL,
	`parent_question_id` text,
	`condition_json` text,
	`weight` real DEFAULT 1 NOT NULL,
	`scoring_rules_json` text,
	`display_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `assessment_responses` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`question_id` text NOT NULL,
	`question_key` text NOT NULL,
	`response_value` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `assessment_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`assessment_id` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`icon` text,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `assessment_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`assessment_slug` text NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`age` integer NOT NULL,
	`gender` text NOT NULL,
	`height_cm` real,
	`weight_kg` real,
	`bmi` real,
	`city` text,
	`status` text DEFAULT 'in_progress' NOT NULL,
	`current_step` integer DEFAULT 0 NOT NULL,
	`overall_score` real,
	`overall_status` text,
	`scores_json` text,
	`strengths_json` text,
	`concerns_json` text,
	`recommendations_json` text,
	`consent_given` integer DEFAULT false NOT NULL,
	`consent_text` text,
	`created_at` integer NOT NULL,
	`completed_at` integer
);
--> statement-breakpoint
CREATE TABLE `assessment_uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`file_name` text NOT NULL,
	`file_path` text NOT NULL,
	`file_type` text NOT NULL,
	`file_size` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `clinical_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`pdf_url` text,
	`clinician_name` text DEFAULT '' NOT NULL,
	`chief_complaint` text DEFAULT '' NOT NULL,
	`metrics_json` text NOT NULL,
	`lifestyle_json` text NOT NULL,
	`clinical_history_json` text DEFAULT '{}' NOT NULL,
	`review_of_systems_json` text DEFAULT '{}' NOT NULL,
	`ayurvedic_assessment_json` text DEFAULT '{}' NOT NULL,
	`action_plan_json` text NOT NULL,
	`clinical_summary` text DEFAULT '' NOT NULL,
	`previous_investigations` text DEFAULT '' NOT NULL,
	`report_data_json` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `consultations` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`age` integer NOT NULL,
	`gender` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`diabetes_type` text,
	`diagnosis_duration` text,
	`current_medications` text,
	`main_concern` text,
	`referral_source` text,
	`additional_notes` text,
	`email_sent` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `delete_invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`original_invoice_id` text,
	`invoice_number` text,
	`patient_id` text,
	`patient_name` text,
	`patient_phone` text,
	`items_json` text NOT NULL,
	`subtotal` real DEFAULT 0 NOT NULL,
	`discount` real DEFAULT 0 NOT NULL,
	`taxable_amount` real DEFAULT 0 NOT NULL,
	`gst_mode` text DEFAULT 'cgst_sgst' NOT NULL,
	`cgst` real DEFAULT 0 NOT NULL,
	`sgst` real DEFAULT 0 NOT NULL,
	`igst` real DEFAULT 0 NOT NULL,
	`grand_total` real DEFAULT 0 NOT NULL,
	`amount_paid` real DEFAULT 0 NOT NULL,
	`balance_due` real DEFAULT 0 NOT NULL,
	`payment_method` text DEFAULT 'UPI' NOT NULL,
	`payment_note` text,
	`invoice_date` text,
	`deleted_by` text,
	`deleted_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inventory_items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text DEFAULT 'general' NOT NULL,
	`quantity` real DEFAULT 0 NOT NULL,
	`unit` text DEFAULT 'pcs' NOT NULL,
	`min_quantity` real DEFAULT 0 NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inventory_usage` (
	`id` text PRIMARY KEY NOT NULL,
	`item_id` text NOT NULL,
	`quantity_used` real NOT NULL,
	`notes` text,
	`used_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_number` text NOT NULL,
	`patient_id` text NOT NULL,
	`items_json` text NOT NULL,
	`subtotal` real DEFAULT 0 NOT NULL,
	`discount` real DEFAULT 0 NOT NULL,
	`taxable_amount` real DEFAULT 0 NOT NULL,
	`gst_mode` text DEFAULT 'cgst_sgst' NOT NULL,
	`cgst` real DEFAULT 0 NOT NULL,
	`sgst` real DEFAULT 0 NOT NULL,
	`igst` real DEFAULT 0 NOT NULL,
	`grand_total` real DEFAULT 0 NOT NULL,
	`amount_paid` real DEFAULT 0 NOT NULL,
	`balance_due` real DEFAULT 0 NOT NULL,
	`payment_method` text DEFAULT 'UPI' NOT NULL,
	`payment_note` text,
	`invoice_date` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoices_invoice_number_unique` ON `invoices` (`invoice_number`);--> statement-breakpoint
CREATE TABLE `otp_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`code` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used` integer DEFAULT false NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`age` integer NOT NULL,
	`gender` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`address` text,
	`occupation` text,
	`marital_status` text,
	`religion` text,
	`education` text,
	`chief_complaint` text,
	`diagnosis` text,
	`diabetes_type` text,
	`diagnosis_duration` text,
	`current_medications` text,
	`main_concern` text,
	`referral_source` text,
	`additional_notes` text,
	`fee` real DEFAULT 0 NOT NULL,
	`next_follow_up` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`amount` real NOT NULL,
	`type` text DEFAULT 'treatment' NOT NULL,
	`payment_date` text NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`window_start` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `refresh_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`admin_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `refresh_tokens_token_hash_unique` ON `refresh_tokens` (`token_hash`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
