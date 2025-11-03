import { generateTextWithGemini } from '@/lib/ai/providers/gemini';
import { enforceAiQuota } from '@/lib/quota';
import { incrementAiUsage } from '@/lib/usage';
import {
  generateImageWithOpenAI,
  generateTextWithOpenAI,
} from './providers/openai';

export type AiProvider = 'openai' | 'gemini';

export type AiConfig = {
  useUserKey?: boolean;
  provider?: AiProvider;
  apiKey?: string; // only when useUserKey is true; never persist server-side
  model?: string; // optional model override for selected provider
};

function resolveProvider(config?: AiConfig): AiProvider {
  if (config?.provider === 'gemini') return 'gemini';
  return 'openai';
}

function resolveApiKey(
  provider: AiProvider,
  config?: AiConfig
): string | undefined {
  if (config?.useUserKey && config.apiKey) return config.apiKey;
  // fallback to app-level keys by provider
  if (provider === 'openai') return process.env.OPENAI_API_KEY;
  if (provider === 'gemini') return process.env.GEMINI_API_KEY;
  return undefined;
}

export async function generateText(options: {
  userId: string;
  systemPrompt?: string;
  prompt: string;
  json?: boolean;
  aiConfig?: AiConfig;
}): Promise<string> {
  const { userId, systemPrompt, prompt, json, aiConfig } = options;

  const isBYOK = !!(aiConfig?.useUserKey && aiConfig.apiKey);
  if (!isBYOK) {
    await enforceAiQuota(userId, 1);
  }

  const provider = resolveProvider(aiConfig);
  const apiKey = resolveApiKey(provider, aiConfig);
  if (!apiKey) {
    throw new Error('No API key configured for selected AI provider');
  }

  let content: string;
  if (provider === 'openai') {
    content = await generateTextWithOpenAI({
      apiKey,
      systemPrompt,
      prompt,
      json: !!json,
      model: aiConfig?.model,
    });
  } else {
    content = await generateTextWithGemini({
      apiKey,
      systemPrompt,
      prompt,
      json: !!json,
      model: aiConfig?.model,
    });
  }

  if (!isBYOK) {
    await incrementAiUsage(userId, 1);
  }
  return content;
}

export async function generateImage(options: {
  userId: string;
  prompt: string;
  aiConfig?: AiConfig;
}): Promise<string> {
  const { userId, prompt, aiConfig } = options;

  const isBYOK = !!(aiConfig?.useUserKey && aiConfig.apiKey);
  const weight = 5; // image counts as 5 units
  if (!isBYOK) {
    await enforceAiQuota(userId, weight);
  }

  const provider = resolveProvider(aiConfig);
  const apiKey = resolveApiKey(provider, aiConfig);
  if (!apiKey) {
    throw new Error('No API key configured for selected AI provider');
  }

  if (provider !== 'openai') {
    // For now, only OpenAI image generation is supported
    throw new Error('Image generation is currently supported only with OpenAI');
  }

  const url = await generateImageWithOpenAI({ apiKey, prompt });
  if (!isBYOK) {
    await incrementAiUsage(userId, weight);
  }
  return url;
}
