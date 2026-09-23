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

    const [
      totalMembers,
      tenPercentMembers,
      fivePercentMembers,
      redeemed,
      registrationsToday,
    ] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ discountPercentage: 10 }),
      Member.countDocuments({ discountPercentage: 5 }),
      Member.countDocuments({ discountRedeemed: true }),
      Member.countDocuments({ createdAt: { $gte: today } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalMembers,
        tenPercentMembers,
        fivePercentMembers,
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
