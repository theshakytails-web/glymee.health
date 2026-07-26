import { BrevoClient } from "@getbrevo/brevo";
import { getOtpEmail } from "./email-templates";

let _brevo: BrevoClient | null = null;

export function getBrevo(): BrevoClient {
  if (!_brevo) {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      throw new Error("BREVO_API_KEY environment variable is not set");
    }
    _brevo = new BrevoClient({ apiKey });
  }
  return _brevo;
}

export const CONFIRMATION_SENDER_EMAIL = "help@glymee.com";
export const CONFIRMATION_SENDER_NAME = "Glymee Health";
export const ADMIN_SENDER_EMAIL = "noreply@glymee.com";
export const ADMIN_SENDER_NAME = "Glymee Health";
export const ADMIN_EMAIL = "glymee.health@gmail.com";

export async function sendOtpEmail(
  to: string,
  code: string
): Promise<boolean> {
  try {
    const brevo = getBrevo();
    const html = getOtpEmail(code);
    await brevo.transactionalEmails.sendTransacEmail({
      sender: { email: CONFIRMATION_SENDER_EMAIL, name: CONFIRMATION_SENDER_NAME },
      to: [{ email: to }],
      subject: `Your Glymee Admin Login Code: ${code}`,
      htmlContent: html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return false;
  }
}
