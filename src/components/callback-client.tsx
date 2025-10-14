'use client';

import { Card, CardContent } from '@/components/ui/card';
import { client } from '@/lib/orpc/client';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const CallbackClient = ({
  code,
  state,
  error,
  errorDescription,
}: {
  code: string;
  state: string;
  error: string;
  errorDescription: string;
}) => {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('Processing OAuth callback...');

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Check for OAuth errors
        if (error) {
          throw new Error(errorDescription || error);
        }

        if (!code || !state) {
          throw new Error('Missing required OAuth parameters');
        }

        // Decode state to get platform and profileId
        let stateData: {
          nonce: string;
          profileId: string;
          platform: string;
          userId: string;
        };

        try {
          stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        } catch {
          throw new Error('Invalid state parameter');
        }

        setMessage(`Connecting ${stateData.platform.toLowerCase()}...`);

        // Complete the OAuth flow via oRPC
        const result = await client.social.completeConnection({
          platform: stateData.platform as any,
          profileId: stateData.profileId,
          code,
          state,
        });

        if (result.success) {
          setStatus('success');
          setMessage(
            `Successfully connected ${result.accounts.length} ${stateData.platform.toLowerCase()} account(s)!`
          );

          // If this window was opened as a popup, notify the opener and close
          if (window.opener && window.opener !== window) {
            try {
              window.opener.postMessage(
                {
                  type: 'oauth-success',
                  platform: stateData.platform,
                  accounts: result.accounts,
                },
                window.location.origin
              );
              setTimeout(() => {
                window.close();
              }, 800);
            } catch (err) {
              console.error('Error communicating with opener:', err);
              // Fallback: redirect to connections page
              setTimeout(() => {
                router.push('/dashboard/connections?success=true');
              }, 2000);
            }
          } else {
            // Not a popup, redirect to connections page
            setTimeout(() => {
              router.push('/dashboard/connections?success=true');
            }, 2000);
          }
        } else {
          throw new Error('Connection failed');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(
          error instanceof Error ? error.message : 'Failed to connect account'
        );

        // If this is a popup, notify the opener
        if (window.opener && window.opener !== window) {
          try {
            window.opener.postMessage(
              {
                type: 'oauth-error',
                error: error instanceof Error ? error.message : 'Unknown error',
              },
              window.location.origin
            );
            setTimeout(() => {
              window.close();
            }, 3000);
          } catch (err) {
            // Fallback: redirect
            setTimeout(() => {
              router.push('/dashboard/connections?error=true');
            }, 3000);
          }
        } else {
          // Not a popup, redirect to connections page
          setTimeout(() => {
            router.push('/dashboard/connections?error=true');
          }, 3000);
        }
      }
    };

    processCallback();
  }, [code, state, error, errorDescription, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
                <h2 className="text-xl font-semibold">Connecting Account</h2>
                <p className="text-muted-foreground">{message}</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                  <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-green-600 dark:text-green-400">
                  Success!
                </h2>
                <p className="text-muted-foreground">{message}</p>
                <p className="text-sm text-muted-foreground">Redirecting...</p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
                  <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
                  Connection Failed
                </h2>
                <p className="text-muted-foreground">{message}</p>
                <p className="text-sm text-muted-foreground">
                  Redirecting back...
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
