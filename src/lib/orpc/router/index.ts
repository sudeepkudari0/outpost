import { authRouter } from '@/lib/orpc/router/auth';
import { socialRouter } from '@/lib/orpc/router/social';

export const router = {
  auth: authRouter,
  social: socialRouter,
};

export type AppRouter = typeof router;
