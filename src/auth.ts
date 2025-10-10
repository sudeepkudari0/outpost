import { getUserById } from '@/data/user';
import { prisma } from '@/lib/db';
import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import authConfig from './lib/auth/auth.config';
import { UserRole } from './schemas';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') return true;
      if (account?.provider === 'otp') return true;

      if (account?.provider !== 'credentials') return true;
      const existingUser = await getUserById(user.id as string);

      if (!existingUser) return false;

      return true;
    },
    async session({ token, session }: { token: any; session: any }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (session.user) {
        session.user.name = token.name ?? session.user.name;
        session.user.email = token.email ?? session.user.email;
        session.user.whatsapp = token.whatsapp ?? null;
        session.user.status = token.status ?? null;
        session.user.role = (token.role as UserRole) ?? null;
        session.user.isVerified = token.isVerified ?? null;
        session.user.image = token.image ?? session.user.image;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      token.name = existingUser.name;
      token.email = existingUser.email;
      token.whatsapp = existingUser.whatsapp;
      token.status = existingUser.status;
      token.role = existingUser.role;
      token.isVerified = existingUser.isVerified;
      token.image = existingUser.image;
      return token;
    },
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  ...authConfig,
});
