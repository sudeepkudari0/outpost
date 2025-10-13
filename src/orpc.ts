import { requiredAuthMiddleware } from '@/lib/orpc/middlewares/auth';
import { dbProviderMiddleware } from '@/lib/orpc/middlewares/db';
import { os } from '@orpc/server';

export const pub = os.use(dbProviderMiddleware);

export const authed = pub.use(requiredAuthMiddleware);
