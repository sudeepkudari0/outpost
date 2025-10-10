import { NextRequest, NextResponse } from 'next/server';

const VERIFY_TOKEN = 'secret';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode && token && challenge) {
    if (token === VERIFY_TOKEN) {
      return new Response(challenge, { status: 200 });
    } else {
      return new Response('Forbidden', { status: 403 });
    }
  }

  return new Response('Bad Request', { status: 400 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Handle webhook notification here
    console.log('Webhook notification received:', body);

    return NextResponse.json({ status: 'OK' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export function OPTIONS() {
  // Optional CORS preflight handling if needed
  return new Response('OK', { status: 200 });
}
