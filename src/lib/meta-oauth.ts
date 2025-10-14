/**
 * Meta OAuth Service
 * Handles Instagram and Facebook authentication via Meta for Developers
 * Industry-standard OAuth 2.0 implementation
 */

import { prisma } from '@/lib/db';
import type { Platform } from '@prisma/client';

export interface MetaOAuthConfig {
  instagramAppId: string;
  facebookAppId: string;
  appSecret: string;
  redirectUri: string;
}

export interface MetaTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface MetaUserProfile {
  id: string;
  name?: string;
  username?: string;
  profile_picture_url?: string;
  account_type?: string;
}

export interface InstagramAccount {
  user_id: string;
  username: string;
  name?: string;
  profile_picture_url?: string;
  account_type?: string;
}

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

export class MetaOAuthService {
  private config: MetaOAuthConfig;
  private readonly authBaseUrlFacebook =
    'https://www.facebook.com/v21.0/dialog/oauth';
  private readonly authBaseUrlInstagram =
    'https://www.instagram.com/oauth/authorize';
  private readonly facebookTokenUrl =
    'https://graph.facebook.com/v21.0/oauth/access_token';
  private readonly instagramTokenUrl =
    'https://api.instagram.com/oauth/access_token';
  private readonly instagramLongLivedTokenUrl =
    'https://graph.instagram.com/access_token';
  private readonly graphApiUrl = 'https://graph.facebook.com/v21.0';
  private readonly instagramMeUrl = 'https://graph.instagram.com/v24.0/me';

  constructor(config: MetaOAuthConfig) {
    this.config = config;
  }

  /**
   * Generate OAuth authorization URL for Instagram
   */
  getInstagramAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.instagramAppId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      // Use business scopes as requested by Meta for Developers
      scope: [
        'instagram_business_basic',
        'instagram_business_content_publish',
      ].join(' '),
      state,
      force_reauth: 'true',
    });

    return `${this.authBaseUrlInstagram}?${params.toString()}`;
  }

  /**
   * Generate OAuth authorization URL for Facebook Pages
   */
  getFacebookAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.facebookAppId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      // Using basic permissions + pages permissions
      // Note: Advanced permissions may require App Review
      scope: [
        'public_profile',
        'pages_show_list',
        'pages_read_engagement',
        'pages_manage_posts',
      ].join(','),
      state,
      // Add config_id if you have a business configuration
      // Helps with permissions in development mode
    });

    return `${this.authBaseUrlFacebook}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for Facebook access token
   */
  async exchangeCodeForFacebookToken(code: string): Promise<MetaTokenResponse> {
    const params = new URLSearchParams({
      client_id: this.config.facebookAppId,
      client_secret: this.config.appSecret,
      redirect_uri: this.config.redirectUri,
      grant_type: 'authorization_code',
      code,
    });

    const response = await fetch(this.facebookTokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code for Facebook token: ${error}`);
    }

    return response.json();
  }

  /**
   * Exchange authorization code for Instagram access token
   */
  async exchangeCodeForInstagramToken(code: string): Promise<{
    access_token: string;
    user_id: number;
    permissions: string[];
  }> {
    const params = new URLSearchParams({
      client_id: this.config.instagramAppId,
      client_secret: this.config.appSecret,
      redirect_uri: this.config.redirectUri,
      grant_type: 'authorization_code',
      code,
    });
    console.log('exchangeCodeForInstagramToken: params', params.toString());

    const response = await fetch(this.instagramTokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Meta OAuth] Instagram token error response:', errorText);

      // Try to parse as JSON for better error message
      try {
        const errorJson = JSON.parse(errorText);
        console.error(
          '[Meta OAuth] Parsed error:',
          JSON.stringify(errorJson, null, 2)
        );
      } catch (e) {
        console.error('[Meta OAuth] Raw error (not JSON):', errorText);
      }

      throw new Error(
        `Failed to exchange code for Instagram token: ${errorText}`
      );
    }

    const data = await response.json();
    return data;
  }

  /**
   * Exchange authorization code for access token (backwards compatibility)
   * @deprecated Use exchangeCodeForFacebookToken or exchangeCodeForInstagramToken instead
   */
  async exchangeCodeForToken(code: string): Promise<MetaTokenResponse> {
    return this.exchangeCodeForFacebookToken(code);
  }

  /**
   * Get long-lived access token for Facebook (expires in ~60 days)
   */
  async getFacebookLongLivedToken(
    shortLivedToken: string
  ): Promise<MetaTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: this.config.facebookAppId,
      client_secret: this.config.appSecret,
      fb_exchange_token: shortLivedToken,
    });

    const response = await fetch(this.facebookTokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get Facebook long-lived token: ${error}`);
    }

    return response.json();
  }

  /**
   * Get long-lived access token for Instagram (expires in ~60 days)
   */
  async getInstagramLongLivedToken(
    shortLivedToken: string
  ): Promise<MetaTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'ig_exchange_token',
      client_secret: this.config.appSecret,
      access_token: shortLivedToken,
    });

    const response = await fetch(
      `${this.instagramLongLivedTokenUrl}?${params.toString()}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get Instagram long-lived token: ${error}`);
    }

    return response.json();
  }

  /**
   * Get long-lived access token (backwards compatibility)
   * @deprecated Use getFacebookLongLivedToken or getInstagramLongLivedToken instead
   */
  async getLongLivedToken(shortLivedToken: string): Promise<MetaTokenResponse> {
    return this.getFacebookLongLivedToken(shortLivedToken);
  }

  /**
   * Get user's Facebook pages
   */
  async getUserPages(accessToken: string): Promise<FacebookPage[]> {
    const response = await fetch(
      `${this.graphApiUrl}/me/accounts?fields=id,name,access_token,category,picture&access_token=${accessToken}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch user pages: ${error}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Get Instagram Business Account details
   */
  async getInstagramAccountDetails(
    accessToken: string
  ): Promise<InstagramAccount> {
    const response = await fetch(
      `${this.instagramMeUrl}?fields=user_id,username,name,profile_picture_url,account_type&access_token=${accessToken}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch Instagram account details: ${error}`);
    }

    return response.json();
  }

  /**
   * Get Instagram Business Account connected to a Facebook Page
   */
  async getPageInstagramAccount(
    pageId: string,
    pageAccessToken: string
  ): Promise<InstagramAccount | null> {
    const response = await fetch(
      `${this.graphApiUrl}/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error(
        `Failed to fetch Instagram account for page ${pageId}:`,
        error
      );
      return null;
    }

    const data = await response.json();

    if (!data.instagram_business_account) {
      return null;
    }

    const igAccountId = data.instagram_business_account.id;

    // Fetch Instagram account details
    const igResponse = await fetch(
      `${this.instagramMeUrl}?fields=user_id,username,name,profile_picture_url,account_type&access_token=${pageAccessToken}`,
      {
        method: 'GET',
      }
    );

    if (!igResponse.ok) {
      return null;
    }

    return igResponse.json();
  }

  /**
   * Get permanent page access token
   */
  async getPageLongLivedToken(
    pageId: string,
    userLongLivedToken: string
  ): Promise<string> {
    const response = await fetch(
      `${this.graphApiUrl}/${pageId}?fields=access_token&access_token=${userLongLivedToken}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get page token: ${error}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  /**
   * Validate access token
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.graphApiUrl}/me?access_token=${accessToken}`,
        {
          method: 'GET',
        }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Revoke access token
   */
  async revokeToken(accessToken: string): Promise<void> {
    const response = await fetch(
      `${this.graphApiUrl}/me/permissions?access_token=${accessToken}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to revoke token: ${error}`);
    }
  }
}

