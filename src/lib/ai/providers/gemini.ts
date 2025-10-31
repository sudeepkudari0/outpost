type TextParams = {
  apiKey: string;
  systemPrompt?: string;
  prompt: string;
  json: boolean;
};

// Minimal Gemini 1.5 text generation via REST
export async function generateTextWithGemini(
  params: TextParams
): Promise<string> {
  const { apiKey, systemPrompt, prompt, json } = params;

  const model = 'models/gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const contents: any[] = [];
  if (systemPrompt)
    contents.push({ role: 'system', parts: [{ text: systemPrompt }] });
  contents.push({ role: 'user', parts: [{ text: prompt }] });

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
