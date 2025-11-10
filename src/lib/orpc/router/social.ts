/**
 * Social Connections oRPC Router
 * Handles Instagram, Facebook, and other social platform connections
 */

import {
  createLinkedInOAuthService,
  saveLinkedInAccount,
} from '@/lib/linkedin-oauth';
import {
  createMetaOAuthService,
  generateOAuthState,
  saveConnectedAccount,
} from '@/lib/meta-oauth';
import { createRedditOAuthService } from '@/lib/reddit-oauth';
import { getTierLimits } from '@/lib/subscription';
import {
  createTwitterOAuthService,
  generatePkceChallenge,
  generatePkceVerifier,
  saveTwitterAccount,
} from '@/lib/twitter-oauth';
import { authed } from '@/orpc';
import { ORPCError } from '@orpc/server';
import type { Platform } from '@prisma/client';
import { z } from 'zod';

// Schemas
const PlatformEnum = z.enum([
  'FACEBOOK',
  'INSTAGRAM',
  'TWITTER',
  'LINKEDIN',
  'TIKTOK',
  'YOUTUBE',
  'THREADS',
  'REDDIT',
]);

const CreateProfileSchema = z.object({
  name: z.string().min(1, 'Profile name is required'),
  description: z.string().optional(),
  color: z.string().default('#ffeda0'),
});

const GetAccountsSchema = z.object({
  profileId: z.string().min(1, 'Profile ID is required'),
});

const InitiateConnectionSchema = z.object({
  platform: PlatformEnum,
  profileId: z.string().min(1, 'Profile ID is required'),
});

const CompleteConnectionSchema = z.object({
  platform: PlatformEnum,
  profileId: z.string().min(1, 'Profile ID is required'),
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().min(1, 'State is required'),
});

const DisconnectAccountSchema = z.object({
  accountId: z.string().min(1, 'Account ID is required'),
});

const UpdateProfileSchema = z.object({
  profileId: z.string().min(1, 'Profile ID is required'),
  name: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
});

const DeleteProfileSchema = z.object({
  profileId: z.string().min(1, 'Profile ID is required'),
});

// Response Schemas
const ProfileResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  color: z.string().nullable(),
  isDefault: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const ConnectedAccountResponseSchema = z.object({
  id: z.string(),
  platform: PlatformEnum,
  username: z.string(),
  displayName: z.string().nullable(),
  profileImageUrl: z.string().nullable(),
  connectedAt: z.date(),
  isActive: z.boolean(),
});

