import { LoginForm } from './_components/login-form';

async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl: string }>;
}) {
  const { callbackUrl } = await searchParams;
  return <LoginForm callbackUrl={callbackUrl} />;
}

export default LoginPage;
