import { prisma } from '@/lib/db';
import type { UsageAction } from '@prisma/client';

/**
 * Get or create usage record for a user
 */
export async function getOrCreateUsage(userId: string) {
  try {
    let usage = await prisma.usage.findUnique({
      where: { userId },
    });

    if (!usage) {
      usage = await prisma.usage.create({
        data: {
          userId,
          postsToday: 0,
          postsThisMonth: 0,
          profileCount: 0,
          lastPostResetDate: new Date(),
          lastMonthReset: new Date(),
        },
      });
    }

    return usage;
  } catch (error) {
    console.error('[Usage] Error getting or creating usage:', error);
    throw new Error('Failed to get or create usage record');
  }
}

/**
 * Get user's current usage statistics
 */
export async function getUserUsage(userId: string) {
  try {
    const usage = await getOrCreateUsage(userId);

    // Reset daily counter if it's a new day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastReset = new Date(usage.lastPostResetDate);
    lastReset.setHours(0, 0, 0, 0);

    if (lastReset < today) {
      // Reset daily counter
      await prisma.usage.update({
        where: { userId },
        data: {
          postsToday: 0,
          lastPostResetDate: new Date(),
        },
      });

      usage.postsToday = 0;
      usage.lastPostResetDate = new Date();
    }

    // Reset AI daily counter if it's a new day
    const lastAiReset = new Date(
      usage.lastAiResetDate || usage.lastPostResetDate
    );
    lastAiReset.setHours(0, 0, 0, 0);

    if (lastAiReset < today) {
      await prisma.usage.update({
        where: { userId },
        data: {
          aiGenerationsToday: 0,
          lastAiResetDate: new Date(),
        },
      });

      usage.aiGenerationsToday = 0;
      usage.lastAiResetDate = new Date();
    }

    // Reset monthly counter if it's a new month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const lastMonthReset = new Date(usage.lastMonthReset);
    lastMonthReset.setDate(1);
    lastMonthReset.setHours(0, 0, 0, 0);

    if (lastMonthReset < currentMonth) {
      // Reset monthly counter
      await prisma.usage.update({
        where: { userId },
        data: {
          postsThisMonth: 0,
          lastMonthReset: new Date(),
        },
      });

      usage.postsThisMonth = 0;
      usage.lastMonthReset = new Date();
    }

    // Reset AI monthly counter if it's a new month (coincide with posts reset)
    const aiMonthReset = lastMonthReset;
    if (aiMonthReset < currentMonth) {
      await prisma.usage.update({
        where: { userId },
        data: {
          aiGenerationsThisMonth: 0,
        },
      });

      usage.aiGenerationsThisMonth = 0;
    }

    return usage;
  } catch (error) {
    console.error('[Usage] Error getting user usage:', error);
    throw new Error('Failed to get user usage');
  }
}

/**
 * Increment post count for a user
 */
export async function incrementPostCount(userId: string) {
  try {
    // First ensure the counters are up to date
    await getUserUsage(userId);

    const usage = await prisma.usage.update({
      where: { userId },
      data: {
        postsToday: { increment: 1 },
        postsThisMonth: { increment: 1 },
      },
    });

    // Log the usage action
    await logUsageAction(userId, 'POST_CREATED');

    console.log(
      `[Usage] Incremented post count for user ${userId}: ${usage.postsToday} today, ${usage.postsThisMonth} this month`
    );

    return usage;
  } catch (error) {
    console.error('[Usage] Error incrementing post count:', error);
    throw new Error('Failed to increment post count');
  }
}

/**
 * Increment AI generation usage. Weight is the number of units to consume
 * (text=1, image=5 as specified)
 */
export async function incrementAiUsage(userId: string, weight: number = 1) {
  try {
    // Ensure counters are up to date
    await getUserUsage(userId);

    const usage = await prisma.usage.update({
      where: { userId },
      data: {
        aiGenerationsToday: { increment: weight },
        aiGenerationsThisMonth: { increment: weight },
      },
    });

    await logUsageAction(userId, 'AI_GENERATION', { weight });

    return usage;
  } catch (error) {
    console.error('[Usage] Error incrementing AI usage:', error);
    throw new Error('Failed to increment AI usage');
  }
}

/**
 * Update profile count for a user
 */
export async function updateProfileCount(userId: string) {
  try {
    // Count actual profiles from the database
    const profileCount = await prisma.socialProfile.count({
      where: { userId },
    });

    const usage = await prisma.usage.update({
      where: { userId },
      data: { profileCount },
    });

    console.log(
      `[Usage] Updated profile count for user ${userId}: ${profileCount}`
    );

    return usage;
  } catch (error) {
    console.error('[Usage] Error updating profile count:', error);
    throw new Error('Failed to update profile count');
  }
}

/**
 * Increment profile count when a profile is connected
 */
export async function incrementProfileCount(userId: string) {
  try {
    const usage = await prisma.usage.update({
      where: { userId },
      data: {
        profileCount: { increment: 1 },
      },
    });

    await logUsageAction(userId, 'PROFILE_CONNECTED');

    console.log(
      `[Usage] Incremented profile count for user ${userId}: ${usage.profileCount}`
    );

    return usage;
  } catch (error) {
    console.error('[Usage] Error incrementing profile count:', error);
    throw new Error('Failed to increment profile count');
  }
}

/**
 * Decrement profile count when a profile is disconnected
 */
export async function decrementProfileCount(userId: string) {
  try {
    const usage = await prisma.usage.update({
      where: { userId },
      data: {
        profileCount: { decrement: 1 },
      },
    });

    await logUsageAction(userId, 'PROFILE_DISCONNECTED');

    console.log(
      `[Usage] Decremented profile count for user ${userId}: ${usage.profileCount}`
    );

    return usage;
  } catch (error) {
    console.error('[Usage] Error decrementing profile count:', error);
    throw new Error('Failed to decrement profile count');
  }
}

