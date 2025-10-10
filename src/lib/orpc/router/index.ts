import { authRouter } from '@/lib/orpc/router/auth';

export const router = {
  auth: authRouter,
};

export type AppRouter = typeof router;
