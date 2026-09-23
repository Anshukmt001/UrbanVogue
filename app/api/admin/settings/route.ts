import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Settings, getOrCreateSettings } from "@/models";

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
        launchDate: settings.launchDate,
        allowRegistration: settings.allowRegistration,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      campaignStatus,
      earlyAccessLimit,
      tenPercentLimit,
      fivePercentLimit,
      launchDate,
      allowRegistration,
    } = body;

    if (
      campaignStatus !== undefined &&
      !["open", "paused", "sold_out"].includes(campaignStatus)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid campaign status" },
        { status: 400 }
      );
    }

    if (earlyAccessLimit !== undefined) {
      const num = parseInt(String(earlyAccessLimit), 10);
      if (isNaN(num) || num < 1 || num > 10000) {
        return NextResponse.json(
          { success: false, error: "Invalid early access limit" },
          { status: 400 }
        );
      }
    }

    if (tenPercentLimit !== undefined) {
      const num = parseInt(String(tenPercentLimit), 10);
      if (isNaN(num) || num < 0) {
        return NextResponse.json(
          { success: false, error: "Invalid 10% limit" },
          { status: 400 }
        );
      }
    }

    if (fivePercentLimit !== undefined) {
      const num = parseInt(String(fivePercentLimit), 10);
      if (isNaN(num) || num < 0) {
        return NextResponse.json(
          { success: false, error: "Invalid 5% limit" },
          { status: 400 }
        );
      }
    }

    const t10 = parseInt(
      String(tenPercentLimit !== undefined ? tenPercentLimit : 100),
      10
    );
    const t5 = parseInt(
      String(fivePercentLimit !== undefined ? fivePercentLimit : 50),
      10
    );
    const max = parseInt(
      String(earlyAccessLimit !== undefined ? earlyAccessLimit : 150),
      10
    );

    if (t10 + t5 > max) {
      return NextResponse.json(
        {
          success: false,
          error: "10% limit + 5% limit cannot exceed maximum members",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const update: Record<string, unknown> = {};
    if (campaignStatus !== undefined) update.campaignStatus = campaignStatus;
    if (earlyAccessLimit !== undefined)
      update.earlyAccessLimit = parseInt(String(earlyAccessLimit), 10);
    if (tenPercentLimit !== undefined)
      update.tenPercentLimit = parseInt(String(tenPercentLimit), 10);
    if (fivePercentLimit !== undefined)
      update.fivePercentLimit = parseInt(String(fivePercentLimit), 10);
    if (launchDate !== undefined)
      update.launchDate = launchDate ? new Date(launchDate) : null;
    if (allowRegistration !== undefined)
      update.allowRegistration = Boolean(allowRegistration);

    const settings = await Settings.findOneAndUpdate({}, update, {
      new: true,
      upsert: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        campaignStatus: settings.campaignStatus,
        earlyAccessLimit: settings.earlyAccessLimit,
        tenPercentLimit: settings.tenPercentLimit,
        fivePercentLimit: settings.fivePercentLimit,
        launchDate: settings.launchDate,
        allowRegistration: settings.allowRegistration,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
