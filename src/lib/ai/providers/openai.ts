type TextParams = {
  apiKey: string;
  systemPrompt?: string;
  prompt: string;
  json: boolean;
};

export async function generateTextWithOpenAI(
  params: TextParams
): Promise<string> {
  const { apiKey, systemPrompt, prompt, json } = params;

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      { role: 'user', content: prompt },
    ],
    ...(json ? { response_format: { type: 'json_object' } } : {}),
    temperature: 0.7,
  } as any;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error: ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned empty content');
  return content as string;
}

export async function generateImageWithOpenAI(params: {
  apiKey: string;
  prompt: string;
}): Promise<string> {
  const { apiKey, prompt } = params;
  const fullPrompt = `Create a professional social media image for: ${prompt}. Make it visually appealing, modern, and suitable for social media platforms.`;

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: fullPrompt,
      n: 1,
      size: '1024x1024',
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenAI Image error: ${errorData}`);
  }

  const data = await response.json();
  const url = data.data?.[0]?.url;
  if (!url) throw new Error('OpenAI Image returned no URL');
  return url as string;
}
