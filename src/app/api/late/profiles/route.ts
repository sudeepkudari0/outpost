import { type NextRequest, NextResponse } from 'next/server';
import { late } from '@/lib/late';

export async function GET() {
  try {
    const data = await late.listProfiles();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[v0] Profiles fetch error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to fetch profiles',
        details: errorMessage,
        suggestion: 'Please check your Late API key and base URL configuration',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await late.createProfile(body);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Profile creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}
