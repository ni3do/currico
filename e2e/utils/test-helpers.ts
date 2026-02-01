/**
 * Common test helper utilities for Currico E2E tests.
 */

/**
 * Extracts the locale from the current page URL.
 */
export function getLocaleFromUrl(url: string): 'de' | 'en' {
  if (url.includes('/en')) return 'en';
  return 'de';
}

/**
 * Waits for the Next.js page to be fully hydrated.
 * Useful for avoiding flaky tests during initial page load.
 */
export async function waitForHydration(page: import('@playwright/test').Page) {
  // Wait for Next.js hydration marker to be removed
  await page.waitForFunction(() => {
    return !document.querySelector('[data-nextjs-scroll-focus-boundary]');
  }, { timeout: 10_000 }).catch(() => {
    // Hydration marker may not exist in all Next.js versions, continue
  });
}
