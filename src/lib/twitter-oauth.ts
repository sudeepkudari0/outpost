/**
 * Twitter (X) OAuth 2.0 with PKCE + basic user retrieval
 * Docs summary:
 * - Authorization: https://twitter.com/i/oauth2/authorize
 * - Token: https://api.twitter.com/2/oauth2/token
 * - Me: GET https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username
 * Scopes needed: tweet.read tweet.write users.read offline.access
 */

import { prisma } from '@/lib/db';
import type { Platform } from '@prisma/client';
import crypto from 'crypto';

export interface TwitterOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface TwitterTokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
  scope: string;
  refresh_token?: string;
}

interface TwitterUserResponse {
  data: {
    id: string;
    name: string;
    username: string;
    profile_image_url?: string;
  };
}

function base64url(input: Buffer) {
  return input
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function generatePkceVerifier(): string {
  return base64url(crypto.randomBytes(32));
}

export function generatePkceChallenge(verifier: string): string {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return base64url(hash);
}

export class TwitterOAuthService {
  private config: TwitterOAuthConfig;
  private readonly authBaseUrl = 'https://x.com/i/oauth2/authorize';
  private readonly tokenUrl = 'https://api.x.com/2/oauth2/token';
  private readonly apiBase = 'https://api.x.com/2';

  constructor(config: TwitterOAuthConfig) {
    this.config = config;
  }

  getAuthUrl(state: string, codeChallenge: string): string {
    const scopes = [
      'tweet.read',
      'tweet.write',
      'users.read',
      'offline.access',
    ];
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: scopes.join(' '),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
    return `${this.authBaseUrl}?${params.toString()}`;
  }

  async exchangeCodeForToken(params: {
    code: string;
    codeVerifier: string;
  }): Promise<TwitterTokenResponse> {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: params.code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
      code_verifier: params.codeVerifier,
    });
    const basicAuth = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`
    ).toString('base64');
    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: body.toString(),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Twitter token exchange failed: ${err}`);
    }
    return (await response.json()) as TwitterTokenResponse;
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<TwitterTokenResponse> {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.config.clientId,
    });
    const basicAuth = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`
    ).toString('base64');
    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: body.toString(),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Twitter token refresh failed: ${err}`);
    }
    return (await response.json()) as TwitterTokenResponse;
  }

  async getUserMe(accessToken: string): Promise<TwitterUserResponse['data']> {
    const url = `${this.apiBase}/users/me?user.fields=profile_image_url,name,username`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Twitter me fetch failed: ${err}`);
    }
    const data = (await response.json()) as TwitterUserResponse;
    return data.data;
  }
}

export function createTwitterOAuthService(
  redirectUri: string
): TwitterOAuthService {
  const clientId = process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      'Twitter credentials not configured. Please set TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET.'
    );
  }
  return new TwitterOAuthService({ clientId, clientSecret, redirectUri });
}

export async function saveTwitterAccount(params: {
  profileId: string;
  platform: Platform;
  platformUserId: string;
  username: string;
  displayName?: string;
  profileImageUrl?: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  platformData?: any;
}) {
  const existing = await prisma.connectedAccount.findFirst({
    where: {
      profileId: params.profileId,
      platform: params.platform,
      platformUserId: params.platformUserId,
    },
  });
  if (existing) {
    return prisma.connectedAccount.update({
      where: { id: existing.id },
      data: {
        username: params.username,
        displayName: params.displayName,
        profileImageUrl: params.profileImageUrl,
        accessToken: params.accessToken,
        refreshToken: params.refreshToken,
        tokenExpiresAt: params.tokenExpiresAt,
        platformData: params.platformData,
        isActive: true,
        lastSyncedAt: new Date(),
      },
    });
  }
  return prisma.connectedAccount.create({
    data: {
      profileId: params.profileId,
      platform: params.platform,
      platformUserId: params.platformUserId,
      username: params.username,
      displayName: params.displayName,
      profileImageUrl: params.profileImageUrl,
      accessToken: params.accessToken,
      refreshToken: params.refreshToken,
      tokenExpiresAt: params.tokenExpiresAt,
      platformData: params.platformData,
      isActive: true,
      connectedAt: new Date(),
      lastSyncedAt: new Date(),
    },
  });
}
