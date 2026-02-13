/**
 * Material Detail Page Object.
 *
 * Handles interactions with the material detail page including:
 * - Material information display (title, description, price)
 * - Buy/Download actions
 * - Wishlist functionality
 * - Seller info
 * - Report modal
 * - Preview gallery with multi-page support
 */

import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class MaterialDetailPage extends BasePage {
  // Path is dynamic - set via constructor or navigation
  readonly path = "/materialien";

  // Material info
  readonly title: Locator;
  readonly description: Locator;
  readonly price: Locator;

  // Action buttons
  readonly buyButton: Locator;
  readonly downloadButton: Locator;
  readonly wishlistButton: Locator;

  // Seller info
  readonly sellerName: Locator;
  readonly sellerAvatar: Locator;
  readonly followButton: Locator;

  // Metadata
  readonly subjectLabel: Locator;
  readonly cycleLabel: Locator;
  readonly downloadCount: Locator;

  // Report
  readonly reportButton: Locator;
  readonly reportModal: Locator;
  readonly reportReasonSelect: Locator;
  readonly reportDescriptionInput: Locator;
  readonly reportSubmitButton: Locator;
  readonly reportCancelButton: Locator;

  // Related materials
  readonly relatedMaterialsSection: Locator;
  readonly relatedMaterialCards: Locator;

  // Breadcrumb
  readonly breadcrumb: Locator;

  // Preview Gallery
  readonly previewGallerySection: Locator;
  readonly previewGalleryTitle: Locator;
  readonly mainPreviewImage: Locator;
  readonly thumbnailButtons: Locator;
  readonly pageIndicator: Locator;
  readonly previewOverlay: Locator;
  readonly noPreviewPlaceholder: Locator;

  // Lightbox
  readonly lightbox: Locator;
  readonly lightboxCloseButton: Locator;
  readonly lightboxNextButton: Locator;
  readonly lightboxPrevButton: Locator;
  readonly lightboxPageIndicator: Locator;

  // Error states
  readonly notFoundMessage: Locator;
  readonly errorMessage: Locator;

  // ============ Comments Section ============
  readonly commentsSection: Locator;
  readonly commentsSectionTitle: Locator;
  readonly commentsCount: Locator;
  readonly commentForm: Locator;
  readonly commentTextarea: Locator;
  readonly commentSubmitButton: Locator;
  readonly commentCards: Locator;
  readonly noCommentsMessage: Locator;
  readonly commentLoginPrompt: Locator;
  readonly commentsPagination: Locator;

  // ============ Reviews Section ============
  readonly reviewsSection: Locator;
  readonly reviewsSectionTitle: Locator;
  readonly reviewsStats: Locator;
  readonly averageRating: Locator;
  readonly writeReviewButton: Locator;
  readonly reviewForm: Locator;
  readonly reviewStars: Locator;
  readonly reviewTitleInput: Locator;
  readonly reviewContentTextarea: Locator;
  readonly reviewSubmitButton: Locator;
  readonly reviewCancelButton: Locator;
  readonly reviewCards: Locator;
  readonly noReviewsMessage: Locator;
  readonly reviewLoginPrompt: Locator;
  readonly userReviewSection: Locator;
  readonly reviewsPagination: Locator;

  constructor(page: Page) {
    super(page);

    // Material info
    this.title = page.locator("h1");
    this.description = page.locator("main .card p").first();
    this.price = page
      .locator("div")
      .filter({ hasText: /^CHF|^Gratis|^Kostenlos/i })
      .first();

    // Action buttons - use more specific locators to avoid matching header buttons
    this.buyButton = page
      .locator("button.btn-primary")
      .filter({ hasText: /kaufen.*CHF|buy.*CHF/i });
    this.downloadButton = page
      .locator("button.btn-primary")
      .filter({ hasText: /herunterladen|kostenlos|download|free/i });
    // Wishlist button has title attribute and contains a heart SVG
    this.wishlistButton = page
      .locator('button[title*="Wunschliste"], button[title*="wishlist"]')
      .first();

    // Seller info (in sidebar)
    this.sellerName = page
      .locator(".card")
      .filter({ hasText: /erstellt von/i })
      .locator("span.font-medium")
      .first();
    this.sellerAvatar = page
      .locator(".card")
      .filter({ hasText: /erstellt von/i })
      .locator("img, div.rounded-full")
      .first();
    this.followButton = page.getByRole("button", { name: /folgen|follow/i });

    // Metadata block
    this.subjectLabel = page.locator("text=Fach").locator("..").locator(".font-medium");
    this.cycleLabel = page.locator("text=Zyklus").locator("..").locator(".font-medium");
    this.downloadCount = page.locator("text=Downloads").locator("..").locator(".font-medium");

    // Report
    this.reportButton = page.getByRole("button", { name: /melden|report/i });
    this.reportModal = page
      .locator("div")
      .filter({ hasText: /ressource melden/i })
      .first();
    this.reportReasonSelect = page.locator('select[name="reason"]');
    this.reportDescriptionInput = page.locator('textarea[name="description"]');
    this.reportSubmitButton = page
      .locator('button[type="submit"]')
      .filter({ hasText: /melden|report/i });
    this.reportCancelButton = page.getByRole("button", { name: /abbrechen|cancel/i });

    // Related materials
    this.relatedMaterialsSection = page.locator("text=Ähnliche Materialien").locator("..");
    this.relatedMaterialCards = page
      .locator("h2")
      .filter({ hasText: /ähnliche/i })
      .locator("..")
      .locator('a[href*="/materialien/"]');

    // Breadcrumb
    this.breadcrumb = page
      .locator("nav")
      .filter({ hasText: /ressourcen/i })
      .first();

    // Preview Gallery - find by the "Vorschau" / "Preview" heading
    this.previewGallerySection = page
      .locator("h3")
      .filter({ hasText: /vorschau|preview/i })
      .locator("..");
    this.previewGalleryTitle = page.locator("h3").filter({ hasText: /vorschau|preview/i });
    this.mainPreviewImage = this.previewGallerySection.locator("img").first();
    this.thumbnailButtons = this.previewGallerySection.locator("button").filter({
      has: page.locator("img"),
    });
    this.pageIndicator = this.previewGallerySection.locator("text=/seite.*von|page.*of/i");
    this.previewOverlay = this.previewGallerySection.locator("div").filter({
      hasText: /kaufen|unlock|freischalten/i,
    });
    this.noPreviewPlaceholder = page.locator("text=/keine vorschau|no preview/i");

    // Lightbox - fullscreen overlay
    this.lightbox = page.locator("div.fixed").filter({ has: page.locator("img") });
    this.lightboxCloseButton = this.lightbox.locator("button").first();
    this.lightboxPrevButton = this.lightbox.locator("button").filter({
      has: page.locator('svg path[d*="15 19l-7-7"]'),
    });
    this.lightboxNextButton = this.lightbox.locator("button").filter({
      has: page.locator('svg path[d*="9 5l7 7"]'),
    });
    this.lightboxPageIndicator = this.lightbox.locator("text=/seite.*von|page.*of/i");

    // Error states
    this.notFoundMessage = page.locator("text=/nicht gefunden|not found/i");
    this.errorMessage = page.locator("text=/fehler beim laden|error loading/i");

    // Comments Section
    this.commentsSection = page
      .locator("h2")
      .filter({ hasText: /kommentare/i })
      .locator("..");
    this.commentsSectionTitle = page.locator("h2").filter({ hasText: /kommentare/i });
    this.commentsCount = this.commentsSectionTitle.locator("span");
    this.commentForm = this.commentsSection.locator("form");
    this.commentTextarea = this.commentsSection.locator('textarea[placeholder*="Kommentar"]');
    this.commentSubmitButton = this.commentsSection.locator('button[type="submit"]');
    this.commentCards = this.commentsSection
      .locator('[class*="border-border"][class*="bg-bg"]')
      .filter({
        has: page.locator('button[aria-label*="Like"], button[aria-label*="Liken"]'),
      });
    this.noCommentsMessage = this.commentsSection.locator("text=/noch keine kommentare/i");
    this.commentLoginPrompt = this.commentsSection.locator("text=/melden sie sich an.*kommentar/i");
    this.commentsPagination = this.commentsSection.locator("text=/seite.*von/i");

    // Reviews Section
    this.reviewsSection = page
      .locator("h2")
      .filter({ hasText: /bewertungen/i })
      .locator("..");
    this.reviewsSectionTitle = page.locator("h2").filter({ hasText: /bewertungen/i });
    this.reviewsStats = this.reviewsSection.locator('[class*="grid"]').first();
    this.averageRating = this.reviewsSection.locator("span.text-4xl");
    this.writeReviewButton = this.reviewsSection.getByRole("button", {
      name: /bewertung schreiben/i,
    });
    this.reviewForm = this.reviewsSection.locator("form");
    this.reviewStars = this.reviewForm.locator("button").filter({
      has: page.locator("svg"),
    });
    this.reviewTitleInput = this.reviewsSection.locator("input#review-title");
    this.reviewContentTextarea = this.reviewsSection.locator("textarea#review-content");
    this.reviewSubmitButton = this.reviewsSection.locator('button[type="submit"]').filter({
      hasText: /bewertung.*abgeben|aktualisieren/i,
    });
    this.reviewCancelButton = this.reviewsSection.getByRole("button", { name: /abbrechen/i });
    this.reviewCards = this.reviewsSection
      .locator('[class*="border-border"][class*="rounded-xl"]')
      .filter({
        has: page.locator('[class*="text-warning"]'), // Star icon
      });
    this.noReviewsMessage = this.reviewsSection.locator("text=/noch keine bewertungen/i");
    this.reviewLoginPrompt = this.reviewsSection.locator("text=/melden sie sich an.*bewertung/i");
    this.userReviewSection = this.reviewsSection.locator('[class*="border-primary"]');
    this.reviewsPagination = this.reviewsSection.locator("text=/seite.*von/i");
  }

  /**
   * Navigate to a specific material by ID.
   */
  async gotoMaterial(materialId: string): Promise<void> {
    await this.page.goto(`/materialien/${materialId}`);
    await this.waitForPageLoad();
  }

  /**
   * Wait for the material detail page to finish loading.
   */
  async waitForPageLoad(): Promise<void> {
    await super.waitForPageLoad();
    // Wait for either title to load or error state
    await Promise.race([
      this.title.waitFor({ state: "visible", timeout: 10000 }).catch(() => {}),
      this.notFoundMessage.waitFor({ state: "visible", timeout: 10000 }).catch(() => {}),
      this.errorMessage.waitFor({ state: "visible", timeout: 10000 }).catch(() => {}),
    ]);
  }

  /**
   * Get the material title text.
   */
  async getMaterialTitle(): Promise<string | null> {
    return this.title.textContent();
  }

  /**
   * Get the material price text.
   */
  async getPrice(): Promise<string | null> {
    return this.price.textContent();
  }

  /**
   * Check if this is a free material.
   */
  async isFreeMaterial(): Promise<boolean> {
    const priceText = await this.getPrice();
    return (
      priceText?.toLowerCase().includes("gratis") ||
      priceText?.toLowerCase().includes("kostenlos") ||
      false
    );
  }

  /**
   * Check if this is a paid material.
   */
  async isPaidMaterial(): Promise<boolean> {
    const priceText = await this.getPrice();
    return priceText?.includes("CHF") || false;
  }

  /**
   * Click the buy button (for paid materials).
   */
  async clickBuy(): Promise<void> {
    await this.buyButton.click();
  }

  /**
   * Click the download button (for free materials).
   */
  async clickDownload(): Promise<void> {
    await this.downloadButton.click();
  }

  /**
   * Toggle wishlist status.
   */
  async toggleWishlist(): Promise<void> {
    await this.wishlistButton.click();
  }

  /**
   * Check if material is wishlisted (heart is filled).
   */
  async isWishlisted(): Promise<boolean> {
    const svg = this.wishlistButton.locator("svg");
    const fill = await svg.getAttribute("fill");
    return fill === "currentColor";
  }

  /**
   * Get seller name.
   */
  async getSellerName(): Promise<string | null> {
    return this.sellerName.textContent();
  }

  /**
   * Click follow seller button.
   */
  async clickFollow(): Promise<void> {
    await this.followButton.click();
  }

  /**
   * Check if following the seller.
   */
  async isFollowing(): Promise<boolean> {
    const text = await this.followButton.textContent();
    return text?.toLowerCase().includes("folge ich") || false;
  }

  /**
   * Open the report modal.
   */
  async openReportModal(): Promise<void> {
    await this.reportButton.click();
    await expect(this.reportModal).toBeVisible();
  }

  /**
   * Submit a report.
   */
  async submitReport(reason: string, description?: string): Promise<void> {
    await this.openReportModal();
    await this.reportReasonSelect.selectOption(reason);
    if (description) {
      await this.reportDescriptionInput.fill(description);
    }
    await this.reportSubmitButton.click();
  }

  /**
   * Close the report modal.
   */
  async closeReportModal(): Promise<void> {
    await this.reportCancelButton.click();
    await expect(this.reportModal).toBeHidden();
  }

  /**
   * Navigate back to catalog via breadcrumb.
   */
  async goToCatalog(): Promise<void> {
    await this.breadcrumb.getByRole("link", { name: /ressourcen/i }).click();
    await this.page.waitForURL(/\/materialien$/);
  }

  /**
   * Assert material details are visible.
   */
  async expectMaterialVisible(): Promise<void> {
    await expect(this.title).toBeVisible();
    await expect(this.price).toBeVisible();
  }

  /**
   * Assert not found error is shown.
   */
  async expectNotFound(): Promise<void> {
    await expect(this.notFoundMessage).toBeVisible();
  }

  /**
   * Assert seller info is visible.
   */
  async expectSellerInfoVisible(): Promise<void> {
    await expect(this.sellerName).toBeVisible();
    await expect(this.followButton).toBeVisible();
  }

  // ============ Preview Gallery Methods ============

  /**
   * Get the number of preview thumbnails (pages).
   */
  async getPreviewThumbnailCount(): Promise<number> {
    return this.thumbnailButtons.count();
  }

  /**
   * Check if the preview gallery is visible.
   */
  async isPreviewGalleryVisible(): Promise<boolean> {
    return this.previewGalleryTitle.isVisible().catch(() => false);
  }

  /**
   * Check if the "no preview" placeholder is shown.
   */
  async hasNoPreviewPlaceholder(): Promise<boolean> {
    return this.noPreviewPlaceholder.isVisible().catch(() => false);
  }

  /**
   * Click a specific thumbnail by index (0-based).
   */
  async clickThumbnail(index: number): Promise<void> {
    await this.thumbnailButtons.nth(index).click();
  }

  /**
   * Open the lightbox by clicking the main preview.
   */
  async openLightbox(): Promise<void> {
    await this.mainPreviewImage.click();
    await expect(this.lightbox).toBeVisible({ timeout: 5000 });
  }

  /**
   * Close the lightbox.
   */
  async closeLightbox(): Promise<void> {
    await this.lightboxCloseButton.click();
    await expect(this.lightbox).toBeHidden({ timeout: 5000 });
  }

  /**
   * Navigate to the next page in the lightbox.
   */
  async lightboxNext(): Promise<void> {
    await this.lightboxNextButton.click();
  }

  /**
   * Navigate to the previous page in the lightbox.
   */
  async lightboxPrev(): Promise<void> {
    await this.lightboxPrevButton.click();
  }

  /**
   * Check if the preview overlay (for locked pages) is visible.
   */
  async hasPreviewOverlay(): Promise<boolean> {
    return this.previewOverlay.isVisible().catch(() => false);
  }

  /**
   * Assert the preview gallery is visible with expected number of pages.
   */
  async expectPreviewGalleryVisible(expectedPages?: number): Promise<void> {
    await expect(this.previewGalleryTitle).toBeVisible();
    await expect(this.mainPreviewImage).toBeVisible();

    if (expectedPages !== undefined && expectedPages > 1) {
      const thumbnailCount = await this.getPreviewThumbnailCount();
      expect(thumbnailCount).toBe(expectedPages);
    }
  }

  /**
   * Assert the lightbox is open and functional.
   */
  async expectLightboxOpen(): Promise<void> {
    await expect(this.lightbox).toBeVisible();
    await expect(this.lightboxCloseButton).toBeVisible();
  }

  // ============ Comments Methods ============

  /**
   * Scroll to and wait for comments section to be visible.
   */
  async scrollToComments(): Promise<void> {
    await this.commentsSectionTitle.scrollIntoViewIfNeeded();
    await expect(this.commentsSectionTitle).toBeVisible();
  }

  /**
   * Get the number of comments displayed.
   */
  async getCommentsCount(): Promise<number> {
    const countText = await this.commentsCount.textContent();
    const match = countText?.match(/\((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Add a new comment (must be authenticated).
   */
  async addComment(content: string): Promise<void> {
    await this.scrollToComments();
    await this.commentTextarea.fill(content);
    await this.commentSubmitButton.click();
    // Wait for comment to appear in the list
    await this.page.waitForResponse(
      (resp) => resp.url().includes("/comments") && resp.status() === 200
    );
  }

  /**
   * Get the content of the first comment.
   */
  async getFirstCommentContent(): Promise<string | null> {
    const firstComment = this.commentCards.first();
    const contentEl = firstComment.locator("p").first();
    return contentEl.textContent();
  }

  /**
   * Click like button on a comment by index (0-based).
   */
  async likeComment(index: number = 0): Promise<void> {
    const comment = this.commentCards.nth(index);
    const likeBtn = comment.locator('button[aria-label*="Like"], button[aria-label*="Liken"]');
    await likeBtn.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Check if a comment is liked (by index, 0-based).
   */
  async isCommentLiked(index: number = 0): Promise<boolean> {
    const comment = this.commentCards.nth(index);
    const likeBtn = comment.locator('button[aria-label*="Like"], button[aria-label*="Liken"]');
    const ariaPressed = await likeBtn.getAttribute("aria-pressed");
    return ariaPressed === "true";
  }

  /**
   * Get the like count for a comment (by index, 0-based).
   */
  async getCommentLikeCount(index: number = 0): Promise<number> {
    const comment = this.commentCards.nth(index);
    const likeBtn = comment.locator('button[aria-label*="Like"], button[aria-label*="Liken"]');
    const countSpan = likeBtn.locator("span").last();
    const countText = await countSpan.textContent();
    return parseInt(countText || "0", 10);
  }

  /**
   * Assert comments section is visible with expected state.
   */
  async expectCommentsVisible(): Promise<void> {
    await expect(this.commentsSectionTitle).toBeVisible();
  }

  /**
   * Assert comment form is visible (authenticated state).
   */
  async expectCommentFormVisible(): Promise<void> {
    await expect(this.commentTextarea).toBeVisible();
    await expect(this.commentSubmitButton).toBeVisible();
  }

  /**
   * Assert login prompt is shown instead of comment form.
   */
  async expectCommentLoginPromptVisible(): Promise<void> {
    await expect(this.commentLoginPrompt).toBeVisible();
  }

  // ============ Reviews Methods ============

  /**
   * Scroll to and wait for reviews section to be visible.
   */
  async scrollToReviews(): Promise<void> {
    await this.reviewsSectionTitle.scrollIntoViewIfNeeded();
    await expect(this.reviewsSectionTitle).toBeVisible();
  }

  /**
   * Get the average rating displayed.
   */
  async getAverageRating(): Promise<number> {
    const ratingText = await this.averageRating.textContent();
    return parseFloat(ratingText || "0");
  }

  /**
   * Click to open the review form.
   */
  async clickWriteReview(): Promise<void> {
    await this.scrollToReviews();
    await this.writeReviewButton.click();
    await expect(this.reviewForm).toBeVisible();
  }

  /**
   * Select a star rating (1-5).
   */
  async selectRating(stars: number): Promise<void> {
    // The interactive stars are buttons within the StarRating component
    const starButtons = this.reviewForm.locator("button").filter({
      has: this.page.locator("svg"),
    });
    // Click the nth star (0-indexed, so stars-1)
    await starButtons.nth(stars - 1).click();
  }

  /**
   * Submit a review with rating and optional content.
   */
  async submitReview(rating: number, title?: string, content?: string): Promise<void> {
    await this.clickWriteReview();
    await this.selectRating(rating);

    if (title) {
      await this.reviewTitleInput.fill(title);
    }
    if (content) {
      await this.reviewContentTextarea.fill(content);
    }

    await this.reviewSubmitButton.click();
    await this.page.waitForResponse(
      (resp) => resp.url().includes("/reviews") && resp.status() === 200
    );
  }

  /**
   * Cancel writing a review.
   */
  async cancelReview(): Promise<void> {
    await this.reviewCancelButton.click();
    await expect(this.reviewForm).toBeHidden();
  }

  /**
   * Check if the user has already reviewed.
   */
  async hasUserReview(): Promise<boolean> {
    return this.userReviewSection.isVisible().catch(() => false);
  }

  /**
   * Assert review form is visible.
   */
  async expectReviewFormVisible(): Promise<void> {
    await expect(this.reviewForm).toBeVisible();
  }

  /**
   * Assert write review button is visible (can review).
   */
  async expectCanWriteReview(): Promise<void> {
    await expect(this.writeReviewButton).toBeVisible();
  }

  /**
   * Assert login prompt is shown for reviews.
   */
  async expectReviewLoginPromptVisible(): Promise<void> {
    await expect(this.reviewLoginPrompt).toBeVisible();
  }

  /**
   * Assert review stats are visible.
   */
  async expectReviewStatsVisible(): Promise<void> {
    await expect(this.reviewsStats).toBeVisible();
    await expect(this.averageRating).toBeVisible();
  }
}
