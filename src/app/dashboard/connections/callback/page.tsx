import { CallbackClient } from '@/components/callback-client';

async function OAuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{
    code: string;
    state: string;
    error: string;
    errorDescription: string;
  }>;
}) {
  const { code, state, error, errorDescription } = await searchParams;
  return (
    <CallbackClient
      code={code}
      state={state}
      error={error}
      errorDescription={errorDescription}
    />
  );
}

export default OAuthCallbackPage;
