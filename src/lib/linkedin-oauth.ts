/**
 * LinkedIn OAuth Service
 * Handles LinkedIn authentication and account retrieval
 * Docs: https://learn.microsoft.com/linkedin/shared/authentication/client-credentials-flow
 */

import { prisma } from '@/lib/db';
import type { Platform } from '@prisma/client';

export interface LinkedInOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  id_token?: string;
}

interface LinkedInMemberResponse {
  id: string; // urn:li:person:xxxx -> may return bare id via projection
  localizedFirstName?: string;
  localizedLastName?: string;
  profilePicture?: any;
}

interface LinkedInOrg {
  id: string; // urn:li:organization:xxxx
  localizedName?: string;
  name?: string;
  vanityName?: string;
  logoV2?: any;
}

export class LinkedInOAuthService {
  private config: LinkedInOAuthConfig;
  private readonly authBaseUrl =
    'https://www.linkedin.com/oauth/v2/authorization';
  private readonly tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
  private readonly apiBase = 'https://api.linkedin.com/v2';

  constructor(config: LinkedInOAuthConfig) {
    this.config = config;
  }

  getAuthUrl(state: string): string {
    const enableOrgScopes =
      (process.env.LINKEDIN_ENABLE_ORG_SCOPES || '').toLowerCase() === 'true';

    const scopes = [
      'openid',
      'profile',
      'email',
      'w_member_social',
    ] as string[];
    if (enableOrgScopes) {
      scopes.push(
        'rw_organization_admin',
        'w_organization_social',
        'r_organization_social'
      );
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      state,
      scope: scopes.join(' '),
    });
    return `${this.authBaseUrl}?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<LinkedInTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });
    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`LinkedIn token exchange failed: ${err}`);
    }
    return (await response.json()) as LinkedInTokenResponse;
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<LinkedInTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });
    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`LinkedIn token refresh failed: ${err}`);
    }
    return (await response.json()) as LinkedInTokenResponse;
  }

  async getMemberProfile(accessToken: string): Promise<LinkedInMemberResponse> {
    // Prefer OIDC userinfo when openid/profile/email scopes are used
    const userinfoUrl = `${this.apiBase}/userinfo`;
    const userinfo = await fetch(userinfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (userinfo.ok) {
      const data = (await userinfo.json()) as any;
      return {
        id: data.sub,
        localizedFirstName: data.given_name,
        localizedLastName: data.family_name,
        profilePicture: data.picture,
      } as LinkedInMemberResponse;
    }

    // Fallback to /me for apps provisioned with r_liteprofile
    const meUrl = `${this.apiBase}/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))`;
    const response = await fetch(meUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        // Optionally allow pinning a version via env
        ...(process.env.LINKEDIN_API_VERSION
          ? { 'LinkedIn-Version': process.env.LINKEDIN_API_VERSION }
          : {}),
      },
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`LinkedIn me fetch failed: ${err}`);
    }
    return (await response.json()) as LinkedInMemberResponse;
  }

  async getAdminOrganizations(accessToken: string): Promise<LinkedInOrg[]> {
    // Organization admin list
    const url = `${this.apiBase}/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED&projection=(elements*(organization~(id,localizedName,vanityName,logoV2(original~:playableStreams))))`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        ...(process.env.LINKEDIN_API_VERSION
          ? { 'LinkedIn-Version': process.env.LINKEDIN_API_VERSION }
          : {}),
      },
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`LinkedIn organization fetch failed: ${err}`);
    }
    const data = (await response.json()) as any;
    const elements = Array.isArray(data.elements) ? data.elements : [];
    return elements
      .map((e: any) => e['organization~'])
      .filter(Boolean)
      .map((org: any) => ({
        id: org.id,
        localizedName: org.localizedName,
        vanityName: org.vanityName,
        logoV2: org.logoV2,
      }));
  }
}

export function createLinkedInOAuthService(
  redirectUri: string
): LinkedInOAuthService {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      'LinkedIn credentials not configured. Please set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET.'
    );
  }
  return new LinkedInOAuthService({ clientId, clientSecret, redirectUri });
}

export async function saveLinkedInAccount(params: {
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

  const existing = await prisma.connectedAccount.findFirst({
    where: { profileId, platform, platformUserId },
  });
  if (existing) {
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
