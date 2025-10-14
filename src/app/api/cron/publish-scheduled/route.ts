/**
 * Cron job to publish scheduled posts
 *
 * This handles scheduled posts for platforms that don't support native scheduling
 * (e.g., Instagram, Twitter, LinkedIn, TikTok, Threads, YouTube)
 *
 * Facebook supports native scheduling via its API, so this cron job will skip Facebook posts.
 * Instagram does NOT support native scheduling, so it's handled by this cron job.
 *
 * Run every 5 minutes to check for posts that need to be published.
 */

import { prisma } from '@/lib/db';
import { getPublisher } from '@/lib/social-publishers';
import { type NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Maximum execution time in seconds

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    // Find posts that are scheduled and due for publishing
    // Only select posts for platforms that don't support native scheduling
    const postsToPublish = await prisma.post.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledFor: {
          lte: fiveMinutesFromNow,
          gte: now,
        },
      },
      include: {
        platforms: {
          where: {
            status: 'PENDING',
            // Only process platforms that don't have native scheduling
            // Facebook has native scheduling, but Instagram does not
            platform: {
              notIn: ['FACEBOOK'],
            },
          },
        },
        profile: true,
      },
    });

    if (postsToPublish.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No posts to publish',
        processed: 0,
      });
    }

    let processed = 0;
    let failed = 0;

    // Process each post
    for (const post of postsToPublish) {
      for (const postPlatform of post.platforms) {
        try {
          // Fetch the connected account
          const account = await prisma.connectedAccount.findUnique({
            where: { id: postPlatform.accountId },
          });

          if (!account || !account.accessToken) {
            await prisma.postPlatform.update({
              where: { id: postPlatform.id },
              data: {
                status: 'FAILED',
                errorMessage: 'No access token available',
              },
            });
            failed++;
            continue;
          }

          // Get the appropriate publisher
          const publisher = getPublisher(account.platform);
          if (!publisher) {
            await prisma.postPlatform.update({
              where: { id: postPlatform.id },
              data: {
                status: 'FAILED',
                errorMessage: `Platform ${account.platform} not supported`,
              },
            });
            failed++;
            continue;
          }

          // Extract platform-specific content
          const platformKey = account.platform.toLowerCase();
          let platformContent: any = post.content;

          if (typeof post.content === 'object' && post.content !== null) {
            const contentObj = post.content as Record<string, any>;
            if (platformKey in contentObj) {
              platformContent = contentObj[platformKey];
            } else {
              const contentValues = Object.values(contentObj);
              if (contentValues.length > 0) {
                platformContent = contentValues[0];
              }
            }
          }

          // Prepare publish request (NO scheduledFor since we're publishing NOW)
          const publishRequest = {
            accountId: account.id,
            platform: account.platform,
            content: platformContent,
            mediaItems: (post.mediaUrls || []).map((url: string) => ({
              url,
              type: 'image' as const,
            })),
            accessToken: account.accessToken,
            platformUserId: account.platformUserId,
          };

          // Publish to platform
          const result = await publisher.publish(publishRequest);

          if (result.success) {
            await prisma.postPlatform.update({
              where: { id: postPlatform.id },
              data: {
                status: 'PUBLISHED',
                publishedId: result.platformPostId,
                publishedUrl: result.platformPostUrl,
                publishedAt: new Date(),
              },
            });
            processed++;
          } else {
            await prisma.postPlatform.update({
              where: { id: postPlatform.id },
              data: {
                status: 'FAILED',
                errorMessage: result.error || 'Unknown error',
              },
            });
            failed++;
          }
        } catch (error: any) {
          console.error(
            `Error publishing post ${post.id} to platform ${postPlatform.platform}:`,
            error
          );
          await prisma.postPlatform.update({
            where: { id: postPlatform.id },
            data: {
              status: 'FAILED',
              errorMessage: error.message || 'Publishing failed',
            },
          });
          failed++;
        }
      }

      // Update post status based on platform results
      const updatedPlatforms = await prisma.postPlatform.findMany({
        where: { postId: post.id },
      });

      // Check if all platforms are either PUBLISHED or SCHEDULED (Meta native scheduling)
      const allPublished = updatedPlatforms.every(
        pp => pp.status === 'PUBLISHED' || pp.status === 'SCHEDULED'
      );
      const anyPublished = updatedPlatforms.some(
        pp => pp.status === 'PUBLISHED'
      );

      // Determine if there are any platforms that were actually published by this cron
      const hasScheduled = updatedPlatforms.some(
        pp => pp.status === 'SCHEDULED'
      );

      if (allPublished) {
        // If we have any published platforms, mark the post as published
        // If all are still scheduled (Meta native), keep as SCHEDULED
        if (anyPublished) {
          await prisma.post.update({
            where: { id: post.id },
            data: {
              status: 'PUBLISHED',
              publishedAt: new Date(),
            },
          });
        }
        // Else keep as SCHEDULED - Meta will handle publishing
      } else if (!anyPublished && !hasScheduled) {
        // All failed - mark as FAILED
        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: 'FAILED',
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processed} posts, ${failed} failed`,
      processed,
      failed,
      total: postsToPublish.length,
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process scheduled posts',
      },
      { status: 500 }
    );
  }
}
