import { Page } from '@playwright/test';

/**
 * Helper functions for Playwright E2E tests
 */

/**
 * Log in a user (if test credentials are available)
 */
export async function loginUser(page: Page, email?: string, password?: string) {
  const testEmail = email || process.env.TEST_USER_EMAIL || 'test@example.com';
  const testPassword =
    password || process.env.TEST_USER_PASSWORD || 'password123';

  await page.goto('/login');
  await page.fill('[name="email"], [type="email"]', testEmail);
  await page.fill('[name="password"], [type="password"]', testPassword);
  await page.click('button[type="submit"], button:has-text("Sign in")');
  await page.waitForURL(/.*dashboard/, { timeout: 10000 });
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(
  page: Page,
  urlPattern: RegExp | string
) {
  if (typeof urlPattern === 'string') {
    await page.waitForURL(urlPattern);
  } else {
    await page.waitForURL(urlPattern);
  }
}

/**
 * Check if element is visible (with timeout handling)
 */
export async function isVisible(
  page: Page,
  selector: string,
  timeout = 5000
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout, state: 'visible' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Fill form fields by label text
 */
export async function fillByLabel(
  page: Page,
  labelText: string | RegExp,
  value: string
) {
  const label = page.getByLabel(labelText);
  await label.fill(value);
}

/**
 * Click button by text
 */
export async function clickByText(page: Page, text: string | RegExp) {
  await page.getByRole('button', { name: text }).click();
}
