import type { DefaultSession } from 'next-auth';
import type { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      name: string;
      email: string | null;
      whatsapp: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    role: UserRole;
    name: string;
    email: string | null;
    whatsapp: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole;
    name: string;
    email: string | null;
    whatsapp: string | null;
  }
}
