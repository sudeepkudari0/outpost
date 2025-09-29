import { type NextRequest, NextResponse } from "next/server"
import { generateImage } from "@/lib/generate-image"

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const imageUrl = await generateImage(prompt)

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error("Error generating image:", error)

    const errorMessage = error instanceof Error ? error.message : "Failed to generate image"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
