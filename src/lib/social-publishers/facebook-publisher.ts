/**
 * Facebook Pages Content Publishing Implementation
 * Based on: https://developers.facebook.com/docs/pages/publishing
 */

import {
  BaseSocialPublisher,
  type PublishRequest,
  type PublishResult,
} from './types';

const GRAPH_API_VERSION = 'v21.0';
const GRAPH_API_BASE = 'https://graph.facebook.com';

interface FacebookPhotoResponse {
  id: string;
  post_id: string;
}

interface FacebookVideoResponse {
  id: string;
  post_id?: string;
}

interface FacebookPostResponse {
  id: string;
}

export class FacebookPublisher extends BaseSocialPublisher {
  platform = 'facebook';

  async publish(request: PublishRequest): Promise<PublishResult> {
    try {
      const { accessToken, platformUserId, content, mediaItems, scheduledFor } =
        request;

      // Extract message from content
      const message = this.extractTextContent(content);

      // Determine if this is a scheduled post
      const isScheduled = !!scheduledFor;

      // Determine publishing strategy based on media
      if (!mediaItems || mediaItems.length === 0) {
        // Text-only post
        const postId = await this.publishTextPost({
          pageId: platformUserId,
          accessToken,
          message,
          scheduledFor,
        });

        if (isScheduled) {
          return {
            success: true,
            platformPostId: postId,
            platformPostUrl: `Scheduled for ${scheduledFor?.toISOString()}`,
          };
        }

        return {
          success: true,
          platformPostId: postId,
          platformPostUrl: `https://www.facebook.com/${postId}`,
        };
      }

      if (mediaItems.length === 1) {
        const mediaItem = mediaItems[0];

        // Validate media URL is accessible
        const isAccessible = await this.validateMediaUrl(mediaItem.url);
        if (!isAccessible) {
          return {
            success: false,
            error: 'Media URL is not publicly accessible',
          };
        }

        if (mediaItem.type === 'image') {
          // Single photo post
          const result = await this.publishPhoto({
            pageId: platformUserId,
            accessToken,
            imageUrl: mediaItem.url,
            message,
            scheduledFor,
          });

          if (isScheduled) {
            return {
              success: true,
              platformPostId: result.id,
              platformPostUrl: `Scheduled for ${scheduledFor?.toISOString()}`,
            };
          }

          return {
            success: true,
            platformPostId: result.post_id,
            platformPostUrl: `https://www.facebook.com/${result.post_id}`,
          };
        } else {
          // Single video post
          const result = await this.publishVideo({
            pageId: platformUserId,
            accessToken,
            videoUrl: mediaItem.url,
            description: message,
            scheduledFor,
          });

          if (isScheduled) {
            return {
              success: true,
              platformPostId: result.id,
              platformPostUrl: `Scheduled for ${scheduledFor?.toISOString()}`,
            };
          }

          return {
            success: true,
            platformPostId: result.post_id || result.id,
            platformPostUrl: result.post_id
              ? `https://www.facebook.com/${result.post_id}`
              : `https://www.facebook.com/${platformUserId}/videos/${result.id}`,
          };
        }
      }

      // Multiple media items - use album/carousel approach
      // For simplicity, we'll publish multiple photos in an album
      const imageItems = mediaItems.filter(m => m.type === 'image');

      if (imageItems.length > 0) {
        // Validate all image URLs
        for (const item of imageItems) {
          const isAccessible = await this.validateMediaUrl(item.url);
          if (!isAccessible) {
            return {
              success: false,
              error: `Media URL is not publicly accessible: ${item.url}`,
            };
          }
        }

        // Upload photos to unpublished album
        const photoIds = await Promise.all(
          imageItems.map(item =>
            this.uploadPhotoToAlbum({
              pageId: platformUserId,
              accessToken,
              imageUrl: item.url,
              published: false,
            })
          )
        );

        // Publish album with all photos
        const postId = await this.publishAlbum({
          pageId: platformUserId,
          accessToken,
          photoIds,
          message,
          scheduledFor,
        });

        if (isScheduled) {
          return {
            success: true,
            platformPostId: postId,
            platformPostUrl: `Scheduled for ${scheduledFor?.toISOString()}`,
          };
        }

        return {
          success: true,
          platformPostId: postId,
          platformPostUrl: `https://www.facebook.com/${postId}`,
        };
      }

      // If we have videos with multiple items, just publish the first video with message
      // (Facebook doesn't support multiple videos in one post easily)
      const videoItem = mediaItems.find(m => m.type === 'video');
      if (videoItem) {
        const isAccessible = await this.validateMediaUrl(videoItem.url);
        if (!isAccessible) {
          return {
            success: false,
            error: 'Video URL is not publicly accessible',
          };
        }

        const result = await this.publishVideo({
          pageId: platformUserId,
          accessToken,
          videoUrl: videoItem.url,
          description: message,
          scheduledFor,
        });

        if (isScheduled) {
          return {
            success: true,
            platformPostId: result.id,
            platformPostUrl: `Scheduled for ${scheduledFor?.toISOString()}`,
          };
        }

        return {
          success: true,
          platformPostId: result.post_id || result.id,
          platformPostUrl: result.post_id
            ? `https://www.facebook.com/${result.post_id}`
            : `https://www.facebook.com/${platformUserId}/videos/${result.id}`,
        };
      }

      return {
        success: false,
        error: 'No valid media items to publish',
      };
    } catch (error: any) {
      console.error('Facebook publish error:', error);
      return {
        success: false,
        error: error.message || 'Failed to publish to Facebook',
        errorDetails: error,
      };
    }
  }

