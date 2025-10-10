import { type NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      lateApiKey: process.env.LATE_API_KEY || '',
      lateProfileId: '',
      lateBaseUrl: 'https://getlate.dev/api',
      openaiApiKey: process.env.OPENAI_API_KEY || '',
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Accept body for backward compatibility but do not persist; we read from env now
    await request.json().catch(() => ({}));

    const missing: string[] = [];
    if (!process.env.LATE_API_KEY) missing.push('Late API Key');
    if (!process.env.OPENAI_API_KEY) missing.push('OpenAI API Key');

    return NextResponse.json({
      success: true,
      validation: missing.length === 0,
      missing,
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
