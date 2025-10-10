import type { SubscriptionTier } from '@prisma/client';
import { getTierLimits, getUserTier, hasFeature } from './subscription';
import { getUserUsage } from './usage';

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
  current?: number;
  limit?: number;
  tier?: SubscriptionTier;
  upgradeRequired?: boolean;
}

/**
 * Check if user can create a post
 */
export async function canCreatePost(userId: string): Promise<QuotaCheckResult> {
  try {
    const [tier, usage] = await Promise.all([
      getUserTier(userId),
      getUserUsage(userId),
    ]);

    const limits = getTierLimits(tier);

    // Check daily limit (unless unlimited)
    if (limits.maxPostsPerDay !== -1) {
      if (usage.postsToday >= limits.maxPostsPerDay) {
        return {
          allowed: false,
          reason: `Daily post limit reached (${limits.maxPostsPerDay} posts per day)`,
          current: usage.postsToday,
          limit: limits.maxPostsPerDay,
          tier,
          upgradeRequired: tier === 'FREE',
        };
      }
    }

    // Check monthly limit (unless unlimited)
    if (limits.maxPostsPerMonth !== -1) {
      if (usage.postsThisMonth >= limits.maxPostsPerMonth) {
        return {
          allowed: false,
          reason: `Monthly post limit reached (${limits.maxPostsPerMonth} posts per month)`,
          current: usage.postsThisMonth,
          limit: limits.maxPostsPerMonth,
          tier,
          upgradeRequired: tier === 'FREE',
        };
      }
    }

    return {
      allowed: true,
      current: usage.postsToday,
      limit: limits.maxPostsPerDay,
      tier,
    };
  } catch (error) {
    console.error('[Quota] Error checking post quota:', error);
    // In case of error, allow the action but log it
    return {
      allowed: true,
      reason: 'Error checking quota',
    };
  }
}

/**
 * Check if user can connect a new profile
 */
export async function canConnectProfile(
  userId: string
): Promise<QuotaCheckResult> {
  try {
    const [tier, usage] = await Promise.all([
      getUserTier(userId),
      getUserUsage(userId),
    ]);

    const limits = getTierLimits(tier);

    // Check profile limit (unless unlimited)
    if (limits.maxProfiles !== -1) {
      if (usage.profileCount >= limits.maxProfiles) {
        return {
          allowed: false,
          reason: `Profile limit reached (${limits.maxProfiles} profiles maximum)`,
          current: usage.profileCount,
          limit: limits.maxProfiles,
          tier,
          upgradeRequired: tier === 'FREE',
        };
      }
    }

    return {
      allowed: true,
      current: usage.profileCount,
      limit: limits.maxProfiles,
      tier,
    };
  } catch (error) {
    console.error('[Quota] Error checking profile quota:', error);
    return {
      allowed: true,
      reason: 'Error checking quota',
    };
  }
}

/**
 * Check if user can connect a new account
 */
export async function canConnectAccount(
  userId: string
): Promise<QuotaCheckResult> {
  try {
    const [tier, usage] = await Promise.all([
      getUserTier(userId),
      getUserUsage(userId),
    ]);

    const limits = getTierLimits(tier);

    // Get current account count from database
    const { prisma } = await import('./db');
    const accountCount = await prisma.connectedAccount.count({
      where: {
        profile: { userId },
        isActive: true,
      },
    });

    // Check account limit (unless unlimited)
    if (limits.maxConnectedAccounts !== -1) {
      if (accountCount >= limits.maxConnectedAccounts) {
        return {
          allowed: false,
          reason: `Connected account limit reached (${limits.maxConnectedAccounts} accounts maximum)`,
          current: accountCount,
          limit: limits.maxConnectedAccounts,
          tier,
          upgradeRequired: tier === 'FREE',
        };
      }
    }

    return {
      allowed: true,
      current: accountCount,
      limit: limits.maxConnectedAccounts,
      tier,
    };
  } catch (error) {
    console.error('[Quota] Error checking account quota:', error);
    return {
      allowed: true,
      reason: 'Error checking quota',
    };
  }
}

/**
 * Check if user can use a specific feature
 */
export async function canUseFeature(
  userId: string,
  feature: string
): Promise<QuotaCheckResult> {
  try {
    const tier = await getUserTier(userId);
    const allowed = hasFeature(tier, feature);

    if (!allowed) {
      return {
        allowed: false,
        reason: `Feature '${feature}' is not available in your plan`,
        tier,
        upgradeRequired: true,
      };
    }

    return {
      allowed: true,
      tier,
    };
  } catch (error) {
    console.error('[Quota] Error checking feature access:', error);
    return {
      allowed: true,
      reason: 'Error checking feature access',
    };
  }
}

/**
 * Get remaining quota for a user (for UI display)
 */
