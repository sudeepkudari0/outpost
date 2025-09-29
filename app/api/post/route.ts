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
      // Ensure content is a string for Late API
      let draftContent: string = "";
      if (typeof content === "string") {
        draftContent = content;
      } else if (typeof content === "object" && content !== null) {
        const firstPlatform = platforms?.[0]?.platform;
        const byPlatform = (content as Record<string, unknown>)[firstPlatform];
        if (typeof byPlatform === "string") draftContent = byPlatform;
        else if (
          byPlatform &&
          typeof byPlatform === "object" &&
          typeof (byPlatform as any).caption === "string"
        )
          draftContent = (byPlatform as any).caption as string;
        else {
          const firstValue = Object.values(
            content as Record<string, unknown>
          )[0];
          draftContent = typeof firstValue === "string" ? firstValue : "";
        }
      }

      const draftData = {
        content: draftContent,
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

    // Normalize content: Late API expects string per platform. If client sent
    // an object like { caption, image }, extract caption only.
    const normalizedContent: Record<string, string> = {};
    if (typeof content === "object" && content !== null) {
      Object.entries(content as Record<string, unknown>).forEach(
        ([platform, value]) => {
          if (value && typeof value === "object") {
            const caption = (value as any).caption;
            normalizedContent[platform] =
              typeof caption === "string" ? caption : "";
          } else {
            normalizedContent[platform] = String(value ?? "");
          }
        }
      );
    }

    // Reduce to a single string content for Late API
    let finalContent: string = "";
    const firstPlatform = platforms?.[0]?.platform;
    if (firstPlatform && typeof normalizedContent[firstPlatform] === "string") {
      finalContent = normalizedContent[firstPlatform];
    } else {
      const firstValue = Object.values(normalizedContent)[0];
      finalContent = typeof firstValue === "string" ? firstValue : "";
    }

    const postData = {
      content: finalContent,
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
