import { authed } from '@/orpc';
import { ORPCError } from '@orpc/server';
import { z } from 'zod';

const ShareProfilesSchema = z.object({
  email: z.string().email(),
  profileIds: z.array(z.string().min(1)).min(1),
  scopes: z.array(z.string()).optional().default(['post']),
  expiresInDays: z.number().int().min(1).max(90).default(7),
});

const RevokeShareSchema = z.object({
  memberUserId: z.string().min(1),
  profileId: z.string().min(1),
});

export const profileShareRouter = {
  shareProfiles: authed
    .route({
      method: 'POST',
      path: '/team/share-profiles',
      summary: 'Share selected profiles with a user by email',
      tags: ['Team'],
    })
    .input(ShareProfilesSchema)
    .output(
      z.object({
        createdShares: z.number().default(0),
        inviteUrl: z.string().nullable().default(null),
      })
    )
    .handler(async ({ input, context }) => {
      const { prisma, user } = context as { prisma: any; user: any };

      // Ensure profiles belong to the inviter
      const owned = await prisma.socialProfile.findMany({
        where: { id: { in: input.profileIds }, userId: user.id },
        select: { id: true },
      });
      if (owned.length !== input.profileIds.length) {
        throw new ORPCError('FORBIDDEN', {
          message: 'You can only share profiles you own',
        });
      }

      const member = await prisma.user.findUnique({
        where: { email: input.email },
      });
      if (!member) {
        // Create a TEAM invite
        const token = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);
        await (prisma as any).invite.create({
          data: {
            email: input.email,
            inviterId: user.id,
            kind: 'TEAM',
            planTier: null,
            profileIds: input.profileIds,
            token,
            expiresAt,
          },
        });
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const inviteUrl = `${baseUrl}/invite/accept?token=${encodeURIComponent(token)}`;
        return { createdShares: 0, inviteUrl };
      }

      // Member exists: create shares
      const toCreate = input.profileIds.map(pid =>
        (prisma as any).profileShare.upsert({
          where: {
            profileId_memberUserId: { profileId: pid, memberUserId: member.id },
          },
          create: {
            profileId: pid,
            memberUserId: member.id,
            createdById: user.id,
            scopes: input.scopes ?? ['post'],
          },
          update: { scopes: input.scopes ?? ['post'] },
        })
      );
      await prisma.$transaction(toCreate);
      return { createdShares: toCreate.length, inviteUrl: null };
    }),

  revokeShare: authed
    .route({
      method: 'POST',
      path: '/team/revoke-share',
      summary: 'Revoke a member access to a profile',
      tags: ['Team'],
    })
    .input(RevokeShareSchema)
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input, context }) => {
      const { prisma, user } = context as { prisma: any; user: any };

      // Ensure the current user owns the profile
      const profile = await prisma.socialProfile.findFirst({
        where: { id: input.profileId, userId: user.id },
      });
      if (!profile) {
        throw new ORPCError('FORBIDDEN', { message: 'Not profile owner' });
      }

      await (prisma as any).profileShare.deleteMany({
        where: { profileId: input.profileId, memberUserId: input.memberUserId },
      });
      return { success: true };
    }),

  listShares: authed
    .route({
      method: 'GET',
      path: '/team/list-shares',
      summary: 'List all members who have access to your profiles',
      tags: ['Team'],
    })
    .output(
      z.array(
        z.object({
          profileId: z.string(),
          memberUserId: z.string(),
          scopes: z.array(z.string()),
          createdAt: z.date(),
        })
      )
    )
    .handler(async ({ context }) => {
      const { prisma, user } = context as { prisma: any; user: any };

      // Get shares for profiles the user owns
      const profiles = await prisma.socialProfile.findMany({
        where: { userId: user.id },
        select: { id: true },
      });
      const profileIds = (profiles as any[]).map((p: any) => p.id);
      if (profileIds.length === 0) return [] as any[];

      const shares = await (prisma as any).profileShare.findMany({
        where: { profileId: { in: profileIds } },
      });
      return shares as any;
    }),

  listSharesDetailed: authed
    .route({
      method: 'GET',
      path: '/team/list-shares-detailed',
      summary: 'List members with access including member and profile details',
      tags: ['Team'],
    })
    .output(
      z.array(
        z.object({
          profileId: z.string(),
          profileName: z.string(),
          memberUserId: z.string(),
          memberEmail: z.string().nullable(),
          memberName: z.string().nullable(),
          scopes: z.array(z.string()),
          createdAt: z.date(),
        })
      )
    )
    .handler(async ({ context }) => {
      const { prisma, user } = context as { prisma: any; user: any };
      const profiles = await prisma.socialProfile.findMany({
        where: { userId: user.id },
        select: { id: true, name: true },
      });
      const profileIds = (profiles as any[]).map((p: any) => p.id);
      if (profileIds.length === 0) return [] as any[];
      const shares = await (prisma as any).profileShare.findMany({
        where: { profileId: { in: profileIds } },
      });
      const memberIds = Array.from(
        new Set((shares as any[]).map((s: any) => s.memberUserId))
      );
      const members = await prisma.user.findMany({
        where: { id: { in: memberIds } },
        select: { id: true, email: true, name: true },
      });
      const memberMap = new Map<string, any>(
        members.map((m: any) => [m.id, m])
      );
      const profileMap = new Map<string, any>(
        (profiles as any[]).map((p: any) => [p.id, p])
      );
      return (shares as any[]).map((s: any) => ({
        profileId: s.profileId,
        profileName: profileMap.get(s.profileId)?.name ?? '',
        memberUserId: s.memberUserId,
        memberEmail: memberMap.get(s.memberUserId)?.email ?? null,
        memberName: memberMap.get(s.memberUserId)?.name ?? null,
        scopes: s.scopes,
        createdAt: s.createdAt,
      }));
    }),

  listMyAccess: authed
    .route({
      method: 'GET',
      path: '/team/list-my-access',
      summary: 'List profiles current user has access to and the owner info',
      tags: ['Team'],
    })
    .output(
      z.array(
        z.object({
          profileId: z.string(),
          profileName: z.string(),
          ownerUserId: z.string(),
          ownerEmail: z.string().nullable(),
          ownerName: z.string().nullable(),
          scopes: z.array(z.string()),
          createdAt: z.date(),
        })
      )
    )
    .handler(async ({ context }) => {
      const { prisma, user } = context as { prisma: any; user: any };
      const shares = await (prisma as any).profileShare.findMany({
        where: { memberUserId: user.id },
      });
      if ((shares as any[]).length === 0) return [] as any[];
      const profileIds = Array.from(
        new Set((shares as any[]).map((s: any) => s.profileId))
      );
      const profiles = await prisma.socialProfile.findMany({
        where: { id: { in: profileIds } },
        select: { id: true, name: true, userId: true },
      });
      const ownerIds = Array.from(
        new Set((profiles as any[]).map((p: any) => p.userId))
      );
      const owners = await prisma.user.findMany({
        where: { id: { in: ownerIds } },
        select: { id: true, email: true, name: true },
      });
      const profileMap = new Map<string, any>(
        (profiles as any[]).map((p: any) => [p.id, p])
      );
      const ownerMap = new Map<string, any>(owners.map((o: any) => [o.id, o]));
      return (shares as any[]).map((s: any) => {
        const p = profileMap.get(s.profileId);
        const owner = p ? ownerMap.get(p.userId) : undefined;
        return {
          profileId: s.profileId,
          profileName: p?.name ?? '',
          ownerUserId: p?.userId ?? '',
          ownerEmail: owner?.email ?? null,
          ownerName: owner?.name ?? null,
          scopes: s.scopes,
          createdAt: s.createdAt,
        };
      });
    }),
};
