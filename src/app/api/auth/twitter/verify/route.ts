import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { createTwitterOAuthService } from '@/lib/twitter-oauth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const redirectUri = searchParams.get('redirect_uri');

    if (!redirectUri) {
      return NextResponse.json(
        { error: 'Missing redirect_uri parameter' },
        { status: 400 }
      );
    }

    // Get user's Twitter account
    const twitterAccount = await prisma.connectedAccount.findFirst({
      where: {
        profileId: session.user.id,
        platform: 'TWITTER',
        isActive: true,
      },
    });

    if (!twitterAccount) {
      return NextResponse.json(
        { error: 'No Twitter account connected' },
        { status: 404 }
      );
    }

    // Check if token is expired
    const now = new Date();
    if (twitterAccount.tokenExpiresAt && twitterAccount.tokenExpiresAt < now) {
      // Try to refresh the token
      if (twitterAccount.refreshToken) {
        try {
          const twitterOAuth = createTwitterOAuthService(redirectUri);
          const refreshedToken = await twitterOAuth.refreshAccessToken(
            twitterAccount.refreshToken
          );

          // Update the token in database
          const newExpiresAt = refreshedToken.expires_in
            ? new Date(Date.now() + refreshedToken.expires_in * 1000)
            : null;

          await prisma.connectedAccount.update({
            where: { id: twitterAccount.id },
            data: {
              accessToken: refreshedToken.access_token,
              refreshToken:
                refreshedToken.refresh_token || twitterAccount.refreshToken,
              tokenExpiresAt: newExpiresAt,
              lastSyncedAt: new Date(),
            },
          });

          // Update the account object with new token
          twitterAccount.accessToken = refreshedToken.access_token;
          twitterAccount.refreshToken =
            refreshedToken.refresh_token || twitterAccount.refreshToken;
          twitterAccount.tokenExpiresAt = newExpiresAt;
        } catch (refreshError) {
          console.error('Failed to refresh Twitter token:', refreshError);
          return NextResponse.json(
            { error: 'Token expired and refresh failed' },
            { status: 401 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Token expired and no refresh token available' },
          { status: 401 }
        );
      }
    }

    // Verify the token by making a test API call
    try {
      const twitterOAuth = createTwitterOAuthService(redirectUri);
      const userInfo = await twitterOAuth.getUserMe(
        twitterAccount.accessToken!
      );

      return NextResponse.json({
        valid: true,
        account: {
          id: twitterAccount.id,
          platform: twitterAccount.platform,
          username: twitterAccount.username,
          displayName: twitterAccount.displayName,
          profileImageUrl: twitterAccount.profileImageUrl,
          connectedAt: twitterAccount.connectedAt,
          lastSyncedAt: twitterAccount.lastSyncedAt,
          tokenExpiresAt: twitterAccount.tokenExpiresAt,
        },
        userInfo: {
          id: userInfo.id,
          username: userInfo.username,
          name: userInfo.name,
          profile_image_url: userInfo.profile_image_url,
        },
      });
    } catch (verifyError) {
      console.error('Failed to verify Twitter token:', verifyError);
      return NextResponse.json(
        { error: 'Token verification failed' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Twitter OAuth verify error:', error);
    return NextResponse.json(
      { error: 'Failed to verify Twitter connection' },
      { status: 500 }
    );
  }
}
