'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

export function SessionProvider({ children }: { children: ReactNode }) {
  // Keep a single QueryClient instance for the lifetime of the provider
  const [queryClient] = (require('react') as typeof import('react')).useState(
    () => new QueryClient()
  );
  return (
    <NextAuthSessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        {/* <ReactQueryDevtools initialIsOpen={false} position="bottom" /> */}
      </QueryClientProvider>
    </NextAuthSessionProvider>
  );
}
