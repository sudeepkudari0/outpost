import { ORPCError, os } from '@orpc/server';
import type { User as PrismaUser } from '@prisma/client';
import type { User as NextAuthUser } from 'next-auth';

interface AuthContext {
  session?: { user?: NextAuthUser };
  user?: PrismaUser;
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
