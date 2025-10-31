import { generateTextWithGemini } from '@/lib/ai/providers/gemini';
import { generateTextWithOpenAI } from '@/lib/ai/providers/openai';
import { prisma } from '@/lib/db';
import {
  generateApiKey,
  getApiKeyLastFour,
  hashApiKeySha256,
} from '@/lib/utils';
import { authed } from '@/orpc';
import { z } from 'zod';

export const apiKeysRouter = {
  list: authed
    .route({
      method: 'GET',
      path: '/apikeys',
      summary: 'List API keys',
      tags: ['ApiKeys'],
    })
    .output(
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          lastFour: z.string(),
          scopes: z.array(z.string()),
          revokedAt: z.date().nullable().optional(),
          expiresAt: z.date().nullable().optional(),
          createdAt: z.date(),
          updatedAt: z.date(),
        })
      )
    )
    .handler(async ({ context }) => {
      const { user } = context as any;
      const keys = await prisma.apiKey.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          lastFour: true,
          scopes: true,
          revokedAt: true,
          expiresAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return keys as any;
    }),

  issue: authed
    .route({
      method: 'POST',
      path: '/apikeys/issue',
      summary: 'Issue API key',
      tags: ['ApiKeys'],
    })
    .input(
      z
        .object({
          name: z.string().optional(),
          scopes: z.array(z.string()).optional(),
          expiresAt: z.string().datetime().optional(),
        })
        .optional()
    )
    .output(
      z.object({ apiKey: z.string(), id: z.string(), lastFour: z.string() })
    )
    .handler(async ({ input, context }) => {
      const { user } = context as any;
      const apiKey = generateApiKey(
        process.env.NODE_ENV === 'production' ? 'sk_live' : 'sk_test'
      );
      const keyHash = hashApiKeySha256(apiKey);
      const lastFour = getApiKeyLastFour(apiKey);

      const created = await prisma.apiKey.create({
        data: {
          userId: user.id,
          name: input?.name || 'Key',
          keyHash,
          lastFour,
          scopes: input?.scopes || [
            'profiles:read',
            'posts:read',
            'posts:write',
          ],
          expiresAt: input?.expiresAt ? new Date(input.expiresAt) : null,
        },
      });

      return { apiKey, id: created.id, lastFour: created.lastFour };
    }),

  revoke: authed
    .route({
      method: 'POST',
      path: '/apikeys/revoke',
      summary: 'Revoke API key',
      tags: ['ApiKeys'],
    })
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input, context }) => {
      const { user } = context as any;
      const found = await prisma.apiKey.findFirst({
        where: { id: input.id, userId: user.id },
      });
      if (!found) return { success: false };
      await prisma.apiKey.update({
        where: { id: input.id },
        data: { revokedAt: new Date() },
      });
      return { success: true };
    }),

  validateEnv: authed
    .route({
      method: 'GET',
      path: '/apikeys/validate-env',
      summary: 'Validate env settings',
      tags: ['ApiKeys'],
    })
    .output(z.object({ validation: z.boolean(), missing: z.array(z.string()) }))
    .handler(async () => {
      const missing: string[] = [];
      if (!process.env.OPENAI_API_KEY) missing.push('OpenAI API Key');
      return { validation: missing.length === 0, missing };
    }),

  verifyAiKey: authed
    .route({
      method: 'POST',
      path: '/apikeys/ai/verify',
      summary: 'Verify user-provided AI key (BYOK) without storing it',
      tags: ['ApiKeys'],
    })
    .input(
      z.object({
        provider: z.enum(['openai', 'gemini']),
        apiKey: z.string().min(8),
      })
    )
    .output(
      z.object({
        valid: z.boolean(),
        provider: z.string(),
        error: z.string().optional(),
      })
    )
    .handler(async ({ input }) => {
      try {
        const trivialPrompt = 'Reply with OK';
        if (input.provider === 'openai') {
          const res = await generateTextWithOpenAI({
            apiKey: input.apiKey,
            systemPrompt: 'Validation',
            prompt: trivialPrompt,
            json: false,
          });
          return {
            valid: typeof res === 'string' && res.length > 0,
            provider: input.provider,
          };
        } else {
          const res = await generateTextWithGemini({
            apiKey: input.apiKey,
            systemPrompt: 'Validation',
            prompt: trivialPrompt,
            json: false,
          });
          return {
            valid: typeof res === 'string' && res.length > 0,
            provider: input.provider,
          };
        }
      } catch (e: any) {
        return {
          valid: false,
          provider: input.provider,
          error: e?.message || 'Invalid key',
        };
      }
    }),
};
