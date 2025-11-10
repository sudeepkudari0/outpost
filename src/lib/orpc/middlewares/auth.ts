import { ORPCError, os } from '@orpc/server';
import type { User as PrismaUser } from '@prisma/client';
import type { User as NextAuthUser } from 'next-auth';

interface AuthContext {
  session?: { user?: NextAuthUser };
  user?: PrismaUser;
  apiKeyScopes?: string[];
  apiKeyId?: string;
}

export const requiredAuthMiddleware = os
  .$context<AuthContext>()
  .middleware(async ({ context, next }) => {
    const session = context.session;
    if (!session?.user) {
      throw new ORPCError('UNAUTHORIZED', {
        status: 401,
        message: 'User not authenticated.',
      });
    }

    return next({
      context: { ...context, session, user: session.user as PrismaUser },
    });
  });

export function requireScopes(required: string[]) {
  return os.$context<AuthContext>().middleware(async ({ context, next }) => {
    const scopes = context.apiKeyScopes;
    if (!scopes || scopes.length === 0) {
      // No API key or no scopes; allow if using session auth
      return next({ context });
    }
    const missing = required.filter(s => !scopes.includes(s));
    if (missing.length > 0) {
      throw new ORPCError('FORBIDDEN', {
        status: 403,
        message: `Missing required scope(s): ${missing.join(', ')}`,
      });
    }
    return next({ context });
  });
}
