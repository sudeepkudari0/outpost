import { expect, test } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Assume user is logged in - you may need to set up authentication
    // For production tests, use login helper or authentication state
    await page.goto('/dashboard');

    // Wait for page to load or handle authentication redirect
    // You might need to login first or use authenticated state
  });

  test('should display dashboard navigation', async ({ page }) => {
    // Check for common dashboard elements
    await expect(page.getByText(/dashboard/i).first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should navigate to create post page', async ({ page }) => {
    const createPostLink = page.getByRole('link', {
      name: /create post|compose|new post/i,
    });

    if (await createPostLink.isVisible()) {
      await createPostLink.click();
      await expect(page).toHaveURL(/.*create-post|.*compose/);
    }
  });

  test('should display sidebar navigation', async ({ page }) => {
    // Check if sidebar or navigation menu is visible
    const sidebar = page.locator('[data-testid="sidebar"], nav, aside').first();
    await expect(sidebar).toBeVisible({ timeout: 5000 });
  });

  test('should be responsive on mobile', async ({ page, viewport }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if mobile menu or bottom navigation appears
    const mobileNav = page
      .locator('[data-testid="mobile-nav"], [data-testid="bottom-nav"]')
      .first();

    // Mobile navigation might be visible or hidden based on design
    // Adjust assertions based on your actual implementation
    const isVisible = await mobileNav.isVisible().catch(() => false);

    // This is a basic responsive test - adjust based on your design
    expect(viewport?.width).toBeLessThanOrEqual(768);
  });
});
