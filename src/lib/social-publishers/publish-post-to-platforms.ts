/**
 * Publish post to all platforms
 * Used by the cron job webhook to publish scheduled posts
 */

import { LinkedInPublisher } from './linkedin-publisher';
import { TwitterPublisher } from './twitter-publisher';
import type { PublishRequest } from './types';

export interface PublishResult {
  platformId: string;
  platform: string;
  status: 'PUBLISHED' | 'FAILED';
  publishedId?: string;
  publishedUrl?: string;
  errorMessage?: string;
}

function getPublisher(platform: string) {
  const key = platform.toLowerCase();
  switch (key) {
    case 'twitter':
    case 'x':
      return new TwitterPublisher();
    case 'linkedin':
      return new LinkedInPublisher();
    default:
      return undefined;
  }
}

export async function publishPostToPlatforms(
  post: any
): Promise<PublishResult[]> {
  const results: PublishResult[] = [];

  for (const postPlatform of post.platforms) {
    const account = postPlatform.account;

    if (!account) {
      results.push({
        platformId: postPlatform.id,
        platform: postPlatform.platform,
        status: 'FAILED',
        errorMessage: 'Connected account not found',
      });
      continue;
    }

    if (!account.accessToken) {
      results.push({
        platformId: postPlatform.id,
        platform: postPlatform.platform,
        status: 'FAILED',
        errorMessage: 'No access token available',
      });
      continue;
    }

    // Get the appropriate publisher
    const publisher = getPublisher(account.platform);
    if (!publisher) {
      results.push({
        platformId: postPlatform.id,
        platform: postPlatform.platform,
        status: 'FAILED',
        errorMessage: `Platform ${account.platform} not supported yet`,
      });
      continue;
    }

    // Extract platform-specific content
    const platformKey = account.platform.toLowerCase();
    let platformContent = post.content;

    // If content is an object with platform-specific keys, use the appropriate one
    if (typeof post.content === 'object' && post.content !== null) {
      if (platformKey in post.content) {
        platformContent = post.content[platformKey];
      } else {
        // Try to find any content value
        const contentValues = Object.values(post.content);
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
      mediaItems: post.mediaUrls?.map((url: string) => ({
        url,
        type: 'image' as const,
      })),
      accessToken: account.accessToken,
      platformUserId: account.platformUserId,
    };

    try {
      // Publish to platform
      const result = await publisher.publish(publishRequest);

      if (result.success) {
        results.push({
          platformId: postPlatform.id,
          platform: postPlatform.platform,
          status: 'PUBLISHED',
          publishedId: result.platformPostId,
          publishedUrl: result.platformPostUrl,
        });
      } else {
        results.push({
          platformId: postPlatform.id,
          platform: postPlatform.platform,
          status: 'FAILED',
          errorMessage:
            result.error || `Unknown error publishing to ${account.platform}`,
        });
      }
    } catch (error: any) {
      console.error(`Error publishing to ${account.platform}:`, error);
      results.push({
        platformId: postPlatform.id,
        platform: postPlatform.platform,
        status: 'FAILED',
        errorMessage:
          error.message || `Publishing failed for ${account.platform}`,
      });
    }
  }

  return results;
}