/**
 * Reset daily usage counters
 * This should be called by a cron job at midnight
 */
export async function resetDailyUsage() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await prisma.usage.updateMany({
      where: {
        lastPostResetDate: {
          lt: today,
        },
      },
      data: {
        postsToday: 0,
        lastPostResetDate: new Date(),
        aiGenerationsToday: 0,
        lastAiResetDate: new Date(),
      },
    });

    console.log(`[Usage] Reset daily usage for ${result.count} users`);

    return result;
  } catch (error) {
    console.error('[Usage] Error resetting daily usage:', error);
    throw new Error('Failed to reset daily usage');
  }
}

/**
 * Reset monthly usage counters
 * This should be called by a cron job on the 1st of each month
 */
export async function resetMonthlyUsage() {
  try {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const result = await prisma.usage.updateMany({
      where: {
        lastMonthReset: {
          lt: currentMonth,
        },
      },
      data: {
        postsThisMonth: 0,
        lastMonthReset: new Date(),
        aiGenerationsThisMonth: 0,
      },
    });

    console.log(`[Usage] Reset monthly usage for ${result.count} users`);

    return result;
  } catch (error) {
    console.error('[Usage] Error resetting monthly usage:', error);
    throw new Error('Failed to reset monthly usage');
  }
}

/**
 * Log a usage action for analytics
 */
export async function logUsageAction(
  userId: string,
  action: UsageAction,
  metadata?: Record<string, any>
) {
  try {
    const log = await prisma.usageLog.create({
      data: {
        userId,
        action,
        metadata: metadata || {},
        timestamp: new Date(),
      },
    });

    return log;
  } catch (error) {
    console.error('[Usage] Error logging usage action:', error);
    // Don't throw error for logging failures
    return null;
  }
}

/**
 * Get usage history for a user
 */
export async function getUserUsageHistory(
  userId: string,
  options?: {
    limit?: number;
    action?: UsageAction;
    startDate?: Date;
    endDate?: Date;
  }
) {
  try {
    const where: any = { userId };

    if (options?.action) {
      where.action = options.action;
    }

    if (options?.startDate || options?.endDate) {
      where.timestamp = {};
      if (options.startDate) {
        where.timestamp.gte = options.startDate;
      }
      if (options.endDate) {
        where.timestamp.lte = options.endDate;
      }
    }

    const logs = await prisma.usageLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: options?.limit || 100,
    });

    return logs;
  } catch (error) {
    console.error('[Usage] Error getting usage history:', error);
    throw new Error('Failed to get usage history');
  }
}

/**
 * Get usage analytics for a user (for dashboard)
 */
export async function getUserUsageAnalytics(userId: string) {
  try {
    const usage = await getUserUsage(userId);

    // Get last 30 days of post activity
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPosts = await prisma.usageLog.findMany({
      where: {
        userId,
        action: 'POST_CREATED',
        timestamp: { gte: thirtyDaysAgo },
      },
      orderBy: { timestamp: 'desc' },
    });

    // Group by day
    const postsByDay: Record<string, number> = {};
    recentPosts.forEach(log => {
      const day = log.timestamp.toISOString().split('T')[0];
      postsByDay[day] = (postsByDay[day] || 0) + 1;
    });

    // Get total posts all time
    const totalPosts = await prisma.post.count({
      where: { userId },
    });

    // Get profile stats
    const profiles = await prisma.socialProfile.count({
      where: { userId },
    });

    const connectedAccounts = await prisma.connectedAccount.count({
      where: {
        profile: { userId },
        isActive: true,
      },
    });

    return {
      current: {
        postsToday: usage.postsToday,
        postsThisMonth: usage.postsThisMonth,
        profiles,
        connectedAccounts,
      },
      historical: {
        totalPosts,
        last30Days: recentPosts.length,
        postsByDay,
      },
    };
  } catch (error) {
    console.error('[Usage] Error getting usage analytics:', error);
    throw new Error('Failed to get usage analytics');
  }
}

/**
 * Get system-wide usage analytics (for admin)
 */
export async function getSystemUsageAnalytics(options?: {
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const where: any = {};

    if (options?.startDate || options?.endDate) {
      where.timestamp = {};
      if (options.startDate) {
        where.timestamp.gte = options.startDate;
      }
      if (options.endDate) {
        where.timestamp.lte = options.endDate;
      }
    }

    const [totalUsers, actionCounts, topUsers] = await Promise.all([
      // Total users with usage
      prisma.usage.count(),

      // Count by action type
      prisma.usageLog.groupBy({
        by: ['action'],
        where,
        _count: true,
      }),

      // Top users by activity
      prisma.usageLog.groupBy({
        by: ['userId'],
        where,
        _count: true,
        orderBy: { _count: { userId: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalUsers,
      actionCounts: actionCounts.reduce(
        (acc, item) => {
          acc[item.action] = item._count;
          return acc;
        },
        {} as Record<string, number>
      ),
      topUsers,
    };
  } catch (error) {
    console.error('[Usage] Error getting system usage analytics:', error);
    throw new Error('Failed to get system usage analytics');
  }
}

/**
 * Clean up old usage logs
 * Call this periodically to prevent database bloat
 */
export async function cleanupOldUsageLogs(daysToKeep: number = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.usageLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    console.log(
      `[Usage] Deleted ${result.count} usage logs older than ${daysToKeep} days`
    );

    return result;
  } catch (error) {
    console.error('[Usage] Error cleaning up usage logs:', error);
    throw new Error('Failed to cleanup usage logs');
  }
}
