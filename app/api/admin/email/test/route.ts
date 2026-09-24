import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, unauthorizedResponse } from "@/lib/admin-auth";
import { getEmailConfig } from "@/lib/email/client";
import { sendWelcomeEmail } from "@/lib/email/sendWelcomeEmail";
import { buildQrDataUrl, buildPassUrl } from "@/lib/email/member-welcome";
import { isEmailShape, type EmailProvider } from "@/lib/email/client";
import { rateLimit } from "@/lib/rate-limit";

function describeFailureNote(
  provider: EmailProvider | null,
  code: string
): string | null {
  if (provider === "brevo") {
    if (code === "invalid_from_address") {
      return "Sender not verified — in Brevo go to Senders and verify this email address (they send you a code).";
    }
    if (code === "invalid_api_key") {
      return "Invalid Brevo API key — check BREVO_API_KEY in your environment variables.";
    }
    if (code === "daily_quota_exceeded") {
      return "Brevo free plan daily limit (300 emails/day) reached — try again tomorrow.";
    }
    if (code === "invalid_recipient") {
      return "Brevo rejected the recipient address — check it for typos.";
    }
    return null;
  }
  if (code === "restricted_api_key" || code === "invalid_recipient") {
    return "Without a verified domain, Resend only delivers to the account's own email address.";
  }
  return null;
}

export async function POST(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return unauthorizedResponse();
  }

  const rl = rateLimit(request, {
    limit: 5,
    windowMs: 60_000,
    keyParts: ["email-test"],
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "RATE_LIMITED", retryAfterSeconds: rl.retryAfterSeconds },
      { status: 429 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const requested = typeof body?.email === "string" ? body.email.trim() : "";
    const recipient = requested || admin.email;

    if (!recipient || !isEmailShape(recipient.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: "INVALID_RECIPIENT" },
        { status: 400 }
      );
    }

    const config = getEmailConfig();
    if (!config.apiKey || !config.from) {
      return NextResponse.json(
        { success: false, error: "EMAIL_NOT_CONFIGURED" },
        { status: 409 }
      );
    }

    const qrCode = await buildQrDataUrl(1);

    const result = await sendWelcomeEmail({
      name: "Test Member",
      email: recipient,
      memberId: 1,
      discount: 10,
      passUrl: buildPassUrl(1),
      qrCode,
    });

    return NextResponse.json({
      success: result.ok,
      data: {
        to: recipient,
        from: config.from,
        status: result.ok ? "sent" : "failed",
        code: result.code,
        messageId: result.messageId,
        error: result.error,
        note: result.ok ? null : describeFailureNote(config.provider, result.code),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
