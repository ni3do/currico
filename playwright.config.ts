import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Storage state paths for authenticated sessions
const AUTH_DIR = path.join(__dirname, '.auth');
export const STORAGE_STATES = {
  buyer: path.join(AUTH_DIR, 'buyer.json'),
  seller: path.join(AUTH_DIR, 'seller.json'),
  admin: path.join(AUTH_DIR, 'admin.json'),
  school: path.join(AUTH_DIR, 'school.json'),
} as const;

/**
 * Playwright configuration for Currico E2E testing.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory
  testDir: './e2e/tests',

  // Global setup runs once before all tests to authenticate test users
  globalSetup: './e2e/global-setup.ts',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI for stability
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['html', { open: 'on-failure' }]],

  // Shared settings for all projects
  use: {
    // Base URL for navigation
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Take screenshot on failure
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'on-first-retry',
  },

  // Global timeouts
  timeout: 30_000, // 30s per test
  expect: {
    timeout: 5_000, // 5s for expect assertions
  },

  // Configure projects for major browsers and locales
  projects: [
    // Desktop Chrome - German (primary locale)
    {
      name: 'chromium-de',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'de-CH',
        baseURL: 'http://localhost:3000/de',
      },
    },
    // Desktop Chrome - English
    {
      name: 'chromium-en',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'en-US',
        baseURL: 'http://localhost:3000/en',
      },
    },
    // Desktop Firefox - German
    {
      name: 'firefox-de',
      use: {
        ...devices['Desktop Firefox'],
        locale: 'de-CH',
        baseURL: 'http://localhost:3000/de',
      },
    },
    // Desktop Safari - German
    {
      name: 'webkit-de',
      use: {
        ...devices['Desktop Safari'],
        locale: 'de-CH',
        baseURL: 'http://localhost:3000/de',
      },
    },
    // Mobile Chrome - German
    {
      name: 'mobile-chrome-de',
      use: {
        ...devices['Pixel 5'],
        locale: 'de-CH',
        baseURL: 'http://localhost:3000/de',
      },
    },
    // Mobile Safari - German
    {
      name: 'mobile-safari-de',
      use: {
        ...devices['iPhone 12'],
        locale: 'de-CH',
        baseURL: 'http://localhost:3000/de',
      },
    },
  ],

  // Run local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000, // 2 minutes to start the server
  },

  // Output directory for test artifacts
  outputDir: 'test-results',
});
