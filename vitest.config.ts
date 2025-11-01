import react from '@vitejs/plugin-react';
import path from 'path';
import { loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      tsconfigPaths(),
      react({
        // Fix for Next.js 15 React modules
        jsxRuntime: 'automatic',
      }),
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./tests/setup/vitest-setup.ts'],
      include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/tests/e2e/**',
        '**/.next/**',
      ],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
          'node_modules/',
          'tests/',
          '**/*.config.{js,ts}',
          '**/*.d.ts',
          '**/types/**',
          '**/.next/**',
          '**/dist/**',
          '**/coverage/**',
          '**/*.test.{js,ts,tsx}',
          '**/*.spec.{js,ts,tsx}',
        ],
        thresholds: {
          lines: 70,
          functions: 70,
          branches: 70,
          statements: 70,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        // Use regular React for tests (not Next.js compiled version)
        // This is needed because tests run in isolation
        react: path.resolve(__dirname, './node_modules/react'),
        'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      },
    },
    define: {
      'process.env': {
        ...env,
        NODE_ENV: 'test',
      },
    },
  };
});
