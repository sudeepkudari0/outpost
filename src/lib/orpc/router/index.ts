import { apiKeysRouter } from '@/lib/orpc/router/api-keys';
import { authRouter } from '@/lib/orpc/router/auth';
import { postsRouter } from '@/lib/orpc/router/posts';
import { socialRouter } from '@/lib/orpc/router/social';

export const router = {
  auth: authRouter,
  social: socialRouter,
  posts: postsRouter,
  apikeys: apiKeysRouter,
};

export type AppRouter = typeof router;
