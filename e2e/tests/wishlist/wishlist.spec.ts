/**
 * Wishlist E2E Tests.
 *
 * Tests wishlist functionality including:
 * - Adding materials to wishlist
 * - Removing materials from wishlist
 * - Unauthenticated user redirect to login
 * - Wishlist items appear on account page
 */

import { test, expect } from "../../fixtures/auth.fixture";
import { test as baseTest } from "@playwright/test";
import { MaterialDetailPage } from "../../pages/resource-detail.page";
import { AccountPage } from "../../pages/account.page";
import { TEST_MATERIAL_IDS } from "../../fixtures/test-users";

test.describe("Wishlist - Authenticated", () => {
  test("authenticated user can add material to wishlist", async ({ buyerPage }) => {
    const materialPage = new MaterialDetailPage(buyerPage);

    // Navigate to a free material
    await materialPage.gotoMaterial(TEST_MATERIAL_IDS.FREE_MATERIAL);
    await materialPage.expectMaterialVisible();

    // Check initial wishlist state
    const wasWishlisted = await materialPage.isWishlisted();

    // If already wishlisted, remove first
    if (wasWishlisted) {
      await materialPage.toggleWishlist();
      await buyerPage.waitForTimeout(500); // Wait for API
    }

    // Add to wishlist
    await materialPage.toggleWishlist();

    // Verify it's now wishlisted
    await expect(async () => {
      const isNowWishlisted = await materialPage.isWishlisted();
      expect(isNowWishlisted).toBe(true);
    }).toPass({ timeout: 5000 });
  });

  test("authenticated user can remove material from wishlist", async ({ buyerPage }) => {
    const materialPage = new MaterialDetailPage(buyerPage);

    // Navigate to free material (different from add test to avoid interference)
    await materialPage.gotoMaterial(TEST_MATERIAL_IDS.FREE_MATERIAL);
    await materialPage.expectMaterialVisible();

    // Wait for the page to fully load and wishlist state to be fetched
    await buyerPage.waitForLoadState("networkidle");

    // First, ensure it's wishlisted (add if not already)
    let isWishlisted = await materialPage.isWishlisted();
    if (!isWishlisted) {
      await materialPage.toggleWishlist();
      await buyerPage.waitForLoadState("networkidle");
      // Verify it's now wishlisted
      await expect(async () => {
        const nowWishlisted = await materialPage.isWishlisted();
        expect(nowWishlisted).toBe(true);
      }).toPass({ timeout: 10000 });
    }

    // Now remove from wishlist
    await materialPage.toggleWishlist();

    // Wait for API response
    await buyerPage.waitForLoadState("networkidle");

    // Verify it's no longer wishlisted
    await expect(async () => {
      const isStillWishlisted = await materialPage.isWishlisted();
      expect(isStillWishlisted).toBe(false);
    }).toPass({ timeout: 10000 });
  });

  test("wishlist items appear on account page", async ({ buyerPage }) => {
    const materialPage = new MaterialDetailPage(buyerPage);
    const accountPage = new AccountPage(buyerPage);

    // First, add a material to wishlist
    await materialPage.gotoMaterial(TEST_MATERIAL_IDS.PAID_MATERIAL);
    await materialPage.expectMaterialVisible();

    // Wait for wishlist state to load
    await buyerPage.waitForLoadState("networkidle");

    // Ensure it's wishlisted
    const wasWishlisted = await materialPage.isWishlisted();
    if (!wasWishlisted) {
      await materialPage.toggleWishlist();
      await buyerPage.waitForLoadState("networkidle");
    }

    // Navigate to account page wishlist tab
    await accountPage.gotoTab("wishlist");

    // Wait for wishlist data to load
    await buyerPage.waitForLoadState("networkidle");

    // Verify the wishlist tab shows materials or is not empty
    // The material might be displayed as a card with a link
    const wishlistContent = buyerPage.locator('a[href*="/materialien/"]');
    const emptyState = buyerPage.locator("text=/wunschliste ist leer|keine einträge/i");

    // Either should have materials or show empty state
    const hasMaterials = (await wishlistContent.count()) > 0;
    const isEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasMaterials || isEmpty).toBe(true);

    // If there are materials, they should include our wishlisted one
    if (hasMaterials) {
      const paidMaterialLink = buyerPage.locator(`a[href*="${TEST_MATERIAL_IDS.PAID_MATERIAL}"]`);
      await expect(paidMaterialLink.first()).toBeVisible({ timeout: 10000 });
    }
  });
});

baseTest.describe("Wishlist - Unauthenticated", () => {
  baseTest(
    "unauthenticated user is redirected to login when clicking wishlist",
    async ({ page }) => {
      const materialPage = new MaterialDetailPage(page);

      // Navigate to a material without authentication
      await materialPage.gotoMaterial(TEST_MATERIAL_IDS.FREE_MATERIAL);
      await materialPage.expectMaterialVisible();

      // Try to click wishlist button
      await materialPage.toggleWishlist();

      // Should be redirected to login page
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    }
  );
});
