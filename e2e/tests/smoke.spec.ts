import { test, expect } from '@playwright/test';

/**
 * Smoke tests to verify basic Playwright configuration works.
 * These tests ensure the app is running and accessible.
 */
test.describe('Smoke Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');

    // Verify page has loaded by checking for common elements
    await expect(page).toHaveTitle(/Currico/i);
  });

  test('page is responsive and renders content', async ({ page }) => {
    await page.goto('/');

    // Verify the page body is visible and has content
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
