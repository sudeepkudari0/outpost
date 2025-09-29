import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

    // Validate required columns
    const requiredColumns = ["content", "scheduled_time", "platforms"]
    const missingColumns = requiredColumns.filter((col) => !headers.includes(col))

    if (missingColumns.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required columns: ${missingColumns.join(", ")}`,
        },
        { status: 400 },
      )
    }

    const posts = []
    let imported = 0
    const errors = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      try {
        const values = line.split(",").map((v) => v.trim())
        const post: any = {}

        headers.forEach((header, index) => {
          post[header] = values[index] || ""
        })

        // Validate post data
        if (!post.content || !post.scheduled_time || !post.platforms) {
          errors.push(`Row ${i + 1}: Missing required fields`)
          continue
        }

        // Parse platforms (comma-separated in the platforms column)
        const platforms = post.platforms.split(";").map((p: string) => p.trim())

        // Create post object for Late API
        const postData = {
          content: post.content,
          scheduledTime: new Date(post.scheduled_time).toISOString(),
          platforms: platforms,
          timezone: post.timezone || "UTC",
          media: post.media_url ? [post.media_url] : [],
        }

        // Here you would call the Late API to create the scheduled post
        // For now, we'll just simulate success
        posts.push(postData)
        imported++
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : "Invalid data"}`)
      }
    }

    return NextResponse.json({
      imported,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully imported ${imported} posts${errors.length > 0 ? ` with ${errors.length} errors` : ""}`,
    })
  } catch (error) {
    console.error("CSV import error:", error)
    return NextResponse.json(
      {
        error: "Failed to process CSV file",
      },
      { status: 500 },
    )
  }
}
