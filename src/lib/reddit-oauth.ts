export interface RedditOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface RedditTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  scope?: string;
  refresh_token?: string;
}

interface RedditMeResponse {
  id: string; // e.g., "t2_abc123"
  name: string; // username
  icon_img?: string;
  snoovatar_img?: string;
}

export class RedditOAuthService {
  private config: RedditOAuthConfig;
  private readonly authBaseUrl = 'https://www.reddit.com/api/v1/authorize';
  private readonly tokenUrl = 'https://www.reddit.com/api/v1/access_token';
  private readonly meUrl = 'https://oauth.reddit.com/api/v1/me';

  constructor(config: RedditOAuthConfig) {
    this.config = config;
  }

  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      state,
      redirect_uri: this.config.redirectUri,
      duration: 'permanent',
      scope: ['identity', 'read', 'submit'].join(' '),
    });
    return `${this.authBaseUrl}?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<RedditTokenResponse> {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.config.redirectUri,
    });

    const credentials = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`
    ).toString('base64');

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
        'User-Agent': 'social-saas/1.0 (+contact admin)',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to exchange Reddit token: ${err}`);
    }

    return response.json();
  }

  async getUserMe(accessToken: string): Promise<RedditMeResponse> {
    const response = await fetch(this.meUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'social-saas/1.0 (+contact admin)',
      },
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to fetch Reddit user: ${err}`);
    }

    return response.json();
  }
}

export function createRedditOAuthService(
  redirectUri: string
): RedditOAuthService {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'Reddit credentials not configured. Please set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET.'
    );
  }

  return new RedditOAuthService({ clientId, clientSecret, redirectUri });
}
