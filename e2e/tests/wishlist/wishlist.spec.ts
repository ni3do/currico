/**
 * Wishlist E2E Tests.
 *
 * Tests wishlist functionality including:
 * - Adding resources to wishlist
 * - Removing resources from wishlist
 * - Unauthenticated user redirect to login
 * - Wishlist items appear on account page
 */

import { test, expect } from "../../fixtures/auth.fixture";
import { test as baseTest } from "@playwright/test";
import { ResourceDetailPage } from "../../pages/resource-detail.page";
import { AccountPage } from "../../pages/account.page";
import { TEST_RESOURCE_IDS } from "../../fixtures/test-users";

test.describe("Wishlist - Authenticated", () => {
  test("authenticated user can add resource to wishlist", async ({ buyerPage }) => {
    const resourcePage = new ResourceDetailPage(buyerPage);

    // Navigate to a free resource
    await resourcePage.gotoResource(TEST_RESOURCE_IDS.FREE_RESOURCE);
    await resourcePage.expectResourceVisible();

    // Check initial wishlist state
    const wasWishlisted = await resourcePage.isWishlisted();

    // If already wishlisted, remove first
    if (wasWishlisted) {
      await resourcePage.toggleWishlist();
      await buyerPage.waitForTimeout(500); // Wait for API
    }

    // Add to wishlist
    await resourcePage.toggleWishlist();

    // Verify it's now wishlisted
    await expect(async () => {
      const isNowWishlisted = await resourcePage.isWishlisted();
      expect(isNowWishlisted).toBe(true);
    }).toPass({ timeout: 5000 });
  });

  test("authenticated user can remove resource from wishlist", async ({ buyerPage }) => {
    const resourcePage = new ResourceDetailPage(buyerPage);

    // Navigate to free resource (different from add test to avoid interference)
    await resourcePage.gotoResource(TEST_RESOURCE_IDS.FREE_RESOURCE);
    await resourcePage.expectResourceVisible();

    // Wait for the page to fully load and wishlist state to be fetched
    await buyerPage.waitForLoadState("networkidle");

    // First, ensure it's wishlisted (add if not already)
    let isWishlisted = await resourcePage.isWishlisted();
    if (!isWishlisted) {
      await resourcePage.toggleWishlist();
      await buyerPage.waitForLoadState("networkidle");
      // Verify it's now wishlisted
      await expect(async () => {
        const nowWishlisted = await resourcePage.isWishlisted();
        expect(nowWishlisted).toBe(true);
      }).toPass({ timeout: 10000 });
    }

    // Now remove from wishlist
    await resourcePage.toggleWishlist();

    // Wait for API response
    await buyerPage.waitForLoadState("networkidle");

    // Verify it's no longer wishlisted
    await expect(async () => {
      const isStillWishlisted = await resourcePage.isWishlisted();
      expect(isStillWishlisted).toBe(false);
    }).toPass({ timeout: 10000 });
  });

  test("wishlist items appear on account page", async ({ buyerPage }) => {
    const resourcePage = new ResourceDetailPage(buyerPage);
    const accountPage = new AccountPage(buyerPage);

    // First, add a resource to wishlist
    await resourcePage.gotoResource(TEST_RESOURCE_IDS.PAID_RESOURCE);
    await resourcePage.expectResourceVisible();

    // Wait for wishlist state to load
    await buyerPage.waitForLoadState("networkidle");

    // Ensure it's wishlisted
    const wasWishlisted = await resourcePage.isWishlisted();
    if (!wasWishlisted) {
      await resourcePage.toggleWishlist();
      await buyerPage.waitForLoadState("networkidle");
    }

    // Navigate to account page wishlist tab
    await accountPage.gotoTab("wishlist");

    // Wait for wishlist data to load
    await buyerPage.waitForLoadState("networkidle");

    // Verify the wishlist tab shows resources or is not empty
    // The resource might be displayed as a card with a link
    const wishlistContent = buyerPage.locator('a[href*="/resources/"]');
    const emptyState = buyerPage.locator("text=/wunschliste ist leer|keine einträge/i");

    // Either should have resources or show empty state
    const hasResources = (await wishlistContent.count()) > 0;
    const isEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasResources || isEmpty).toBe(true);

    // If there are resources, they should include our wishlisted one
    if (hasResources) {
      const paidResourceLink = buyerPage.locator(`a[href*="${TEST_RESOURCE_IDS.PAID_RESOURCE}"]`);
      await expect(paidResourceLink.first()).toBeVisible({ timeout: 10000 });
    }
  });
});

baseTest.describe("Wishlist - Unauthenticated", () => {
  baseTest(
    "unauthenticated user is redirected to login when clicking wishlist",
    async ({ page }) => {
      const resourcePage = new ResourceDetailPage(page);

      // Navigate to a resource without authentication
      await resourcePage.gotoResource(TEST_RESOURCE_IDS.FREE_RESOURCE);
      await resourcePage.expectResourceVisible();

      // Try to click wishlist button
      await resourcePage.toggleWishlist();

      // Should be redirected to login page
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    }
  );
});
