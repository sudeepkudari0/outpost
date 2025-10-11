/**
 * Instagram Content Publishing API Implementation
 * Based on: https://developers.facebook.com/docs/instagram-platform/content-publishing
 */

import {
  BaseSocialPublisher,
  type PublishRequest,
  type PublishResult,
} from './types';

const GRAPH_API_VERSION = 'v21.0';
const GRAPH_API_BASE = 'https://graph.instagram.com';
const RUPLOAD_BASE = 'https://rupload.facebook.com';

interface InstagramContainerResponse {
  id: string;
}

interface InstagramContainerStatus {
  status_code: 'EXPIRED' | 'ERROR' | 'FINISHED' | 'IN_PROGRESS' | 'PUBLISHED';
  error_message?: string;
}

interface InstagramPublishResponse {
  id: string; // Media ID
}

export class InstagramPublisher extends BaseSocialPublisher {
  platform = 'instagram';

  async publish(request: PublishRequest): Promise<PublishResult> {
    try {
      const { accessToken, platformUserId, content, mediaItems, scheduledFor } =
        request;

      // Extract caption from content
      const caption = this.extractTextContent(content);

      // Determine if this is a scheduled post
      const isScheduled = !!scheduledFor;

      // Determine if this is a carousel post (multiple media items)
      const isCarousel = mediaItems && mediaItems.length > 1;

      // Single image/video post
      if (!isCarousel) {
        if (mediaItems && mediaItems.length === 1) {
          const mediaItem = mediaItems[0];

          // Validate media URL is accessible
          const isAccessible = await this.validateMediaUrl(mediaItem.url);
          if (!isAccessible) {
            return {
              success: false,
              error: 'Media URL is not publicly accessible',
            };
          }

          // Create container based on media type
          const containerId = await this.createMediaContainer({
            userId: platformUserId,
            accessToken,
            mediaUrl: mediaItem.url,
            mediaType: mediaItem.type,
            caption,
          });

          // Wait for container to be ready
          await this.waitForContainer(containerId, accessToken);

          // Publish the container (with optional scheduling)
          const mediaId = await this.publishContainer(
            platformUserId,
            containerId,
            accessToken,
            scheduledFor
          );

          if (isScheduled) {
            return {
              success: true,
              platformPostId: containerId,
              platformPostUrl: `Scheduled for ${scheduledFor?.toISOString()}`,
            };
          }

          return {
            success: true,
            platformPostId: mediaId,
            platformPostUrl: `https://www.instagram.com/p/${mediaId}/`,
          };
        } else {
          // Text-only post (not supported by Instagram API directly)
          // We'll need to handle this differently or return an error
          return {
            success: false,
            error:
              'Instagram requires at least one image or video. Text-only posts are not supported.',
          };
        }
      }

      // Carousel post (multiple media items)
      if (isCarousel && mediaItems) {
        // Validate all media URLs
        for (const item of mediaItems) {
          const isAccessible = await this.validateMediaUrl(item.url);
          if (!isAccessible) {
            return {
              success: false,
              error: `Media URL is not publicly accessible: ${item.url}`,
            };
          }
        }

        // Create containers for each media item
        const containerIds: string[] = [];
        for (const item of mediaItems) {
          const containerId = await this.createCarouselItemContainer({
            userId: platformUserId,
            accessToken,
            mediaUrl: item.url,
            mediaType: item.type,
          });
          containerIds.push(containerId);
        }

        // Wait for all containers to be ready
        await Promise.all(
          containerIds.map(id => this.waitForContainer(id, accessToken))
        );

        // Create carousel container
        const carouselContainerId = await this.createCarouselContainer({
          userId: platformUserId,
          accessToken,
          children: containerIds,
          caption,
        });

        // Publish the carousel (with optional scheduling)
        const mediaId = await this.publishContainer(
          platformUserId,
          carouselContainerId,
          accessToken,
          scheduledFor
        );

        if (isScheduled) {
          return {
            success: true,
            platformPostId: carouselContainerId,
            platformPostUrl: `Scheduled for ${scheduledFor?.toISOString()}`,
          };
        }

        return {
          success: true,
          platformPostId: mediaId,
          platformPostUrl: `https://www.instagram.com/p/${mediaId}/`,
        };
      }

      return {
        success: false,
        error: 'Invalid request: No media items provided',
      };
    } catch (error: any) {
      console.error('Instagram publish error:', error);
      return {
        success: false,
        error: error.message || 'Failed to publish to Instagram',
        errorDetails: error,
      };
    }
  }