export const socialRouter = {
  /**
   * Create a new social profile
   */
  createProfile: authed
    .route({
      method: 'POST',
      path: '/social/profiles/create',
      summary: 'Create a new social profile',
      tags: ['Social'],
    })
    .input(CreateProfileSchema)
    .output(ProfileResponseSchema)
    .handler(async ({ input, context }) => {
      const { user, prisma } = context;

      if (!prisma) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Database not available',
        });
      }

      // Check user's profile limit based on subscription
      const userWithUsage = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          usage: true,
          subscription: true,
        },
      });

      if (!userWithUsage) {
        throw new ORPCError('NOT_FOUND', {
          message: 'User not found',
        });
      }

      // Get tier configuration
      const tierConfig = await prisma.tierConfig.findUnique({
        where: { tier: userWithUsage.subscription?.tier || 'FREE' },
      });

      if (tierConfig && userWithUsage.usage) {
        if (userWithUsage.usage.profileCount >= tierConfig.maxProfiles) {
          throw new ORPCError('FORBIDDEN', {
            message: `Profile limit reached. Your plan allows ${tierConfig.maxProfiles} profiles.`,
          });
        }
      }

      // Check current profile count from DB for accurate enforcement
      const profileCount = await prisma.socialProfile.count({
        where: { userId: user.id },
      });

      // Enforce with fallback to code limits if TierConfig is missing
      const effectiveTier = userWithUsage.subscription?.tier || 'FREE';
      const maxProfiles =
        tierConfig?.maxProfiles ?? getTierLimits(effectiveTier).maxProfiles;

      if (maxProfiles !== -1 && profileCount >= maxProfiles) {
        throw new ORPCError('FORBIDDEN', {
          message: `Profile limit reached. Your plan allows ${maxProfiles} profiles.`,
        });
      }

      const isFirst = profileCount === 0;

      // Create profile
      const profile = await prisma.socialProfile.create({
        data: {
          userId: user.id,
          name: input.name,
          description: input.description,
          color: input.color,
          isDefault: isFirst,
        },
      });

      // Update usage count
      await prisma.usage.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          profileCount: 1,
        },
        update: {
          profileCount: {
            increment: 1,
          },
        },
      });

      // Log the action
      await prisma.usageLog.create({
        data: {
          userId: user.id,
          action: 'PROFILE_CONNECTED',
          metadata: {
            profileId: profile.id,
            profileName: profile.name,
          },
        },
      });

      return profile;
    }),

  /**
   * Get all profiles for the current user
   */
  'get-profiles': authed
    .route({
      method: 'GET',
      path: '/social/get-profiles',
      summary: 'Get all social profiles',
      tags: ['Social'],
    })
    .output(z.array(ProfileResponseSchema))
    .handler(async ({ context }) => {
      const { user, prisma } = context;

      if (!prisma) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Database not available',
        });
      }

      // Own profiles
      const ownProfiles = await prisma.socialProfile.findMany({
        where: { userId: user.id },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
      });

      // Profiles shared to this user
      const shares = await prisma.profileShare.findMany({
        where: { memberUserId: user.id },
        include: { profile: true },
      });
      const sharedProfiles = shares.map((s: any) => s.profile);

      // Merge unique profiles
      const map = new Map<string, any>();
      for (const p of ownProfiles) map.set(p.id, p);
      for (const p of sharedProfiles) if (!map.has(p.id)) map.set(p.id, p);
      return Array.from(map.values());
    }),

  /**
   * Update a profile
   */
  'update-profile': authed
    .route({
      method: 'PUT',
      path: '/social/update-profile',
      summary: 'Update a social profile',
      tags: ['Social'],
    })
    .input(UpdateProfileSchema)
    .output(ProfileResponseSchema)
    .handler(async ({ input, context }) => {
      const { user, prisma } = context;

      if (!prisma) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Database not available',
        });
      }

      // Verify ownership
      const profile = await prisma.socialProfile.findFirst({
        where: {
          id: input.profileId,
          userId: user.id,
        },
      });

      if (!profile) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Profile not found',
        });
      }

      // Update profile
      const updated = await prisma.socialProfile.update({
        where: { id: input.profileId },
        data: {
          name: input.name,
          description: input.description,
          color: input.color,
        },
      });

      return updated;
    }),

  /**
   * Delete a profile
   */
  'delete-profile': authed
    .route({
      method: 'DELETE',
      path: '/social/delete-profile',
      summary: 'Delete a social profile',
      tags: ['Social'],
    })
    .input(DeleteProfileSchema)
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input, context }) => {
      const { user, prisma } = context;

      if (!prisma) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Database not available',
        });
      }

      // Verify ownership
      const profile = await prisma.socialProfile.findFirst({
        where: {
          id: input.profileId,
          userId: user.id,
        },
      });

      if (!profile) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Profile not found',
        });
      }

      // Delete profile (cascade will delete connected accounts)
      await prisma.socialProfile.delete({
        where: { id: input.profileId },
      });

      // Update usage count
      await prisma.usage.update({
        where: { userId: user.id },
        data: {
          profileCount: {
            decrement: 1,
          },
        },
      });

      return { success: true };
    }),

  /**
   * Get connected accounts for a profile
   */
  'get-connected-accounts': authed
    .route({
      method: 'GET',
      path: '/social/get-connected-accounts',
      summary: 'Get connected accounts for a profile',
      tags: ['Social'],
    })
    .input(GetAccountsSchema)
    .output(z.array(ConnectedAccountResponseSchema))
    .handler(async ({ input, context }) => {
      const { user, prisma } = context;

      if (!prisma) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Database not available',
        });
      }

      // Verify ownership or share
      const profile = await prisma.socialProfile.findFirst({
        where: { id: input.profileId, userId: user.id },
      });
      if (!profile) {
        const shared = await prisma.profileShare.findFirst({
          where: { profileId: input.profileId, memberUserId: user.id },
        });
        if (!shared) {
          throw new ORPCError('NOT_FOUND', {
            message: 'Profile not found',
          });
        }
      }

      const accounts = await prisma.connectedAccount.findMany({
        where: {
          profileId: input.profileId,
        },
        orderBy: { connectedAt: 'desc' },
      });

      return accounts;
    }),

  /**
   * Initiate OAuth connection for Instagram or Facebook
   */
  'initiate-connection': authed
    .route({
      method: 'POST',
      path: '/social/initiate-connection',
      summary: 'Initiate OAuth connection for social platform',
      tags: ['Social'],
    })
    .input(InitiateConnectionSchema)
    .output(z.object({ authUrl: z.string(), state: z.string() }))
    .handler(async ({ input, context }) => {
      const { user, prisma } = context;

      if (!prisma) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Database not available',
        });
      }

      // Verify profile ownership
      const profile = await prisma.socialProfile.findFirst({
        where: {
          id: input.profileId,
          userId: user.id,
        },
      });

      if (!profile) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Profile not found',
        });
      }

      const { platform } = input;

      // Build redirect URI
      const baseRaw =
        process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const redirectUri = `${baseRaw}/dashboard/connections`;
      console.log('platform', platform);
      // Generate state for CSRF protection and encode it with metadata
      // This encoded state will be sent to the OAuth provider and returned in the callback
      const encodedState = Buffer.from(
        JSON.stringify({
          nonce: generateOAuthState(), // Random nonce for CSRF protection
          profileId: input.profileId,
          platform,
          userId: user.id,
        })
      ).toString('base64');

      if (platform === 'INSTAGRAM' || platform === 'FACEBOOK') {
        const metaOAuth = createMetaOAuthService(redirectUri);
        const authUrl =
          platform === 'INSTAGRAM'
            ? metaOAuth.getInstagramAuthUrl(encodedState)
            : metaOAuth.getFacebookAuthUrl(encodedState);
        return { authUrl, state: encodedState };
      }

      if (platform === 'LINKEDIN') {
        const li = createLinkedInOAuthService(redirectUri);
        const authUrl = li.getAuthUrl(encodedState);
        return { authUrl, state: encodedState };
      }

      if (platform === 'TWITTER') {
        // Use the correct Twitter callback URL
        const twitterRedirectUri = `${baseRaw}/api/auth/twitter/callback`;
        const tw = createTwitterOAuthService(twitterRedirectUri);
        const codeVerifier = generatePkceVerifier();
        const codeChallenge = generatePkceChallenge(codeVerifier);

        // Embed codeVerifier in state (stateless approach)
        const stateWithPkce = Buffer.from(
          JSON.stringify({
            nonce: generateOAuthState(),
            profileId: input.profileId,
            platform,
            userId: user.id,
            codeVerifier,
          })
        ).toString('base64');

        const authUrl = tw.getAuthUrl(stateWithPkce, codeChallenge);
        return { authUrl, state: stateWithPkce };
      }

      if (platform === 'REDDIT') {
        const reddit = createRedditOAuthService(redirectUri);
        const authUrl = reddit.getAuthUrl(encodedState);
        return { authUrl, state: encodedState };
      }

      throw new ORPCError('BAD_REQUEST', {
        message: `Platform ${platform} is not supported yet.`,
      });
    }),

  /**
   * Complete OAuth connection after callback
   */
  'complete-connection': authed
    .route({
      method: 'POST',
      path: '/social/complete-connection',
      summary: 'Complete OAuth connection after callback',
      tags: ['Social'],
    })
    .input(CompleteConnectionSchema)
    .output(
      z.object({
        success: z.boolean(),
        accounts: z.array(ConnectedAccountResponseSchema),
      })
    )
    .handler(async ({ input, context }) => {
      const { user, prisma } = context;

      if (!prisma) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Database not available',
        });
      }

      const { code, state, platform, profileId } = input;

      // Verify state
      let stateData: {
        nonce: string;
        profileId: string;
        platform: string;
        userId: string;
        codeVerifier?: string;
      };

      try {
        stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      } catch {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Invalid state parameter',
        });
      }

      // Verify state matches
      if (
        stateData.profileId !== profileId ||
        stateData.platform !== platform ||
        stateData.userId !== user.id
      ) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'State verification failed',
        });
      }

      // Verify nonce exists (CSRF protection)
      if (!stateData.nonce) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Invalid state: missing nonce',
        });
      }

      // Verify profile ownership
      const profile = await prisma.socialProfile.findFirst({
        where: {
          id: profileId,
          userId: user.id,
        },
      });

      if (!profile) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Profile not found',
        });
      }

      const baseRaw =
        process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const redirectUri = `${baseRaw}/dashboard/connections`;

      if (platform === 'INSTAGRAM') {
        const metaOAuth = createMetaOAuthService(redirectUri);
        // Instagram Business Login flow
        const tokenResponse =
          await metaOAuth.exchangeCodeForInstagramToken(code);

        const shortLivedToken = tokenResponse.access_token;

        // Get long-lived Instagram token
        const longLivedToken =
          await metaOAuth.getInstagramLongLivedToken(shortLivedToken);

        // Fetch Instagram account details
        const accountDetails = await metaOAuth.getInstagramAccountDetails(
          longLivedToken.access_token
        );

        // Save Instagram account with actual details
        const account = await saveConnectedAccount({
          profileId,
          platform: 'INSTAGRAM' as Platform,
          platformUserId: accountDetails.user_id,
          username: accountDetails.username,
          displayName: accountDetails.name || accountDetails.username,
          profileImageUrl: accountDetails.profile_picture_url,
          accessToken: longLivedToken.access_token,
          tokenExpiresAt: longLivedToken.expires_in
            ? new Date(Date.now() + longLivedToken.expires_in * 1000)
            : undefined,
          platformData: {
            permissions: tokenResponse.permissions,
            account_type: accountDetails.account_type,
          },
        });

        return {
          success: true,
          accounts: [account],
        };
      } else if (platform === 'FACEBOOK') {
        const metaOAuth = createMetaOAuthService(redirectUri);
        // Facebook flow
        const tokenResponse =
          await metaOAuth.exchangeCodeForFacebookToken(code);

        // Get long-lived Facebook token
        const longLivedToken = await metaOAuth.getFacebookLongLivedToken(
          tokenResponse.access_token
        );

        const expiresAt = longLivedToken.expires_in
          ? new Date(Date.now() + longLivedToken.expires_in * 1000)
          : undefined;

        const savedAccounts = [];

        // Get user's Facebook pages
        const pages = await metaOAuth.getUserPages(longLivedToken.access_token);

        for (const page of pages) {
          // Save each page as a connected account
          const account = await saveConnectedAccount({
            profileId,
            platform: 'FACEBOOK' as Platform,
            platformUserId: page.id,
            username: page.name,
            displayName: page.name,
            profileImageUrl: page.picture?.data?.url,
            accessToken: page.access_token, // Use page token, not user token
            tokenExpiresAt: undefined, // Page tokens don't expire
            platformData: {
              category: page.category,
            },
          });

          savedAccounts.push(account);
        }

        return {
          success: true,
          accounts: savedAccounts,
        };
      } else if (platform === 'LINKEDIN') {
        const li = createLinkedInOAuthService(redirectUri);
        const token = await li.exchangeCodeForToken(code);

        const accessToken = token.access_token;
        const expiresAt = token.expires_in
          ? new Date(Date.now() + token.expires_in * 1000)
          : undefined;

        // Fetch member profile
        const me = await li.getMemberProfile(accessToken);
        const memberUrn = `urn:li:person:${me.id}`;
        const displayName = [me.localizedFirstName, me.localizedLastName]
          .filter(Boolean)
          .join(' ');

        const saved: any[] = [];

        // Save member as an account (personal posting)
        const memberAccount = await saveLinkedInAccount({
          profileId,
          platform: 'LINKEDIN' as Platform,
          platformUserId: memberUrn,
          username: displayName || me.id,
          displayName: displayName || me.id,
          profileImageUrl: undefined,
          accessToken,
          refreshToken: token.refresh_token,
          tokenExpiresAt: expiresAt,
          platformData: { type: 'PERSON' },
        });
        saved.push(memberAccount);

        // Also save admin organizations (company pages) if any
        try {
          const orgs = await li.getAdminOrganizations(accessToken);
          for (const org of orgs) {
            const orgUrn = `urn:li:organization:${org.id}`;
            const orgAccount = await saveLinkedInAccount({
              profileId,
              platform: 'LINKEDIN' as Platform,
              platformUserId: orgUrn,
              username: org.localizedName || org.vanityName || String(org.id),
              displayName:
                org.localizedName || org.vanityName || String(org.id),
              profileImageUrl: undefined,
              accessToken,
              refreshToken: token.refresh_token,
              tokenExpiresAt: expiresAt,
              platformData: { type: 'ORGANIZATION' },
            });
            saved.push(orgAccount);
          }
        } catch {}

        return { success: true, accounts: saved };
      } else if (platform === 'TWITTER') {
        const tw = createTwitterOAuthService(redirectUri);

        const codeVerifier = stateData?.codeVerifier as string | undefined;
        if (!codeVerifier) {
          throw new ORPCError('BAD_REQUEST', {
            message: 'Missing PKCE verifier in state',
          });
        }

        const token = await tw.exchangeCodeForToken({ code, codeVerifier });
        const accessToken = token.access_token;
        const expiresAt = token.expires_in
          ? new Date(Date.now() + token.expires_in * 1000)
          : undefined;

        const me = await tw.getUserMe(accessToken);

        const account = await saveTwitterAccount({
          profileId,
          platform: 'TWITTER' as Platform,
          platformUserId: me.id,
          username: me.username,
          displayName: me.name,
          profileImageUrl: me.profile_image_url,
          accessToken,
          refreshToken: token.refresh_token,
          tokenExpiresAt: expiresAt,
          platformData: { token_type: token.token_type, scope: token.scope },
        });

        return { success: true, accounts: [account] };
      } else if (platform === 'REDDIT') {
        const reddit = createRedditOAuthService(redirectUri);
        const token = await reddit.exchangeCodeForToken(code);
        const accessToken = token.access_token;
        const expiresAt = token.expires_in
          ? new Date(Date.now() + token.expires_in * 1000)
          : undefined;

        const me = await reddit.getUserMe(accessToken);
        const displayName = me.name;
        const avatar = me.icon_img || me.snoovatar_img;

        const account = await saveConnectedAccount({
          profileId,
          platform: 'REDDIT' as Platform,
          platformUserId: me.id,
          username: displayName,
          displayName,
          profileImageUrl: avatar,
          accessToken,
          refreshToken: token.refresh_token,
          tokenExpiresAt: expiresAt,
          platformData: { token_type: token.token_type, scope: token.scope },
        });

        return { success: true, accounts: [account] };
      }

      // This should never be reached
      throw new ORPCError('BAD_REQUEST', {
        message: 'Unsupported platform',
      });
    }),

  /**
   * Disconnect a social account
   */
  'disconnect-account': authed
    .route({
      method: 'POST',
      path: '/social/disconnect-account',
      summary: 'Disconnect a social account',
      tags: ['Social'],
    })
    .input(DisconnectAccountSchema)
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input, context }) => {
      const { session, prisma } = context;

      if (!prisma) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Database not available',
        });
      }

      // Find account and verify ownership
      const account = await prisma.connectedAccount.findFirst({
        where: {
          id: input.accountId,
        },
        include: {
          profile: true,
        },
      });

      if (!account) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Account not found',
        });
      }

      if (account.profile.userId !== session.user?.id) {
        throw new ORPCError('FORBIDDEN', {
          message: 'You do not have permission to disconnect this account',
        });
      }

      if (
        account.accessToken &&
        (account.platform === 'INSTAGRAM' || account.platform === 'FACEBOOK')
      ) {
        try {
          const baseRaw =
            process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
          const redirectUri = `${baseRaw}/dashboard/connections`;
          const metaOAuth = createMetaOAuthService(redirectUri);
          await metaOAuth.revokeToken(account.accessToken);
        } catch (error) {
          console.error('[Meta OAuth] Error revoking token:', error);
          // Continue with deletion even if revocation fails
        }
      }

      // Delete account
      await prisma.connectedAccount.delete({
        where: { id: input.accountId },
      });

      // Log the disconnection
      await prisma.usageLog.create({
        data: {
          userId: session.user?.id,
          action: 'PROFILE_DISCONNECTED',
          metadata: {
            platform: account.platform,
            accountId: account.id,
            username: account.username,
          },
        },
      });

      return { success: true };
    }),
};
