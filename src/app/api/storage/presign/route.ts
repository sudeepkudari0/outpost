import { getPresignedUrl } from '@/lib/storage';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();
    if (!key || typeof key !== 'string') {
      return NextResponse.json({ error: 'key is required' }, { status: 400 });
    }
    const raw = await getPresignedUrl(key);
    if (raw?.error) {
      return NextResponse.json(raw, { status: 500 });
    }
    const r: any = raw;
    const payload = r.result ? r.result : r;
    const presignedUrl = payload.presignedUrl;
    const publicUrl = payload.publicUrl;
    if (!presignedUrl || !publicUrl) {
      return NextResponse.json(
        { error: 'Invalid presign response' },
        { status: 500 }
      );
    }
    return NextResponse.json({ presignedUrl, publicUrl });
  } catch (error) {
    console.error('presign error:', error);
    return NextResponse.json({ error: 'Failed to presign' }, { status: 500 });
  }
}