  /**
   * Create a media container for single post
   */
  private async createMediaContainer(params: {
    userId: string;
    accessToken: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    caption?: string;
  }): Promise<string> {
    const { userId, accessToken, mediaUrl, mediaType, caption } = params;

    const body: any = {
      access_token: accessToken,
    };

    if (mediaType === 'image') {
      body.image_url = mediaUrl;
    } else {
      body.video_url = mediaUrl;
      body.media_type = 'REELS'; // Use REELS for videos
    }

    if (caption) {
      body.caption = caption;
    }

    const url = `${GRAPH_API_BASE}/${GRAPH_API_VERSION}/${userId}/media`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.error?.message || response.statusText;

      // Provide helpful message for common errors
      let helpfulMessage = `Failed to create Instagram container: ${errorMessage}`;
      if (errorMessage.includes('aspect ratio')) {
        helpfulMessage +=
          '\n\nInstagram requirements:\n' +
          '• Square: 1:1 (e.g., 1080x1080)\n' +
          '• Portrait: 4:5 (e.g., 1080x1350)\n' +
          '• Landscape: 1.91:1 (e.g., 1080x566)\n' +
          '• Minimum: 320px width\n' +
          '• Maximum: 1440px width';
      }

      throw new Error(helpfulMessage);
    }

    const data: InstagramContainerResponse = await response.json();
    return data.id;
  }

  /**
   * Create a carousel item container (no caption)
   */
  private async createCarouselItemContainer(params: {
    userId: string;
    accessToken: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
  }): Promise<string> {
    const { userId, accessToken, mediaUrl, mediaType } = params;

    const body: any = {
      access_token: accessToken,
      is_carousel_item: true,
    };

    if (mediaType === 'image') {
      body.image_url = mediaUrl;
    } else {
      body.video_url = mediaUrl;
      body.media_type = 'VIDEO';
    }

    const url = `${GRAPH_API_BASE}/${GRAPH_API_VERSION}/${userId}/media`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.error?.message || response.statusText;

      // Provide helpful message for common errors
      let helpfulMessage = `Failed to create Instagram carousel item: ${errorMessage}`;
      if (errorMessage.includes('aspect ratio')) {
        helpfulMessage +=
          '\n\nInstagram carousel requirements:\n' +
          '• All items must have same aspect ratio\n' +
          '• Recommended: 1:1 (square, 1080x1080)\n' +
          '• Minimum: 320px width';
      }

      throw new Error(helpfulMessage);
    }

    const data: InstagramContainerResponse = await response.json();
    return data.id;
  }

  /**
   * Create a carousel container with child containers
   */
  private async createCarouselContainer(params: {
    userId: string;
    accessToken: string;
    children: string[];
    caption?: string;
  }): Promise<string> {
    const { userId, accessToken, children, caption } = params;

    if (children.length > 10) {
      throw new Error('Instagram carousels support a maximum of 10 items');
    }

    const body: any = {
      access_token: accessToken,
      media_type: 'CAROUSEL',
      children: children.join(','),
    };

    if (caption) {
      body.caption = caption;
    }

    const url = `${GRAPH_API_BASE}/${GRAPH_API_VERSION}/${userId}/media`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to create Instagram carousel container: ${error.error?.message || response.statusText}`
      );
    }

    const data: InstagramContainerResponse = await response.json();
    return data.id;
  }

  /**
   * Wait for container to be ready for publishing
   */
  private async waitForContainer(
    containerId: string,
    accessToken: string,
    maxAttempts = 30,
    delayMs = 2000
  ): Promise<void> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.checkContainerStatus(containerId, accessToken);

      if (status.status_code === 'FINISHED') {
        return;
      }

      if (status.status_code === 'ERROR') {
        throw new Error(
          `Container error: ${status.error_message || 'Unknown error'}`
        );
      }

      if (status.status_code === 'EXPIRED') {
        throw new Error('Container expired before publishing');
      }

      // Still in progress, wait before next check
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    throw new Error('Container processing timeout');
  }

  /**
   * Check container status
   */
  private async checkContainerStatus(
    containerId: string,
    accessToken: string
  ): Promise<InstagramContainerStatus> {
    const url = `${GRAPH_API_BASE}/${GRAPH_API_VERSION}/${containerId}?fields=status_code,error_message&access_token=${accessToken}`;

    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to check container status: ${error.error?.message || response.statusText}`
      );
    }

    return await response.json();
  }

  /**
   * Publish a container to create an Instagram post
   * Note: Instagram API does NOT support native scheduling
   * Scheduled posts must be handled by a cron job that publishes at the scheduled time
   */
  private async publishContainer(
    userId: string,
    containerId: string,
    accessToken: string,
    scheduledFor?: Date
  ): Promise<string> {
    // Instagram does not support native scheduling via API
    // If this is a scheduled post, throw an error - it should be handled by cron job
    if (scheduledFor) {
      throw new Error(
        'Instagram does not support native scheduling. Post will be published by cron job at scheduled time.'
      );
    }

    const url = `${GRAPH_API_BASE}/${GRAPH_API_VERSION}/${userId}/media_publish`;

    const body: any = {
      access_token: accessToken,
      creation_id: containerId,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to publish Instagram container: ${error.error?.message || response.statusText}`
      );
    }

    const data: InstagramPublishResponse = await response.json();
    return data.id;
  }
}
