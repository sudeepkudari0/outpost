'use client';

import { individualClient } from '@/lib/orpc/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import Link from 'next/link';

const SignupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Minimum 6 characters required'),
});

type SignupValues = z.infer<typeof SignupSchema>;

export const SignupForm = ({
  error: inboundError,
  callbackUrl,
}: {
  error?: string;
  callbackUrl: string;
}) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(
    inboundError === 'EMAIL_IN_USE_DIFFERENT_METHOD'
      ? 'This email is already registered with a password. Please log in instead.'
      : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignupValues>({
    resolver: zodResolver(SignupSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  async function onSubmit(values: SignupValues) {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await individualClient.auth.signUp({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (!res.success) {
        setError(res.message || 'Unable to create account');
        return;
      }

      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Sign in failed after signup');
        return;
      }

      router.push(callbackUrl ? callbackUrl : '/dashboard');
      router.refresh();
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f5f5f0] dark:bg-gray-950">
      {/* Back to Home Link */}
      <Link
        href="/"
        className="absolute top-4 left-4 text-[#1a1a1a] dark:text-white font-mono hover:text-[#ff6b35] transition-colors"
      >
        ← Back to Home
      </Link>

      <div className="w-full max-w-md">
        {/* Header Badge */}
        <div className="text-center mb-6">
          <div className="inline-block bg-[#4ecdc4] px-4 py-2 border-[2px] border-[#1a1a1a] font-mono text-sm rotate-[2deg] transform mb-4">
            ✨ FREE TO START
          </div>
          <h1 className="text-4xl font-black mb-2">Create Account</h1>
          <p className="font-mono text-sm text-gray-600 dark:text-gray-400">
            Join 200+ creators using OutPost
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-white dark:bg-gray-900 border-[3px] border-[#1a1a1a] p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono font-bold text-sm">
                      FULL NAME
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Jane Doe"
                        className="h-12 border-[2px] border-[#1a1a1a] font-mono focus:border-[#4ecdc4] focus:ring-[#4ecdc4]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="font-mono text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono font-bold text-sm">
                      EMAIL
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className="h-12 border-[2px] border-[#1a1a1a] font-mono focus:border-[#4ecdc4] focus:ring-[#4ecdc4]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="font-mono text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono font-bold text-sm">
                      PASSWORD
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="••••••••"
                        className="h-12 border-[2px] border-[#1a1a1a] font-mono focus:border-[#4ecdc4] focus:ring-[#4ecdc4]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="font-mono text-xs" />
                  </FormItem>
                )}
              />

              {error && (
                <div className="bg-red-100 dark:bg-red-900/30 border-[2px] border-red-600 p-3">
                  <p
                    className="text-sm font-mono text-red-600 dark:text-red-400"
                    role="alert"
                  >
                    ❌ {error}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-[#1a1a1a] text-white border-[3px] border-[#1a1a1a] hover:bg-[#4ecdc4] hover:border-[#4ecdc4] font-mono font-bold text-base transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'CREATING ACCOUNT...' : 'SIGN UP →'}
              </Button>
            </form>
          </Form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t-[2px] border-[#1a1a1a]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-900 px-3 font-mono font-bold">
                OR CONTINUE WITH
              </span>
            </div>
          </div>

          {/* Google Button */}
          <Button
            variant="outline"
            onClick={() =>
              signIn('google', { callbackUrl: callbackUrl || '/dashboard' })
            }
            className="w-full h-12 border-[2px] border-[#1a1a1a] hover:bg-gray-100 dark:hover:bg-gray-800 font-mono font-bold transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            GOOGLE
          </Button>

          {/* Login Link */}
          <div className="mt-6 text-center bg-[#f5f5f0] dark:bg-gray-800 p-4 border-l-4 border-[#ff6b35]">
            <p className="text-sm font-mono">
              Already have an account?{' '}
              <Link
                href={`/login?callbackUrl=${callbackUrl}`}
                className="font-bold text-[#ff6b35] hover:underline"
              >
                Log in →
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-xs font-mono text-gray-600 dark:text-gray-400">
            🎉 Free forever plan • 💳 No credit card required • 🚀 Get started
            in 30 seconds
          </p>
        </div>
      </div>
    </div>
  );
};
