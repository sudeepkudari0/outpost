import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

// Mock window.matchMedia for next-themes and other libraries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  }),
});

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Create shared mock router instances for tests to access
export const mockPush = vi.fn();
export const mockReplace = vi.fn();
export const mockRefresh = vi.fn();
export const mockBack = vi.fn();

// Mock Next.js router with shared instances
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
    back: mockBack,
    refresh: mockRefresh,
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js image
vi.mock('next/image', () => {
  const React = require('react');
  return {
    default: (props: any) => {
      return React.createElement('img', props);
    },
  };
});

// Mock Next.js link
vi.mock('next/link', () => {
  const React = require('react');
  return {
    default: ({ children, href, ...props }: any) => {
      return React.createElement('a', { href, ...props }, children);
    },
  };
});

// Mock environment variables
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('AUTH_SECRET', 'test-secret-key-for-testing-purposes-only');
vi.stubEnv('DATABASE_URL', 'mongodb://localhost:27017/test-db');
vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3000');

// Setup global test utilities
beforeAll(() => {
  // Suppress console errors in tests unless needed
  global.console = {
    ...console,
    error: vi.fn(),
    warn: vi.fn(),
  };
});
