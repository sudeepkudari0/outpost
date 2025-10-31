import { updateSubscriptionTier } from '@/lib/subscription';
import { authed } from '@/orpc';
import { ORPCError } from '@orpc/server';
import { z } from 'zod';

function assertAdmin(user: { role?: string }) {
  if (user?.role !== 'ADMIN') {
    throw new ORPCError('FORBIDDEN', { message: 'Admin access required' });
  }
}

export const adminRouter = {
  listUsers: authed
    .route({
      method: 'GET',
      path: '/admin/users',
      summary: 'Admin: list all users',
      tags: ['Admin'],
    })
    .output(z.array(z.any()))
    .handler(async ({ context }) => {
      const { prisma, user } = context as { prisma: any; user: any };
      assertAdmin(user);
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          subscription: true,
          usage: true,
        },
      });
      return users as any;
    }),

  updateUser: authed
    .route({
      method: 'POST',
      path: '/admin/users/update',
      summary: 'Admin: update user name and/or plan',
      tags: ['Admin'],
    })
    .input(
      z.object({
        userId: z.string(),
        name: z.string().optional(),
        planTier: z.enum(['FREE', 'PRO', 'BUSINESS', 'ENTERPRISE']).optional(),
      })
    )
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input, context }) => {
      const { prisma, user } = context as { prisma: any; user: any };
      assertAdmin(user);
      if (input.name) {
        await prisma.user.update({
          where: { id: input.userId },
          data: { name: input.name },
        });
      }
      if (input.planTier) {
        await updateSubscriptionTier(input.userId, input.planTier as any);
      }
      return { success: true };
    }),

  disableUser: authed
    .route({
      method: 'POST',
      path: '/admin/users/disable',
      summary: 'Admin: disable (deactivate) a user',
      tags: ['Admin'],
    })
    .input(z.object({ userId: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input, context }) => {
      const { prisma, user } = context as { prisma: any; user: any };
      assertAdmin(user);
      await prisma.user.update({
        where: { id: input.userId },
        data: { status: 'INACTIVE' },
      });
      await prisma.subscription.updateMany({
        where: { userId: input.userId },
        data: { status: 'INACTIVE' },
      });
      return { success: true };
    }),

  deleteUser: authed
    .route({
      method: 'POST',
      path: '/admin/users/delete',
      summary: 'Admin: delete a user (cascade)',
      tags: ['Admin'],
    })
    .input(z.object({ userId: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input, context }) => {
      const { prisma, user } = context as { prisma: any; user: any };
      assertAdmin(user);
      await prisma.user.delete({ where: { id: input.userId } });
      return { success: true };
    }),
};
