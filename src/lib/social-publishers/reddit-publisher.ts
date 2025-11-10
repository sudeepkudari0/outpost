import {
  BaseSocialPublisher,
  type PublishRequest,
  type PublishResult,
} from './types';

/**
 * Reddit Publishing - self text post to user's profile (u_<username>)
 * Endpoint: POST https://oauth.reddit.com/api/submit
 * Required scope: submit (token must be permanent or valid refresh)
 */
export class RedditPublisher extends BaseSocialPublisher {
  platform = 'reddit';

  async publish(request: PublishRequest): Promise<PublishResult> {
    try {
      const { accessToken, content } = request;
      const text = this.extractTextContent(content)?.trim();
      if (!text) {
        return {
          success: false,
          error: 'Reddit requires non-empty text content',
        };
      }

      // Derive a simple title: first line or first 100 chars
      const firstLine = text.split(/\r?\n/)[0] || text;
      let title = firstLine.substring(0, 100).trim();
      if (title.length < 10) title = `Post from Social SaaS`;

      // Fetch username to post to user profile (u_<username>)
      const meRes = await fetch('https://oauth.reddit.com/api/v1/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!meRes.ok) {
        const err = await meRes.text();
        return {
          success: false,
          error: `Reddit token invalid or missing scope. Please reconnect Reddit. Error: ${err}`,
        };
      }
      const me = (await meRes.json()) as { name?: string };
      const username = me?.name;
      if (!username) {
        return {
          success: false,
          error: 'Unable to resolve Reddit username for publishing',
        };
      }

      // Create a self post on the user's profile (u_<username>)
      const body = new URLSearchParams({
        sr: `u_${username}`,
        kind: 'self',
        title,
        text,
        api_type: 'json',
      });

      const res = await fetch('https://oauth.reddit.com/api/submit', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'social-saas/1.0 (+contact admin)',
        },
        body: body.toString(),
      });

      if (!res.ok) {
        let message = `Reddit publish failed: ${res.status} ${res.statusText}`;
        let details: any = undefined;
        try {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const j = await res.json();
            details = j;
            const errors = j?.json?.errors;
            if (Array.isArray(errors) && errors.length) {
              message = `Reddit publish failed: ${errors.map((e: any) => e?.[1] || e?.toString()).join(', ')}`;
            }
          } else {
            const t = await res.text();
            details = t;
            if (t) message = `Reddit publish failed: ${t}`;
          }
        } catch {}
        return { success: false, error: message, errorDetails: details };
      }

      const data = await res.json();
      const thing = data?.json?.data?.id as string | undefined; // e.g., t3_<id>
      const id = thing?.split('_')?.[1];
      const url = id
        ? `https://www.reddit.com/user/${username}/comments/${id}`
        : undefined;
      return {
        success: true,
        platformPostId: thing || id,
        platformPostUrl: url,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to publish to Reddit',
        errorDetails: error,
      };
    }
  }
}
