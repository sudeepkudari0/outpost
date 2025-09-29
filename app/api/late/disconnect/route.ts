import { type NextRequest, NextResponse } from "next/server";
import { late } from "@/lib/late";

export async function POST(request: NextRequest) {
  try {
    const { platform, accountId } = await request.json();

    if (!platform || !accountId) {
      return NextResponse.json(
        { error: "Platform and account ID are required" },
        { status: 400 }
      );
    }

    await late.disconnectAccount(accountId);

    return NextResponse.json({
      success: true,
      message: `${platform} account disconnected successfully`,
    });
  } catch (error) {
    console.error("Disconnect error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
