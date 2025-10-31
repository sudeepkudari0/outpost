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
  stats: authed
    .route({
      method: 'GET',
      path: '/admin/stats',
      summary: 'Admin: site-wide statistics and trends',
      tags: ['Admin'],
    })
    .output(z.any())
    .handler(async ({ context }) => {
      const { prisma, user } = context as { prisma: any; user: any };
      assertAdmin(user);

      const now = new Date();
      const start30 = new Date(now);
      start30.setDate(start30.getDate() - 30);
      const start7 = new Date(now);
      start7.setDate(start7.getDate() - 7);

      const [
        usersTotal,
        usersActive,
        profilesTotal,
        accountsTotal,
        postsTotal,
        newUsers7,
        newUsers30,
        byTier,
        byStatus,
        recentUsers,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: 'ACTIVE' } }),
        prisma.socialProfile.count(),
        prisma.connectedAccount.count({ where: { isActive: true } }),
        prisma.post.count(),
        prisma.user.count({ where: { createdAt: { gte: start7 } } }),
        prisma.user.count({ where: { createdAt: { gte: start30 } } }),
        prisma.subscription.groupBy({ by: ['tier'], _count: true }),
        prisma.subscription.groupBy({ by: ['status'], _count: true }),
        prisma.user.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            subscription: { select: { tier: true, status: true } },
          },
        }),
      ]);

      // Build last 30 days user signups series (Mongo-friendly)
      const last30Days: Array<{ date: string; count: number }> = [];
      const dayPromises: Array<Promise<number>> = [];
      const dayStarts: Date[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - i);
        const next = new Date(d);
        next.setDate(d.getDate() + 1);
        dayStarts.push(d);
        dayPromises.push(
          prisma.user.count({
            where: {
              createdAt: { gte: d, lt: next },
            },
          })
        );
      }
      const counts = await Promise.all(dayPromises);
      for (let i = 0; i < dayStarts.length; i++) {
        last30Days.push({
          date: dayStarts[i].toISOString().slice(0, 10),
          count: counts[i] || 0,
        });
      }

      return {
        totals: {
          users: usersTotal,
          activeUsers: usersActive,
          profiles: profilesTotal,
          connectedAccounts: accountsTotal,
          posts: postsTotal,
        },
        newUsers: {
          last7Days: newUsers7,
          last30Days: newUsers30,
        },
        subscriptions: {
          byTier,
          byStatus,
        },
        recentUsers,
        timeseries: {
          usersLast30Days: last30Days,
        },
      } as any;
    }),
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
