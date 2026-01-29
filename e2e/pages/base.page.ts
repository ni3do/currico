/**
 * Base Page Object class providing common utilities for all page objects.
 *
 * All page objects should extend this class to inherit common functionality
 * like navigation helpers, wait utilities, and element interactions.
 */

import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;

  /**
   * The path segment for this page (e.g., '/login', '/resources').
   * Override in subclasses to define the page's URL path.
   */
  abstract readonly path: string;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to this page using the configured path.
   * The base URL (including locale prefix) is set in the Playwright config.
   */
  async goto(): Promise<void> {
    await this.page.goto(this.path);
    await this.waitForPageLoad();
  }

  /**
   * Navigate to a specific URL path.
   */
  async gotoPath(path: string): Promise<void> {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  /**
   * Wait for the page to finish loading.
   * Override in subclasses if specific load indicators are needed.
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Get the current page URL.
   */
  getUrl(): string {
    return this.page.url();
  }

  /**
   * Get the current page title.
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Check if the current URL matches the expected path.
   */
  async isOnPage(): Promise<boolean> {
    const url = this.getUrl();
    return url.includes(this.path);
  }

  /**
   * Wait for URL to contain the specified path.
   */
  async waitForUrl(urlPattern: string | RegExp, options?: { timeout?: number }): Promise<void> {
    await this.page.waitForURL(urlPattern, options);
  }

  /**
   * Wait for an element to be visible.
   */
  async waitForVisible(locator: Locator, options?: { timeout?: number }): Promise<void> {
    await expect(locator).toBeVisible(options);
  }

  /**
   * Wait for an element to be hidden.
   */
  async waitForHidden(locator: Locator, options?: { timeout?: number }): Promise<void> {
    await expect(locator).toBeHidden(options);
  }

  /**
   * Fill a form field and optionally verify the value was set.
   */
  async fillField(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  /**
   * Click an element and wait for any resulting navigation or network activity.
   */
  async clickAndWait(locator: Locator): Promise<void> {
    await locator.click();
  }

  /**
   * Check a checkbox if it's not already checked.
   */
  async checkCheckbox(locator: Locator): Promise<void> {
    await locator.check();
  }

  /**
   * Uncheck a checkbox if it's checked.
   */
  async uncheckCheckbox(locator: Locator): Promise<void> {
    await locator.uncheck();
  }

  /**
   * Get the text content of an element.
   */
  async getText(locator: Locator): Promise<string | null> {
    return locator.textContent();
  }

  /**
   * Get the value of an input element.
   */
  async getInputValue(locator: Locator): Promise<string> {
    return locator.inputValue();
  }

  /**
   * Check if an element has a specific CSS class.
   */
  async hasClass(locator: Locator, className: string): Promise<boolean> {
    const classes = await locator.getAttribute('class');
    return classes?.includes(className) ?? false;
  }

  /**
   * Take a screenshot of the current page state.
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png` });
  }

  /**
   * Get the locale from the current URL.
   */
  getLocale(): 'de' | 'en' {
    const url = this.getUrl();
    if (url.includes('/en')) return 'en';
    return 'de';
  }
}
