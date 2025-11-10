import { getAccountByUserId, getUserByEmail } from '@/data/user';
import { LoginSchema } from '@/schemas';
import { createHash } from 'crypto';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),

    // Email & Password Provider
    Credentials({
      id: 'credentials',
      name: 'Email Login',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);
        if (!validatedFields.success) return null;

        const { email, password } = validatedFields.data;
        const user = await getUserByEmail(email);
        if (!user) return null;

        const account = await getAccountByUserId(user.id as string);
        if (!account) return null;

        // If account doesn't have password set yet, return null to indicate password needs to be set
        if (!account.password || !account.salt) {
          return null;
        }

        const saltedPassword = password + account.salt;
        const hashedPassword = createHash('sha256')
          .update(saltedPassword)
          .digest('hex');

        if (hashedPassword !== account.password) {
          return null;
        }

        return user;
      },
    }),
  ],
} satisfies NextAuthConfig;
