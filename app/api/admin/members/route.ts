import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Member } from "@/models";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(
    200,
    Math.max(1, parseInt(searchParams.get("pageSize") || "8", 10))
  );
  const search = searchParams.get("search")?.trim() || "";
  const discount = searchParams.get("discount") || "";
  const status = searchParams.get("status") || "";
  const redeemed = searchParams.get("redeemed") || "";

  try {
    await connectToDatabase();

    const filter: Record<string, unknown> = {};

    if (search) {
      const num = parseInt(search, 10);
      const or: Record<string, unknown>[] = [
        { name: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ];
      if (!isNaN(num)) {
        or.push({ membershipNumber: num });
      }
      filter.$or = or;
    }

    if (discount === "10" || discount === "5") {
      filter.discountPercentage = parseInt(discount, 10);
    }

    if (status === "active" || status === "revoked") {
      filter.status = status;
    }

    if (redeemed === "true") {
      filter.discountRedeemed = true;
    } else if (redeemed === "false") {
      filter.discountRedeemed = false;
    }

    const skip = (page - 1) * pageSize;

    const [members, total] = await Promise.all([
      Member.find(filter)
        .sort({ membershipNumber: 1 })
        .skip(skip)
        .limit(pageSize)
        .select({
          membershipNumber: 1,
          name: 1,
          mobile: 1,
          email: 1,
          discountPercentage: 1,
          status: 1,
          discountRedeemed: 1,
          createdAt: 1,
        })
        .lean(),
      Member.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        members,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
