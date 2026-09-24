import { Resend } from "resend";

export type EmailProvider = "brevo" | "resend";

export interface EmailConfig {
  provider: EmailProvider | null;
  apiKey: string | undefined;
  from: string | undefined;
  replyTo: string | undefined;
}

export function getEmailConfig(): EmailConfig {
  const brevoKey = process.env.BREVO_API_KEY?.trim();
  if (brevoKey) {
    const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();
    const senderName = process.env.BREVO_SENDER_NAME?.trim();
    const from =
      process.env.BREVO_FROM_EMAIL?.trim() ||
      (senderEmail
        ? senderName
          ? `${senderName} <${senderEmail}>`
          : senderEmail
        : undefined);
    return {
      provider: "brevo",
      apiKey: brevoKey,
      from,
      replyTo:
        process.env.BREVO_REPLY_TO_EMAIL?.trim() ||
        process.env.RESEND_REPLY_TO_EMAIL?.trim() ||
        undefined,
    };
  }

  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    return {
      provider: "resend",
      apiKey: resendKey,
      from: process.env.RESEND_FROM_EMAIL?.trim() || undefined,
      replyTo: process.env.RESEND_REPLY_TO_EMAIL?.trim() || undefined,
    };
  }

  return { provider: null, apiKey: undefined, from: undefined, replyTo: undefined };
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

export function extractDisplayName(value: string): string | null {
  const angled = value.match(/^\s*([^<]+?)\s*<[^>]+>$/);
  return angled ? angled[1].trim() : null;
}
