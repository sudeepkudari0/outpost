import { type NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const {
      prompt,
      tone = "professional",
      platform = "instagram",
      contentType = "promotional",
    } = await request.json();

    console.log("[v0] Compose request:", {
      prompt,
      tone,
      platform,
      contentType,
    });

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const platformGuidelines = {
      instagram:
        "Focus on visual storytelling, use relevant hashtags, keep captions engaging but concise (under 2200 characters). Include emoji usage.",
      facebook:
        "Create conversational, community-focused content. Longer posts are acceptable. Encourage engagement and discussion.",
      linkedin:
        "Professional tone, industry insights, thought leadership. Longer form content is preferred. Include relevant professional hashtags.",
      twitter:
        "Concise, punchy content under 280 characters. Use trending hashtags, be timely and engaging. Thread format if needed.",
      tiktok:
        "Trendy, youth-focused, video description style. Use popular hashtags and trending sounds references. Keep it fun and energetic.",
      threads:
        "Conversational, authentic tone. Similar to Twitter but can be slightly longer. Focus on real-time thoughts and discussions.",
      youtube:
        "Compelling video descriptions, SEO-optimized titles, clear call-to-actions. Include timestamps and relevant keywords.",
    };

    const contentTypeGuidelines = {
      promotional:
        "Focus on product benefits, create urgency, include clear call-to-actions, highlight value propositions.",
      educational:
        "Provide valuable tips, step-by-step guidance, actionable insights, and helpful information.",
      inspirational:
        "Use motivational language, share success stories, include uplifting quotes, encourage positive action.",
      "behind-scenes":
        "Show authentic moments, company culture, team personalities, and genuine workplace experiences.",
      "user-generated":
        "Highlight customer experiences, showcase testimonials, feature user stories, and build community.",
      trending:
        "Reference current events, use trending hashtags, tap into viral topics, and stay culturally relevant.",
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a social media content creator specializing in ${platform.toUpperCase()}. Generate ${contentType} content optimized specifically for ${platform} with a ${tone} tone. 

Platform Guidelines for ${platform}: ${
            platformGuidelines[platform as keyof typeof platformGuidelines]
          }

Content Type Guidelines for ${contentType}: ${
            contentTypeGuidelines[
              contentType as keyof typeof contentTypeGuidelines
            ]
          }

Return JSON with a single key "${platform}" containing the optimized content for this platform only. Make sure the content aligns with both the platform requirements and the content type strategy.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "No content generated" },
        { status: 500 }
      );
    }

    const parsedContent = JSON.parse(content);
    return NextResponse.json(parsedContent);
  } catch (error) {
    console.error("Compose error:", error);
    console.log(
      "[v0] Detailed error:",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
