import { prisma } from '@/lib/db';
import type { SubscriptionStatus, SubscriptionTier } from '@prisma/client';

/**
 * Tier limits configuration
 * Define the limits for each subscription tier
 */
export const TIER_LIMITS = {
  FREE: {
    maxProfiles: 2,
    maxPostsPerDay: 10,
    maxPostsPerMonth: 300,
    maxConnectedAccounts: 4, // 2 profiles x 2 accounts each
    // AI limits (FREE: no AI generation)
    maxAiGenerationsPerDay: 0,
    maxAiGenerationsPerMonth: 0,
    features: [
      'basic_posting',
      'basic_scheduling',
      'connect_facebook',
      'connect_instagram',
      'connect_linkedin',
      'connect_twitter',
      'connect_threads',
    ],
  },
  PRO: {
    maxProfiles: 10,
    maxPostsPerDay: 100,
    maxPostsPerMonth: 3000,
    maxConnectedAccounts: 20,
    // AI limits
    maxAiGenerationsPerDay: 5,
    maxAiGenerationsPerMonth: 150,
    features: [
      'basic_posting',
      'basic_scheduling',
      'ai_generation',
      'bulk_upload',
      'advanced_scheduling',
      'analytics_basic',
      'connect_all_platforms',
      'priority_support',
    ],
  },
  BUSINESS: {
    maxProfiles: 50,
    maxPostsPerDay: 500,
    maxPostsPerMonth: 15000,
    maxConnectedAccounts: 100,
    // AI limits
    maxAiGenerationsPerDay: 15,
    maxAiGenerationsPerMonth: 450,
    features: [
      'basic_posting',
      'basic_scheduling',
      'ai_generation_unlimited',
      'bulk_upload',
      'advanced_scheduling',
      'analytics_advanced',
      'connect_all_platforms',
      'team_collaboration',
      'white_label',
      'priority_support',
      'custom_branding',
    ],
  },
  ENTERPRISE: {
    maxProfiles: -1, // Unlimited
    maxPostsPerDay: -1, // Unlimited
    maxPostsPerMonth: -1, // Unlimited
    maxConnectedAccounts: -1, // Unlimited
    // AI limits (unlimited)
    maxAiGenerationsPerDay: -1,
    maxAiGenerationsPerMonth: -1,
    features: [
      'everything',
      'dedicated_support',
      'custom_integrations',
      'sla_guarantee',
      'advanced_security',
      'audit_logs',
    ],
  },
} as const;

export interface TierLimits {
  maxProfiles: number;
  maxPostsPerDay: number;
  maxPostsPerMonth: number;
  maxConnectedAccounts: number;
  maxAiGenerationsPerDay: number;
  maxAiGenerationsPerMonth: number;
  features: readonly string[];
}

/**
 * Get tier limits for a specific subscription tier
 */
export function getTierLimits(tier: SubscriptionTier): TierLimits {
  return TIER_LIMITS[tier];
}

/**
 * Check if a tier has a specific feature
 */
export function hasFeature(tier: SubscriptionTier, feature: string): boolean {
  const limits = getTierLimits(tier);
  return (
    limits.features.includes(feature) || limits.features.includes('everything')
  );
}

/**
 * Get user's subscription with full details
 */
export async function getUserSubscription(userId: string) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return subscription;
  } catch (error) {
    console.error('[Subscription] Error fetching user subscription:', error);
    return null;
  }
}

/**
 * Get or create subscription for a user
 * If user doesn't have a subscription, create a FREE tier subscription
 */
export async function getOrCreateSubscription(userId: string) {
  try {
    // Try to get existing subscription
    let subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    // If no subscription exists, create a FREE tier subscription
    if (!subscription) {
      const now = new Date();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1); // 1 month period

      subscription = await prisma.subscription.create({
        data: {
          userId,
          tier: 'FREE',
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });
    }

    return subscription;
  } catch (error) {
    console.error(
      '[Subscription] Error getting or creating subscription:',
      error
    );
    throw new Error('Failed to get or create subscription');
  }
}

/**
 * Check if subscription is active and valid
 */
