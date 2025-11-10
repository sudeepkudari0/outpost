type TextParams = {
  apiKey: string;
  systemPrompt?: string;
  prompt: string;
  json: boolean;
  model?: string;
};

// Minimal Gemini 1.5 text generation via REST
export async function generateTextWithGemini(
  params: TextParams
): Promise<string> {
  const { apiKey, systemPrompt, prompt, json, model } = params;

  const modelPath = model || 'models/gemini-2.5-pro';
  const url = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const mergedPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
  const contents: any[] = [{ role: 'user', parts: [{ text: mergedPrompt }] }];

  // Gemini does not have the same response_format; we can instruct JSON via system
  const body: any = {
    contents,
    generationConfig: {
      temperature: 0.7,
      ...(json ? { responseMimeType: 'application/json' } : {}),
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error: ${err}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned empty content');
  return text as string;
}
