'server only';

import { prisma } from '@/lib/db';
import { createRouterClient } from '@orpc/server';
import { headers } from 'next/headers';
import { router } from './router';
import { getAuthenticatedUser } from './server-client';

// Optimize SSR: share a single client instance
// eslint-disable-next-line no-undef
globalThis.$client = createRouterClient(router, {
  context: async () => ({
    headers: await headers(),
    prisma,
    session: await getAuthenticatedUser(),
  }),
});

export const client = globalThis.$client;
