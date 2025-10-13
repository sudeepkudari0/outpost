import { authRouter } from '@/lib/orpc/router/auth';
import { postsRouter } from '@/lib/orpc/router/posts';
import { socialRouter } from '@/lib/orpc/router/social';

export const router = {
  auth: authRouter,
  social: socialRouter,
  posts: postsRouter,
};

export type AppRouter = typeof router;
