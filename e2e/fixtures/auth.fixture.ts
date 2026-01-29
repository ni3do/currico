/**
 * Authentication Fixture for Playwright E2E Tests
 *
 * Provides authenticated test contexts for different user roles.
 * Uses Playwright's storageState feature to persist authentication
 * between tests, avoiding repeated login flows.
 *
 * Usage in tests:
 *   import { test } from '@/e2e/fixtures/auth.fixture';
 *
 *   test('authenticated test', async ({ buyerPage }) => {
 *     // buyerPage is already logged in as TEST_BUYER
 *   });
 */

/* eslint-disable react-hooks/rules-of-hooks */
// Note: The 'use' function below is Playwright's fixture mechanism, not React's use() hook.

import { test as base, expect, Page, BrowserContext } from '@playwright/test';
import path from 'path';
import {
  TestUser,
  TEST_BUYER,
  TEST_SELLER,
  TEST_ADMIN,
  TEST_SCHOOL,
} from './test-users';

/**
 * Storage state file paths for each role.
 * These are stored in the .auth directory (should be gitignored).
 */
const AUTH_DIR = path.join(process.cwd(), '.auth');

export const STORAGE_STATE_PATHS = {
  buyer: path.join(AUTH_DIR, 'buyer.json'),
  seller: path.join(AUTH_DIR, 'seller.json'),
  admin: path.join(AUTH_DIR, 'admin.json'),
  school: path.join(AUTH_DIR, 'school.json'),
} as const;

/**
 * Performs login via the UI and saves the authenticated state.
 *
 * @param page - Playwright page instance
 * @param user - Test user credentials
 * @param storagePath - Path to save the storage state
 */
export async function loginAndSaveState(
  page: Page,
  user: TestUser,
  storagePath: string
): Promise<void> {
  // Navigate to login page
  await page.goto('/login');

  // Fill in credentials
  await page.locator('#email').fill(user.email);
  await page.locator('#password').fill(user.password);

  // Submit the form
  await page.locator('button[type="submit"]').click();

  // Wait for navigation after successful login
  // Admins go to /admin, others go to /account
  const expectedPath = user.role === 'ADMIN' ? '/admin' : '/account';
  await page.waitForURL(`**${expectedPath}`, { timeout: 15000 });

  // Save the authenticated state
  await page.context().storageState({ path: storagePath });
}

/**
 * Login helper that can be used directly in tests.
 * Does not save state - use for one-off logins or testing login flow.
 *
 * @param page - Playwright page instance
 * @param user - Test user credentials
 */
export async function login(page: Page, user: TestUser): Promise<void> {
  await page.goto('/login');
  await page.locator('#email').fill(user.email);
  await page.locator('#password').fill(user.password);
  await page.locator('button[type="submit"]').click();

  // Wait for redirect
  const expectedPath = user.role === 'ADMIN' ? '/admin' : '/account';
  await page.waitForURL(`**${expectedPath}`, { timeout: 15000 });
}

/**
 * Logout helper.
 *
 * @param page - Playwright page instance
 */
export async function logout(page: Page): Promise<void> {
  // Navigate to account page (where logout is accessible)
  await page.goto('/account');

  // Click logout button/link
  // The exact selector depends on the UI implementation
  await page.locator('[data-testid="logout-button"], a[href*="signout"]').click();

  // Wait for redirect to home or login page
  await page.waitForURL(/\/(login)?$/);
}

/**
 * Verifies that the current session is authenticated as the expected user.
 *
 * @param page - Playwright page instance
 * @param user - Expected test user
 */
export async function expectAuthenticated(
  page: Page,
  user: TestUser
): Promise<void> {
  // Check session by visiting the user API endpoint
  const response = await page.request.get('/api/user/me');
  expect(response.ok()).toBe(true);

  const userData = await response.json();
  expect(userData.email).toBe(user.email);
  expect(userData.role).toBe(user.role);
}

/**
 * Verifies that the current session is not authenticated.
 *
 * @param page - Playwright page instance
 */
export async function expectNotAuthenticated(page: Page): Promise<void> {
  const response = await page.request.get('/api/user/me');
  // Should return 401 or redirect when not authenticated
  expect(response.ok()).toBe(false);
}

// ============================================================
// Extended Test Fixture with Authenticated Pages
// ============================================================

/**
 * Extended test fixtures providing pre-authenticated pages for each role.
 */
type AuthFixtures = {
  /** Page authenticated as TEST_BUYER */
  buyerPage: Page;
  /** Page authenticated as TEST_SELLER */
  sellerPage: Page;
  /** Page authenticated as TEST_ADMIN */
  adminPage: Page;
  /** Page authenticated as TEST_SCHOOL */
  schoolPage: Page;
  /** Context authenticated as TEST_BUYER */
  buyerContext: BrowserContext;
  /** Context authenticated as TEST_SELLER */
  sellerContext: BrowserContext;
  /** Context authenticated as TEST_ADMIN */
  adminContext: BrowserContext;
};

/**
 * Extended test object with authenticated fixtures.
 *
 * Import this instead of @playwright/test to get access to
 * pre-authenticated page fixtures.
 */
export const test = base.extend<AuthFixtures>({
  buyerContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: STORAGE_STATE_PATHS.buyer,
    });
    await use(context);
    await context.close();
  },

  sellerContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: STORAGE_STATE_PATHS.seller,
    });
    await use(context);
    await context.close();
  },

  adminContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: STORAGE_STATE_PATHS.admin,
    });
    await use(context);
    await context.close();
  },

  buyerPage: async ({ buyerContext }, use) => {
    const page = await buyerContext.newPage();
    await use(page);
    await page.close();
  },

  sellerPage: async ({ sellerContext }, use) => {
    const page = await sellerContext.newPage();
    await use(page);
    await page.close();
  },

  adminPage: async ({ adminContext }, use) => {
    const page = await adminContext.newPage();
    await use(page);
    await page.close();
  },

  schoolPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: STORAGE_STATE_PATHS.school,
    });
    const page = await context.newPage();
    await use(page);
    await page.close();
    await context.close();
  },
});

// Re-export expect for convenience
export { expect };

// Export test users for use in tests
export { TEST_BUYER, TEST_SELLER, TEST_ADMIN, TEST_SCHOOL };
