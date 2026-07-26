import { BrevoClient } from "@getbrevo/brevo";

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

export const SENDER_EMAIL = "noreply@glymee.com";
export const SENDER_NAME = "Glymee Health";
export const ADMIN_EMAIL = "help@glymee.com";
