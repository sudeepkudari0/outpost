import { LoginForm } from '@/app/login/_components/login-form';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '../../setup/test-utils';
import { mockPush } from '../../setup/vitest-setup';

// Mock next-auth signIn
vi.mock('next-auth/react', async () => {
  const actual = await vi.importActual('next-auth/react');
  return {
    ...actual,
    signIn: vi.fn(() => Promise.resolve({ error: null })),
  };
});

// Mock ORPC client
vi.mock('@/lib/orpc/client', () => ({
  individualClient: {
    auth: {
      signIn: vi.fn(() =>
        Promise.resolve({ success: true, message: 'Signed in successfully' })
      ),
    },
  },
}));

describe('LoginForm Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear router mocks
    mockPush.mockClear();
  });

  it('renders login form correctly', () => {
    render(<LoginForm callbackUrl="/dashboard" />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<LoginForm callbackUrl="/dashboard" />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // React Hook Form with Zod validation prevents form submission on invalid email
    // Wait to ensure validation completes, then verify API was NOT called
    await waitFor(
      async () => {
        const { individualClient } = await import('@/lib/orpc/client');
        // Form validation should prevent submission - no API call
        expect(individualClient.auth.signIn).not.toHaveBeenCalled();
      },
      { timeout: 2000 }
    );
  });

  it('shows error for invalid credentials', async () => {
    const user = userEvent.setup();

    // Mock failed authentication
    const { individualClient } = await import('@/lib/orpc/client');
    vi.mocked(individualClient.auth.signIn).mockResolvedValueOnce({
      success: false,
      message: 'Invalid credentials',
    });

    render(<LoginForm callbackUrl="/dashboard" />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid credentials', async () => {
    const user = userEvent.setup();

    const { individualClient } = await import('@/lib/orpc/client');
    vi.mocked(individualClient.auth.signIn).mockResolvedValueOnce({
      success: true,
      message: 'Signed in successfully',
    });

    // Clear mock before test
    mockPush.mockClear();

    render(<LoginForm callbackUrl="/dashboard" />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Wait for API call first
    await waitFor(() => {
      expect(individualClient.auth.signIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    // Wait for router.push to be called (after signIn and NextAuth)
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      },
      { timeout: 3000 }
    );
  });

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup();

    const { individualClient } = await import('@/lib/orpc/client');
    let resolveSignIn: (value: any) => void;
    const signInPromise = new Promise(resolve => {
      resolveSignIn = resolve;
    });
    vi.mocked(individualClient.auth.signIn).mockReturnValueOnce(
      signInPromise as Promise<{ success: boolean; message: string }>
    );

    render(<LoginForm callbackUrl="/dashboard" />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });

    resolveSignIn!({ success: true, message: 'Success' });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('shows error when NextAuth signIn fails', async () => {
    const user = userEvent.setup();
    const { signIn } = await import('next-auth/react');

    const { individualClient } = await import('@/lib/orpc/client');
    vi.mocked(individualClient.auth.signIn).mockResolvedValueOnce({
      success: true,
      message: 'Signed in successfully',
    });

    // Mock NextAuth signIn to return error
    vi.mocked(signIn).mockResolvedValueOnce({
      error: 'CredentialsSignin',
      code: 'CredentialsSignin',
      status: 401,
      ok: false,
      url: '/dashboard',
    });

    render(<LoginForm callbackUrl="/dashboard" />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Wait for NextAuth error to show
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    // Router should NOT be called because NextAuth failed
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('handles exceptions during form submission', async () => {
    const user = userEvent.setup();

    const { individualClient } = await import('@/lib/orpc/client');
    // Mock to throw an exception
    vi.mocked(individualClient.auth.signIn).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<LoginForm callbackUrl="/dashboard" />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Wait for exception error message
    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  it('shows error when API response has no message', async () => {
    const user = userEvent.setup();

    const { individualClient } = await import('@/lib/orpc/client');
    // Mock API to return failure with no message
    vi.mocked(individualClient.auth.signIn).mockResolvedValueOnce({
      success: false,
      message: undefined as any, // No message provided
    });

    render(<LoginForm callbackUrl="/dashboard" />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Should show fallback error message
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('uses default callbackUrl when not provided', async () => {
    const user = userEvent.setup();

    const { individualClient } = await import('@/lib/orpc/client');
    vi.mocked(individualClient.auth.signIn).mockResolvedValueOnce({
      success: true,
      message: 'Signed in successfully',
    });

    mockPush.mockClear();

    // Render without callbackUrl (empty string)
    render(<LoginForm callbackUrl="" />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Wait for API call
    await waitFor(() => {
      expect(individualClient.auth.signIn).toHaveBeenCalled();
    });

    // Should redirect to default '/dashboard' when callbackUrl is empty
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      },
      { timeout: 3000 }
    );
  });
});
