import { prisma } from '@/lib/db';
import { os } from '@orpc/server';
import type { PrismaClient } from '@prisma/client';

interface DbContext {
  prisma?: PrismaClient;
}

export const dbProviderMiddleware = os
  .$context<DbContext>()
  .middleware(async ({ context, next }) => {
    return next({
      context: {
        ...context,
        prisma,
      },
    });
  });
