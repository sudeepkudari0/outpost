import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { BatchLinkPlugin } from '@orpc/client/plugins';
import type { RouterClient } from '@orpc/server';
import { createRouterUtils } from '@orpc/tanstack-query';
import type { router } from './router';

/**
 * This is part of the Optimize SSR setup.
 *
 * @see {@link https://orpc.unnoq.com/docs/adapters/next#optimize-ssr}
 */
declare global {
  var $client: RouterClient<typeof router> | undefined;
  var $individualClient: RouterClient<typeof router> | undefined;
}

const link = new RPCLink({
  url: `${
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  }/api/orpc`,
  fetch:
    typeof window !== 'undefined'
      ? window.fetch.bind(window)
      : async (input, init: RequestInit | undefined) => {
          // For server-side requests, we need to include cookies
          const { cookies } = await import('next/headers');
          const cookieStore = await cookies();
          const cookieHeader = cookieStore.toString();

          return fetch(input, {
            ...init,
            headers: {
              ...(init?.headers || {}),
              ...(cookieHeader ? { Cookie: cookieHeader } : {}),
            },
          } as RequestInit);
        },
  plugins: [
    new BatchLinkPlugin({
      groups: [
        {
          condition: () => true,
          context: {},
        },
      ],
    }),
  ],
});

// Individual link without batching for problematic procedures
const individualLink = new RPCLink({
  url: `${
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  }/api/orpc`,
  fetch:
    typeof window !== 'undefined'
      ? window.fetch.bind(window)
      : async (input, init: RequestInit | undefined) => {
          // For server-side requests, we need to include cookies
          const { cookies } = await import('next/headers');
          const cookieStore = await cookies();
          const cookieHeader = cookieStore.toString();

          return fetch(input, {
            ...init,
            headers: {
              ...(init?.headers || {}),
              ...(cookieHeader ? { Cookie: cookieHeader } : {}),
            },
          } as RequestInit);
        },
  // No BatchLinkPlugin for individual calls
});

export const client: RouterClient<typeof router> =
  globalThis.$client ?? createORPCClient(link);

// Individual client for procedures that fail with batching
export const individualClient: RouterClient<typeof router> =
  globalThis.$individualClient ?? createORPCClient(individualLink);

export const orpc = createRouterUtils(client);
