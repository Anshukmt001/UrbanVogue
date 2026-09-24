import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Member, Settings } from "@/models";

export const dynamic = "force-dynamic";

const DEFAULT_LIMITS = {
  earlyAccessLimit: 100,
  tenPercentLimit: 50,
  fivePercentLimit: 50,
};

export async function GET() {
  try {
    await connectToDatabase();

    const [settings, result] = await Promise.all([
      Settings.findOne().lean(),
      Member.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            tenPercent: {
              $sum: { $cond: [{ $eq: ["$discountPercentage", 10] }, 1, 0] },
            },
            fivePercent: {
              $sum: { $cond: [{ $eq: ["$discountPercentage", 5] }, 1, 0] },
            },
            redeemed: {
              $sum: { $cond: ["$discountRedeemed", 1, 0] },
            },
          },
        },
      ]),
    ]);

    const stats = result[0] ?? {
      total: 0,
      tenPercent: 0,
      fivePercent: 0,
      redeemed: 0,
    };

    const limits = {
      earlyAccessLimit:
        settings?.earlyAccessLimit ?? DEFAULT_LIMITS.earlyAccessLimit,
      tenPercentLimit:
        settings?.tenPercentLimit ?? DEFAULT_LIMITS.tenPercentLimit,
      fivePercentLimit:
        settings?.fivePercentLimit ?? DEFAULT_LIMITS.fivePercentLimit,
    };

    return NextResponse.json({
      success: true,
      data: {
        totalMembers: stats.total,
        tenPercentMembers: stats.tenPercent,
        fivePercentMembers: stats.fivePercent,
        remainingMembers: Math.max(0, limits.earlyAccessLimit - stats.total),
        redeemedMembers: stats.redeemed,
        unredeemedMembers: stats.total - stats.redeemed,
        campaignStatus: settings?.campaignStatus ?? "open",
        allowRegistration: settings?.allowRegistration ?? true,
        earlyAccessOpen:
          (settings?.campaignStatus ?? "open") === "open" &&
          (settings?.allowRegistration ?? true),
        ...limits,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to load member statistics" },
      { status: 500 }
    );
  }
}
