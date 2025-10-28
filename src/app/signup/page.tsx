import { SignupForm } from './_components/signup-form';

async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <SignupForm error={error} />;
}

export default SignupPage;
