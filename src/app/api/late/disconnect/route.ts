import { type NextRequest, NextResponse } from 'next/server';
import { late } from '@/lib/late';

export async function POST(request: NextRequest) {
  try {
    const { platform, accountId, profileId } = await request.json();

    if (!platform || !accountId) {
      return NextResponse.json(
        { error: 'Platform and account ID are required' },
        { status: 400 }
      );
    }

    // Normalize platform alias (twitter/x)
    const normalizedPlatform =
      platform?.toLowerCase() === 'x' || platform?.toLowerCase() === 'twitter'
        ? 'twitter'
        : platform;

    await late.disconnectAccount(accountId, {
      profileId,
      platform: normalizedPlatform,
    });

    return NextResponse.json({
      success: true,
      message: `${platform} account disconnected successfully`,
    });
  } catch (error) {
    console.error('Disconnect error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to disconnect account';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
