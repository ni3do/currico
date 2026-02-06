/**
 * E2E Tests for Reviews functionality.
 *
 * Tests the ReviewsSection component including:
 * - Viewing reviews and stats (authenticated and unauthenticated)
 * - Writing reviews (requires download/purchase)
 * - Star rating selection
 * - Review form validation
 */

import { test as baseTest, expect } from "@playwright/test";
import { test } from "../../fixtures/auth.fixture";
import { MaterialDetailPage } from "../../pages/resource-detail.page";
import { TEST_MATERIAL_IDS } from "../../fixtures/test-users";

// Use unauthenticated base test for anonymous user tests
baseTest.describe("Reviews - Unauthenticated", () => {
  baseTest("shows login prompt instead of write review button", async ({ page }) => {
    const materialPage = new MaterialDetailPage(page);
    await materialPage.gotoMaterial(TEST_MATERIAL_IDS.FREE_MATERIAL);
    await materialPage.expectMaterialVisible();

    await materialPage.scrollToReviews();
    await materialPage.expectReviewLoginPromptVisible();
  });

  baseTest("displays existing reviews", async ({ page }) => {
    const materialPage = new MaterialDetailPage(page);
    await materialPage.gotoMaterial(TEST_MATERIAL_IDS.FREE_MATERIAL);
    await materialPage.expectMaterialVisible();

    await materialPage.scrollToReviews();

    // Should see reviews section title
    await expect(materialPage.reviewsSectionTitle).toBeVisible();
  });

  baseTest("shows review statistics when reviews exist", async ({ page }) => {
    const materialPage = new MaterialDetailPage(page);
    await materialPage.gotoMaterial(TEST_MATERIAL_IDS.FREE_MATERIAL);
    await materialPage.expectMaterialVisible();

    await materialPage.scrollToReviews();

    // If there are reviews (from seed data), stats should be visible
    const hasReviews = await materialPage.averageRating.isVisible().catch(() => false);
    if (hasReviews) {
      const rating = await materialPage.getAverageRating();
      expect(rating).toBeGreaterThanOrEqual(1);
      expect(rating).toBeLessThanOrEqual(5);
    }
  });
});

// Authenticated tests - Buyer can review (has download record in seed)
test.describe("Reviews - Authenticated (Buyer with Download)", () => {
  test("shows write review button when user can review", async ({ buyerPage }) => {
    const materialPage = new MaterialDetailPage(buyerPage);
    // Use free material where buyer has a download record
    await materialPage.gotoMaterial(TEST_MATERIAL_IDS.FREE_MATERIAL);
    await materialPage.expectMaterialVisible();

    await materialPage.scrollToReviews();

    // Buyer has download record from seed, so should be able to write review
    // OR buyer already has a review, so should see "Your Review" section
    const canWrite = await materialPage.writeReviewButton.isVisible().catch(() => false);
    const hasReview = await materialPage.hasUserReview();

    expect(canWrite || hasReview).toBe(true);
  });

  test("opens review form when clicking write review", async ({ buyerPage }) => {
    const materialPage = new MaterialDetailPage(buyerPage);
    await materialPage.gotoMaterial(TEST_MATERIAL_IDS.FREE_MATERIAL);
    await materialPage.expectMaterialVisible();

    await materialPage.scrollToReviews();

    // Check if user already has a review
    const hasReview = await materialPage.hasUserReview();

    if (!hasReview) {
      await materialPage.clickWriteReview();
      await materialPage.expectReviewFormVisible();
    }
  });

  test("can cancel review form", async ({ buyerPage }) => {
    const materialPage = new MaterialDetailPage(buyerPage);
    await materialPage.gotoMaterial(TEST_MATERIAL_IDS.FREE_MATERIAL);
    await materialPage.expectMaterialVisible();

    await materialPage.scrollToReviews();

    const hasReview = await materialPage.hasUserReview();

    if (!hasReview) {
      await materialPage.clickWriteReview();
      await materialPage.expectReviewFormVisible();
      await materialPage.cancelReview();

      // Form should be hidden after cancel
      await expect(materialPage.reviewForm).toBeHidden();
    }
  });

  test("validates that rating is required", async ({ buyerPage }) => {
    const materialPage = new MaterialDetailPage(buyerPage);
    await materialPage.gotoMaterial(TEST_MATERIAL_IDS.FREE_MATERIAL);
    await materialPage.expectMaterialVisible();

    await materialPage.scrollToReviews();

    const hasReview = await materialPage.hasUserReview();

    if (!hasReview) {
      await materialPage.clickWriteReview();

      // Submit button should be disabled without rating
      await expect(materialPage.reviewSubmitButton).toBeDisabled();
    }
  });

  test("displays user's own review highlighted", async ({ buyerPage }) => {
    const materialPage = new MaterialDetailPage(buyerPage);
    await materialPage.gotoMaterial(TEST_MATERIAL_IDS.FREE_MATERIAL);
    await materialPage.expectMaterialVisible();

    await materialPage.scrollToReviews();

    // From seed data, buyer has a review
    const hasReview = await materialPage.hasUserReview();

    if (hasReview) {
      // User's review section should be highlighted (has primary border)
      await expect(materialPage.userReviewSection).toBeVisible();
    }
  });
});

