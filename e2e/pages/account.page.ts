/**
 * Account Page Object.
 *
 * Handles interactions with the user's account dashboard including:
 * - Library (purchased/free resources)
 * - Uploads (seller's own resources)
 * - Wishlist
 * - Settings navigation
 */

import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export type AccountTab = "overview" | "library" | "uploads" | "wishlist";

export class AccountPage extends BasePage {
  readonly path = "/account";

  // Tab navigation
  readonly libraryTab: Locator;
  readonly uploadsTab: Locator;
  readonly wishlistTab: Locator;
  readonly overviewTab: Locator;

  // Resource cards
  readonly resourceCards: Locator;

  // Upload action
  readonly uploadButton: Locator;

  // Empty state messages
  readonly emptyLibraryMessage: Locator;
  readonly emptyUploadsMessage: Locator;
  readonly emptyWishlistMessage: Locator;

  // Stats display
  readonly statsSection: Locator;

  constructor(page: Page) {
    super(page);

    // Tab navigation - using German labels from the UI
    this.libraryTab = page.getByRole("button", { name: /bibliothek/i });
    this.uploadsTab = page.getByRole("button", { name: /meine uploads/i });
    this.wishlistTab = page.getByRole("button", { name: /wunschliste/i });
    this.overviewTab = page.getByRole("button", { name: /übersicht/i });

    // Resource cards - DashboardResourceCard elements contain links to resources
    // They are inside a grid container and have a specific structure
    this.resourceCards = page.locator('.grid a[href*="/resources/"]').locator("..");

    // Upload button - link to /upload page (use href to be specific)
    this.uploadButton = page.locator('a[href="/upload"], a[href*="/upload"]').first();

    // Empty state messages
    this.emptyLibraryMessage = page.locator(
      "text=/keine ressourcen|keine materialien|your library is empty/i"
    );
    this.emptyUploadsMessage = page.locator(
      "text=/keine uploads|noch keine materialien hochgeladen/i"
    );
    this.emptyWishlistMessage = page.locator(
      "text=/wunschliste ist leer|keine einträge|no wishlist items/i"
    );

    // Stats section
    this.statsSection = page.locator('[data-testid="stats"], .stats-grid, .stats');
  }

  /**
   * Navigate to a specific tab.
   */
  async switchToTab(tab: AccountTab): Promise<void> {
    // Dismiss cookie consent if blocking
    await this.dismissCookieConsent();

    const tabLocator = {
      overview: this.overviewTab,
      library: this.libraryTab,
      uploads: this.uploadsTab,
      wishlist: this.wishlistTab,
    }[tab];

    await tabLocator.click();
    // Wait for content to update
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Navigate to account page with a specific tab via URL.
   */
  async gotoTab(tab: AccountTab): Promise<void> {
    await this.page.goto(`/account?tab=${tab}`);
    await this.waitForPageLoad();
    // Dismiss cookie consent if blocking
    await this.dismissCookieConsent();
  }

  /**
   * Get the count of visible resource cards.
   */
  async getResourceCount(): Promise<number> {
    await this.page.waitForLoadState("networkidle");
    return this.resourceCards.count();
  }

  /**
   * Check if a resource with the given title is visible.
   */
  async expectResourceWithTitle(title: string): Promise<void> {
    await expect(this.page.locator(`text="${title}"`).first()).toBeVisible();
  }

  /**
   * Click on a resource card by title.
   */
  async clickResourceByTitle(title: string): Promise<void> {
    await this.page.locator(`text="${title}"`).first().click();
  }

  /**
   * Navigate to the upload wizard.
   */
  async goToUpload(): Promise<void> {
    await this.uploadButton.click();
    await this.page.waitForURL(/\/upload/);
  }

  /**
   * Get status badge text for a resource by title.
   */
  async getResourceStatus(title: string): Promise<string | null> {
    const card = this.page
      .locator("article, div")
      .filter({
        hasText: title,
      })
      .first();
    const badge = card
      .locator('.badge, [class*="badge"], span')
      .filter({
        hasText: /ausstehend|verifiziert|pending|verified/i,
      })
      .first();
    return badge.textContent();
  }

  /**
   * Check if the library is empty.
   */
  async isLibraryEmpty(): Promise<boolean> {
    const count = await this.getResourceCount();
    return count === 0;
  }

  /**
   * Expect the library tab to be active.
   */
  async expectLibraryTabActive(): Promise<void> {
    await expect(this.libraryTab).toHaveAttribute("aria-selected", "true");
  }

  /**
   * Expect the uploads tab to be active.
   */
  async expectUploadsTabActive(): Promise<void> {
    await expect(this.uploadsTab).toHaveAttribute("aria-selected", "true");
  }

  /**
   * Expect the wishlist tab to be active.
   */
  async expectWishlistTabActive(): Promise<void> {
    await expect(this.wishlistTab).toHaveAttribute("aria-selected", "true");
  }

  /**
   * Wait for the page to finish loading.
   */
  async waitForPageLoad(): Promise<void> {
    await super.waitForPageLoad();
    // Wait for either content or empty state
    await Promise.race([
      this.resourceCards
        .first()
        .waitFor({ state: "visible", timeout: 10000 })
        .catch(() => {}),
      this.emptyLibraryMessage.waitFor({ state: "visible", timeout: 10000 }).catch(() => {}),
      this.statsSection.waitFor({ state: "visible", timeout: 10000 }).catch(() => {}),
    ]);
  }
}
