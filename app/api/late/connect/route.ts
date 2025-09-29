import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { late } from "@/lib/late";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform } = body;

    if (!platform) {
      return NextResponse.json(
        { error: "Platform is required" },
        { status: 400 }
      );
    }

    const bodyProfileId = body?.profileId as string | undefined;
    const cookieStore = await cookies();
    const cookieProfileId = cookieStore.get("profile_id")?.value;
    const profileId = bodyProfileId ?? cookieProfileId;

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
