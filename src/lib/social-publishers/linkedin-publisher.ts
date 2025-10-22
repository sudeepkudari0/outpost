/**
 * LinkedIn Publishing Implementation (text-only for now)
 * Docs: https://learn.microsoft.com/linkedin/marketing/integrations/community-management/shares/ugc-post-api
 */

import {
  BaseSocialPublisher,
  type PublishRequest,
  type PublishResult,
} from './types';

export class LinkedInPublisher extends BaseSocialPublisher {
  platform = 'linkedin';

  async publish(request: PublishRequest): Promise<PublishResult> {
    try {
      const { accessToken, platformUserId, content, mediaItems } = request;

      const text = this.extractTextContent(content) || '';

      const imageItems = (mediaItems || []).filter(m => m.type === 'image');

      if (imageItems.length === 0) {
        // Text-only post
        return await this.publishTextOnly({
          accessToken,
          authorUrn: platformUserId,
          text,
        });
      }

      // Image post (support multiple images)
      const assetUrns: string[] = [];
      for (const img of imageItems) {
        const ok = await this.validateMediaUrl(img.url);
        if (!ok) {
          return { success: false, error: `Image not accessible: ${img.url}` };
        }

        const upload = await this.registerImageUpload({
          accessToken,
          authorUrn: platformUserId,
        });
        await this.uploadImage({
          uploadUrl: upload.uploadUrl,
          imageUrl: img.url,
        });
        assetUrns.push(upload.assetUrn);
      }

      return await this.publishImages({
        accessToken,
        authorUrn: platformUserId,
        text,
        assetUrns,
      });
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to publish to LinkedIn',
        errorDetails: error,
      };
    }
  }

  private async publishTextOnly(params: {
    accessToken: string;
    authorUrn: string;
    text: string;
  }): Promise<PublishResult> {
    const { accessToken, authorUrn, text } = params;
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: 'LinkedIn requires non-empty text content',
      };
    }
    const body = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    } as const;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    };
    if (process.env.LINKEDIN_API_VERSION)
      headers['LinkedIn-Version'] = process.env.LINKEDIN_API_VERSION;

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: `LinkedIn publish failed: ${errText}` };
    }

    const idHeader = response.headers.get('x-restli-id') || undefined;
    const platformPostId = idHeader;
    const platformPostUrl = platformPostId
      ? `https://www.linkedin.com/feed/update/${encodeURIComponent(platformPostId)}`
      : undefined;
    return { success: true, platformPostId, platformPostUrl };
  }

  private async publishImages(params: {
    accessToken: string;
    authorUrn: string;
    text: string;
    assetUrns: string[];
  }): Promise<PublishResult> {
    const { accessToken, authorUrn, text, assetUrns } = params;
    const media = assetUrns.map(urn => ({
      status: 'READY',
      description: { text: '' },
      media: urn,
      title: { text: '' },
    }));

    const body = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: 'IMAGE',
          media,
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    } as const;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    };
    if (process.env.LINKEDIN_API_VERSION)
      headers['LinkedIn-Version'] = process.env.LINKEDIN_API_VERSION;

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        error: `LinkedIn image post failed: ${errText}`,
      };
    }

    const idHeader = response.headers.get('x-restli-id') || undefined;
    const platformPostId = idHeader;
    const platformPostUrl = platformPostId
      ? `https://www.linkedin.com/feed/update/${encodeURIComponent(platformPostId)}`
      : undefined;
    return { success: true, platformPostId, platformPostUrl };
  }

  private async registerImageUpload(params: {
    accessToken: string;
    authorUrn: string;
  }): Promise<{ assetUrn: string; uploadUrl: string }> {
    const { accessToken, authorUrn } = params;
    const body = {
      registerUploadRequest: {
        owner: authorUrn,
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        serviceRelationships: [
          {
            relationshipType: 'OWNER',
            identifier: 'urn:li:userGeneratedContent',
          },
        ],
        supportedUploadMechanism: ['SYNCHRONOUS_UPLOAD'],
      },
    } as const;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    };
    if (process.env.LINKEDIN_API_VERSION)
      headers['LinkedIn-Version'] = process.env.LINKEDIN_API_VERSION;

    const response = await fetch(
      'https://api.linkedin.com/v2/assets?action=registerUpload',
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`LinkedIn register image upload failed: ${errText}`);
    }

    const data = (await response.json()) as any;
    const uploadReq =
      data?.value?.uploadMechanism?.[
        'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
      ];
    const uploadUrl = uploadReq?.uploadUrl;
    const assetUrn = data?.value?.asset;
    if (!uploadUrl || !assetUrn)
      throw new Error('Invalid LinkedIn upload registration response');
    return { assetUrn, uploadUrl };
  }

  private async uploadImage(params: {
    uploadUrl: string;
    imageUrl: string;
  }): Promise<void> {
    const { uploadUrl, imageUrl } = params;
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      const errText = await imgRes.text();
      throw new Error(`Failed to fetch image: ${errText}`);
    }
    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await imgRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const putRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(buffer.byteLength),
      },
      body: buffer,
    });
    if (!putRes.ok) {
      const errText = await putRes.text();
      throw new Error(`LinkedIn image upload failed: ${errText}`);
    }
  }
}
