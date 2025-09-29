import { type NextRequest, NextResponse } from "next/server";
import { late } from "@/lib/late";

export async function POST(request: NextRequest) {
  try {
    const { platform } = await request.json();

    if (!platform) {
      return NextResponse.json(
        { error: "Platform is required" },
        { status: 400 }
      );
    }

    const { profileId: bodyProfileId } = await request.json();
    const profileId = bodyProfileId;

    if (!profileId) {
      return NextResponse.json(
        { error: "profileId is required" },
        { status: 400 }
      );
    }

    const connectUrl = late.buildConnectUrl(
      platform,
      profileId,
      `${request.nextUrl.origin}/dashboard/connections?connected=${platform}`
    );

    return NextResponse.json({
      connectUrl,
    });
  } catch (error) {
    console.error("Connect error:", error);
    return NextResponse.json(
      { error: "Failed to generate connect URL" },
      { status: 500 }
    );
  }
}
