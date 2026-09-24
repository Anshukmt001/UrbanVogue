import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getEmailConfig } from "@/lib/email/client";
import { sendWelcomeEmail } from "@/lib/email/sendWelcomeEmail";
import { buildQrDataUrl, buildPassUrl } from "@/lib/email/member-welcome";
import { isEmailShape } from "@/lib/email/client";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, error: "UNAUTHORIZED" },
      { status: 401 }
    );
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
    const recipient = requested || session.user.email;

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
        note: result.ok
          ? null
          : result.code === "restricted_api_key" || result.code === "invalid_recipient"
            ? "Without a verified domain, Resend only delivers to the account's own email address."
            : null,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
