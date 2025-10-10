'server only';

import { createRouterClient } from '@orpc/server';
import { headers } from 'next/headers';
import { router } from './router';

// Optimize SSR: share a single client instance
// eslint-disable-next-line no-undef
globalThis.$client = createRouterClient(router, {
  context: async () => ({
    headers: await headers(),
  }),
});
