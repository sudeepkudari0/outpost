import { type NextRequest, NextResponse } from "next/server";
import { late } from "@/lib/late";

export async function POST(request: NextRequest) {
  try {
    const {
      platforms,
      content,
      mediaItems,
      publishingOption = "now",
      scheduledFor,
      timezone = "America/Los_Angeles",
      tags,
    } = await request.json();

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { error: "Platforms array is required" },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (publishingOption === "draft") {
      const draftData = {
        content,
        platforms: platforms.map((p) => ({
          platform: p.platform,
          accountId: p.accountId,
          platformSpecificData: p.platformSpecificData || {},
        })),
        mediaItems: mediaItems || [],
        tags: tags || [],
        createdAt: new Date().toISOString(),
        status: "draft",
      };

      const result = await late.createDraft(draftData);
      return NextResponse.json({
        message: "Draft saved successfully",
        draftId: result.id,
      });
    }

    const postData = {
      content,
      platforms: platforms.map((p) => ({
        platform: p.platform,
        accountId: p.accountId,
        platformSpecificData: p.platformSpecificData || {},
      })),
      mediaItems: mediaItems || [],
      tags: tags || [],
      ...(publishingOption === "schedule"
        ? {
            scheduledFor,
            timezone,
          }
        : {
            scheduledFor: null,
          }),
    };

    console.log("[v0] Posting to Late API:", postData);

    const result = await late.createPost(postData);

    const message =
      publishingOption === "schedule"
        ? "Post scheduled successfully"
        : "Post published successfully";

    return NextResponse.json({
      message,
      postId: result.id,
      result,
    });
  } catch (error) {
    console.error("Post error:", error);
    return NextResponse.json(
      { error: "Failed to process post" },
      { status: 500 }
    );
  }
}
