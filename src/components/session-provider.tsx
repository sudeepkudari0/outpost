'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <NextAuthSessionProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NextAuthSessionProvider>
  );
}
