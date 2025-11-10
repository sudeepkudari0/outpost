import { auth } from '@/auth';
import {
  createTwitterOAuthService,
  saveTwitterAccount,
} from '@/lib/twitter-oauth';
import type { Platform } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth error
    if (error) {
      console.error('Twitter OAuth error:', { error, errorDescription });
      const message = errorDescription ? `${error}:${errorDescription}` : error;
      return NextResponse.redirect(
        new URL(
          `/dashboard/connections?error=${encodeURIComponent(message)}`,
          request.url
        )
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard/connections?error=missing_parameters', request.url)
      );
    }

    // Decode state to get stored data
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch (e) {
      console.error('Invalid state parameter:', e);
      return NextResponse.redirect(
        new URL('/dashboard/connections?error=invalid_state', request.url)
      );
    }

    const { codeVerifier, profileId } = stateData as {
      codeVerifier?: string;
      profileId?: string;
    };

    if (!codeVerifier) {
      return NextResponse.redirect(
        new URL('/dashboard/connections?error=missing_verifier', request.url)
      );
    }
    if (!profileId) {
      return NextResponse.redirect(
        new URL('/dashboard/connections?error=missing_profile', request.url)
      );
    }

    // Get current user session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.redirect(
        new URL('/login?error=not_authenticated', request.url)
      );
    }

    // Create Twitter OAuth service (recompute redirect URI deterministically)
    const baseRaw = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const redirectUri = `${baseRaw}/api/auth/twitter/callback`;
    const twitterOAuth = createTwitterOAuthService(redirectUri);

    // Exchange code for token
    const tokenResponse = await twitterOAuth.exchangeCodeForToken({
      code,
      codeVerifier,
    });

    // Get user info from Twitter
    const userInfo = await twitterOAuth.getUserMe(tokenResponse.access_token);

    // Calculate token expiration
    const tokenExpiresAt = tokenResponse.expires_in
      ? new Date(Date.now() + tokenResponse.expires_in * 1000)
      : undefined;

    // Save Twitter account to database
    await saveTwitterAccount({
      profileId,
      platform: 'TWITTER' as Platform,
      platformUserId: userInfo.id,
      username: userInfo.username,
      displayName: userInfo.name,
      profileImageUrl: userInfo.profile_image_url,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      tokenExpiresAt,
      platformData: {
        token_type: tokenResponse.token_type,
        scope: tokenResponse.scope,
      },
    });

    // Redirect to connections page with success
    return NextResponse.redirect(
      new URL('/dashboard/connections?success=twitter_connected', request.url)
    );
  } catch (error) {
    console.error('Twitter OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/connections?error=callback_failed', request.url)
    );
  }
}