export async function getRemainingQuota(userId: string) {
  try {
    const [tier, usage] = await Promise.all([
      getUserTier(userId),
      getUserUsage(userId),
    ]);

    const limits = getTierLimits(tier);

    // Get current account count
    const { prisma } = await import('./db');
    const accountCount = await prisma.connectedAccount.count({
      where: {
        profile: { userId },
        isActive: true,
      },
    });

    return {
      tier,
      posts: {
        daily: {
          used: usage.postsToday,
          limit: limits.maxPostsPerDay,
          remaining:
            limits.maxPostsPerDay === -1
              ? -1
              : limits.maxPostsPerDay - usage.postsToday,
          unlimited: limits.maxPostsPerDay === -1,
        },
        monthly: {
          used: usage.postsThisMonth,
          limit: limits.maxPostsPerMonth,
          remaining:
            limits.maxPostsPerMonth === -1
              ? -1
              : limits.maxPostsPerMonth - usage.postsThisMonth,
          unlimited: limits.maxPostsPerMonth === -1,
        },
      },
      profiles: {
        used: usage.profileCount,
        limit: limits.maxProfiles,
        remaining:
          limits.maxProfiles === -1
            ? -1
            : limits.maxProfiles - usage.profileCount,
        unlimited: limits.maxProfiles === -1,
      },
      accounts: {
        used: accountCount,
        limit: limits.maxConnectedAccounts,
        remaining:
          limits.maxConnectedAccounts === -1
            ? -1
            : limits.maxConnectedAccounts - accountCount,
        unlimited: limits.maxConnectedAccounts === -1,
      },
      features: limits.features,
    };
  } catch (error) {
    console.error('[Quota] Error getting remaining quota:', error);
    throw new Error('Failed to get remaining quota');
  }
}

/**
 * Middleware helper: Check quota and throw if exceeded
 * Use this in API routes
 */
export async function enforcePostQuota(userId: string) {
  const result = await canCreatePost(userId);

  if (!result.allowed) {
    const error = new Error(result.reason || 'Quota exceeded') as Error & {
      statusCode?: number;
      upgradeRequired?: boolean;
      quota?: QuotaCheckResult;
    };
    error.statusCode = 429; // Too Many Requests
    error.upgradeRequired = result.upgradeRequired;
    error.quota = result;
    throw error;
  }

  return result;
}

/**
 * Middleware helper: Check profile quota and throw if exceeded
 */
export async function enforceProfileQuota(userId: string) {
  const result = await canConnectProfile(userId);

  if (!result.allowed) {
    const error = new Error(
      result.reason || 'Profile limit exceeded'
    ) as Error & {
      statusCode?: number;
      upgradeRequired?: boolean;
      quota?: QuotaCheckResult;
    };
    error.statusCode = 429; // Too Many Requests
    error.upgradeRequired = result.upgradeRequired;
    error.quota = result;
    throw error;
  }

  return result;
}

/**
 * Middleware helper: Check account quota and throw if exceeded
 */
export async function enforceAccountQuota(userId: string) {
  const result = await canConnectAccount(userId);

  if (!result.allowed) {
    const error = new Error(
      result.reason || 'Account limit exceeded'
    ) as Error & {
      statusCode?: number;
      upgradeRequired?: boolean;
      quota?: QuotaCheckResult;
    };
    error.statusCode = 429; // Too Many Requests
    error.upgradeRequired = result.upgradeRequired;
    error.quota = result;
    throw error;
  }

  return result;
}

/**
 * Middleware helper: Check feature access and throw if not allowed
 */
export async function enforceFeatureAccess(userId: string, feature: string) {
  const result = await canUseFeature(userId, feature);

  if (!result.allowed) {
    const error = new Error(
      result.reason || 'Feature not available'
    ) as Error & {
      statusCode?: number;
      upgradeRequired?: boolean;
      quota?: QuotaCheckResult;
    };
    error.statusCode = 403; // Forbidden
    error.upgradeRequired = result.upgradeRequired;
    error.quota = result;
    throw error;
  }

  return result;
}

/**
 * Get quota status with percentage calculations (for UI progress bars)
 */
export async function getQuotaStatus(userId: string) {
  try {
    const quota = await getRemainingQuota(userId);

    const calculatePercentage = (used: number, limit: number) => {
      if (limit === -1) return 0; // Unlimited
      return Math.min(Math.round((used / limit) * 100), 100);
    };

    const getStatus = (percentage: number) => {
      if (percentage >= 100) return 'exceeded';
      if (percentage >= 90) return 'warning';
      if (percentage >= 75) return 'caution';
      return 'normal';
    };

    return {
      tier: quota.tier,
      posts: {
        daily: {
          ...quota.posts.daily,
          percentage: calculatePercentage(
            quota.posts.daily.used,
            quota.posts.daily.limit
          ),
          status: getStatus(
            calculatePercentage(quota.posts.daily.used, quota.posts.daily.limit)
          ),
        },
        monthly: {
          ...quota.posts.monthly,
          percentage: calculatePercentage(
            quota.posts.monthly.used,
            quota.posts.monthly.limit
          ),
          status: getStatus(
            calculatePercentage(
              quota.posts.monthly.used,
              quota.posts.monthly.limit
            )
          ),
        },
      },
      profiles: {
        ...quota.profiles,
        percentage: calculatePercentage(
          quota.profiles.used,
          quota.profiles.limit
        ),
        status: getStatus(
          calculatePercentage(quota.profiles.used, quota.profiles.limit)
        ),
      },
      accounts: {
        ...quota.accounts,
        percentage: calculatePercentage(
          quota.accounts.used,
          quota.accounts.limit
        ),
        status: getStatus(
          calculatePercentage(quota.accounts.used, quota.accounts.limit)
        ),
      },
      features: quota.features,
    };
  } catch (error) {
    console.error('[Quota] Error getting quota status:', error);
    throw new Error('Failed to get quota status');
  }
}
