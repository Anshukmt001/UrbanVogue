import { NextResponse } from "next/server";
import Member from "@/models/Member";
import Redemption from "@/models/Redemption";
import Counter from "@/models/Counter";
import { getOrCreateSettings } from "@/models/Settings";
import { connectToDatabase } from "@/lib/mongodb";

export async function DELETE() {
  try {
    await connectToDatabase();
    const [memberResult, redemptionResult] = await Promise.all([
      Member.deleteMany({}),
      Redemption.deleteMany({}),
    ]);
    await Counter.deleteMany({});
    const settings = await getOrCreateSettings();
    settings.campaignStatus = "open";
    settings.allowRegistration = true;
    settings.earlyAccessLimit = 100;
    settings.tenPercentLimit = 50;
    settings.fivePercentLimit = 50;
    settings.launchDate = null;
    await settings.save();
    return NextResponse.json({
      success: true,
      db: true,
      membersDeleted: memberResult.deletedCount,
      redemptionsDeleted: redemptionResult.deletedCount,
    });
  } catch {
    return NextResponse.json({
      success: false,
      db: false,
      message: "Database unavailable — frontend state was still reset.",
    });
  }
}