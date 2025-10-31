import { getQuotaStatus } from '@/lib/quota';
import { authed } from '@/orpc';
import { z } from 'zod';

export const quotaRouter = {
  status: authed
    .route({
      method: 'GET',
      path: '/quota/status',
      summary: 'Get current quota usage and limits',
      tags: ['Quota'],
    })
    .input(z.object({}))
    .output(
      z.object({
        tier: z.string(),
        posts: z.object({
          daily: z.object({
            used: z.number(),
            limit: z.number(),
            remaining: z.number(),
            unlimited: z.boolean(),
            percentage: z.number(),
            status: z.enum(['normal', 'caution', 'warning', 'exceeded']),
          }),
          monthly: z.object({
            used: z.number(),
            limit: z.number(),
            remaining: z.number(),
            unlimited: z.boolean(),
            percentage: z.number(),
            status: z.enum(['normal', 'caution', 'warning', 'exceeded']),
          }),
        }),
        ai: z.object({
          daily: z.object({
            used: z.number(),
            limit: z.number(),
            remaining: z.number(),
            unlimited: z.boolean(),
            percentage: z.number(),
            status: z.enum(['normal', 'caution', 'warning', 'exceeded']),
          }),
          monthly: z.object({
            used: z.number(),
            limit: z.number(),
            remaining: z.number(),
            unlimited: z.boolean(),
            percentage: z.number(),
            status: z.enum(['normal', 'caution', 'warning', 'exceeded']),
          }),
        }),
        profiles: z.object({
          used: z.number(),
          limit: z.number(),
          remaining: z.number(),
          unlimited: z.boolean(),
          percentage: z.number(),
          status: z.enum(['normal', 'caution', 'warning', 'exceeded']),
        }),
        accounts: z.object({
          used: z.number(),
          limit: z.number(),
          remaining: z.number(),
          unlimited: z.boolean(),
          percentage: z.number(),
          status: z.enum(['normal', 'caution', 'warning', 'exceeded']),
        }),
        features: z.array(z.string()),
      })
    )
    .handler(async ({ context }) => {
      const { user } = context as { user: { id: string } };
      const status = await getQuotaStatus(user.id);
      return status as any;
    }),
};
