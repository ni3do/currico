/**
 * Resource Detail Page Object.
 *
 * Handles interactions with the resource detail page including:
 * - Resource information display (title, description, price)
 * - Buy/Download actions
 * - Wishlist functionality
 * - Seller info
 * - Report modal
 */

import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class ResourceDetailPage extends BasePage {
  // Path is dynamic - set via constructor or navigation
  readonly path = "/resources";

  // Resource info
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

  // Related resources
  readonly relatedResourcesSection: Locator;
  readonly relatedResourceCards: Locator;

  // Breadcrumb
  readonly breadcrumb: Locator;

  // Error states
  readonly notFoundMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Resource info
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

    // Related resources
    this.relatedResourcesSection = page.locator("text=Ähnliche Ressourcen").locator("..");
    this.relatedResourceCards = page
      .locator("h2")
      .filter({ hasText: /ähnliche/i })
      .locator("..")
      .locator('a[href*="/resources/"]');

    // Breadcrumb
    this.breadcrumb = page
      .locator("nav")
      .filter({ hasText: /ressourcen/i })
      .first();

    // Error states
    this.notFoundMessage = page.locator("text=/nicht gefunden|not found/i");
    this.errorMessage = page.locator("text=/fehler beim laden|error loading/i");
  }

  /**
   * Navigate to a specific resource by ID.
   */
  async gotoResource(resourceId: string): Promise<void> {
    await this.page.goto(`/resources/${resourceId}`);
    await this.waitForPageLoad();
  }

  /**
   * Wait for the resource detail page to finish loading.
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
   * Get the resource title text.
   */
  async getResourceTitle(): Promise<string | null> {
    return this.title.textContent();
  }

  /**
   * Get the resource price text.
   */
  async getPrice(): Promise<string | null> {
    return this.price.textContent();
  }

  /**
   * Check if this is a free resource.
   */
  async isFreeResource(): Promise<boolean> {
    const priceText = await this.getPrice();
    return (
      priceText?.toLowerCase().includes("gratis") ||
      priceText?.toLowerCase().includes("kostenlos") ||
      false
    );
  }

  /**
   * Check if this is a paid resource.
   */
  async isPaidResource(): Promise<boolean> {
    const priceText = await this.getPrice();
    return priceText?.includes("CHF") || false;
  }

  /**
   * Click the buy button (for paid resources).
   */
  async clickBuy(): Promise<void> {
    await this.buyButton.click();
  }

  /**
   * Click the download button (for free resources).
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
   * Check if resource is wishlisted (heart is filled).
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
    await this.page.waitForURL(/\/resources$/);
  }

  /**
   * Assert resource details are visible.
   */
  async expectResourceVisible(): Promise<void> {
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
}
