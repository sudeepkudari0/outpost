import {
  generateImage as generateAiImage,
  generateText as generateAiText,
} from '@/lib/ai';
import { getPublisher } from '@/lib/social-publishers/publishers';
import { PublishRequest } from '@/lib/social-publishers/types';
import { getPresignedUrl } from '@/lib/storage';
import { authed } from '@/orpc';
import { ORPCError } from '@orpc/server';
import { Platform } from '@prisma/client';
import { z } from 'zod';

const ListPostsInput = z.object({
  limit: z.number().int().min(1).max(200).default(50),
});

export const postsRouter = {
  list: authed
    .route({
      method: 'GET',
      path: '/posts',
      summary: 'List posts for current user',
      tags: ['Posts'],
    })
    .input(ListPostsInput.optional())
    .output(
      z.object({
        posts: z.array(
          z.object({
            id: z.string(),
            content: z.any(),
            mediaUrls: z.array(z.string()).optional(),
            status: z.string(),
            scheduledFor: z.date().nullable().optional(),
            createdAt: z.date(),
            platforms: z.array(
              z.object({
                platform: z.string(),
              })
            ),
          })
        ),
      })
    )
    .handler(async ({ input, context }) => {
      const { prisma, user } = context as { prisma: any; user: { id: string } };

      if (!prisma || !user?.id) {
        throw new ORPCError('UNAUTHORIZED', { message: 'Not authenticated' });
      }

      const limit = input?.limit ?? 50;

      const posts = await prisma.post.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: { platforms: true },
      });

      return {
        posts: posts.map((p: any) => ({
          id: p.id,
          content: p.content,
          mediaUrls: p.mediaUrls,
          status: p.status,
          scheduledFor: p.scheduledFor ?? null,
          createdAt: p.createdAt,
          platforms: p.platforms.map((pp: any) => ({ platform: pp.platform })),
        })),
      };
    }),

  compose: authed
    .route({
      method: 'POST',
      path: '/posts/compose',
      summary: 'Generate platform-specific content',
      tags: ['Posts'],
    })
    .input(
      z.object({
        prompt: z.string().min(1),
        tone: z.string().default('professional'),
        platform: z
          .enum([
            'instagram',
            'facebook',
            'linkedin',
            'twitter',
            'tiktok',
            'threads',
            'youtube',
          ])
          .default('instagram'),
        contentType: z
          .enum([
            'promotional',
            'educational',
            'inspirational',
            'behind-scenes',
            'user-generated',
            'trending',
          ])
          .default('promotional'),
        aiConfig: z
          .object({
            useUserKey: z.boolean().optional(),
            provider: z.enum(['openai', 'gemini']).optional(),
            apiKey: z.string().optional(),
          })
          .optional(),
      })
    )
    .output(z.record(z.any()))
    .handler(async ({ input, context }) => {
      const { user } = context as { user: { id: string } };
      // Helper to strip common markdown and fix hashtag formats in generated text
      function sanitizeText(text: string): string {
        if (!text) return text;
        let out = text;
        // Remove bold/italic markers
        out = out.replace(/\*\*([^*]+)\*\*/g, '$1'); // **bold**
        out = out.replace(/__([^_]+)__/g, '$1'); // __bold__
        out = out.replace(/\*([^*]+)\*/g, '$1'); // *italic*
        out = out.replace(/_([^_]+)_/g, '$1'); // _italic_
        // Remove heading prefixes at line starts (#, ##, ###, etc.)
        out = out.replace(/^\s{0,3}#{1,6}\s+/gm, '');
        // Strip leading bullet markers (-, *, •) but keep the text
        out = out.replace(/^\s*[-*•]\s+/gm, '');
        // Convert [text](url) and [text] to plain text
        out = out.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
        out = out.replace(/\[([^\]]+)\]/g, '$1');
        // Fix hashtag formatting like 'hashtag#Beauty' -> '#Beauty'
        out = out.replace(/\bhashtag#(\w+)/gi, '#$1');
        // Normalize multiple spaces
        out = out.replace(/[\t ]{2,}/g, ' ');
        // Trim trailing spaces on lines
        out = out.replace(/[\t ]+$/gm, '');
        return out.trim();
      }

      function sanitizeGeneratedContent(content: any): any {
        if (typeof content === 'string') return sanitizeText(content);
        if (content && typeof content === 'object') {
          const result: Record<string, any> = {};
          for (const [k, v] of Object.entries(content)) {
            result[k] = typeof v === 'string' ? sanitizeText(v) : v;
          }
          return result;
        }
        return content;
      }
      const platformGuidelines: Record<string, string> = {
        instagram:
          'Focus on visual storytelling, use relevant hashtags, keep captions engaging but concise (under 2200 characters). Include emoji usage.',
        facebook:
          'Create conversational, community-focused content. Longer posts are acceptable. Encourage engagement and discussion.',
        linkedin:
          'Professional tone, industry insights, thought leadership. Longer form content is preferred. Include relevant professional hashtags.',
        twitter:
          'Concise, punchy content under 280 characters. Use trending hashtags, be timely and engaging. Thread format if needed.',
        tiktok:
          'Trendy, youth-focused, video description style. Use popular hashtags and trending sounds references. Keep it fun and energetic.',
        threads:
          'Conversational, authentic tone. Similar to Twitter but can be slightly longer. Focus on real-time thoughts and discussions.',
        youtube:
          'Compelling video descriptions, SEO-optimized titles, clear call-to-actions. Include timestamps and relevant keywords.',
      };

      const contentTypeGuidelines: Record<string, string> = {
        promotional:
          'Focus on product benefits, create urgency, include clear call-to-actions, highlight value propositions.',
        educational:
          'Provide valuable tips, step-by-step guidance, actionable insights, and helpful information.',
        inspirational:
          'Use motivational language, share success stories, include uplifting quotes, encourage positive action.',
        'behind-scenes':
          'Show authentic moments, company culture, team personalities, and genuine workplace experiences.',
        'user-generated':
          'Highlight customer experiences, showcase testimonials, feature user stories, and build community.',
        trending:
          'Reference current events, use trending hashtags, tap into viral topics, and stay culturally relevant.',
      };

      const systemPrompt = `You are a social media content creator specializing in ${input.platform.toUpperCase()}. Generate ${input.contentType} content optimized specifically for ${input.platform} with a ${input.tone} tone.\n\nPlatform Guidelines for ${input.platform}: ${
        platformGuidelines[input.platform]
      }\n\nContent Type Guidelines for ${input.contentType}: ${
        contentTypeGuidelines[input.contentType]
      }\n\nCRITICAL FORMAT RULES:\n- Use plain text only. Do NOT use any markdown (no **bold**, no headings with #, no bullet symbols like -, *, •).\n- Do NOT include bracketed placeholders like [Product Name] or [Discount Offer]; replace with concrete, generic wording.\n- If you include hashtags, format them as #Word with spaces between each hashtag. Do NOT use 'hashtag#Word'.\n- Keep links as plain text or generic CTAs without markdown.\n\nReturn JSON with a single key "${input.platform}" containing only the plain-text content for this platform.`;

      const content = await generateAiText({
        userId: user.id,
        systemPrompt,
        prompt: input.prompt,
        json: true,
        aiConfig: input.aiConfig,
      });
      if (!content) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'No content generated',
        });
      }

      try {
        const parsed = JSON.parse(content);
        return sanitizeGeneratedContent(parsed);
      } catch {
        return {
          [input.platform]: sanitizeGeneratedContent(content),
        } as Record<string, unknown>;
      }
    }),

  generateImage: authed
    .route({
      method: 'POST',
      path: '/posts/generate-image',
      summary: 'Generate an image and upload to storage',
      tags: ['Posts'],
    })
    .input(
      z.object({
        prompt: z.string().min(1),
        aiConfig: z
          .object({
            useUserKey: z.boolean().optional(),
            provider: z.enum(['openai', 'gemini']).optional(),
            apiKey: z.string().optional(),
          })
          .optional(),
      })
    )
    .output(z.object({ imageUrl: z.string() }))
    .handler(async ({ input, context }) => {
      const { user } = context as { user: { id: string } };
      // Generate remote image
      const imageUrl = await generateAiImage({
        userId: user.id,
        prompt: input.prompt,
        aiConfig: input.aiConfig,
      });

      // Download bytes server-side
      const res = await fetch(imageUrl);
      if (!res.ok) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to fetch generated image bytes',
        });
      }
      const arrayBuffer = await res.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Upload to storage
      const key = `generated/${Date.now()}.png`;
      const presign = await getPresignedUrl(key);
      if (presign?.error) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to get presigned URL',
        });
      }
      const payload: any = presign.result ?? presign;
      const uploadUrl: string | undefined = payload.presignedUrl;
      if (!uploadUrl) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Presign did not include an upload URL',
        });
      }

      const uploadRes = await fetch(uploadUrl, { method: 'PUT', body: bytes });
      if (!uploadRes.ok) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to upload generated image to storage',
        });
      }

      const storedUrl: string = payload.publicUrl || key;
      return { imageUrl: storedUrl };
    }),

  presignUpload: authed
    .route({
      method: 'POST',
      path: '/posts/presign',
      summary: 'Get a presigned upload URL for media',
      tags: ['Posts'],
    })
    .input(z.object({ key: z.string().min(1) }))
    .output(z.object({ presignedUrl: z.string(), publicUrl: z.string() }))
    .handler(async ({ input }) => {
      const raw = await getPresignedUrl(input.key);
      if (raw?.error) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to get presigned URL',
        });
      }
      const payload: any = raw.result ?? raw;
      const presignedUrl = payload.presignedUrl as string | undefined;
      const publicUrl = payload.publicUrl as string | undefined;
      if (!presignedUrl || !publicUrl) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Invalid presign response',
        });
      }
      return { presignedUrl, publicUrl };
    }),

  createOrSchedulePost: authed
    .route({
      method: 'POST',
      path: '/posts/post',
      summary: 'Create, schedule, or draft a post',
      tags: ['Posts'],
    })
    .input(
      z.object({
        profileId: z.string().min(1),
        platforms: z
          .array(
            z.object({
              accountId: z.string(),
              platform: z.string().optional(),
            })
          )
          .min(1),
        content: z.any(),
        mediaItems: z
          .array(
            z.object({
              url: z.string(),
              type: z.enum(['image', 'video']).optional(),
              filename: z.string().optional(),
              size: z.number().optional(),
            })
          )
          .optional()
          .default([]),
        publishingOption: z.enum(['now', 'schedule', 'draft']).default('now'),
        scheduledFor: z.string().optional(),
        timezone: z.string().default('America/Los_Angeles'),
      })
    )
    .output(z.object({ success: z.boolean(), id: z.string().optional() }))
    .handler(async ({ input, context }) => {
      const { prisma, user } = context;

      if (!prisma || !user?.id) {
        throw new ORPCError('UNAUTHORIZED', { message: 'Not authenticated' });
      }

      // Ensure user can post to the selected profile: owner or shared
      const ownsProfile = await prisma.socialProfile.findFirst({
        where: { id: input.profileId, userId: user.id },
        select: { id: true },
      });
      if (!ownsProfile) {
        const hasShare = await prisma.profileShare.findFirst({
          where: { profileId: input.profileId, memberUserId: user.id },
        });
        if (!hasShare) {
          throw new ORPCError('FORBIDDEN', {
            message: 'You do not have access to this profile',
          });
        }
      }

      // Map string platform to Prisma enum
      const toPlatformEnum = (value?: string): Platform => {
        const upper = (value || 'INSTAGRAM').toUpperCase();
        switch (upper) {
          case 'FACEBOOK':
            return Platform.FACEBOOK;
          case 'INSTAGRAM':
            return Platform.INSTAGRAM;
          case 'TWITTER':
            return Platform.TWITTER;
          case 'LINKEDIN':
            return Platform.LINKEDIN;
          case 'TIKTOK':
            return Platform.TIKTOK;
          case 'YOUTUBE':
            return Platform.YOUTUBE;
          case 'THREADS':
            return Platform.THREADS;
          default:
            return Platform.INSTAGRAM;
        }
      };

      // Determine post status based on publishing option
      const postStatus =
        input.publishingOption === 'draft'
          ? 'DRAFT'
          : input.publishingOption === 'schedule'
            ? 'SCHEDULED'
            : 'PUBLISHING'; // Set to PUBLISHING initially if posting now

      // Use a transaction to ensure atomicity - if any publishing fails, rollback everything
      // Set a longer timeout since we're making external API calls to social platforms
      const result = await prisma.$transaction(
        async (tx: any) => {
          // Create post record
          const created = await tx.post.create({
            data: {
              userId: user.id,
              profileId: input.profileId,
              content: input.content,
              mediaUrls: input.mediaItems?.map((m: any) => m.url) ?? [],
              status: postStatus,
              scheduledFor:
                input.publishingOption === 'schedule' && input.scheduledFor
                  ? new Date(input.scheduledFor)
                  : null,
              timezone: input.timezone,
              platforms: {
                create: input.platforms.map(p => ({
                  accountId: p.accountId,
                  platform: toPlatformEnum(p.platform),
                  status:
                    input.publishingOption === 'now' ? 'PUBLISHING' : 'PENDING',
                })),
              },
            },
            include: {
              platforms: true,
            },
          });

          // If scheduling, nothing else to do here; Vercel cron will pick it up

          // If draft, just return early - no publishing needed
          if (input.publishingOption === 'draft') {
            return { success: true, id: created.id };
          }

          // If publishing now or scheduled, process with publishers
          // For scheduled posts, we'll use Meta's native scheduling for Facebook/Instagram
          if (
            input.publishingOption === 'now' ||
            input.publishingOption === 'schedule'
          ) {
            // Fetch connected account details for each platform
            const accountIds = input.platforms.map(p => p.accountId);
            const connectedAccounts = await tx.connectedAccount.findMany({
              where: {
                id: { in: accountIds },
                profileId: input.profileId,
                isActive: true,
              },
            });

            // Store errors to throw at the end if any fail
            const publishErrors: string[] = [];

            // For scheduled posts, defer actual publishing to the cron runner
            if (input.publishingOption === 'schedule') {
              // All platforms will be handled by the cron job
              // Just mark them as PENDING and return
              return { success: true, id: created.id };
            }

            // For immediate publishing, process each platform
            for (const postPlatform of created.platforms) {
              const account = connectedAccounts.find(
                (a: any) => a.id === postPlatform.accountId
              );

              if (!account) {
                const errorMsg = `Connected account not found for ${postPlatform.platform}`;
                publishErrors.push(errorMsg);
                await tx.postPlatform.update({
                  where: { id: postPlatform.id },
                  data: {
                    status: 'FAILED',
                    errorMessage: errorMsg,
                  },
                });
                continue;
              }

              if (!account.accessToken) {
                const errorMsg = `No access token available for ${postPlatform.platform}`;
                publishErrors.push(errorMsg);
                await tx.postPlatform.update({
                  where: { id: postPlatform.id },
                  data: {
                    status: 'FAILED',
                    errorMessage: errorMsg,
                  },
                });
                continue;
              }

              // Preflight: ensure Twitter token has tweet.write scope
              if (account.platform === 'TWITTER') {
                const scope: string | undefined = account?.platformData?.scope;

                // Debug logging
                console.log('=== TWITTER SCOPE DEBUG ===');
                console.log('Account ID:', account.id);
                console.log(
                  'Platform Data:',
                  JSON.stringify(account.platformData, null, 2)
                );
                console.log('Scope:', scope);
                console.log(
                  'Has tweet.write:',
                  scope?.split(/\s+/).includes('tweet.write')
                );
                console.log('========================');

                const hasWrite =
                  !!scope && scope.split(/\s+/).includes('tweet.write');
                if (!hasWrite) {
                  const errorMsg =
                    'Twitter account is missing tweet.write scope. Please disconnect and reconnect Twitter to grant write permissions.';
                  publishErrors.push(errorMsg);
                  await tx.postPlatform.update({
                    where: { id: postPlatform.id },
                    data: {
                      status: 'FAILED',
                      errorMessage: errorMsg,
                    },
                  });
                  continue;
                }
              }

              // Get the appropriate publisher
              const publisher = getPublisher(account.platform);
              if (!publisher) {
                const errorMsg = `Platform ${account.platform} not supported yet`;
                publishErrors.push(errorMsg);
                await tx.postPlatform.update({
                  where: { id: postPlatform.id },
                  data: {
                    status: 'FAILED',
                    errorMessage: errorMsg,
                  },
                });
                continue;
              }

              // Extract platform-specific content
              const platformKey = account.platform.toLowerCase();
              let platformContent = input.content;

              // If content is an object with platform-specific keys, use the appropriate one
              if (typeof input.content === 'object' && input.content !== null) {
                if (platformKey in input.content) {
                  platformContent = input.content[platformKey];
                } else {
                  // Try to find any content value
                  const contentValues = Object.values(input.content);
                  if (contentValues.length > 0) {
                    platformContent = contentValues[0];
                  }
                }
              }

              // Prepare publish request
              const publishRequest: PublishRequest = {
                accountId: account.id,
                platform: account.platform,
                content: platformContent,
                mediaItems: input.mediaItems?.map(m => ({
                  url: m.url,
                  type: m.type || 'image',
                  filename: m.filename,
                  size: m.size,
                })),
                accessToken: account.accessToken,
                platformUserId: account.platformUserId,
              };

              try {
                // Publish to platform
                const result = await publisher.publish(publishRequest);

                if (result.success) {
                  // Update post platform with success
                  await tx.postPlatform.update({
                    where: { id: postPlatform.id },
                    data: {
                      status: 'PUBLISHED',
                      publishedId: result.platformPostId,
                      publishedUrl: result.platformPostUrl,
                      publishedAt: new Date(),
                    },
                  });
                } else {
                  const errorMsg =
                    result.error ||
                    `Unknown error publishing to ${account.platform}`;
                  publishErrors.push(errorMsg);
                  // Update post platform with failure
                  await tx.postPlatform.update({
                    where: { id: postPlatform.id },
                    data: {
                      status: 'FAILED',
                      errorMessage: errorMsg,
                    },
                  });
                }
              } catch (error: any) {
                console.error(
                  `Error publishing to ${account.platform}:`,
                  error
                );
                const errorMsg =
                  error.message || `Publishing failed for ${account.platform}`;
                publishErrors.push(errorMsg);
                await tx.postPlatform.update({
                  where: { id: postPlatform.id },
                  data: {
                    status: 'FAILED',
                    errorMessage: errorMsg,
                  },
                });
                try {
                  await tx.usageLog.create({
                    data: {
                      userId: user.id,
                      action: 'POST_PUBLISHED',
                      metadata: {
                        postId: created.id,
                        platform: account.platform,
                        error: errorMsg,
                        kind: 'PUBLISH_ERROR',
                      },
                      timestamp: new Date(),
                    },
                  });
                } catch {}
              }
            }

            // If any platform failed to publish, throw an error to rollback the transaction
            if (publishErrors.length > 0) {
              throw new ORPCError('BAD_REQUEST', {
                message: `Failed to publish to one or more platforms:\n${publishErrors.join('\n')}`,
              });
            }

            // Check if all platforms published successfully
            const updatedPostPlatforms = await tx.postPlatform.findMany({
              where: { postId: created.id },
            });

            const allSuccess = updatedPostPlatforms.every(
              (pp: any) => pp.status === 'PUBLISHED'
            );

            // Update overall post status
            await tx.post.update({
              where: { id: created.id },
              data: {
                status: 'PUBLISHED',
                publishedAt: allSuccess ? new Date() : null,
              },
            });

            // Log the publishing action
            await tx.usageLog.create({
              data: {
                userId: user.id,
                action: 'POST_PUBLISHED',
                metadata: {
                  postId: created.id,
                  publishingOption: input.publishingOption,
                  platforms: updatedPostPlatforms.map((pp: any) => ({
                    platform: pp.platform,
                    status: pp.status,
                  })),
                },
              },
            });
          }

          return { success: true, id: created.id };
        },
        {
          timeout: 120000, // 120 second timeout for external API calls
        }
      );

      return result;
    }),

  cancelScheduledPost: authed
    .route({
      method: 'POST',
      path: '/posts/cancel-scheduled',
      summary: 'Cancel a scheduled post',
      tags: ['Posts'],
    })
    .input(
      z.object({
        postId: z.string().min(1),
      })
    )
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input, context }) => {
      const { prisma, user } = context;

      if (!prisma || !user?.id) {
        throw new ORPCError('UNAUTHORIZED', { message: 'Not authenticated' });
      }

      // Find the scheduled post
      const post = await prisma.post.findFirst({
        where: {
          id: input.postId,
          userId: user.id,
          status: 'SCHEDULED',
        },
      });

      if (!post) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Scheduled post not found',
        });
      }

      // No external cron to cancel; just mark as canceled

      // Update post status to canceled
      await prisma.post.update({
        where: { id: input.postId },
        data: {
          status: 'CANCELED',
        },
      });

      // Log the cancellation
      await prisma.usageLog.create({
        data: {
          userId: user.id,
          action: 'POST_SCHEDULED',
          metadata: {
            postId: input.postId,
            cancelled: true,
          },
        },
      });

      return { success: true };
    }),

  get: authed
    .route({
      method: 'GET',
      path: '/posts/get',
      summary: 'Get a single post by ID',
      tags: ['Posts'],
    })
    .input(
      z.object({
        id: z.string().min(1),
      })
    )
    .output(
      z.object({
        id: z.string(),
        content: z.any(),
        mediaUrls: z.array(z.string()).optional(),
        status: z.string(),
        scheduledFor: z.date().nullable().optional(),
        createdAt: z.date(),
        profileId: z.string(),
        platforms: z.array(
          z.object({
            platform: z.string(),
            accountId: z.string(),
          })
        ),
        publishingOption: z.string().optional(),
        timezone: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const { prisma, user } = context;

      if (!prisma || !user?.id) {
        throw new ORPCError('UNAUTHORIZED', { message: 'Not authenticated' });
      }

      const post = await prisma.post.findFirst({
        where: {
          id: input.id,
          userId: user.id,
        },
        include: {
          platforms: true,
        },
      });

      if (!post) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Post not found',
        });
      }

      return {
        id: post.id,
        content: post.content,
        mediaUrls: post.mediaUrls,
        status: post.status,
        scheduledFor: post.scheduledFor ?? null,
        createdAt: post.createdAt,
        profileId: post.profileId,
        platforms: post.platforms.map((pp: any) => ({
          platform: pp.platform,
          accountId: pp.accountId || '',
        })),
        publishingOption: post.publishingOption || 'draft',
        timezone: post.timezone || 'America/Los_Angeles',
      };
    }),

  update: authed
    .route({
      method: 'PUT',
      path: '/posts/update',
      summary: 'Update an existing post',
      tags: ['Posts'],
    })
    .input(
      z.object({
        id: z.string().min(1),
        profileId: z.string().min(1).optional(),
        platforms: z
          .array(
            z.object({
              accountId: z.string(),
              platform: z.string().optional(),
            })
          )
          .optional(),
        content: z.any().optional(),
        mediaItems: z
          .array(
            z.object({
              url: z.string(),
              type: z.enum(['image', 'video']).optional(),
              filename: z.string().optional(),
              size: z.number().optional(),
            })
          )
          .optional(),
        publishingOption: z.enum(['now', 'schedule', 'draft']).optional(),
        scheduledFor: z.string().optional(),
        timezone: z.string().optional(),
      })
    )
    .output(z.object({ success: z.boolean(), id: z.string().optional() }))
    .handler(async ({ input, context }) => {
      const { prisma, user } = context;

      if (!prisma || !user?.id) {
        throw new ORPCError('UNAUTHORIZED', { message: 'Not authenticated' });
      }

      // Find the post and verify ownership
      const post = await prisma.post.findFirst({
        where: {
          id: input.id,
          userId: user.id,
        },
      });

      if (!post) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Post not found',
        });
      }

      // Only allow editing of DRAFT or SCHEDULED posts
      if (post.status !== 'DRAFT' && post.status !== 'SCHEDULED') {
        throw new ORPCError('FORBIDDEN', {
          message: 'Only draft or scheduled posts can be edited',
        });
      }

      const toPlatformEnum = (value?: string): Platform => {
        const upper = (value || 'INSTAGRAM').toUpperCase();
        switch (upper) {
          case 'FACEBOOK':
            return Platform.FACEBOOK;
          case 'INSTAGRAM':
            return Platform.INSTAGRAM;
          case 'TWITTER':
            return Platform.TWITTER;
          case 'LINKEDIN':
            return Platform.LINKEDIN;
          case 'TIKTOK':
            return Platform.TIKTOK;
          case 'YOUTUBE':
            return Platform.YOUTUBE;
          case 'THREADS':
            return Platform.THREADS;
          default:
            return Platform.INSTAGRAM;
        }
      };

      // Determine post status based on publishing option
      const postStatus =
        input.publishingOption === 'draft'
          ? 'DRAFT'
          : input.publishingOption === 'schedule'
            ? 'SCHEDULED'
            : post.status === 'SCHEDULED'
              ? 'SCHEDULED'
              : 'DRAFT';

      // Update the post
      await prisma.post.update({
        where: { id: input.id },
        data: {
          content: input.content !== undefined ? input.content : post.content,
          mediaUrls:
            input.mediaItems !== undefined
              ? input.mediaItems.map(m => m.url)
              : post.mediaUrls,
          status: postStatus,
          scheduledFor:
            input.scheduledFor !== undefined
              ? input.scheduledFor
                ? new Date(input.scheduledFor)
                : null
              : post.scheduledFor,
          timezone:
            input.timezone !== undefined ? input.timezone : post.timezone,
          publishingOption:
            input.publishingOption !== undefined
              ? input.publishingOption === 'now'
                ? 'NOW'
                : input.publishingOption === 'schedule'
                  ? 'SCHEDULE'
                  : 'DRAFT'
              : post.publishingOption,
        },
      });

      // Update platforms if provided
      if (input.platforms && input.platforms.length > 0) {
        // Delete existing platforms
        await prisma.postPlatform.deleteMany({
          where: { postId: input.id },
        });

        // Create new platform entries
        await prisma.postPlatform.createMany({
          data: input.platforms.map(p => ({
            postId: input.id,
            platform: toPlatformEnum(p.platform),
            accountId: p.accountId,
            status: 'PENDING',
          })),
        });
      }

      return { success: true, id: input.id };
    }),
};
