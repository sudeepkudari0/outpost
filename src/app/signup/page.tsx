import { SignupForm } from './_components/signup-form';

async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { error, callbackUrl } = await searchParams;
  return <SignupForm error={error} callbackUrl={callbackUrl || '/dashboard'} />;
}

export default SignupPage;
