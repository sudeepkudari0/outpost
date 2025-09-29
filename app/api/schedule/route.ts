import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { platforms, content, mediaItems, scheduledFor, timezone } = await request.json()

    const response = await fetch(`${process.env.NEXT_PUBLIC_LATE_BASE}/api/posts/schedule`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LATE_API_KEY}`,
      },
      body: JSON.stringify({
        platforms,
        content,
        mediaItems,
        scheduledFor,
        timezone,
        profileId: process.env.NEXT_PUBLIC_LATE_PROFILE_ID,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to schedule posts")
    }

    return NextResponse.json({
      success: true,
      scheduledPosts: data.posts,
      message: "Posts scheduled successfully",
    })
  } catch (error) {
    console.error("Schedule API error:", error)
    return NextResponse.json({ error: "Failed to schedule posts" }, { status: 500 })
  }
}
