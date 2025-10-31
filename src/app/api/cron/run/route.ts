import { prisma } from '@/lib/db';
import { getPublisher } from '@/lib/social-publishers/publishers';
import type { PublishRequest } from '@/lib/social-publishers/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  try {
    const now = new Date();

    // Find posts that are scheduled and due (scheduledFor <= now)
    const duePosts = await prisma.post.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledFor: { lte: now },
      },
      include: {
        platforms: true,
      },
    });

    let processed = 0;
    const errors: Array<{ postId: string; error: string }> = [];

    for (const post of duePosts) {
      try {
        // Load connected accounts for the post's platforms
        const accounts = await prisma.connectedAccount.findMany({
          where: {
            id: { in: post.platforms.map(p => p.accountId) },
            profileId: post.profileId,
            isActive: true,
          },
        });

        // Mark post as publishing
        await prisma.post.update({
          where: { id: post.id },
          data: { status: 'PUBLISHING' },
        });

        const publishErrors: string[] = [];

        for (const pp of post.platforms) {
          const account = accounts.find(a => a.id === pp.accountId);
          if (!account) {
            publishErrors.push(`No connected account for ${pp.platform}`);
            await prisma.postPlatform.update({
              where: { id: pp.id },
              data: { status: 'FAILED', errorMessage: 'Account not found' },
            });
            continue;
          }

          if (!account.accessToken) {
            publishErrors.push(`No token for ${pp.platform}`);
            await prisma.postPlatform.update({
              where: { id: pp.id },
              data: { status: 'FAILED', errorMessage: 'Missing access token' },
            });
            continue;
          }

          const publisher = getPublisher(account.platform);
          if (!publisher) {
            publishErrors.push(`Unsupported platform ${account.platform}`);
            await prisma.postPlatform.update({
              where: { id: pp.id },
              data: { status: 'FAILED', errorMessage: 'Unsupported platform' },
            });
            continue;
          }

          const platformKey = account.platform.toLowerCase();
          let platformContent: any = post.content;
          if (typeof post.content === 'object' && post.content !== null) {
            if (platformKey in post.content) {
              platformContent =
                post.content[platformKey as keyof typeof post.content];
            } else {
              const vals = Object.values(post.content);
              if (vals.length > 0) platformContent = vals[0];
            }
          }

          const req: PublishRequest = {
            accountId: account.id,
            platform: account.platform,
            content: platformContent,
            mediaItems: post.mediaUrls?.map(url => ({ url, type: 'image' })),
            accessToken: account.accessToken!,
            platformUserId: account.platformUserId,
          };

          try {
            const result = await publisher.publish(req);
            if (result.success) {
              await prisma.postPlatform.update({
                where: { id: pp.id },
                data: {
                  status: 'PUBLISHED',
                  publishedId: result.platformPostId,
                  publishedUrl: result.platformPostUrl,
                  publishedAt: new Date(),
                },
              });
            } else {
              publishErrors.push(result.error || 'Unknown publish error');
              await prisma.postPlatform.update({
                where: { id: pp.id },
                data: {
                  status: 'FAILED',
                  errorMessage: result.error || undefined,
                },
              });
            }
          } catch (e: any) {
            const msg = e?.message || 'Publishing failed';
            publishErrors.push(msg);
            await prisma.postPlatform.update({
              where: { id: pp.id },
              data: { status: 'FAILED', errorMessage: msg },
            });
          }
        }

        const updated = await prisma.postPlatform.findMany({
          where: { postId: post.id },
        });
        const allSuccess = updated.every(u => u.status === 'PUBLISHED');

        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: allSuccess ? 'PUBLISHED' : 'FAILED',
            publishedAt: allSuccess ? new Date() : null,
          },
        });

        processed += 1;
      } catch (e: any) {
        errors.push({ postId: post.id, error: e?.message || 'Unknown error' });
      }
    }

    return NextResponse.json({ processed, errors });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal error' },
      { status: 500 }
    );
  }
}
