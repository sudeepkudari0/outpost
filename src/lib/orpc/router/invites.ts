import { sendMagicLinkEmail, sendTeamInviteEmail } from '@/lib/mail';
import { updateSubscriptionTier } from '@/lib/subscription';
import { authed, pub } from '@/orpc';
import { ORPCError } from '@orpc/server';
import type { PrismaClient, SubscriptionTier } from '@prisma/client';
import { z } from 'zod';

function assertAdmin(user: { role?: string }) {
  if (user?.role !== 'ADMIN') {
    throw new ORPCError('FORBIDDEN', { message: 'Admin access required' });
  }
}

const CreatePlatformInviteSchema = z.object({
  email: z.string().email(),
  planTier: z.enum(['FREE', 'PRO', 'BUSINESS', 'ENTERPRISE']),
  expiresInDays: z.number().int().min(1).max(90).default(7),
});

const AcceptInviteSchema = z.object({ token: z.string().min(1) });

export const invitesRouter = {
  getInviteDetails: pub
    .route({
      method: 'GET',
      path: '/invites/details',
      summary: 'Get invite details by token',
      tags: ['Invites'],
    })
    .input(z.object({ token: z.string().min(1) }))
    .output(
      z.object({
        exists: z.boolean(),
        kind: z.enum(['PLATFORM', 'TEAM']).optional(),
        email: z.string().optional(),
        inviter: z
          .object({
            id: z.string(),
            name: z.string().nullable(),
            email: z.string(),
          })
          .optional(),
        teamProfiles: z
          .array(z.object({ id: z.string(), name: z.string() }))
          .optional(),
        planTier: z.string().optional(),
        expired: z.boolean().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const { prisma } = context as { prisma: any };
      const invite = await prisma.invite.findUnique({
        where: { token: input.token },
      });
      if (!invite) return { exists: false };
      const expired = invite.expiresAt < new Date();
      const inviter = await prisma.user.findUnique({
        where: { id: invite.inviterId },
        select: { id: true, name: true, email: true },
      });
      let teamProfiles: Array<{ id: string; name: string }> | undefined;
      if (
        invite.kind === 'TEAM' &&
        Array.isArray(invite.profileIds) &&
        invite.profileIds.length
      ) {
        const profiles = await prisma.socialProfile.findMany({
          where: { id: { in: invite.profileIds } },
          select: { id: true, name: true },
        });
        teamProfiles = profiles;
      }
      return {
        exists: true,
        kind: invite.kind,
        email: invite.email,
        inviter,
        teamProfiles,
        planTier: invite.planTier ?? undefined,
        expired,
      };
    }),
  listPlatformInvites: authed
    .route({
      method: 'GET',
      path: '/invites/platform/list',
      summary: 'Admin: list all platform invites',
      tags: ['Invites'],
    })
    .output(
      z.array(
        z.object({
          id: z.string(),
          email: z.string(),
          inviter: z
            .object({
              id: z.string(),
              name: z.string().nullable(),
              email: z.string(),
            })
            .nullable(),
          planTier: z.string().nullable(),
          token: z.string(),
          expiresAt: z.string(),
          acceptedAt: z.string().nullable(),
          createdAt: z.string(),
          updatedAt: z.string(),
        })
      )
    )
    .handler(async ({ context }) => {
      const { prisma, user } = context as { prisma: PrismaClient; user: any };
      assertAdmin(user);

      const invites = await prisma.invite.findMany({
        where: { kind: 'PLATFORM' },
        orderBy: { createdAt: 'desc' },
        include: {
          inviter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return invites.map(invite => ({
        id: invite.id,
        email: invite.email,
        inviter: invite.inviter,
        planTier: invite.planTier,
        token: invite.token,
        expiresAt: invite.expiresAt.toISOString(),
        acceptedAt: invite.acceptedAt?.toISOString() ?? null,
        createdAt: invite.createdAt.toISOString(),
        updatedAt: invite.updatedAt.toISOString(),
      }));
    }),

  listTeamInvites: authed
    .route({
      method: 'GET',
      path: '/invites/team/list',
      summary: 'List all team invites created by the current user',
      tags: ['Invites'],
    })
    .output(
      z.array(
        z.object({
          id: z.string(),
          email: z.string(),
          inviter: z
            .object({
              id: z.string(),
              name: z.string().nullable(),
              email: z.string(),
            })
            .nullable(),
          profileIds: z.array(z.string()),
          profileNames: z.array(z.string()),
          token: z.string(),
          expiresAt: z.string(),
          acceptedAt: z.string().nullable(),
          createdAt: z.string(),
          updatedAt: z.string(),
        })
      )
    )
    .handler(async ({ context }) => {
      const { prisma, user } = context as { prisma: PrismaClient; user: any };

      const invites = await prisma.invite.findMany({
        where: {
          kind: 'TEAM',
          inviterId: user.id,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          inviter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Get profile names for each invite
      const invitesWithProfileNames = await Promise.all(
        invites.map(async invite => {
          const profileIds = (invite.profileIds || []) as string[];
          const profiles =
            profileIds.length > 0
              ? await prisma.socialProfile.findMany({
                  where: { id: { in: profileIds } },
                  select: { id: true, name: true },
                })
              : [];

          return {
            id: invite.id,
            email: invite.email,
            inviter: invite.inviter,
            profileIds: profileIds,
            profileNames: profiles.map(p => p.name),
            token: invite.token,
            expiresAt: invite.expiresAt.toISOString(),
            acceptedAt: invite.acceptedAt?.toISOString() ?? null,
            createdAt: invite.createdAt.toISOString(),
            updatedAt: invite.updatedAt.toISOString(),
          };
        })
      );

      return invitesWithProfileNames;
    }),

  createPlatformInvite: authed
    .route({
      method: 'POST',
      path: '/invites/platform/create',
      summary: 'Admin: create a platform invite with selected tier',
      tags: ['Invites'],
    })
    .input(CreatePlatformInviteSchema)
    .output(
      z.object({
        id: z.string(),
        token: z.string(),
        inviteUrl: z.string(),
      })
    )
    .handler(async ({ input, context }) => {
      const { prisma, user } = context as { prisma: PrismaClient; user: any };
      assertAdmin(user);

      // Check for existing invite with the same email
      const existingInvite = await prisma.invite.findFirst({
        where: {
          email: input.email,
          kind: 'PLATFORM',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const now = new Date();
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

      // If invite exists, hasn't expired, and hasn't been accepted, reuse it
      if (
        existingInvite &&
        existingInvite.expiresAt > now &&
        !existingInvite.acceptedAt
      ) {
        const inviteUrl = `${baseUrl}/invite/accept?token=${encodeURIComponent(existingInvite.token)}`;
        return {
          id: existingInvite.id,
          token: existingInvite.token,
          inviteUrl,
        };
      }

      // Create new invite if none exists or the existing one has expired
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);

      const invite = await prisma.invite.create({
        data: {
          email: input.email,
          inviterId: user.id,
          kind: 'PLATFORM',
          planTier: input.planTier as SubscriptionTier,
          profileIds: [],
          token,
          expiresAt,
        },
      });

      const inviteUrl = `${baseUrl}/invite/accept?token=${encodeURIComponent(token)}`;

      return { id: invite.id, token, inviteUrl };
    }),

  sendInviteEmail: authed
    .route({
      method: 'POST',
      path: '/invites/send-email',
      summary: 'Send invite email with magic link',
      tags: ['Invites'],
    })
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().optional(),
        inviteUrl: z.string().url(),
      })
    )
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input, context }) => {
      const { user } = context as { user: any };
      assertAdmin(user);
      const name = input.name || input.email.split('@')[0];
      await sendMagicLinkEmail(input.email, name, input.inviteUrl);
      return { success: true };
    }),

  sendTeamEmail: authed
    .route({
      method: 'POST',
      path: '/invites/send-team-email',
      summary: 'Send team invite email with magic link',
      tags: ['Invites'],
    })
    .input(
      z.object({
        email: z.string().email(),
        inviterName: z.string().min(1),
        inviteUrl: z.string().url(),
        profileNames: z.array(z.string()).optional(),
      })
    )
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input }) => {
      await sendTeamInviteEmail(
        input.email,
        input.inviterName,
        input.inviteUrl,
        input.profileNames
      );
      return { success: true };
    }),

  acceptInvite: authed
    .route({
      method: 'POST',
      path: '/invites/accept',
      summary: 'Accept an invite (must be authenticated)',
      tags: ['Invites'],
    })
    .input(AcceptInviteSchema)
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input, context }) => {
      const { prisma, user } = context as { prisma: any; user: any };

      const invite = await prisma.invite.findUnique({
        where: { token: input.token },
      });
      if (!invite) {
        throw new ORPCError('NOT_FOUND', { message: 'Invalid invite' });
      }
      if (invite.acceptedAt) {
        return { success: true };
      }
      if (invite.expiresAt < new Date()) {
        throw new ORPCError('BAD_REQUEST', { message: 'Invite expired' });
      }

      if (invite.kind === 'PLATFORM') {
        const tier = (invite.planTier || 'FREE') as SubscriptionTier;
        await updateSubscriptionTier(user.id, tier);
      } else if (invite.kind === 'TEAM') {
        // Grant profile shares to the current user
        const uniqueProfileIds: string[] = Array.from(
          new Set((invite.profileIds || []) as string[])
        );
        if (uniqueProfileIds.length > 0) {
          // Validate profiles still exist
          const profiles = await prisma.socialProfile.findMany({
            where: { id: { in: uniqueProfileIds } },
            select: { id: true, userId: true },
          });
          const existingIds = new Set(profiles.map((p: any) => p.id));
          const toCreate = uniqueProfileIds.filter(id => existingIds.has(id));
          if (toCreate.length > 0) {
            await prisma.$transaction(
              toCreate.map(pid =>
                prisma.profileShare.upsert({
                  where: {
                    profileId_memberUserId: {
                      profileId: pid,
                      memberUserId: user.id,
                    },
                  },
                  create: {
                    profileId: pid,
                    memberUserId: user.id,
                    createdById: profiles.find((p: any) => p.id === pid)!
                      .userId,
                    scopes: ['post'],
                  },
                  update: {},
                })
              )
            );
          }
        }
      }

      await prisma.invite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });

      return { success: true };
    }),

  deleteInvite: authed
    .route({
      method: 'DELETE',
      path: '/invites/delete',
      summary: 'Admin: delete an invite',
      tags: ['Invites'],
    })
    .input(z.object({ inviteId: z.string().min(1) }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input, context }) => {
      const { prisma, user } = context as { prisma: PrismaClient; user: any };
      assertAdmin(user);

      await prisma.invite.delete({
        where: { id: input.inviteId },
      });

      return { success: true };
    }),

  resendInviteEmail: authed
    .route({
      method: 'POST',
      path: '/invites/resend-email',
      summary: 'Admin: resend invite email',
      tags: ['Invites'],
    })
    .input(z.object({ inviteId: z.string().min(1) }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input, context }) => {
      const { prisma, user } = context as { prisma: PrismaClient; user: any };
      assertAdmin(user);

      const invite = await prisma.invite.findUnique({
        where: { id: input.inviteId },
      });

      if (!invite) {
        throw new ORPCError('NOT_FOUND', { message: 'Invite not found' });
      }

      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const inviteUrl = `${baseUrl}/invite/accept?token=${encodeURIComponent(invite.token)}`;

      const name = invite.email.split('@')[0];
      await sendMagicLinkEmail(invite.email, name, inviteUrl);

      return { success: true };
    }),
};
