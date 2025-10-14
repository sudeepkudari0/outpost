import { getAccountByUserId, getUserByEmail } from '@/data/user';
import { pub } from '@/orpc';
import { LoginSchema } from '@/schemas';
import { createHash } from 'crypto';
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
};