/**
 * Create Meta OAuth service instance
 */
export function createMetaOAuthService(redirectUri: string): MetaOAuthService {
  const instagramAppId = process.env.META_INSTAGRAM_APP_ID;
  const facebookAppId = process.env.META_FACEBOOK_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!instagramAppId || !facebookAppId || !appSecret) {
    throw new Error(
      'Meta OAuth credentials not configured. Please set META_APP_ID and META_APP_SECRET environment variables.'
    );
  }

  return new MetaOAuthService({
    instagramAppId,
    facebookAppId,
    appSecret,
    redirectUri,
  });
}

/**
 * Save connected account to database
 */
export async function saveConnectedAccount(params: {
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
  const {
    profileId,
    platform,
    platformUserId,
    username,
    displayName,
    profileImageUrl,
    accessToken,
    refreshToken,
    tokenExpiresAt,
    platformData,
  } = params;

  // Check if account already exists
  const existing = await prisma.connectedAccount.findFirst({
    where: {
      profileId,
      platform,
      platformUserId,
    },
  });

  if (existing) {
    // Update existing account
    return prisma.connectedAccount.update({
      where: { id: existing.id },
      data: {
        username,
        displayName,
        profileImageUrl,
        accessToken,
        refreshToken,
        tokenExpiresAt,
        platformData,
        isActive: true,
        lastSyncedAt: new Date(),
      },
    });
  }

  // Create new account
  return prisma.connectedAccount.create({
    data: {
      profileId,
      platform,
      platformUserId,
      username,
      displayName,
      profileImageUrl,
      accessToken,
      refreshToken,
      tokenExpiresAt,
      platformData,
      isActive: true,
      connectedAt: new Date(),
      lastSyncedAt: new Date(),
    },
  });
}

/**
 * Generate a secure random state for OAuth
 */
export function generateOAuthState(): string {
  return crypto.randomUUID();
}