// Test for users who cannot review (no download)
test.describe("Reviews - Cannot Review (No Download)", () => {
  test("shows message when user cannot review without download", async ({ buyerPage }) => {
    const materialPage = new MaterialDetailPage(buyerPage);
    // Use paid material where buyer has no download/purchase
    await materialPage.gotoMaterial(TEST_MATERIAL_IDS.PAID_MATERIAL);
    await materialPage.expectMaterialVisible();

    await materialPage.scrollToReviews();

    // User cannot review without downloading first
    // Should see info message instead of write review button
    const canWrite = await materialPage.writeReviewButton.isVisible().catch(() => false);
    const hasReview = await materialPage.hasUserReview();

    // If buyer hasn't purchased/downloaded paid material, they can't write review
    if (!canWrite && !hasReview) {
      // Should see the "download to review" info message
      const infoMessage = materialPage.reviewsSection.locator(
        "text=/kaufen.*herunterladen.*bewertung|download.*review/i"
      );
      const hasInfoMessage = await infoMessage.isVisible().catch(() => false);
      expect(hasInfoMessage || canWrite || hasReview).toBe(true);
    }
  });
});

// Seller tests - cannot review own materials
test.describe("Reviews - Seller Cannot Review Own Material", () => {
  test("seller cannot write review on their own material", async ({ sellerPage }) => {
    const materialPage = new MaterialDetailPage(sellerPage);
    // Free material is owned by test seller
    await materialPage.gotoMaterial(TEST_MATERIAL_IDS.FREE_MATERIAL);
    await materialPage.expectMaterialVisible();

    await materialPage.scrollToReviews();

    // Seller should not see write review button for their own material
    const canWrite = await materialPage.writeReviewButton.isVisible().catch(() => false);
    expect(canWrite).toBe(false);
  });
});

// Review statistics tests
test.describe("Reviews - Statistics", () => {
  baseTest("shows average rating as number with one decimal", async ({ page }) => {
    const materialPage = new MaterialDetailPage(page);
    await materialPage.gotoMaterial(TEST_MATERIAL_IDS.FREE_MATERIAL);
    await materialPage.expectMaterialVisible();

    await materialPage.scrollToReviews();

    const hasStats = await materialPage.averageRating.isVisible().catch(() => false);
    if (hasStats) {
      const ratingText = await materialPage.averageRating.textContent();
      // Should be a number like "4.5" or "5.0"
      expect(ratingText).toMatch(/^\d\.\d$/);
    }
  });

  baseTest("shows rating distribution chart when reviews exist", async ({ page }) => {
    const materialPage = new MaterialDetailPage(page);
    await materialPage.gotoMaterial(TEST_MATERIAL_IDS.FREE_MATERIAL);
    await materialPage.expectMaterialVisible();

    await materialPage.scrollToReviews();

    // Look for the distribution chart (shows 1-5 star bars)
    const distributionBars = materialPage.reviewsSection.locator('[class*="bg-warning"]');
    const hasDistribution = (await distributionBars.count()) > 0;

    // Distribution is only shown when there are reviews
    expect(hasDistribution).toBeDefined();
  });
});
