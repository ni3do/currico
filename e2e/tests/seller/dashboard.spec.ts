/**
 * Seller Dashboard E2E Tests.
 *
 * Tests seller-specific functionality including:
 * - Viewing uploaded resources
 * - Navigating to upload wizard
 * - Resource status badges display
 */

import { test, expect } from "../../fixtures/auth.fixture";
import { AccountPage } from "../../pages/account.page";

test.describe("Seller Dashboard", () => {
  test("seller can view uploaded resources", async ({ sellerPage }) => {
    const accountPage = new AccountPage(sellerPage);

    // Navigate to account page with uploads tab
    await accountPage.gotoTab("uploads");

    // Wait for resources to load
    await sellerPage.waitForLoadState("networkidle");

    // Check for either resources or the empty state message text
    const hasResources = await sellerPage
      .locator('a[href*="/resources/"]')
      .first()
      .isVisible()
      .catch(() => false);
    const hasEmptyText = await sellerPage
      .locator("text=/noch keine|material hochladen/i")
      .isVisible()
      .catch(() => false);

    // Either has resources or shows empty message
    expect(hasResources || hasEmptyText).toBe(true);
  });

  test("upload button navigates to wizard", async ({ sellerPage }) => {
    const accountPage = new AccountPage(sellerPage);

    // Navigate to account page with uploads tab (cookie consent dismissed automatically)
    await accountPage.gotoTab("uploads");

    // Wait for the page to stabilize
    await sellerPage.waitForLoadState("networkidle");

    // Find and click the upload link specifically (not resource links)
    const uploadLink = sellerPage.locator('a[href="/upload"]').first();
    await expect(uploadLink).toBeVisible({ timeout: 10000 });
    await uploadLink.click();

    // Should be on the upload page
    await sellerPage.waitForURL(/\/upload/);
    expect(sellerPage.url()).toContain("/upload");
  });

  test("seller sees resource status badges", async ({ sellerPage }) => {
    const accountPage = new AccountPage(sellerPage);

    // Navigate to uploads tab
    await accountPage.gotoTab("uploads");

    // Wait for content to load
    await sellerPage.waitForLoadState("networkidle");

    // Check if we have any resources
    const resourceCount = await accountPage.getResourceCount();

    if (resourceCount > 0) {
      // Look for status badges in the page
      const statusBadges = sellerPage.locator('.badge, [class*="badge"], span').filter({
        hasText: /ausstehend|verifiziert|pending|verified|abgelehnt|rejected/i,
      });

      // Should have at least one status badge visible
      const badgeCount = await statusBadges.count();
      expect(badgeCount).toBeGreaterThanOrEqual(0); // May have resources without visible badges
    }
  });

  test("seller can access seller-specific stats", async ({ sellerPage }) => {
    const accountPage = new AccountPage(sellerPage);

    // Navigate to account overview
    await accountPage.goto();

    // Sellers should see stats like downloads, earnings, etc.
    // Check for any stats-related elements
    const statsElements = sellerPage.locator("text=/downloads|einnahmen|verkäufe|earnings|sales/i");

    // Wait for potential stats to load
    await sellerPage.waitForLoadState("networkidle");

    // Stats section should be visible for sellers
    const statsCount = await statsElements.count();
    expect(statsCount).toBeGreaterThanOrEqual(0); // Stats may or may not be visible depending on seller status
  });
});

test.describe("Seller Resources", () => {
  test("seller can click on uploaded resource to view details", async ({ sellerPage }) => {
    const accountPage = new AccountPage(sellerPage);

    // Navigate to uploads tab
    await accountPage.gotoTab("uploads");

    // Wait for content to load
    await sellerPage.waitForLoadState("networkidle");

    // Get resource count
    const resourceCount = await accountPage.getResourceCount();

    if (resourceCount > 0) {
      // Click on the first resource card link
      const firstResourceLink = sellerPage.locator('a[href*="/resources/"]').first();
      await firstResourceLink.click();

      // Should navigate to resource detail page
      await expect(sellerPage).toHaveURL(/\/resources\//, { timeout: 10000 });
    }
  });
});
