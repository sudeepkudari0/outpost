import { prisma } from '@/lib/db';
import { router } from '@/lib/orpc/router';
import { onError } from '@orpc/server';
import { RPCHandler } from '@orpc/server/fetch';
import { BatchHandlerPlugin } from '@orpc/server/plugins';
import { createHash } from 'crypto';
import { getToken } from 'next-auth/jwt';

const rpcHandler = new RPCHandler(router, {
  interceptors: [
    onError((error: any) => {
      console.error('=== ORPC ERROR DETAILS ===');
      console.error('Error type:', error.constructor?.name || 'Unknown');
      console.error('Error code:', error.code);
      console.error('Error status:', error.status);
      console.error('Error message:', error.message);

      // Log detailed validation errors if they exist
      if (error.data) {
        console.error('Error data:', JSON.stringify(error.data, null, 2));
      }

      // Log the cause if it exists (this is where Zod validation errors are stored)
      if (error.cause) {
        console.error('Error cause:', error.cause);

        // If it's a Zod validation error, log the issues in detail
        if (error.cause.issues && Array.isArray(error.cause.issues)) {
          console.error('Validation issues:');
          error.cause.issues.forEach((issue: any, index: number) => {
            console.error(`  Issue ${index + 1}:`, {
              path: issue.path?.join('.') || 'root',
              code: issue.code,
              message: issue.message,
              expected: issue.expected,
              received: issue.received,
              ...issue,
            });
          });
        }
      }

      // Log the full error object for debugging
      console.error(
        'Full error object:',
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
      );
      console.error('=== END ORPC ERROR DETAILS ===');
    }),
  ],
  plugins: [new BatchHandlerPlugin()],
});

async function handleRequest(request: Request) {
  const cookieName =
    process.env.NODE_ENV === 'production'
      ? '__Secure-authjs.session-token'
      : 'authjs.session-token';
  const token = await getToken({
    req: request,
    cookieName,
    secret: process.env.AUTH_SECRET,
  });
  const userFromSession = token
    ? {
        ...token,
        id: token.sub,
      }
    : undefined;

  // If no session user, try API key authentication via headers
  let apiKeyUser: any | undefined;
  let apiKeyScopes: string[] | undefined;
  let apiKeyId: string | undefined;

  if (!userFromSession) {
    const hdr = request.headers;
    const rawApiKey = (() => {
      const auth = hdr.get('authorization') || hdr.get('Authorization');
      if (!auth) return undefined;
      const parts = auth.trim().split(/\s+/);
      if (parts.length === 2 && /^Bearer$/i.test(parts[0])) return parts[1];
      return undefined;
    })();

    if (rawApiKey) {
      try {
        const hash = createHash('sha256').update(rawApiKey).digest('hex');
        const keyRecord = await prisma.apiKey.findUnique({
          where: { keyHash: hash },
        });
        const now = new Date();
        if (
          keyRecord &&
          !keyRecord.revokedAt &&
          (!keyRecord.expiresAt || keyRecord.expiresAt > now)
        ) {
          const user = await prisma.user.findUnique({
            where: { id: keyRecord.userId },
          });
          if (user) {
            apiKeyUser = {
              id: user.id,
              email: user.email,
              role: user.role,
            };
            apiKeyScopes = keyRecord.scopes || [];
            apiKeyId = keyRecord.id;
          }
        }
      } catch (e) {
        // Swallow errors to avoid leaking info; unauthenticated will be handled downstream
      }
    }
  }
  const { response } = await rpcHandler.handle(request, {
    prefix: '/api/orpc',
    context: {
      session: userFromSession
        ? { user: userFromSession }
        : apiKeyUser
          ? { user: apiKeyUser }
          : undefined,
      apiKeyId,
      apiKeyScopes,
    },
  });

  return response ?? new Response('Not found', { status: 404 });
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
