# Testing Guide

This directory contains the complete testing infrastructure for the Social SaaS application.

## 📁 Folder Structure

```
tests/
├── setup/              # Test configuration and utilities
│   ├── vitest-setup.ts # Vitest global setup
│   ├── test-utils.tsx  # React Testing Library utilities
│   └── mocks.ts        # Shared mocks and test helpers
├── unit/               # Unit tests
│   ├── components/    # Component unit tests
│   ├── hooks/         # Hook unit tests
│   └── lib/           # Utility function tests
├── integration/        # Integration tests
│   └── components/    # Component integration tests
└── e2e/                # End-to-end tests
    ├── auth.spec.ts   # Authentication flow tests
    ├── dashboard.spec.ts
    └── posts.spec.ts
```

## 🧪 Test Types

### Unit Tests
- **Location**: `tests/unit/`
- **Purpose**: Test individual functions, hooks, and components in isolation
- **Tools**: Vitest + React Testing Library
- **Run**: `npm run test:unit`

### Integration Tests
- **Location**: `tests/integration/`
- **Purpose**: Test how multiple components/utilities work together
- **Tools**: Vitest + React Testing Library
- **Run**: `npm run test:integration`

### E2E Tests
- **Location**: `tests/e2e/`
- **Purpose**: Test complete user flows in a real browser
- **Tools**: Playwright
- **Run**: `npm run test:e2e`

## 🚀 Quick Start

### Running Tests

```bash
# Run all unit tests
npm run test:unit

# Run unit tests in watch mode
npm run test:unit:watch

# Run unit tests with UI
npm run test:unit:ui

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run all tests
npm run test:all

# Run with coverage
npm run test:coverage
```

## 📝 Writing Tests

### Unit Test Example

```typescript
import { describe, expect, it } from 'vitest';
import { render, screen } from '../setup/test-utils';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

## 🔧 Configuration

### Vitest
Configuration is in `vitest.config.ts` at the project root.

### Playwright
Configuration is in `playwright.config.ts` at the project root.

## 📊 Coverage

Coverage thresholds are set to:
- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

## 🎯 Best Practices

1. **Test behavior, not implementation**: Focus on what the component does, not how it does it.

2. **Use semantic queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`.

3. **Keep tests isolated**: Each test should be independent and not rely on other tests.

4. **Mock external dependencies**: Use mocks for API calls, database, and external services.

5. **Write descriptive test names**: Test names should clearly describe what is being tested.

6. **Arrange-Act-Assert pattern**: Structure tests with clear sections.

## 🐛 Debugging Tests

### Unit Tests
```bash
# Run specific test file
npm run test:unit -- tests/unit/components/button.test.tsx

# Run tests matching a pattern
npm run test:unit -- -t "renders"

# Run with coverage
npm run test:coverage
```

### E2E Tests
```bash
# Run specific test file
npm run test:e2e tests/e2e/auth.spec.ts

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode (step through)
npm run test:e2e:debug

# Run specific browser
npm run test:e2e -- --project=chromium
```

## 🔐 Environment Variables

For E2E tests, create a `.env.test` file (not committed) with:

```env
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password123
DATABASE_URL=mongodb://localhost:27017/test-db
AUTH_SECRET=test-secret-key
```

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
