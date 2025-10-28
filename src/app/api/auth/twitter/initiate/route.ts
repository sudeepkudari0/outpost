import {
  createTwitterOAuthService,
  generatePkceChallenge,
  generatePkceVerifier,
} from '@/lib/twitter-oauth';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const redirectUri = searchParams.get('redirect_uri');

    if (!redirectUri) {
      return NextResponse.json(
        { error: 'Missing redirect_uri parameter' },
        { status: 400 }
      );
    }

    // Generate PKCE parameters
    const codeVerifier = generatePkceVerifier();
    const codeChallenge = generatePkceChallenge(codeVerifier);

    // Generate state parameter for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');

    // Store state and code verifier in a secure way (you might want to use Redis or database)
    // For now, we'll encode them in the state parameter
    const stateData = {
      state,
      codeVerifier,
      redirectUri,
    };

    const encodedState = Buffer.from(JSON.stringify(stateData)).toString(
      'base64'
    );

    // Create Twitter OAuth service
    const twitterOAuth = createTwitterOAuthService(redirectUri);

    // Generate authorization URL
    const authUrl = twitterOAuth.getAuthUrl(encodedState, codeChallenge);

    return NextResponse.json({
      auth_url: authUrl,
      state: encodedState,
    });
  } catch (error) {
    console.error('Twitter OAuth initiate error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Twitter OAuth' },
      { status: 500 }
    );
  }
}
