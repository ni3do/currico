/**
 * E2E Tests for Likes functionality.
 *
 * Tests the LikeButton components including:
 * - Comment likes (thumbs icon) - visible in CommentsSection
 * - Like/unlike toggle behavior
 * - Like count updates
 * - Authentication requirements
 *
 * Note: Resource likes API exists but the ResourceLikeButton component
 * is not currently rendered on the resource detail page (only wishlist is shown).
 * These tests focus on comment likes which are actively displayed.
 */

import { test as baseTest, expect } from "@playwright/test";
import { test } from "../../fixtures/auth.fixture";
import { ResourceDetailPage } from "../../pages/resource-detail.page";
import { TEST_RESOURCE_IDS } from "../../fixtures/test-users";

// Comment likes - Unauthenticated
baseTest.describe("Comment Likes - Unauthenticated", () => {
  baseTest("redirects to login when clicking like on a comment", async ({ page }) => {
    const resourcePage = new ResourceDetailPage(page);
    await resourcePage.gotoResource(TEST_RESOURCE_IDS.FREE_RESOURCE);
    await resourcePage.expectResourceVisible();

    await resourcePage.scrollToComments();
    await resourcePage.expectCommentsVisible();

    // Find the first comment like button
    const commentLikeBtn = page
      .locator('button[aria-label*="Like"], button[aria-label*="Liken"]')
      .first();
    await commentLikeBtn.click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  baseTest("displays like count on comments", async ({ page }) => {
    const resourcePage = new ResourceDetailPage(page);
    await resourcePage.gotoResource(TEST_RESOURCE_IDS.FREE_RESOURCE);
    await resourcePage.expectResourceVisible();

    await resourcePage.scrollToComments();

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
    const resourcePage = new ResourceDetailPage(buyerPage);
    await resourcePage.gotoResource(TEST_RESOURCE_IDS.FREE_RESOURCE);
    await resourcePage.expectResourceVisible();

    await resourcePage.scrollToComments();

    // Get initial state
    const initialLiked = await resourcePage.isCommentLiked(0);
    const initialCount = await resourcePage.getCommentLikeCount(0);

    // Toggle like
    await resourcePage.likeComment(0);

    // Verify state changed
    await expect(async () => {
      const nowLiked = await resourcePage.isCommentLiked(0);
      expect(nowLiked).toBe(!initialLiked);
    }).toPass({ timeout: 5000 });

    // Verify count changed
    await expect(async () => {
      const newCount = await resourcePage.getCommentLikeCount(0);
      const expectedCount = initialLiked ? initialCount - 1 : initialCount + 1;
      expect(newCount).toBe(expectedCount);
    }).toPass({ timeout: 5000 });
  });

  test("can unlike a comment", async ({ buyerPage }) => {
    const resourcePage = new ResourceDetailPage(buyerPage);
    await resourcePage.gotoResource(TEST_RESOURCE_IDS.FREE_RESOURCE);
    await resourcePage.expectResourceVisible();

    await resourcePage.scrollToComments();

    // First ensure it's liked
    let isLiked = await resourcePage.isCommentLiked(0);
    if (!isLiked) {
      await resourcePage.likeComment(0);
      await expect(async () => {
        isLiked = await resourcePage.isCommentLiked(0);
        expect(isLiked).toBe(true);
      }).toPass({ timeout: 5000 });
    }

    // Now unlike it
    await resourcePage.likeComment(0);

    // Verify it's unliked
    await expect(async () => {
      const nowLiked = await resourcePage.isCommentLiked(0);
      expect(nowLiked).toBe(false);
    }).toPass({ timeout: 5000 });
  });

  test("like button shows correct aria-pressed state", async ({ buyerPage }) => {
    const resourcePage = new ResourceDetailPage(buyerPage);
    await resourcePage.gotoResource(TEST_RESOURCE_IDS.FREE_RESOURCE);
    await resourcePage.expectResourceVisible();

    await resourcePage.scrollToComments();

    const isLiked = await resourcePage.isCommentLiked(0);

    // The isCommentLiked method checks aria-pressed, so this verifies consistency
    const comment = resourcePage.commentCards.nth(0);
    const likeBtn = comment.locator('button[aria-label*="Like"], button[aria-label*="Liken"]');
    const ariaPressed = await likeBtn.getAttribute("aria-pressed");

    expect(ariaPressed).toBe(isLiked.toString());
  });

  test("persists like state after page refresh", async ({ buyerPage }) => {
    const resourcePage = new ResourceDetailPage(buyerPage);
    await resourcePage.gotoResource(TEST_RESOURCE_IDS.FREE_RESOURCE);
    await resourcePage.expectResourceVisible();

    await resourcePage.scrollToComments();

    // Get to a known state
    let isLiked = await resourcePage.isCommentLiked(0);

    // Toggle to ensure we have a state change
    await resourcePage.likeComment(0);
    await expect(async () => {
      isLiked = await resourcePage.isCommentLiked(0);
    }).toPass({ timeout: 5000 });

    const stateBeforeRefresh = isLiked;

    // Refresh the page
    await buyerPage.reload();
    await resourcePage.waitForPageLoad();
    await resourcePage.expectResourceVisible();
    await resourcePage.scrollToComments();

    // Like state should persist
    await expect(async () => {
      const persistedState = await resourcePage.isCommentLiked(0);
      expect(persistedState).toBe(stateBeforeRefresh);
    }).toPass({ timeout: 5000 });
  });
});

// Comment likes - Visual feedback
test.describe("Comment Likes - Visual Feedback", () => {
  test("like button has thumbs-up icon", async ({ buyerPage }) => {
    const resourcePage = new ResourceDetailPage(buyerPage);
    await resourcePage.gotoResource(TEST_RESOURCE_IDS.FREE_RESOURCE);
    await resourcePage.expectResourceVisible();

    await resourcePage.scrollToComments();

    // The like button should contain an SVG
    const comment = resourcePage.commentCards.nth(0);
    const likeBtn = comment.locator('button[aria-label*="Like"], button[aria-label*="Liken"]');
    const svg = likeBtn.locator("svg");

    await expect(svg).toBeVisible();
  });

  test("liked state shows filled icon with primary color", async ({ buyerPage }) => {
    const resourcePage = new ResourceDetailPage(buyerPage);
    await resourcePage.gotoResource(TEST_RESOURCE_IDS.FREE_RESOURCE);
    await resourcePage.expectResourceVisible();

    await resourcePage.scrollToComments();

    // Ensure comment is liked
    let isLiked = await resourcePage.isCommentLiked(0);
    if (!isLiked) {
      await resourcePage.likeComment(0);
      await buyerPage.waitForLoadState("networkidle");
    }

    // When liked, button should have primary styling
    const comment = resourcePage.commentCards.nth(0);
    const likeBtn = comment.locator('button[aria-label*="Like"], button[aria-label*="Liken"]');

    // Check for text-primary class (thumbs variant uses primary color)
    const hasActiveClass = await likeBtn.evaluate(
      (el) => el.classList.contains("text-primary") || el.className.includes("text-primary")
    );
    expect(hasActiveClass).toBe(true);

    // Clean up
    if (!isLiked) {
      await resourcePage.likeComment(0);
    }
  });
});

// Seller liking comments test
test.describe("Comment Likes - Seller", () => {
  test("seller can like comments on their own resource", async ({ sellerPage }) => {
    const resourcePage = new ResourceDetailPage(sellerPage);
    await resourcePage.gotoResource(TEST_RESOURCE_IDS.FREE_RESOURCE);
    await resourcePage.expectResourceVisible();

    await resourcePage.scrollToComments();

    // Seller should be able to like comments
    const initialLiked = await resourcePage.isCommentLiked(0);
    await resourcePage.likeComment(0);

    await expect(async () => {
      const nowLiked = await resourcePage.isCommentLiked(0);
      expect(nowLiked).toBe(!initialLiked);
    }).toPass({ timeout: 5000 });

    // Clean up - toggle back
    await resourcePage.likeComment(0);
  });
});

// Like count display tests
test.describe("Comment Likes - Count Display", () => {
  baseTest("shows like count next to button", async ({ page }) => {
    const resourcePage = new ResourceDetailPage(page);
    await resourcePage.gotoResource(TEST_RESOURCE_IDS.FREE_RESOURCE);
    await resourcePage.expectResourceVisible();

    await resourcePage.scrollToComments();

    // Like count should be displayed
    const count = await resourcePage.getCommentLikeCount(0);
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("count updates immediately after like action", async ({ buyerPage }) => {
    const resourcePage = new ResourceDetailPage(buyerPage);
    await resourcePage.gotoResource(TEST_RESOURCE_IDS.FREE_RESOURCE);
    await resourcePage.expectResourceVisible();

    await resourcePage.scrollToComments();

    const initialCount = await resourcePage.getCommentLikeCount(0);
    const initialLiked = await resourcePage.isCommentLiked(0);

    // Toggle like
    await resourcePage.likeComment(0);

    // Count should update
    await expect(async () => {
      const newCount = await resourcePage.getCommentLikeCount(0);
      // Count changes by 1 in either direction depending on initial state
      expect(Math.abs(newCount - initialCount)).toBe(1);
    }).toPass({ timeout: 5000 });

    // Clean up
    if (!initialLiked) {
      await resourcePage.likeComment(0);
    }
  });
});
