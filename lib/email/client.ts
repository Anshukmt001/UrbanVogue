import { Resend } from "resend";

export interface EmailConfig {
  apiKey: string | undefined;
  from: string | undefined;
  replyTo: string | undefined;
}

export function getEmailConfig(): EmailConfig {
  return {
    apiKey: process.env.RESEND_API_KEY?.trim() || undefined,
    from: process.env.RESEND_FROM_EMAIL?.trim() || undefined,
    replyTo: process.env.RESEND_REPLY_TO_EMAIL?.trim() || undefined,
  };
}

let cachedClient: Resend | null = null;

export function getResendClient(apiKey: string): Resend {
  if (!cachedClient) {
    cachedClient = new Resend(apiKey);
  }
  return cachedClient;
}

export function isEmailShape(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function extractEmailAddress(value: string): string | null {
  const angled = value.match(/<([^>]+)>/);
  const email = (angled ? angled[1] : value).trim();
  return isEmailShape(email) ? email.toLowerCase() : null;
}
