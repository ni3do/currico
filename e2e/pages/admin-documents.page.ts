/**
 * Admin Documents Page Object.
 *
 * Handles interactions with the admin moderation interface including:
 * - Filtering resources by status
 * - Opening resource review modal
 * - Verifying, rejecting, or resetting resources
 */

import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export type StatusFilter = "all" | "pending" | "approved" | "draft";

export class AdminDocumentsPage extends BasePage {
  readonly path = "/admin/documents";

  // Filters
  readonly statusFilter: Locator;

  // Table
  readonly resourcesTable: Locator;
  readonly resourceRows: Locator;
  readonly loadingIndicator: Locator;
  readonly emptyMessage: Locator;
  readonly totalCount: Locator;

  // Review modal
  readonly reviewModal: Locator;
  readonly modalTitle: Locator;
  readonly closeModalButton: Locator;

  // Action buttons (inside modal)
  readonly verifyButton: Locator;
  readonly rejectButton: Locator;
  readonly resetButton: Locator;

  // Pagination
  readonly prevPageButton: Locator;
  readonly nextPageButton: Locator;
  readonly pageIndicator: Locator;

  constructor(page: Page) {
    super(page);

    // Status filter dropdown
    this.statusFilter = page.locator("select").filter({
      has: page.locator('option[value="pending"]'),
    });

    // Table elements
    this.resourcesTable = page.locator("table");
    this.resourceRows = page.locator("tbody tr");
    this.loadingIndicator = page.locator("text=Laden...");
    this.emptyMessage = page.locator("text=Keine Dokumente gefunden");
    this.totalCount = page.locator("text=/\\d+ Dokumente gefunden/");

    // Review modal
    this.reviewModal = page.locator(".fixed").filter({
      has: page.locator("text=Dokument prüfen"),
    });
    this.modalTitle = this.reviewModal.locator("h3");
    this.closeModalButton = this.reviewModal
      .locator("button")
      .filter({
        has: page.locator("svg"),
      })
      .first();

    // Action buttons - scoped to modal and located by their text content
    this.verifyButton = this.reviewModal.getByRole("button", { name: /verifizieren/i });
    this.rejectButton = this.reviewModal.getByRole("button", { name: /ablehnen/i });
    this.resetButton = this.reviewModal.getByRole("button", { name: /zurücksetzen/i });

    // Pagination
    this.prevPageButton = page.getByRole("button", { name: /zurück/i });
    this.nextPageButton = page.getByRole("button", { name: /weiter/i });
    this.pageIndicator = page.locator("text=/Seite \\d+ von \\d+/");
  }

  /**
   * Wait for the page to load and resources to appear.
   */
  async waitForPageLoad(): Promise<void> {
    await super.waitForPageLoad();
    // Wait for loading to complete
    await this.loadingIndicator.waitFor({ state: "hidden", timeout: 10000 }).catch(() => {});
    // Wait for table or empty message
    await Promise.race([
      this.resourceRows
        .first()
        .waitFor({ state: "visible", timeout: 10000 })
        .catch(() => {}),
      this.emptyMessage.waitFor({ state: "visible", timeout: 10000 }).catch(() => {}),
    ]);
  }

  /**
   * Select a status filter.
   */
  async selectStatusFilter(status: StatusFilter): Promise<void> {
    await this.statusFilter.selectOption(status);
    await this.waitForPageLoad();
  }

  /**
   * Get the count of resources in the table.
   */
  async getResourceCount(): Promise<number> {
    await this.page.waitForLoadState("networkidle");
    // Exclude the loading and empty message rows
    const rows = this.resourceRows.filter({
      hasNot: this.page.locator("text=Laden..., text=Keine Dokumente gefunden"),
    });
    return rows.count();
  }

  /**
   * Get the total count from the header text.
   */
  async getTotalCount(): Promise<number> {
    const text = await this.totalCount.textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Open the review modal for a resource by title.
   */
  async openReviewModal(resourceTitle: string): Promise<void> {
    const row = this.resourceRows.filter({
      hasText: resourceTitle,
    });
    const reviewButton = row.getByRole("button", { name: /prüfen/i });
    await reviewButton.click();
    await expect(this.reviewModal).toBeVisible();
  }

  /**
   * Close the review modal.
   */
  async closeReviewModal(): Promise<void> {
    await this.closeModalButton.click();
    await expect(this.reviewModal).toBeHidden();
  }

  /**
   * Verify the currently selected resource.
   */
  async verifyResource(): Promise<void> {
    // Dismiss cookie consent if blocking
    await this.dismissCookieConsent();
    await this.verifyButton.click();
    // Modal should close after action
    await expect(this.reviewModal).toBeHidden({ timeout: 5000 });
  }

  /**
   * Reject the currently selected resource.
   */
  async rejectResource(): Promise<void> {
    // Dismiss cookie consent if blocking
    await this.dismissCookieConsent();
    await this.rejectButton.click();
    // Modal should close after action
    await expect(this.reviewModal).toBeHidden({ timeout: 5000 });
  }

  /**
   * Reset the currently selected resource to pending.
   */
  async resetResource(): Promise<void> {
    // Dismiss cookie consent if blocking
    await this.dismissCookieConsent();
    await this.resetButton.click();
    // Modal should close after action
    await expect(this.reviewModal).toBeHidden({ timeout: 5000 });
  }

  /**
   * Check if a resource is visible in the table.
   */
  async expectResourceVisible(title: string): Promise<void> {
    await expect(this.resourceRows.filter({ hasText: title })).toBeVisible();
  }

  /**
   * Check if no resources are shown.
   */
  async expectNoResources(): Promise<void> {
    await expect(this.emptyMessage).toBeVisible();
  }

  /**
   * Get the status badge text for a resource.
   */
  async getResourceStatus(title: string): Promise<string | null> {
    const row = this.resourceRows.filter({ hasText: title });
    const statusBadge = row.locator(".rounded-full").filter({
      hasText: /ausstehend|verifiziert|abgelehnt/i,
    });
    return statusBadge.textContent();
  }

  /**
   * Expect resource to have a specific status.
   */
  async expectResourceStatus(
    title: string,
    status: "PENDING" | "VERIFIED" | "REJECTED"
  ): Promise<void> {
    const statusLabels = {
      PENDING: "Ausstehend",
      VERIFIED: "Verifiziert",
      REJECTED: "Abgelehnt",
    };
    const row = this.resourceRows.filter({ hasText: title });
    await expect(row.locator(`text=${statusLabels[status]}`)).toBeVisible();
  }

  /**
   * Navigate to next page.
   */
  async goToNextPage(): Promise<void> {
    await this.nextPageButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Navigate to previous page.
   */
  async goToPreviousPage(): Promise<void> {
    await this.prevPageButton.click();
    await this.waitForPageLoad();
  }
}
