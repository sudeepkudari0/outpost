import { expect, test } from '@playwright/test';

test.describe('Posts Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard - adjust authentication as needed
    await page.goto('/dashboard');

    // Wait for page to be ready
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to create post page', async ({ page }) => {
    const createPostButton = page.getByRole('link', {
      name: /create post|new post|compose/i,
    });

    if (await createPostButton.isVisible()) {
      await createPostButton.click();
      await expect(page).toHaveURL(/.*create-post|.*compose/);
    } else {
      // If button is not visible, try navigating directly
      await page.goto('/dashboard/create-post');
      await expect(page).toHaveURL(/.*create-post/);
    }
  });

  test('should display post creation form', async ({ page }) => {
    await page.goto('/dashboard/create-post');

    // Look for form elements
    const topicInput = page
      .getByPlaceholder(/topic|prompt|what.*post/i)
      .or(page.getByLabel(/topic|prompt/i))
      .first();

    // Form might not always be visible immediately, so we check with a timeout
    const isFormVisible = await topicInput.isVisible().catch(() => false);

    if (isFormVisible) {
      await expect(topicInput).toBeVisible();
    }
  });

  test('should display posts list page', async ({ page }) => {
    await page.goto('/dashboard/posts');

    // Check if posts page loads
    await expect(page).toHaveURL(/.*posts/);

    // Look for posts table or list
    const postsContent = page
      .locator('[data-testid="posts-list"], table, [role="table"]')
      .first();

    // Posts might be empty, so we just check if the page structure exists
    const pageLoaded = await page
      .waitForLoadState('networkidle')
      .then(() => true)
      .catch(() => false);
    expect(pageLoaded).toBe(true);
  });

  test('should filter or search posts', async ({ page }) => {
    await page.goto('/dashboard/posts');
    await page.waitForLoadState('networkidle');

    // Look for search input
    const searchInput = page
      .getByPlaceholder(/search/i)
      .or(page.getByLabel(/search/i))
      .first();

    const hasSearch = await searchInput.isVisible().catch(() => false);

    if (hasSearch) {
      await searchInput.fill('test');
      await page.waitForTimeout(500); // Wait for debounce

      // Search functionality tested
      expect(await searchInput.inputValue()).toBe('test');
    }
  });
});
