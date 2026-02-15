/**
 * Checkout Success Page Object.
 *
 * Handles interactions with the post-purchase success page including:
 * - Transaction details display
 * - Navigation to library or material
 */

import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class CheckoutSuccessPage extends BasePage {
  readonly path = "/checkout/success";

  // Success state
  readonly successIcon: Locator;
  readonly successTitle: Locator;
  readonly successDescription: Locator;

  // Loading state
  readonly loadingSpinner: Locator;

  // Error state
  readonly errorIcon: Locator;
  readonly errorTitle: Locator;
  readonly errorMessage: Locator;

  // Not logged in state
  readonly loginPrompt: Locator;
  readonly loginButton: Locator;

  // Purchase details
  readonly purchaseDetailsSection: Locator;
  readonly materialTitle: Locator;
  readonly amountPaid: Locator;
  readonly transactionStatus: Locator;

  // Navigation buttons
  readonly viewMaterialButton: Locator;
  readonly goToLibraryButton: Locator;
  readonly browseMaterialsButton: Locator;

  constructor(page: Page) {
    super(page);

    // Success state elements - match actual German/English translations
    this.successIcon = page.locator(".bg-\\[var\\(--color-success-light\\)\\]").first();
    this.successTitle = page.locator("h1").filter({
      hasText: /kauf abgeschlossen|purchase complete|zahlung wird verarbeitet|payment processing/i,
    });
    this.successDescription = page.locator("p").filter({
      hasText: /material|materialien|zugreifen|access/i,
    });

    // Loading state
    this.loadingSpinner = page.locator(".animate-spin");

    // Error state
    this.errorIcon = page.locator(".bg-\\[var\\(--color-error-light\\)\\]").first();
    this.errorTitle = page.locator("h1").filter({
      hasText: /fehler|error/i,
    });
    this.errorMessage = page.locator("p").filter({
      hasText: /problem|fehler|error|nicht gefunden/i,
    });

    // Not logged in state
    this.loginPrompt = page.locator("text=/nicht angemeldet|not logged in|please log in/i");
    this.loginButton = page.getByRole("link", { name: /anmelden|log in|login/i });

    // Purchase details section
    this.purchaseDetailsSection = page
      .locator("div.rounded-lg")
      .filter({
        has: page.locator("h2"),
      })
      .first();
    this.materialTitle = page
      .locator("span.font-medium")
      .filter({
        hasNot: page.locator("text=/CHF|abgeschlossen|completed|ausstehend|pending/i"),
      })
      .first();
    this.amountPaid = page
      .locator("span.font-medium")
      .filter({
        hasText: /CHF/i,
      })
      .first();
    this.transactionStatus = page
      .locator("span.font-medium")
      .filter({
        hasText: /abgeschlossen|completed|ausstehend|pending/i,
      })
      .first();

    // Navigation buttons
    this.viewMaterialButton = page.getByRole("link", {
      name: /material anzeigen|view material|öffnen/i,
    });
    this.goToLibraryButton = page.getByRole("link", { name: /bibliothek|library/i });
    this.browseMaterialsButton = page.getByRole("link", {
      name: /materialien durchsuchen|browse materials/i,
    });
  }

  /**
   * Navigate to success page with a session ID.
   */
  async gotoWithSession(sessionId: string): Promise<void> {
    await this.page.goto(`/checkout/success?session_id=${sessionId}`);
    await this.waitForPageLoad();
  }

  /**
   * Wait for the page to finish loading.
   */
  async waitForPageLoad(): Promise<void> {
    await super.waitForPageLoad();
    // Wait for loading to complete
    await this.loadingSpinner.waitFor({ state: "hidden", timeout: 10000 }).catch(() => {});
    // Wait for content to appear
    await Promise.race([
      this.successTitle.waitFor({ state: "visible", timeout: 10000 }).catch(() => {}),
      this.errorTitle.waitFor({ state: "visible", timeout: 10000 }).catch(() => {}),
      this.loginPrompt.waitFor({ state: "visible", timeout: 10000 }).catch(() => {}),
    ]);
  }

  /**
   * Expect the success state to be displayed.
   */
  async expectSuccessState(): Promise<void> {
    await expect(this.successTitle).toBeVisible();
    await expect(this.purchaseDetailsSection).toBeVisible();
  }

  /**
   * Expect the error state to be displayed.
   */
  async expectErrorState(): Promise<void> {
    await expect(this.errorTitle).toBeVisible();
  }

  /**
   * Expect the login prompt to be displayed.
   */
  async expectLoginPrompt(): Promise<void> {
    await expect(this.loginPrompt).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Get the displayed material title.
   */
  async getMaterialTitle(): Promise<string | null> {
    return this.materialTitle.textContent();
  }

  /**
   * Get the displayed amount.
   */
  async getAmount(): Promise<string | null> {
    return this.amountPaid.textContent();
  }

  /**
   * Check if the transaction is completed.
   */
  async isTransactionCompleted(): Promise<boolean> {
    const status = await this.transactionStatus.textContent();
    return (
      status?.toLowerCase().includes("abgeschlossen") ||
      status?.toLowerCase().includes("completed") ||
      false
    );
  }

  /**
   * Check if the transaction is pending.
   */
  async isTransactionPending(): Promise<boolean> {
    const status = await this.transactionStatus.textContent();
    return (
      status?.toLowerCase().includes("ausstehend") ||
      status?.toLowerCase().includes("pending") ||
      false
    );
  }

  /**
   * Navigate to view the purchased material.
   */
  async goToMaterial(): Promise<void> {
    await this.viewMaterialButton.click();
    await this.page.waitForURL(/\/materialien\//);
  }

  /**
   * Navigate to the library.
   */
  async goToLibrary(): Promise<void> {
    await this.goToLibraryButton.click();
    await this.page.waitForURL(/\/konto/);
  }
}
