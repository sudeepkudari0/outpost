import { type NextRequest, NextResponse } from "next/server";
import { late } from "@/lib/late";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const limitParam = searchParams.get("limit");
    const after = searchParams.get("after") || undefined;
    const profileId = searchParams.get("profileId") || undefined;
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const data = await late.listPosts({ status, limit, after, profileId });

    return NextResponse.json({
      posts: data.posts ?? [],
      after: (data as any).after,
      before: (data as any).before,
    });
  } catch (error) {
    console.error("Posts fetch error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch posts", details: message },
      { status: 500 }
    );
  }
}
