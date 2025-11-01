import { expect, test } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const submitButton = page.getByRole('button', { name: /sign in/i });

    await emailInput.fill('invalid-email');
    await passwordInput.fill('password123');
    await submitButton.click();

    await expect(page.getByText(/email is required/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const submitButton = page.getByRole('button', { name: /sign in/i });

    await emailInput.fill('nonexistent@example.com');
    await passwordInput.fill('wrongpassword');
    await submitButton.click();

    // Wait for error message to appear
    await expect(page.getByText(/invalid credentials/i).first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should redirect to signup page', async ({ page }) => {
    const signupLink = page.getByRole('link', { name: /sign up/i });
    await signupLink.click();

    await expect(page).toHaveURL(/.*signup/);
    await expect(page.getByText(/create account/i)).toBeVisible();
  });

  test('should navigate to dashboard after successful login', async ({
    page,
  }) => {
    // This test assumes you have test credentials or can set up a test user
    // You may need to seed test data or use test authentication
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const submitButton = page.getByRole('button', { name: /sign in/i });

    // Fill with test credentials (adjust based on your test setup)
    await emailInput.fill(process.env.TEST_USER_EMAIL || 'user@outpost.com');
    await passwordInput.fill(process.env.TEST_USER_PASSWORD || 'User@#123');
    await submitButton.click();

    // Wait for redirect to dashboard
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
