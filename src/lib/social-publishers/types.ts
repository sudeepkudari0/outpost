/**
 * Types for social media publishing
 */

export interface PublishMediaItem {
  url: string;
  type: 'image' | 'video';
  filename?: string;
  size?: number;
}

export interface PublishRequest {
  accountId: string;
  platform: string;
  content: any; // Platform-specific content
  mediaItems?: PublishMediaItem[];
  accessToken: string;
  platformUserId: string;
  scheduledFor?: Date; // Optional: For native platform scheduling
}

export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  platformPostUrl?: string;
  error?: string;
  errorDetails?: any;
}

export interface PublishStatus {
  status: 'PENDING' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED';
  message?: string;
}

/**
 * Base publisher interface that all platform publishers must implement
 */
export abstract class BaseSocialPublisher {
  abstract platform: string;

  /**
   * Publish content to the platform
   */
  abstract publish(request: PublishRequest): Promise<PublishResult>;

  /**
   * Check if the publisher supports a given platform
   */
  supports(platform: string): boolean {
    return platform.toLowerCase() === this.platform.toLowerCase();
  }

  /**
   * Extract text content from platform-specific content object
   */
  protected extractTextContent(content: any): string {
    if (typeof content === 'string') {
      return content;
    }
    if (content && typeof content === 'object') {
      // Try various common field names
      return (
        content.caption || content.text || content.message || content.body || ''
      );
    }
    return '';
  }

  /**
   * Validate media URL is accessible
   */
  protected async validateMediaUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
}
