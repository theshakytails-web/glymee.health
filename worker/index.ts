import {
  getConfirmationEmail,
  getAdminNotificationEmail,
  type ConsultationFormData,
} from "../src/lib/email-templates";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (request.method === "POST" && url.pathname === "/v1/sendemail") {
      return handleSendEmail(request, env);
    }

    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  },
};

interface Env {
  BREVO_API_KEY: string;
}

const CONFIRMATION_SENDER_EMAIL = "help@glymee.com";
const CONFIRMATION_SENDER_NAME = "Glymee Health";
const ADMIN_SENDER_EMAIL = "noreply@glymee.com";
const ADMIN_SENDER_NAME = "Glymee Health";
const ADMIN_EMAIL = "glymee.health@gmail.com";

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// ─── Rate Limiting (in-memory, per-isolate) ─────────────────────────

const rateLimitStore = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 5;
const MAX_PER_EMAIL = 3;

function checkRateLimit(key: string, limit: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

function clientIp(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}

function validateForm(data: Record<string, unknown>): string | null {
  if (!data || typeof data !== "object") return "Invalid request body";
  if (data.fullName === undefined) return "Missing required fields: fullName, age, gender, email, phone, city, state";

  const str = (v: unknown, maxLen: number): string => {
    if (v == null) return "";
    const s = String(v);
    return s.length > maxLen ? "" : s.trim();
  };

  const fullName = str(data.fullName, 120);
  const age = str(data.age, 3);
  const gender = str(data.gender, 30);
  const email = str(data.email, 200);
  const phone = str(data.phone, 20);
  const city = str(data.city, 80);
  const state = str(data.state, 80);

  if (!fullName || !age || !gender || !email || !phone || !city || !state) {
    return "Missing required fields: fullName, age, gender, email, phone, city, state";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email address";
  if (!/^[0-9+()\-\s]{7,20}$/.test(phone)) return "Invalid phone number";
  const ageNum = Number(age);
  if (!Number.isInteger(ageNum) || ageNum < 1 || ageNum > 120) return "Invalid age";

  const optionalFields: [string, number][] = [
    ["diabetesType", 100],
    ["diagnosisDuration", 100],
    ["currentMedications", 500],
    ["mainConcern", 2000],
    ["referralSource", 100],
    ["additionalNotes", 2000],
  ];
  for (const [field, maxLen] of optionalFields) {
    if (data[field] != null && String(data[field]).length > maxLen) {
      return `${field} exceeds maximum length of ${maxLen} characters`;
    }
  }

  return null;
}

// ─── Send via Brevo ─────────────────────────────────────────────────

interface EmailPayload {
  sender: { email: string; name: string };
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  replyTo?: { email: string; name?: string };
  tags?: string[];
}

async function sendBrevoEmail(apiKey: string, payload: EmailPayload): Promise<void> {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Brevo API error ${response.status}: ${err}`);
  }
}

// ─── Request Handler ────────────────────────────────────────────────

async function handleSendEmail(request: Request, env: Env): Promise<Response> {
  const headers = { "Content-Type": "application/json", ...corsHeaders() };

  try {
    const data: Record<string, unknown> = await request.json();

    const validationError = validateForm(data);
    if (validationError) {
      return new Response(
        JSON.stringify({ message: validationError }),
        { status: 400, headers }
      );
    }

    const email = String(data.email).toLowerCase().trim();
    const ip = clientIp(request);
    if (!checkRateLimit(`sendemail:ip:${ip}`, MAX_PER_IP)) {
      return new Response(
        JSON.stringify({ message: "Too many requests. Please try again later." }),
        { status: 429, headers }
      );
    }
    if (!checkRateLimit(`sendemail:email:${email}`, MAX_PER_EMAIL)) {
      return new Response(
        JSON.stringify({ message: "Too many requests. Please try again later." }),
        { status: 429, headers }
      );
    }

    const confirmationHtml = getConfirmationEmail(data as unknown as ConsultationFormData);
    const notificationHtml = getAdminNotificationEmail(data as unknown as ConsultationFormData);

    // 1. Confirmation to user (from help@glymee.com)
    await sendBrevoEmail(env.BREVO_API_KEY, {
      sender: { email: CONFIRMATION_SENDER_EMAIL, name: CONFIRMATION_SENDER_NAME },
      to: [{ email, name: String(data.fullName) }],
      subject: "We've Received Your Consultation Request - Glymee Health",
      htmlContent: confirmationHtml,
      tags: ["consultation", "confirmation"],
    });

    // 2. Notification to admin (from noreply@glymee.com → gmail)
    await sendBrevoEmail(env.BREVO_API_KEY, {
      sender: { email: ADMIN_SENDER_EMAIL, name: ADMIN_SENDER_NAME },
      to: [{ email: ADMIN_EMAIL, name: "Glymee Admin" }],
      subject: `New Consultation Request from ${data.fullName}`,
      htmlContent: notificationHtml,
      replyTo: { email, name: String(data.fullName) },
      tags: ["consultation", "notification"],
    });

    return new Response(
      JSON.stringify({ message: "Consultation request received successfully" }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Error processing consultation form:", error);
    return new Response(
      JSON.stringify({ message: "Failed to process request" }),
      { status: 500, headers }
    );
  }
}

// ─── Email Templates ────────────────────────────────────────────────
// Shared with the Next.js app in src/lib/email-templates.ts (single source).
