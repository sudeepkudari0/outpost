import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/mov",
      "video/avi",
      "video/quicktime",
    ]

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            error: `Unsupported file type: ${file.type}. Supported types: images (JPEG, PNG, GIF, WebP) and videos (MP4, MOV, AVI)`,
          },
          { status: 400 },
        )
      }

      const maxSize = file.type.startsWith("video/") ? 50 * 1024 * 1024 : 10 * 1024 * 1024
      if (file.size > maxSize) {
        const maxSizeMB = file.type.startsWith("video/") ? "50MB" : "10MB"
        return NextResponse.json(
          {
            error: `File too large: ${file.name}. Maximum size: ${maxSizeMB}`,
          },
          { status: 400 },
        )
      }
    }

    const apiKey = process.env.LATE_API_KEY
    const lateBase = process.env.NEXT_PUBLIC_LATE_BASE

    if (!apiKey || !lateBase) {
      return NextResponse.json({ error: "Late configuration missing" }, { status: 500 })
    }

    const uploadPromises = files.map(async (file) => {
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      const response = await fetch(`${lateBase}/v1/media`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: uploadFormData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Upload error:", response.status, errorText)
        throw new Error(`Upload failed: ${response.status}`)
      }

      const result = await response.json()

      return {
        ...result,
        mediaType: file.type.startsWith("video/") ? "video" : "image",
        originalName: file.name,
        fileSize: file.size,
      }
    })

    const results = await Promise.all(uploadPromises)
    return NextResponse.json({ mediaItems: results })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload media" }, { status: 500 })
  }
}