  /**
   * Publish a text-only post to a Facebook Page
   * Supports native scheduling via Facebook API
   */
  private async publishTextPost(params: {
    pageId: string;
    accessToken: string;
    message: string;
    scheduledFor?: Date;
  }): Promise<string> {
    const { pageId, accessToken, message, scheduledFor } = params;

    const url = `${GRAPH_API_BASE}/${GRAPH_API_VERSION}/${pageId}/feed`;

    const body: any = {
      access_token: accessToken,
      message,
    };

    // If scheduled, Facebook will publish automatically at the scheduled time
    if (scheduledFor) {
      const scheduledTimestamp = Math.floor(scheduledFor.getTime() / 1000);

      // Facebook requires the time to be at least 10 minutes in the future
      const now = Math.floor(Date.now() / 1000);
      const minTime = now + 600; // 10 minutes from now

      if (scheduledTimestamp < minTime) {
        throw new Error(
          'Scheduled time must be at least 10 minutes in the future'
        );
      }

      body.published = false;
      body.scheduled_publish_time = scheduledTimestamp;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to publish Facebook text post: ${error.error?.message || response.statusText}`
      );
    }

    const data: FacebookPostResponse = await response.json();
    return data.id;
  }

  /**
   * Publish a photo to a Facebook Page
   * Supports native scheduling via Facebook API
   */
  private async publishPhoto(params: {
    pageId: string;
    accessToken: string;
    imageUrl: string;
    message?: string;
    scheduledFor?: Date;
  }): Promise<FacebookPhotoResponse> {
    const { pageId, accessToken, imageUrl, message, scheduledFor } = params;

    const url = `${GRAPH_API_BASE}/${GRAPH_API_VERSION}/${pageId}/photos`;

    const body: any = {
      access_token: accessToken,
      url: imageUrl,
      published: !scheduledFor, // If scheduled, set published to false
    };

    if (message) {
      body.message = message;
    }

    // If scheduled, add scheduling parameters
    if (scheduledFor) {
      const scheduledTimestamp = Math.floor(scheduledFor.getTime() / 1000);

      const now = Math.floor(Date.now() / 1000);
      const minTime = now + 600; // 10 minutes from now

      if (scheduledTimestamp < minTime) {
        throw new Error(
          'Scheduled time must be at least 10 minutes in the future'
        );
      }

      body.scheduled_publish_time = scheduledTimestamp;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to publish Facebook photo: ${error.error?.message || response.statusText}`
      );
    }

    return await response.json();
  }

  /**
   * Publish a video to a Facebook Page
   * Supports native scheduling via Facebook API
   */
  private async publishVideo(params: {
    pageId: string;
    accessToken: string;
    videoUrl: string;
    description?: string;
    scheduledFor?: Date;
  }): Promise<FacebookVideoResponse> {
    const { pageId, accessToken, videoUrl, description, scheduledFor } = params;

    const url = `${GRAPH_API_BASE}/${GRAPH_API_VERSION}/${pageId}/videos`;

    const body: any = {
      access_token: accessToken,
      file_url: videoUrl,
    };

    if (description) {
      body.description = description;
    }

    // If scheduled, add scheduling parameters
    if (scheduledFor) {
      const scheduledTimestamp = Math.floor(scheduledFor.getTime() / 1000);

      const now = Math.floor(Date.now() / 1000);
      const minTime = now + 600; // 10 minutes from now

      if (scheduledTimestamp < minTime) {
        throw new Error(
          'Scheduled time must be at least 10 minutes in the future'
        );
      }

      body.published = false;
      body.scheduled_publish_time = scheduledTimestamp;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to publish Facebook video: ${error.error?.message || response.statusText}`
      );
    }

    return await response.json();
  }

  /**
   * Upload a photo to a page (unpublished for album creation)
   */
  private async uploadPhotoToAlbum(params: {
    pageId: string;
    accessToken: string;
    imageUrl: string;
    published: boolean;
  }): Promise<string> {
    const { pageId, accessToken, imageUrl, published } = params;

    const url = `${GRAPH_API_BASE}/${GRAPH_API_VERSION}/${pageId}/photos`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: accessToken,
        url: imageUrl,
        published,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to upload photo to album: ${error.error?.message || response.statusText}`
      );
    }

    const data: FacebookPhotoResponse = await response.json();
    return data.id;
  }

  /**
   * Publish an album of photos
   * Supports native scheduling via Facebook API
   */
  private async publishAlbum(params: {
    pageId: string;
    accessToken: string;
    photoIds: string[];
    message?: string;
    scheduledFor?: Date;
  }): Promise<string> {
    const { pageId, accessToken, photoIds, message, scheduledFor } = params;

    // Create attached_media array
    const attachedMedia = photoIds.map(id => ({ media_fbid: id }));

    const url = `${GRAPH_API_BASE}/${GRAPH_API_VERSION}/${pageId}/feed`;

    const body: any = {
      access_token: accessToken,
      attached_media: JSON.stringify(attachedMedia),
    };

    if (message) {
      body.message = message;
    }

    // If scheduled, add scheduling parameters
    if (scheduledFor) {
      const scheduledTimestamp = Math.floor(scheduledFor.getTime() / 1000);

      const now = Math.floor(Date.now() / 1000);
      const minTime = now + 600; // 10 minutes from now

      if (scheduledTimestamp < minTime) {
        throw new Error(
          'Scheduled time must be at least 10 minutes in the future'
        );
      }

      body.published = false;
      body.scheduled_publish_time = scheduledTimestamp;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to publish Facebook album: ${error.error?.message || response.statusText}`
      );
    }

    const data: FacebookPostResponse = await response.json();
    return data.id;
  }
}
