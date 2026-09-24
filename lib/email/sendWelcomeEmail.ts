import { buildWelcomeEmail } from "./templates/welcome";
import {
  getEmailConfig,
  getResendClient,
  isEmailShape,
  extractEmailAddress,
  extractDisplayName,
  type EmailConfig,
} from "./client";

export type WelcomeEmailErrorCode =
  | "not_configured"
  | "invalid_recipient"
  | "invalid_from_address"
  | "invalid_api_key"
  | "restricted_api_key"
  | "daily_quota_exceeded"
  | "monthly_quota_exceeded"
  | "rate_limited"
  | "send_failed";

export interface SendWelcomeEmailInput {
  name: string;
  email: string | undefined | null;
  memberId: number;
  discount: number;
  passUrl?: string;
  qrCode?: string;
}

export interface SendWelcomeEmailResult {
  ok: boolean;
  code: "sent" | WelcomeEmailErrorCode;
  messageId: string | null;
  error: string | null;
}

const ERROR_CODE_MAP: Partial<Record<string, WelcomeEmailErrorCode>> = {
  invalid_from_address: "invalid_from_address",
  invalid_api_key: "invalid_api_key",
  missing_api_key: "invalid_api_key",
  restricted_api_key: "restricted_api_key",
  daily_quota_exceeded: "daily_quota_exceeded",
  monthly_quota_exceeded: "monthly_quota_exceeded",
  rate_limit_exceeded: "rate_limited",
  validation_error: "invalid_recipient",
};

function failure(
  code: WelcomeEmailErrorCode,
  error: string | null = null
): SendWelcomeEmailResult {
  return { ok: false, code, messageId: null, error };
}

function mapBrevoError(status: number, code: string, message: string): WelcomeEmailErrorCode {
  const lower = `${code} ${message}`.toLowerCase();
  if (status === 401 || status === 403) {
    if (lower.includes("sender") || lower.includes("verif")) {
      return "invalid_from_address";
    }
    return "invalid_api_key";
  }
  if (status === 429 || lower.includes("rate")) return "rate_limited";
  if (lower.includes("send limit") || lower.includes("quota")) return "daily_quota_exceeded";
  if (lower.includes("sender") || lower.includes("verif")) return "invalid_from_address";
  if (status === 400 || status === 422) return "invalid_recipient";
  return "send_failed";
}

async function sendViaBrevo(
  config: EmailConfig,
  recipient: string,
  subject: string,
  html: string,
  text: string
): Promise<SendWelcomeEmailResult> {
  const fromEmail = config.from ? extractEmailAddress(config.from) : null;
  if (!config.apiKey || !fromEmail) {
    return failure("not_configured", "BREVO_API_KEY or BREVO_FROM_EMAIL is not valid");
  }
  const fromName = config.from ? extractDisplayName(config.from) : null;
  const replyToEmail = config.replyTo ? extractEmailAddress(config.replyTo) : null;

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": config.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: fromEmail, ...(fromName ? { name: fromName } : {}) },
        to: [{ email: recipient }],
        subject,
        htmlContent: html,
        textContent: text,
        ...(replyToEmail ? { replyTo: { email: replyToEmail } } : {}),
      }),
      cache: "no-store",
    });

    if (res.ok) {
      const body = (await res.json().catch(() => ({}))) as { messageId?: string };
      return { ok: true, code: "sent", messageId: body.messageId ?? null, error: null };
    }

    const body = (await res.json().catch(() => ({}))) as {
      code?: string;
      message?: string;
    };
    const code = mapBrevoError(res.status, body.code ?? "", body.message ?? res.statusText);
    return failure(code, `${body.code ?? res.status}: ${body.message ?? res.statusText}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return failure("send_failed", message);
  }
}

export async function sendWelcomeEmail(
  input: SendWelcomeEmailInput
): Promise<SendWelcomeEmailResult> {
  const email = (input.email ?? "").trim().toLowerCase();
  if (!email) {
    return failure("invalid_recipient", "No recipient address");
  }
  if (!isEmailShape(email)) {
    return failure("invalid_recipient", "Recipient address is not valid");
  }

  const config = getEmailConfig();
  if (!config.apiKey || !config.from) {
    return failure(
      "not_configured",
      "Email provider is not configured (set BREVO_API_KEY + BREVO_FROM_EMAIL, or RESEND_API_KEY + RESEND_FROM_EMAIL)"
    );
  }
  if (!isEmailShape(config.from.replace(/^.*<|>$/g, ""))) {
    return failure("invalid_from_address", "FROM email address is not valid");
  }

  const { subject, html, text } = buildWelcomeEmail({
    name: input.name,
    memberId: input.memberId,
    discount: input.discount,
    passUrl: input.passUrl,
    qrCode: input.qrCode,
  });

  if (config.provider === "brevo") {
    return sendViaBrevo(config, email, subject, html, text);
  }

  try {
    const resend = getResendClient(config.apiKey);
    const { data, error } = await resend.emails.send({
      from: config.from,
      to: email,
      subject,
      html,
      text,
      ...(config.replyTo ? { replyTo: config.replyTo } : {}),
    });

    if (error) {
      const code = ERROR_CODE_MAP[error.name] ?? "send_failed";
      return failure(code, `${error.name}: ${error.message}`);
    }

    return {
      ok: true,
      code: "sent",
      messageId: data?.id ?? null,
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return failure("send_failed", message);
  }
}
