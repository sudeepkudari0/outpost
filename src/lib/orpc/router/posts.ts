import { authed } from '@/orpc';
import { ORPCError } from '@orpc/server';
import { z } from 'zod';

const ListPostsInput = z.object({
  limit: z.number().int().min(1).max(200).default(50),
});

export const postsRouter = {
  list: authed
    .route({
      method: 'GET',
      path: '/posts',
      summary: 'List posts for current user',
      tags: ['Posts'],
    })
    .input(ListPostsInput.optional())
    .output(
      z.object({
        posts: z.array(
          z.object({
            id: z.string(),
            content: z.any(),
            mediaUrls: z.array(z.string()).optional(),
            status: z.string(),
            scheduledFor: z.date().nullable().optional(),
            createdAt: z.date(),
            platforms: z.array(
              z.object({
                platform: z.string(),
              })
            ),
          })
        ),
      })
    )
    .handler(async ({ input, context }) => {
      const { prisma, user } = context as { prisma: any; user: { id: string } };

      if (!prisma || !user?.id) {
        throw new ORPCError('UNAUTHORIZED', { message: 'Not authenticated' });
      }

      const limit = input?.limit ?? 50;

      const posts = await prisma.post.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: { platforms: true },
      });

      return {
        posts: posts.map((p: any) => ({
          id: p.id,
          content: p.content,
          mediaUrls: p.mediaUrls,
          status: p.status,
          scheduledFor: p.scheduledFor ?? null,
          createdAt: p.createdAt,
          platforms: p.platforms.map((pp: any) => ({ platform: pp.platform })),
        })),
      };
    }),
};
