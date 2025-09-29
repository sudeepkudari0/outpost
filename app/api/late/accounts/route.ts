import { type NextRequest, NextResponse } from "next/server";
import { late } from "@/lib/late";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileIdFromQuery = searchParams.get("profileId") || undefined;
    const profileId = profileIdFromQuery;

    if (!profileId) {
      return NextResponse.json(
        { error: "profileId is required" },
        { status: 400 }
      );
    }

    const data = await late.listAccounts(profileId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Accounts fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}
