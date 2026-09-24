import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, unauthorizedResponse } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Member } from "@/models";
import { getEmailConfig } from "@/lib/email/client";
import { sendAndRecordWelcomeEmail } from "@/lib/email/member-welcome";
import { rateLimit } from "@/lib/rate-limit";

const MAX_BATCH = 25;

function pendingEmailFilter() {
  return {
    email: { $exists: true, $nin: [null, ""] as (string | null)[] },
    welcomeEmailStatus: { $nin: ["sent", "skipped"] as ("sent" | "skipped")[] },
  };
}

export async function POST(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return unauthorizedResponse();
  }

  const rl = rateLimit(request, {
    limit: 10,
    windowMs: 60_000,
    keyParts: ["email-welcome"],
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "RATE_LIMITED", retryAfterSeconds: rl.retryAfterSeconds },
      { status: 429 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const requested = Number(body?.limit);
    const limit = Number.isFinite(requested)
      ? Math.min(MAX_BATCH, Math.max(1, Math.floor(requested)))
      : MAX_BATCH;

    const config = getEmailConfig();
    if (!config.apiKey || !config.from) {
      return NextResponse.json(
        { success: false, error: "EMAIL_NOT_CONFIGURED" },
        { status: 409 }
      );
    }

    await connectToDatabase();

    const queue = await Member.find(pendingEmailFilter())
      .sort({ membershipNumber: 1 })
      .limit(limit)
      .select({
        membershipNumber: 1,
        name: 1,
        email: 1,
        discountPercentage: 1,
      })
      .lean();

    if (queue.length === 0) {
      const remaining = await Member.countDocuments(pendingEmailFilter());
      return NextResponse.json({
        success: true,
        data: { attempted: 0, sent: 0, failed: 0, remaining },
      });
    }

    // Resend allows max 10 API requests/second (sliding window). Send in
    // waves of 8 with 1.1s gaps so two waves never share a 1s window, and
    // retry once if a send still comes back rate-limited.
    const WAVE_SIZE = 8;
    const results: PromiseSettledResult<
      Awaited<ReturnType<typeof sendAndRecordWelcomeEmail>>
    >[] = [];

    for (let start = 0; start < queue.length; start += WAVE_SIZE) {
      if (start > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1100));
      }
      const wave = queue.slice(start, start + WAVE_SIZE);
      const waveResults = await Promise.allSettled(
        wave.map((m) =>
          sendAndRecordWelcomeEmail({
            _id: m._id,
            membershipNumber: m.membershipNumber,
            name: m.name,
            email: m.email,
            discountPercentage: m.discountPercentage,
          })
        )
      );

      for (let j = 0; j < waveResults.length; j++) {
        const r = waveResults[j];
        if (r.status !== "fulfilled" || r.value.ok || r.value.code !== "rate_limited") {
          continue;
        }
        await new Promise((resolve) => setTimeout(resolve, 1200));
        try {
          const m = wave[j];
          waveResults[j] = {
            status: "fulfilled",
            value: await sendAndRecordWelcomeEmail({
              _id: m._id,
              membershipNumber: m.membershipNumber,
              name: m.name,
              email: m.email,
              discountPercentage: m.discountPercentage,
            }),
          };
        } catch (e) {
          waveResults[j] = { status: "rejected", reason: e };
        }
      }
      results.push(...waveResults);
    }

    let sent = 0;
    let failed = 0;
    const errors: { membershipNumber: number; code: string; error: string | null }[] = [];

    results.forEach((r, i) => {
      if (r.status === "rejected") {
        failed += 1;
        errors.push({
          membershipNumber: queue[i].membershipNumber,
          code: "send_failed",
          error: r.reason instanceof Error ? r.reason.message : "unknown",
        });
        return;
      }
      if (r.value.ok) {
        sent += 1;
      } else {
        failed += 1;
        errors.push({
          membershipNumber: r.value.membershipNumber,
          code: r.value.code,
          error: r.value.error,
        });
      }
    });

    const remaining = await Member.countDocuments(pendingEmailFilter());

    return NextResponse.json({
      success: true,
      data: {
        attempted: queue.length,
        sent,
        failed,
        remaining,
        errors: errors.slice(0, 10),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