export function isSubscriptionActive(
  subscription: { status: SubscriptionStatus; currentPeriodEnd: Date } | null
): boolean {
  if (!subscription) return false;

  // Check if status is ACTIVE or TRIALING
  const validStatuses: SubscriptionStatus[] = ['ACTIVE', 'TRIALING'];
  if (!validStatuses.includes(subscription.status)) return false;

  // Check if subscription hasn't expired
  const now = new Date();
  if (subscription.currentPeriodEnd < now) return false;

  return true;
}

/**
 * Get user's current tier
 */
export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  try {
    const subscription = await getOrCreateSubscription(userId);

    // If subscription is not active, downgrade to FREE
    if (!isSubscriptionActive(subscription)) {
      return 'FREE';
    }

    return subscription.tier;
  } catch (error) {
    console.error('[Subscription] Error getting user tier:', error);
    return 'FREE'; // Default to FREE on error
  }
}

/**
 * Update subscription tier
 */
export async function updateSubscriptionTier(
  userId: string,
  newTier: SubscriptionTier,
  options?: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    stripePriceId?: string;
  }
) {
  try {
    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: {
        tier: newTier,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        stripeCustomerId: options?.stripeCustomerId,
        stripeSubscriptionId: options?.stripeSubscriptionId,
        stripePriceId: options?.stripePriceId,
      },
      create: {
        userId,
        tier: newTier,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        stripeCustomerId: options?.stripeCustomerId,
        stripeSubscriptionId: options?.stripeSubscriptionId,
        stripePriceId: options?.stripePriceId,
      },
    });

    return subscription;
  } catch (error) {
    console.error('[Subscription] Error updating subscription tier:', error);
    throw new Error('Failed to update subscription tier');
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(userId: string, cancelAt?: Date) {
  try {
    const subscription = await prisma.subscription.update({
      where: { userId },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
        cancelAt: cancelAt || new Date(),
      },
    });

    return subscription;
  } catch (error) {
    console.error('[Subscription] Error canceling subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(userId: string) {
  try {
    const subscription = await prisma.subscription.update({
      where: { userId },
      data: {
        status: 'ACTIVE',
        cancelAt: null,
        canceledAt: null,
      },
    });

    return subscription;
  } catch (error) {
    console.error('[Subscription] Error reactivating subscription:', error);
    throw new Error('Failed to reactivate subscription');
  }
}

/**
 * Check if subscription needs renewal
 */
export async function checkSubscriptionRenewal(userId: string) {
  try {
    const subscription = await getUserSubscription(userId);
    if (!subscription) return false;

    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (subscription.currentPeriodEnd.getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return {
      needsRenewal: daysUntilExpiry <= 7,
      daysUntilExpiry,
      expiresAt: subscription.currentPeriodEnd,
    };
  } catch (error) {
    console.error('[Subscription] Error checking renewal:', error);
    return { needsRenewal: false, daysUntilExpiry: 0, expiresAt: new Date() };
  }
}

/**
 * Get subscription analytics for admin dashboard
 */
export async function getSubscriptionAnalytics() {
  try {
    const [total, byTier, byStatus, recentSubscriptions] = await Promise.all([
      // Total subscriptions
      prisma.subscription.count(),

      // Count by tier
      prisma.subscription.groupBy({
        by: ['tier'],
        _count: true,
      }),

      // Count by status
      prisma.subscription.groupBy({
        by: ['status'],
        _count: true,
      }),

      // Recent subscriptions
      prisma.subscription.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      total,
      byTier: byTier.reduce(
        (acc, item) => {
          acc[item.tier] = item._count;
          return acc;
        },
        {} as Record<string, number>
      ),
      byStatus: byStatus.reduce(
        (acc, item) => {
          acc[item.status] = item._count;
          return acc;
        },
        {} as Record<string, number>
      ),
      recent: recentSubscriptions,
    };
  } catch (error) {
    console.error('[Subscription] Error fetching analytics:', error);
    throw new Error('Failed to fetch subscription analytics');
  }
}

/**
 * Initialize subscription for new users
 * Call this after user registration
 */
export async function initializeUserSubscription(userId: string) {
  try {
    const subscription = await getOrCreateSubscription(userId);

    // Also create usage record
    await prisma.usage.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        postsToday: 0,
        postsThisMonth: 0,
        profileCount: 0,
        lastPostResetDate: new Date(),
        lastMonthReset: new Date(),
      },
    });

    return subscription;
  } catch (error) {
    console.error('[Subscription] Error initializing subscription:', error);
    throw new Error('Failed to initialize subscription');
  }
}
