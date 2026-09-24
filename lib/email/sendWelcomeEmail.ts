import { buildWelcomeEmail } from "./templates/welcome";
import { getEmailConfig, getResendClient, isEmailShape } from "./client";

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
      "RESEND_API_KEY or RESEND_FROM_EMAIL is not set"
    );
  }
  if (!isEmailShape(config.from.replace(/^.*<|>$/g, ""))) {
    return failure("invalid_from_address", "RESEND_FROM_EMAIL is not valid");
  }

  const { subject, html, text } = buildWelcomeEmail({
    name: input.name,
    memberId: input.memberId,
    discount: input.discount,
    passUrl: input.passUrl,
    qrCode: input.qrCode,
  });

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
