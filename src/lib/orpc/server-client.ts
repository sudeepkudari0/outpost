import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { adminRouter } from './router/admin';
import { authRouter } from './router/auth';
import { invitesRouter } from './router/invites';
import { postsRouter } from './router/posts';
import { profileShareRouter } from './router/profile-share';
import { socialRouter } from './router/social';

/**
 * Server-side router instance that can be called directly without HTTP
 * This bypasses the authentication middleware issues when calling from server components
 */
export const serverRouter = {
  auth: authRouter,
  social: socialRouter,
  posts: postsRouter,
  invites: invitesRouter,
  team: profileShareRouter,
  admin: adminRouter,
};

/**
 * Get the authenticated user on the server side
 */
export async function getAuthenticatedUser() {
  const session = await auth();

  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  return session;
}

/**
 * Server-side authenticated context
 */
export async function getServerContext() {
  const session = await auth();

  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  return {
    user: session.user,
    prisma,
  };
}
