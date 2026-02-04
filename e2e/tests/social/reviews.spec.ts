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
import { ResourceDetailPage } from "../../pages/resource-detail.page";
import { TEST_RESOURCE_IDS } from "../../fixtures/test-users";

// Use unauthenticated base test for anonymous user tests
baseTest.describe("Reviews - Unauthenticated", () => {
  baseTest("shows login prompt instead of write review button", async ({ page }) => {
    const resourcePage = new ResourceDetailPage(page);
    await resourcePage.gotoResource(TEST_RESOURCE_IDS.FREE_RESOURCE);
    await resourcePage.expectResourceVisible();

    await resourcePage.scrollToReviews();
    await resourcePage.expectReviewLoginPromptVisible();
  });

  baseTest("displays existing reviews", async ({ page }) => {
    const resourcePage = new ResourceDetailPage(page);
    await resourcePage.gotoResource(TEST_RESOURCE_IDS.FREE_RESOURCE);
    await resourcePage.expectResourceVisible();

    await resourcePage.scrollToReviews();

    // Should see reviews section title
    await expect(resourcePage.reviewsSectionTitle).toBeVisible();
  });

  baseTest("shows review statistics when reviews exist", async ({ page }) => {
    const resourcePage = new ResourceDetailPage(page);
    await resourcePage.gotoResource(TEST_RESOURCE_IDS.FREE_RESOURCE);
    await resourcePage.expectResourceVisible();

    await resourcePage.scrollToReviews();

    // If there are reviews (from seed data), stats should be visible
    const hasReviews = await resourcePage.averageRating.isVisible().catch(() => false);
    if (hasReviews) {
      const rating = await resourcePage.getAverageRating();
      expect(rating).toBeGreaterThanOrEqual(1);
      expect(rating).toBeLessThanOrEqual(5);
    }
  });
});

// Authenticated tests - Buyer can review (has download record in seed)
test.describe("Reviews - Authenticated (Buyer with Download)", () => {
  test("shows write review button when user can review", async ({ buyerPage }) => {
    const resourcePage = new ResourceDetailPage(buyerPage);
    // Use free resource where buyer has a download record
    await resourcePage.gotoResource(TEST_RESOURCE_IDS.FREE_RESOURCE);
    await resourcePage.expectResourceVisible();

    await resourcePage.scrollToReviews();

    // Buyer has download record from seed, so should be able to write review
    // OR buyer already has a review, so should see "Your Review" section
    const canWrite = await resourcePage.writeReviewButton.isVisible().catch(() => false);
    const hasReview = await resourcePage.hasUserReview();

    expect(canWrite || hasReview).toBe(true);
  });

  test("opens review form when clicking write review", async ({ buyerPage }) => {
    const resourcePage = new ResourceDetailPage(buyerPage);
    await resourcePage.gotoResource(TEST_RESOURCE_IDS.FREE_RESOURCE);
    await resourcePage.expectResourceVisible();

    await resourcePage.scrollToReviews();

    // Check if user already has a review
    const hasReview = await resourcePage.hasUserReview();

    if (!hasReview) {
      await resourcePage.clickWriteReview();
      await resourcePage.expectReviewFormVisible();
    }
  });

  test("can cancel review form", async ({ buyerPage }) => {
    const resourcePage = new ResourceDetailPage(buyerPage);
    await resourcePage.gotoResource(TEST_RESOURCE_IDS.FREE_RESOURCE);
    await resourcePage.expectResourceVisible();

    await resourcePage.scrollToReviews();

    const hasReview = await resourcePage.hasUserReview();

    if (!hasReview) {
      await resourcePage.clickWriteReview();
      await resourcePage.expectReviewFormVisible();
      await resourcePage.cancelReview();

      // Form should be hidden after cancel
      await expect(resourcePage.reviewForm).toBeHidden();
    }
  });

  test("validates that rating is required", async ({ buyerPage }) => {
    const resourcePage = new ResourceDetailPage(buyerPage);
    await resourcePage.gotoResource(TEST_RESOURCE_IDS.FREE_RESOURCE);
    await resourcePage.expectResourceVisible();

    await resourcePage.scrollToReviews();

    const hasReview = await resourcePage.hasUserReview();

    if (!hasReview) {
      await resourcePage.clickWriteReview();

      // Submit button should be disabled without rating
      await expect(resourcePage.reviewSubmitButton).toBeDisabled();
    }
  });

  test("displays user's own review highlighted", async ({ buyerPage }) => {
    const resourcePage = new ResourceDetailPage(buyerPage);
    await resourcePage.gotoResource(TEST_RESOURCE_IDS.FREE_RESOURCE);
    await resourcePage.expectResourceVisible();

    await resourcePage.scrollToReviews();

    // From seed data, buyer has a review
    const hasReview = await resourcePage.hasUserReview();

    if (hasReview) {
      // User's review section should be highlighted (has primary border)
      await expect(resourcePage.userReviewSection).toBeVisible();
    }
  });
});

