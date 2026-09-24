import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Member, getOrCreateSettings } from "@/models";

export async function GET() {
  try {
    await connectToDatabase();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const settings = await getOrCreateSettings();
    const limit = settings.earlyAccessLimit;
    const tenPercentLimit = settings.tenPercentLimit;
    const fivePercentLimit = settings.fivePercentLimit;
    const tierOnePercent =
      typeof settings.tierOnePercent === "number" ? settings.tierOnePercent : 10;
    const tierTwoPercent =
      typeof settings.tierTwoPercent === "number" ? settings.tierTwoPercent : 5;

    const [
      totalMembers,
      tenPercentMembers,
      fivePercentMembers,
      redeemed,
      registrationsToday,
    ] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ discountPercentage: tierOnePercent }),
      Member.countDocuments({ discountPercentage: tierTwoPercent }),
      Member.countDocuments({ discountRedeemed: true }),
      Member.countDocuments({ createdAt: { $gte: today } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalMembers,
        tenPercentMembers,
        fivePercentMembers,
        tierOnePercent,
        tierTwoPercent,
        remaining: Math.max(0, limit - totalMembers),
        redeemed,
        unredeemed: totalMembers - redeemed,
        registrationsToday,
        totalLimit: limit,
        tenPercentLimit,
        fivePercentLimit,
        tenPercentRemaining: Math.max(0, tenPercentLimit - tenPercentMembers),
        fivePercentRemaining: Math.max(0, fivePercentLimit - fivePercentMembers),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
