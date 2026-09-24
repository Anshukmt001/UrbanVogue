import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getOrCreateSettings } from "@/models";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const settings = await getOrCreateSettings();
    return NextResponse.json({
      success: true,
      data: {
        campaignStatus: settings.campaignStatus,
        earlyAccessLimit: settings.earlyAccessLimit,
        tenPercentLimit: settings.tenPercentLimit,
        fivePercentLimit: settings.fivePercentLimit,
        tierOnePercent:
          typeof settings.tierOnePercent === "number"
            ? settings.tierOnePercent
            : 10,
        tierTwoPercent:
          typeof settings.tierTwoPercent === "number"
            ? settings.tierTwoPercent
            : 5,
        allowRegistration: settings.allowRegistration,
        launchDate: settings.launchDate,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