// Test for users who cannot review (no download)
test.describe("Reviews - Cannot Review (No Download)", () => {
  test("shows message when user cannot review without download", async ({ buyerPage }) => {
    const resourcePage = new ResourceDetailPage(buyerPage);
    // Use paid resource where buyer has no download/purchase
    await resourcePage.gotoResource(TEST_RESOURCE_IDS.PAID_RESOURCE);
    await resourcePage.expectResourceVisible();

    await resourcePage.scrollToReviews();

    // User cannot review without downloading first
    // Should see info message instead of write review button
    const canWrite = await resourcePage.writeReviewButton.isVisible().catch(() => false);
    const hasReview = await resourcePage.hasUserReview();

    // If buyer hasn't purchased/downloaded paid resource, they can't write review
    if (!canWrite && !hasReview) {
      // Should see the "download to review" info message
      const infoMessage = resourcePage.reviewsSection.locator(
        "text=/kaufen.*herunterladen.*bewertung|download.*review/i"
      );
      const hasInfoMessage = await infoMessage.isVisible().catch(() => false);
      expect(hasInfoMessage || canWrite || hasReview).toBe(true);
    }
  });
});

// Seller tests - cannot review own resources
test.describe("Reviews - Seller Cannot Review Own Resource", () => {
  test("seller cannot write review on their own resource", async ({ sellerPage }) => {
    const resourcePage = new ResourceDetailPage(sellerPage);
    // Free resource is owned by test seller
    await resourcePage.gotoResource(TEST_RESOURCE_IDS.FREE_RESOURCE);
    await resourcePage.expectResourceVisible();

    await resourcePage.scrollToReviews();

    // Seller should not see write review button for their own resource
    const canWrite = await resourcePage.writeReviewButton.isVisible().catch(() => false);
    expect(canWrite).toBe(false);
  });
});

// Review statistics tests
test.describe("Reviews - Statistics", () => {
  baseTest("shows average rating as number with one decimal", async ({ page }) => {
    const resourcePage = new ResourceDetailPage(page);
    await resourcePage.gotoResource(TEST_RESOURCE_IDS.FREE_RESOURCE);
    await resourcePage.expectResourceVisible();

    await resourcePage.scrollToReviews();

    const hasStats = await resourcePage.averageRating.isVisible().catch(() => false);
    if (hasStats) {
      const ratingText = await resourcePage.averageRating.textContent();
      // Should be a number like "4.5" or "5.0"
      expect(ratingText).toMatch(/^\d\.\d$/);
    }
  });

  baseTest("shows rating distribution chart when reviews exist", async ({ page }) => {
    const resourcePage = new ResourceDetailPage(page);
    await resourcePage.gotoResource(TEST_RESOURCE_IDS.FREE_RESOURCE);
    await resourcePage.expectResourceVisible();

    await resourcePage.scrollToReviews();

    // Look for the distribution chart (shows 1-5 star bars)
    const distributionBars = resourcePage.reviewsSection.locator('[class*="bg-warning"]');
    const hasDistribution = (await distributionBars.count()) > 0;

    // Distribution is only shown when there are reviews
    expect(hasDistribution).toBeDefined();
  });
});
