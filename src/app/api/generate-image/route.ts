import { auth } from '@/auth';
import { generateImage as generateAiImage } from '@/lib/ai';
import { getPresignedUrl } from '@/lib/storage';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, aiConfig } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const imageUrl = await generateAiImage({ userId, prompt, aiConfig });
    // Fetch the generated image bytes server-side
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      throw new Error('Failed to fetch generated image bytes');
    }
    const arrayBuffer = await imageRes.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Presign a key and upload to R2
    const key = `generated/${Date.now()}.png`;
    const presign = await getPresignedUrl(key);
    if (presign.error) {
      throw new Error('Failed to get presigned URL');
    }

    const p = presign.result;
    const uploadUrl: string | undefined = p.presignedUrl;
    if (!uploadUrl) {
      throw new Error('Presign did not include an upload URL');
    }

    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      body: bytes,
    });
    if (!uploadRes.ok) {
      throw new Error('Failed to upload generated image to storage');
    }

    const storedUrl = p.publicUrl || key;
    return NextResponse.json({ imageUrl: storedUrl });
  } catch (error) {
    console.error('Error generating image:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate image';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
