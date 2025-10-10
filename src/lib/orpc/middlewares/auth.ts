import { auth } from '@/auth';
import { ORPCError, os } from '@orpc/server';
import type { User } from 'next-auth';

interface AuthContext {
  session?: { user?: User };
  user?: User;
}

export const requiredAuthMiddleware = os
  .$context<AuthContext>()
  .middleware(async ({ context, next }) => {
    const session = await auth();

    if (!session?.user) {
      throw new ORPCError('UNAUTHORIZED', {
        status: 401,
        message: 'User not authenticated.',
      });
    }

    return next({
      context: { ...context, session, user: session.user },
    });
  });
