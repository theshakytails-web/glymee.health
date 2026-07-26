export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(env),
      });
    }

    // POST /v1/sendemail
    if (request.method === "POST" && url.pathname === "/v1/sendemail") {
      return handleSendEmail(request, env);
    }

    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...corsHeaders(env) },
    });
  },
};

interface Env {
  BREVO_API_KEY: string;
  ENVIRONMENT: string;
}

interface FormData {
  fullName: string;
  age: string;
  gender: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  diabetesType: string;
  diagnosisDuration: string;
  currentMedications: string;
  mainConcern: string;
  referralSource: string;
  additionalNotes: string;
}

const CONFIRMATION_SENDER_EMAIL = "help@glymee.com";
const CONFIRMATION_SENDER_NAME = "Glymee Health";
const ADMIN_SENDER_EMAIL = "noreply@glymee.com";
const ADMIN_SENDER_NAME = "Glymee Health";
const ADMIN_EMAIL = "help@glymee.com";

function corsHeaders(env: Env): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

async function handleSendEmail(request: Request, env: Env): Promise<Response> {
  const headers = { "Content-Type": "application/json", ...corsHeaders(env) };

  try {
    const data: FormData = await request.json();

    if (!data.fullName || !data.email || !data.phone || !data.city || !data.state || !data.gender || !data.age) {
      return new Response(
        JSON.stringify({ message: "Missing required fields: fullName, age, gender, email, phone, city, state" }),
        { status: 400, headers }
      );
    }

    const confirmationHtml = getConfirmationEmail(data);
    const notificationHtml = getAdminNotificationEmail(data);

    // Send confirmation to user (from help@glymee.com)
    await sendBrevoEmail(env.BREVO_API_KEY, {
      sender: { email: CONFIRMATION_SENDER_EMAIL, name: CONFIRMATION_SENDER_NAME },
      to: [{ email: data.email, name: data.fullName }],
      subject: "We've Received Your Consultation Request - Glymee Health",
      htmlContent: confirmationHtml,
      tags: ["consultation", "confirmation"],
    });

    // Send notification to admin (from noreply@glymee.com)
    await sendBrevoEmail(env.BREVO_API_KEY, {
      sender: { email: ADMIN_SENDER_EMAIL, name: ADMIN_SENDER_NAME },
      to: [{ email: ADMIN_EMAIL, name: "Glymee Admin" }],
      subject: `New Consultation Request from ${data.fullName}`,
      htmlContent: notificationHtml,
      replyTo: { email: data.email, name: data.fullName },
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

async function sendBrevoEmail(
  apiKey: string,
  payload: {
    sender: { email: string; name?: string };
    to: { email: string; name?: string }[];
    subject: string;
    htmlContent: string;
    replyTo?: { email: string; name?: string };
    tags?: string[];
  }
): Promise<void> {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: payload.sender,
      to: payload.to,
      subject: payload.subject,
      htmlContent: payload.htmlContent,
      replyTo: payload.replyTo,
      tags: payload.tags,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Brevo API error ${response.status}: ${errorBody}`);
  }
}

// ─── Email Templates ────────────────────────────────────────────────

const LOGO_URL = "https://glymee.com/Glymee_name.png";

function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Glymee Health</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f7f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <tr>
            <td style="background-color:#00647c;padding:32px 40px;text-align:center;">
              <img src="${LOGO_URL}" alt="Glymee" width="180" style="display:block;margin:0 auto 12px;" />
              <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;letter-spacing:0.5px;">Manage Today. Healthy Tomorrow.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8fafb;padding:24px 40px;border-top:1px solid #e8e8e8;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="font-size:12px;color:#888;margin:0 0 4px 0;">&copy; 2026 Glymee Health. All rights reserved.</p>
                    <p style="font-size:12px;color:#888;margin:0;">Pune, Maharashtra, India &bull; <a href="mailto:help@glymee.com" style="color:#00647c;text-decoration:none;">help@glymee.com</a></p>
                  </td>
                  <td align="right">
                    <a href="https://glymee.com/privacy" style="font-size:12px;color:#00647c;text-decoration:none;">Privacy Policy</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function getConfirmationEmail(data: FormData): string {
  return emailWrapper(`
    <h1 style="font-size:24px;font-weight:700;color:#1a1a1a;margin:0 0 8px 0;">Thank You, ${esc(data.fullName)}!</h1>
    <p style="font-size:16px;color:#555;margin:0 0 24px 0;line-height:1.6;">
      We've received your consultation request and our team will reach out to you within <strong style="color:#00647c;">24 hours</strong>.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f9fb;border-radius:8px;padding:24px;margin-bottom:24px;">
      <tr>
        <td>
          <h2 style="font-size:16px;font-weight:600;color:#00647c;margin:0 0 12px 0;">Your Submission Summary</h2>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#333;">
            <tr><td style="padding:4px 0;color:#888;width:140px;">Full Name</td><td style="padding:4px 0;font-weight:500;">${esc(data.fullName)}</td></tr>
            <tr><td style="padding:4px 0;color:#888;">Age / Gender</td><td style="padding:4px 0;font-weight:500;">${esc(data.age)} / ${esc(data.gender)}</td></tr>
            <tr><td style="padding:4px 0;color:#888;">Email</td><td style="padding:4px 0;font-weight:500;">${esc(data.email)}</td></tr>
            <tr><td style="padding:4px 0;color:#888;">Phone</td><td style="padding:4px 0;font-weight:500;">${esc(data.phone)}</td></tr>
            <tr><td style="padding:4px 0;color:#888;">Location</td><td style="padding:4px 0;font-weight:500;">${esc(data.city)}, ${esc(data.state)}</td></tr>
            ${data.diabetesType ? `<tr><td style="padding:4px 0;color:#888;">Diabetes Type</td><td style="padding:4px 0;font-weight:500;">${esc(data.diabetesType)}</td></tr>` : ""}
            ${data.diagnosisDuration ? `<tr><td style="padding:4px 0;color:#888;">Diagnosis Duration</td><td style="padding:4px 0;font-weight:500;">${esc(data.diagnosisDuration)}</td></tr>` : ""}
            ${data.currentMedications ? `<tr><td style="padding:4px 0;color:#888;">Current Medications</td><td style="padding:4px 0;font-weight:500;">${esc(data.currentMedications)}</td></tr>` : ""}
            ${data.mainConcern ? `<tr><td style="padding:4px 0;color:#888;">Main Concern</td><td style="padding:4px 0;font-weight:500;">${esc(data.mainConcern)}</td></tr>` : ""}
            ${data.referralSource ? `<tr><td style="padding:4px 0;color:#888;">Found Us Via</td><td style="padding:4px 0;font-weight:500;">${esc(data.referralSource)}</td></tr>` : ""}
            ${data.additionalNotes ? `<tr><td style="padding:4px 0;color:#888;">Additional Notes</td><td style="padding:4px 0;font-weight:500;">${esc(data.additionalNotes)}</td></tr>` : ""}
          </table>
        </td>
      </tr>
    </table>

    <p style="font-size:14px;color:#555;margin:0 0 16px 0;line-height:1.6;">
      In the meantime, feel free to explore our resources or reply to this email if you have any questions.
    </p>
    <p style="font-size:14px;color:#555;margin:0;line-height:1.6;">
      Best regards,<br/>
      <strong style="color:#00647c;">The Glymee Team</strong>
    </p>
  `);
}

function getAdminNotificationEmail(data: FormData): string {
  return emailWrapper(`
    <h1 style="font-size:22px;font-weight:700;color:#1a1a1a;margin:0 0 8px 0;">New Consultation Request</h1>
    <p style="font-size:15px;color:#555;margin:0 0 24px 0;line-height:1.6;">
      A new consultation form has been submitted on the Glymee website.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f9fb;border-radius:8px;padding:24px;margin-bottom:20px;">
      <tr><td>
        <h2 style="font-size:15px;font-weight:600;color:#00647c;margin:0 0 14px 0;border-bottom:1px solid #d0e8ee;padding-bottom:8px;">Personal Information</h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#333;">
          <tr><td style="padding:5px 0;color:#888;width:150px;">Full Name</td><td style="padding:5px 0;font-weight:500;">${esc(data.fullName)}</td></tr>
          <tr><td style="padding:5px 0;color:#888;">Age</td><td style="padding:5px 0;font-weight:500;">${esc(data.age)}</td></tr>
          <tr><td style="padding:5px 0;color:#888;">Gender</td><td style="padding:5px 0;font-weight:500;">${esc(data.gender)}</td></tr>
        </table>
      </td></tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f9fb;border-radius:8px;padding:24px;margin-bottom:20px;">
      <tr><td>
        <h2 style="font-size:15px;font-weight:600;color:#00647c;margin:0 0 14px 0;border-bottom:1px solid #d0e8ee;padding-bottom:8px;">Contact Information</h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#333;">
          <tr><td style="padding:5px 0;color:#888;width:150px;">Email</td><td style="padding:5px 0;font-weight:500;"><a href="mailto:${esc(data.email)}" style="color:#00647c;text-decoration:none;">${esc(data.email)}</a></td></tr>
          <tr><td style="padding:5px 0;color:#888;">Phone</td><td style="padding:5px 0;font-weight:500;"><a href="tel:${esc(data.phone)}" style="color:#00647c;text-decoration:none;">${esc(data.phone)}</a></td></tr>
          <tr><td style="padding:5px 0;color:#888;">City / State</td><td style="padding:5px 0;font-weight:500;">${esc(data.city)}, ${esc(data.state)}</td></tr>
        </table>
      </td></tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f9fb;border-radius:8px;padding:24px;margin-bottom:20px;">
      <tr><td>
        <h2 style="font-size:15px;font-weight:600;color:#00647c;margin:0 0 14px 0;border-bottom:1px solid #d0e8ee;padding-bottom:8px;">Health Information</h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#333;">
          ${data.diabetesType ? `<tr><td style="padding:5px 0;color:#888;width:150px;">Diabetes Type</td><td style="padding:5px 0;font-weight:500;">${esc(data.diabetesType)}</td></tr>` : ""}
          ${data.diagnosisDuration ? `<tr><td style="padding:5px 0;color:#888;">Duration</td><td style="padding:5px 0;font-weight:500;">${esc(data.diagnosisDuration)}</td></tr>` : ""}
          ${data.currentMedications ? `<tr><td style="padding:5px 0;color:#888;">Medications</td><td style="padding:5px 0;font-weight:500;">${esc(data.currentMedications)}</td></tr>` : ""}
          ${data.mainConcern ? `<tr><td style="padding:5px 0;color:#888;vertical-align:top;">Main Concern</td><td style="padding:5px 0;font-weight:500;">${esc(data.mainConcern)}</td></tr>` : ""}
        </table>
      </td></tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f9fb;border-radius:8px;padding:24px;margin-bottom:20px;">
      <tr><td>
        <h2 style="font-size:15px;font-weight:600;color:#00647c;margin:0 0 14px 0;border-bottom:1px solid #d0e8ee;padding-bottom:8px;">Other Details</h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#333;">
          ${data.referralSource ? `<tr><td style="padding:5px 0;color:#888;width:150px;">Referral Source</td><td style="padding:5px 0;font-weight:500;">${esc(data.referralSource)}</td></tr>` : ""}
          ${data.additionalNotes ? `<tr><td style="padding:5px 0;color:#888;vertical-align:top;">Additional Notes</td><td style="padding:5px 0;font-weight:500;">${esc(data.additionalNotes)}</td></tr>` : ""}
        </table>
      </td></tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:8px 0 0 0;">
          <a href="mailto:${esc(data.email)}?subject=Re:%20Your%20Glymee%20Consultation%20Request" style="display:inline-block;background-color:#00647c;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;">Reply to ${esc(data.fullName)}</a>
        </td>
      </tr>
    </table>
  `);
}

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
