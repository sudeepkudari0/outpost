import { getAccountByUserId, getUserByEmail } from '@/data/user';
import { prisma } from '@/lib/db';
import { pub } from '@/orpc';
import { LoginSchema } from '@/schemas';
import { createHash, randomBytes } from 'crypto';
import { z } from 'zod';

const SignInResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const authRouter = {
  signIn: pub
    .route({
      method: 'POST',
      path: '/auth/sign-in',
      summary: 'Sign in with email and password',
      tags: ['Authentication'],
    })
    .input(LoginSchema)
    .output(SignInResponseSchema)
    .handler(async ({ input }) => {
      const { email, password } = input;

      const user = await getUserByEmail(email);
      if (!user) {
        return { success: false, message: 'Invalid credentials' };
      }

      const account = await getAccountByUserId(user.id as string);
      if (!account || !account.password || !account.salt) {
        return { success: false, message: 'Invalid credentials' };
      }

      const saltedPassword = password + account.salt;
      const hashedPassword = createHash('sha256')
        .update(saltedPassword)
        .digest('hex');

      if (hashedPassword !== account.password) {
        return { success: false, message: 'Invalid credentials' };
      }

      return { success: true, message: 'Signed in successfully' };
    }),
  signUp: pub
    .route({
      method: 'POST',
      path: '/auth/sign-up',
      summary: 'Sign up with name, email and password',
      tags: ['Authentication'],
    })
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Valid email is required'),
        password: z.string().min(6, 'Minimum 6 characters required'),
      })
    )
    .output(z.object({ success: z.boolean(), message: z.string() }))
    .handler(async ({ input }) => {
      const { name, email, password } = input;

      const existing = await getUserByEmail(email);
      if (existing) {
        return { success: false, message: 'Email already in use' };
      }

      const salt = randomBytes(16).toString('hex');
      const hashedPassword = createHash('sha256')
        .update(password + salt)
        .digest('hex');

      await prisma.$transaction(async tx => {
        const user = await tx.user.create({
          data: {
            name,
            email,
            passwordSet: true,
          },
        });

        await tx.account.create({
          data: {
            userId: user.id,
            type: 'EMAIL',
            provider: 'credentials',
            providerAccountId: email,
            password: hashedPassword,
            salt,
          },
        });
      });

      return { success: true, message: 'Account created successfully' };
    }),
};
