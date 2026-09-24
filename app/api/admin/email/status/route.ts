import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Member } from "@/models";
import { getEmailConfig } from "@/lib/email/client";
import { getBaseUrl } from "@/lib/email/member-welcome";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, error: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  try {
    await connectToDatabase();

    const [
      totalMembers,
      withEmail,
      sent,
      pending,
      failed,
      skipped,
    ] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ email: { $exists: true, $nin: [null, ""] } }),
      Member.countDocuments({ welcomeEmailStatus: "sent" }),
      Member.countDocuments({
        email: { $exists: true, $nin: [null, ""] },
        welcomeEmailStatus: { $nin: ["sent", "failed", "skipped"] },
      }),
      Member.countDocuments({ welcomeEmailStatus: "failed" }),
      Member.countDocuments({ welcomeEmailStatus: "skipped" }),
    ]);

    const config = getEmailConfig();

    return NextResponse.json({
      success: true,
      data: {
        totalMembers,
        withEmail,
        noEmail: totalMembers - withEmail,
        sent,
        pending,
        failed,
        skipped,
        remaining: Math.max(0, withEmail - sent),
        configured: Boolean(config.apiKey && config.from),
        from: config.from ?? null,
        replyTo: config.replyTo ?? null,
        hasApiKey: Boolean(config.apiKey),
        baseUrl: getBaseUrl(),
        dailyQuota: 100,
        monthlyQuota: 3000,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
