import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { BatchLinkPlugin } from '@orpc/client/plugins';
import type { RouterClient } from '@orpc/server';
import { createRouterUtils } from '@orpc/tanstack-query';
import type { router } from './router';

declare global {
  // Optimize SSR shared instances
  // eslint-disable-next-line no-var
  var $client: RouterClient<typeof router> | undefined;
  // eslint-disable-next-line no-var
  var $individualClient: RouterClient<typeof router> | undefined;
}

const baseUrl =
  typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const link = new RPCLink({
  url: `${baseUrl}/api/orpc`,
  fetch:
    typeof window !== 'undefined'
      ? window.fetch.bind(window)
      : async (input, init: RequestInit | undefined) => {
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

const individualLink = new RPCLink({
  url: `${baseUrl}/api/orpc`,
  fetch:
    typeof window !== 'undefined'
      ? window.fetch.bind(window)
      : async (input, init: RequestInit | undefined) => {
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
});

export const client: RouterClient<typeof router> =
  globalThis.$client ?? createORPCClient(link);

export const individualClient: RouterClient<typeof router> =
  globalThis.$individualClient ?? createORPCClient(individualLink);

export const orpc = createRouterUtils(client);
