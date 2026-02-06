/**
 * E2E Tests for Likes functionality.
 *
 * Tests the LikeButton components including:
 * - Comment likes (thumbs icon) - visible in CommentsSection
 * - Like/unlike toggle behavior
 * - Like count updates
 * - Authentication requirements
 *
 * Note: Material likes API exists but the MaterialLikeButton component
 * is not currently rendered on the material detail page (only wishlist is shown).
 * These tests focus on comment likes which are actively displayed.
 */

import { test as baseTest, expect } from "@playwright/test";
import { test } from "../../fixtures/auth.fixture";
import { MaterialDetailPage } from "../../pages/resource-detail.page";
import { TEST_MATERIAL_IDS } from "../../fixtures/test-users";

// Comment likes - Unauthenticated
baseTest.describe("Comment Likes - Unauthenticated", () => {
  baseTest("redirects to login when clicking like on a comment", async ({ page }) => {
    const materialPage = new MaterialDetailPage(page);
    await materialPage.gotoMaterial(TEST_MATERIAL_IDS.FREE_MATERIAL);
    await materialPage.expectMaterialVisible();

    await materialPage.scrollToComments();
    await materialPage.expectCommentsVisible();

    // Find the first comment like button
    const commentLikeBtn = page
      .locator('button[aria-label*="Like"], button[aria-label*="Liken"]')
      .first();
    await commentLikeBtn.click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  baseTest("displays like count on comments", async ({ page }) => {
    const materialPage = new MaterialDetailPage(page);
    await materialPage.gotoMaterial(TEST_MATERIAL_IDS.FREE_MATERIAL);
    await materialPage.expectMaterialVisible();

    await materialPage.scrollToComments();

    // Look for like buttons with counts
    const likeButtons = page.locator('button[aria-label*="Like"], button[aria-label*="Liken"]');
    const count = await likeButtons.count();

    // If there are comments, there should be like buttons
    if (count > 0) {
      await expect(likeButtons.first()).toBeVisible();
    }
  });
});

// Comment likes - Authenticated
test.describe("Comment Likes - Authenticated (Buyer)", () => {
  test("can like a comment", async ({ buyerPage }) => {
    const materialPage = new MaterialDetailPage(buyerPage);
    await materialPage.gotoMaterial(TEST_MATERIAL_IDS.FREE_MATERIAL);
    await materialPage.expectMaterialVisible();

    await materialPage.scrollToComments();

    // Get initial state
    const initialLiked = await materialPage.isCommentLiked(0);
    const initialCount = await materialPage.getCommentLikeCount(0);

    // Toggle like
    await materialPage.likeComment(0);

    // Verify state changed
    await expect(async () => {
      const nowLiked = await materialPage.isCommentLiked(0);
      expect(nowLiked).toBe(!initialLiked);
    }).toPass({ timeout: 5000 });

    // Verify count changed
    await expect(async () => {
      const newCount = await materialPage.getCommentLikeCount(0);
      const expectedCount = initialLiked ? initialCount - 1 : initialCount + 1;
      expect(newCount).toBe(expectedCount);
    }).toPass({ timeout: 5000 });
  });

  test("can unlike a comment", async ({ buyerPage }) => {
    const materialPage = new MaterialDetailPage(buyerPage);
    await materialPage.gotoMaterial(TEST_MATERIAL_IDS.FREE_MATERIAL);
    await materialPage.expectMaterialVisible();

    await materialPage.scrollToComments();

    // First ensure it's liked
    let isLiked = await materialPage.isCommentLiked(0);
    if (!isLiked) {
      await materialPage.likeComment(0);
      await expect(async () => {
        isLiked = await materialPage.isCommentLiked(0);
        expect(isLiked).toBe(true);
      }).toPass({ timeout: 5000 });
    }

    // Now unlike it
    await materialPage.likeComment(0);

    // Verify it's unliked
    await expect(async () => {
      const nowLiked = await materialPage.isCommentLiked(0);
      expect(nowLiked).toBe(false);
    }).toPass({ timeout: 5000 });
  });

  test("like button shows correct aria-pressed state", async ({ buyerPage }) => {
    const materialPage = new MaterialDetailPage(buyerPage);
    await materialPage.gotoMaterial(TEST_MATERIAL_IDS.FREE_MATERIAL);
    await materialPage.expectMaterialVisible();

    await materialPage.scrollToComments();

    const isLiked = await materialPage.isCommentLiked(0);

    // The isCommentLiked method checks aria-pressed, so this verifies consistency
    const comment = materialPage.commentCards.nth(0);
    const likeBtn = comment.locator('button[aria-label*="Like"], button[aria-label*="Liken"]');
    const ariaPressed = await likeBtn.getAttribute("aria-pressed");

    expect(ariaPressed).toBe(isLiked.toString());
  });

  test("persists like state after page refresh", async ({ buyerPage }) => {
    const materialPage = new MaterialDetailPage(buyerPage);
    await materialPage.gotoMaterial(TEST_MATERIAL_IDS.FREE_MATERIAL);
    await materialPage.expectMaterialVisible();

    await materialPage.scrollToComments();

    // Get to a known state
    let isLiked = await materialPage.isCommentLiked(0);

    // Toggle to ensure we have a state change
    await materialPage.likeComment(0);
    await expect(async () => {
      isLiked = await materialPage.isCommentLiked(0);
    }).toPass({ timeout: 5000 });

    const stateBeforeRefresh = isLiked;

    // Refresh the page
    await buyerPage.reload();
    await materialPage.waitForPageLoad();
    await materialPage.expectMaterialVisible();
    await materialPage.scrollToComments();

    // Like state should persist
    await expect(async () => {
      const persistedState = await materialPage.isCommentLiked(0);
      expect(persistedState).toBe(stateBeforeRefresh);
    }).toPass({ timeout: 5000 });
  });
});

// Comment likes - Visual feedback
test.describe("Comment Likes - Visual Feedback", () => {
  test("like button has thumbs-up icon", async ({ buyerPage }) => {
    const materialPage = new MaterialDetailPage(buyerPage);
    await materialPage.gotoMaterial(TEST_MATERIAL_IDS.FREE_MATERIAL);
    await materialPage.expectMaterialVisible();

    await materialPage.scrollToComments();

    // The like button should contain an SVG
    const comment = materialPage.commentCards.nth(0);
    const likeBtn = comment.locator('button[aria-label*="Like"], button[aria-label*="Liken"]');
    const svg = likeBtn.locator("svg");

    await expect(svg).toBeVisible();
  });

  test("liked state shows filled icon with primary color", async ({ buyerPage }) => {
    const materialPage = new MaterialDetailPage(buyerPage);
    await materialPage.gotoMaterial(TEST_MATERIAL_IDS.FREE_MATERIAL);
    await materialPage.expectMaterialVisible();

    await materialPage.scrollToComments();

    // Ensure comment is liked
    let isLiked = await materialPage.isCommentLiked(0);
    if (!isLiked) {
      await materialPage.likeComment(0);
      await buyerPage.waitForLoadState("networkidle");
    }

    // When liked, button should have primary styling
    const comment = materialPage.commentCards.nth(0);
    const likeBtn = comment.locator('button[aria-label*="Like"], button[aria-label*="Liken"]');

    // Check for text-primary class (thumbs variant uses primary color)
    const hasActiveClass = await likeBtn.evaluate(
      (el) => el.classList.contains("text-primary") || el.className.includes("text-primary")
    );
    expect(hasActiveClass).toBe(true);

    // Clean up
    if (!isLiked) {
      await materialPage.likeComment(0);
    }
  });
});

// Seller liking comments test
test.describe("Comment Likes - Seller", () => {
  test("seller can like comments on their own material", async ({ sellerPage }) => {
    const materialPage = new MaterialDetailPage(sellerPage);
    await materialPage.gotoMaterial(TEST_MATERIAL_IDS.FREE_MATERIAL);
    await materialPage.expectMaterialVisible();

    await materialPage.scrollToComments();

    // Seller should be able to like comments
    const initialLiked = await materialPage.isCommentLiked(0);
    await materialPage.likeComment(0);

    await expect(async () => {
      const nowLiked = await materialPage.isCommentLiked(0);
      expect(nowLiked).toBe(!initialLiked);
    }).toPass({ timeout: 5000 });

    // Clean up - toggle back
    await materialPage.likeComment(0);
  });
});

// Like count display tests
test.describe("Comment Likes - Count Display", () => {
  baseTest("shows like count next to button", async ({ page }) => {
    const materialPage = new MaterialDetailPage(page);
    await materialPage.gotoMaterial(TEST_MATERIAL_IDS.FREE_MATERIAL);
    await materialPage.expectMaterialVisible();

    await materialPage.scrollToComments();

    // Like count should be displayed
    const count = await materialPage.getCommentLikeCount(0);
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("count updates immediately after like action", async ({ buyerPage }) => {
    const materialPage = new MaterialDetailPage(buyerPage);
    await materialPage.gotoMaterial(TEST_MATERIAL_IDS.FREE_MATERIAL);
    await materialPage.expectMaterialVisible();

    await materialPage.scrollToComments();

    const initialCount = await materialPage.getCommentLikeCount(0);
    const initialLiked = await materialPage.isCommentLiked(0);

    // Toggle like
    await materialPage.likeComment(0);

    // Count should update
    await expect(async () => {
      const newCount = await materialPage.getCommentLikeCount(0);
      // Count changes by 1 in either direction depending on initial state
      expect(Math.abs(newCount - initialCount)).toBe(1);
    }).toPass({ timeout: 5000 });

    // Clean up
    if (!initialLiked) {
      await materialPage.likeComment(0);
    }
  });
});
