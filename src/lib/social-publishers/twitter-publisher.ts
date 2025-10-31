/**
 * Twitter (X) Publishing - text only (v2)
 * Endpoint: POST https://api.x.com/2/tweets
 * Scope required: tweet.write
 */

import {
  BaseSocialPublisher,
  type PublishRequest,
  type PublishResult,
} from './types';

export class TwitterPublisher extends BaseSocialPublisher {
  platform = 'twitter';

  async publish(request: PublishRequest): Promise<PublishResult> {
    try {
      const { accessToken, content } = request;
      const text = this.extractTextContent(content);

      console.log('=== TWITTER PUBLISH DEBUG ===');
      console.log('Text to publish:', text);
      console.log(
        'Access token (first 20 chars):',
        accessToken?.substring(0, 20) + '...'
      );

      // Diagnostic: Verify the token works by fetching user info
      try {
        const meResponse = await fetch('https://api.x.com/2/users/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log(
          'Token validation (GET /users/me):',
          meResponse.status,
          meResponse.ok ? '✓ Token valid' : '✗ Token invalid'
        );

        if (!meResponse.ok) {
          const errorText = await meResponse.text();
          console.log('Token validation error:', errorText);
          return {
            success: false,
            error: `Access token is invalid or expired. Please reconnect your Twitter account. Error: ${errorText}`,
          };
        }
      } catch (diagError: any) {
        console.log('Token validation failed:', diagError.message);
      }

      console.log('===========================');

      if (!text || text.trim().length === 0) {
        return {
          success: false,
          error: 'Twitter requires non-empty text content',
        };
      }

      const response = await fetch('https://api.x.com/2/tweets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        let message = `Twitter publish failed: ${response.status} ${response.statusText}`;
        let fullErrorData: any = null;

        try {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await response.json();
            fullErrorData = data;

            // Extract detailed error information
            const detail =
              data?.detail || data?.error || data?.title || data?.message;

            // Check for specific error types
            if (data?.errors && Array.isArray(data.errors)) {
              const errorMessages = data.errors
                .map((e: any) => e.message || e.detail)
                .join(', ');
              message = `Twitter publish failed: ${errorMessages}`;
            } else if (detail) {
              message = `Twitter publish failed: ${detail}`;
            }
          } else {
            const text = await response.text();
            fullErrorData = text;
            if (text) message = `Twitter publish failed: ${text}`;
          }
        } catch {}

        console.log('=== TWITTER API ERROR ===');
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log(
          'Full error response:',
          JSON.stringify(fullErrorData, null, 2)
        );
        console.log('========================');

        // Provide specific guidance based on error type
        if (response.status === 403) {
          if (
            fullErrorData?.detail?.includes('duplicate') ||
            fullErrorData?.errors?.some((e: any) =>
              e.message?.includes('duplicate')
            )
          ) {
            message =
              'Twitter rejected this tweet as duplicate content. Please modify your tweet text to make it unique.';
          } else if (fullErrorData?.detail?.includes('not permitted')) {
            message +=
              '\n\nPossible causes:\n' +
              "1. App permissions: Go to Twitter Developer Portal → Your App → Settings → User authentication settings → App permissions must be 'Read and Write'\n" +
              "2. Access Level: Your app might need 'Elevated' access (not just 'Free' tier) - check Twitter Developer Portal\n" +
              '3. Account restriction: The Twitter account may be restricted or locked\n' +
              '4. Reconnect required: After changing app permissions, you MUST disconnect and reconnect your Twitter account';
          }
        }
        return { success: false, error: message };
      }

      const data = await response.json();
      const id = data?.data?.id as string | undefined;
      const url = id ? `https://x.com/i/web/status/${id}` : undefined;
      return { success: true, platformPostId: id, platformPostUrl: url };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to publish to Twitter',
        errorDetails: error,
      };
    }
  }
}
