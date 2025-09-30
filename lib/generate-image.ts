export async function generateImage(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key is not found in environment variables.");
  }

  if (!apiKey.startsWith("sk-") || apiKey.length < 40) {
    throw new Error(
      `Invalid OpenAI API key format. Expected format: sk-... (got length: ${apiKey.length})`
    );
  }

  const fullPrompt = `Create a professional social media image for: ${prompt}. Make it visually appealing, modern, and suitable for social media platforms.`;

  try {
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: fullPrompt,
          n: 1,
          size: "1024x1024",
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `DALL·E API Error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    return data.data[0].url;
  } catch (error) {
    console.error("Error generating image:", error);

    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error(`OpenAI API Error: ${error.message}`);
      }
      if (error.message.includes("quota")) {
        throw new Error(
          "OpenAI API quota exceeded. Please check your billing settings."
        );
      }
      if (error.message.includes("rate limit")) {
        throw new Error(
          "OpenAI API rate limit reached. Please try again in a moment."
        );
      }
    }

    throw new Error(
      `Image generation failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
