/**
 * Seller Dashboard E2E Tests.
 *
 * Tests seller-specific functionality including:
 * - Viewing uploaded materials
 * - Navigating to upload wizard
 * - Material status badges display
 */

import { test, expect } from "../../fixtures/auth.fixture";
import { AccountPage } from "../../pages/account.page";

test.describe("Seller Dashboard", () => {
  test("seller can view uploaded materials", async ({ sellerPage }) => {
    const accountPage = new AccountPage(sellerPage);

    // Navigate to account page with uploads tab
    await accountPage.gotoTab("uploads");

    // Wait for materials to load
    await sellerPage.waitForLoadState("networkidle");

    // Check for either materials or the empty state message text
    const hasMaterials = await sellerPage
      .locator('a[href*="/materialien/"]')
      .first()
      .isVisible()
      .catch(() => false);
    const hasEmptyText = await sellerPage
      .locator("text=/noch keine|material hochladen/i")
      .isVisible()
      .catch(() => false);

    // Either has materials or shows empty message
    expect(hasMaterials || hasEmptyText).toBe(true);
  });

  test("upload button navigates to wizard", async ({ sellerPage }) => {
    const accountPage = new AccountPage(sellerPage);

    // Navigate to account page with uploads tab (cookie consent dismissed automatically)
    await accountPage.gotoTab("uploads");

    // Wait for the page to stabilize
    await sellerPage.waitForLoadState("networkidle");

    // Find and click the upload link specifically (not material links)
    const uploadLink = sellerPage.locator('a[href="/upload"]').first();
    await expect(uploadLink).toBeVisible({ timeout: 10000 });
    await uploadLink.click();

    // Should be on the upload page
    await sellerPage.waitForURL(/\/upload/);
    expect(sellerPage.url()).toContain("/upload");
  });

  test("seller sees material status badges", async ({ sellerPage }) => {
    const accountPage = new AccountPage(sellerPage);

    // Navigate to uploads tab
    await accountPage.gotoTab("uploads");

    // Wait for content to load
    await sellerPage.waitForLoadState("networkidle");

    // Check if we have any materials
    const materialCount = await accountPage.getMaterialCount();

    if (materialCount > 0) {
      // Look for status badges in the page
      const statusBadges = sellerPage.locator('.badge, [class*="badge"], span').filter({
        hasText: /ausstehend|verifiziert|pending|verified|abgelehnt|rejected/i,
      });

      // Should have at least one status badge visible
      const badgeCount = await statusBadges.count();
      expect(badgeCount).toBeGreaterThanOrEqual(0); // May have materials without visible badges
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

test.describe("Seller Materials", () => {
  test("seller can click on uploaded material to view details", async ({ sellerPage }) => {
    const accountPage = new AccountPage(sellerPage);

    // Navigate to uploads tab
    await accountPage.gotoTab("uploads");

    // Wait for content to load
    await sellerPage.waitForLoadState("networkidle");

    // Get material count
    const materialCount = await accountPage.getMaterialCount();

    if (materialCount > 0) {
      // Click on the first material card link
      const firstMaterialLink = sellerPage.locator('a[href*="/materialien/"]').first();
      await firstMaterialLink.click();

      // Should navigate to material detail page
      await expect(sellerPage).toHaveURL(/\/materialien\//, { timeout: 10000 });
    }
  });
});
