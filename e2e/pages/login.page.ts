/**
 * Login Page Object for Currico authentication flows.
 *
 * Encapsulates all interactions with the login page including:
 * - Credential-based login
 * - OAuth provider buttons
 * - Form validation
 * - Error handling
 */

import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";
import type { TestUser } from "../fixtures/test-users";

export class LoginPage extends BasePage {
  readonly path = "/anmelden";

  // Form elements
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly submitButton: Locator;

  // OAuth buttons
  readonly googleButton: Locator;
  readonly eduIdButton: Locator;

  // Error and validation elements
  readonly errorMessage: Locator;
  readonly emailValidationError: Locator;

  // Navigation elements
  readonly registerLink: Locator;
  readonly forgotPasswordLink: Locator;
  readonly backToHomeLink: Locator;

  // Cookie banner
  readonly cookieBanner: Locator;
  readonly cookieAcceptButton: Locator;
  readonly cookieRejectButton: Locator;

  constructor(page: Page) {
    super(page);

    // Form elements
    this.emailInput = page.locator("#email");
    this.passwordInput = page.locator("#password");
    this.rememberMeCheckbox = page.locator("#remember");
    this.submitButton = page.locator('button[type="submit"]');

    // OAuth buttons - using text content for resilience
    this.googleButton = page.getByRole("button", { name: /google/i });
    this.eduIdButton = page.getByRole("button", { name: /edu-id/i });

    // Error display - use role-based selector for reliability
    this.errorMessage = page
      .locator("div")
      .filter({ hasText: /^.+$/ })
      .filter({ has: page.locator(".border-error") })
      .first();
    this.emailValidationError = page.locator("p.text-error");

    // Navigation links - use the link inside the form area (not the header link)
    this.registerLink = page.locator('main a[href*="/registrieren"]');
    this.forgotPasswordLink = page.locator('a[href*="/forgot-password"]');
    this.backToHomeLink = page.locator('footer a[href="/"]');

    // Cookie banner
    this.cookieBanner = page.getByRole("dialog", { name: /cookie/i });
    this.cookieAcceptButton = page.getByRole("button", { name: /alle akzeptieren|accept all/i });
    this.cookieRejectButton = page.getByRole("button", { name: /nur essentielle|essential only/i });
  }

  /**
   * Wait for the login page to be fully loaded.
   */
  async waitForPageLoad(): Promise<void> {
    await super.waitForPageLoad();
    await this.waitForVisible(this.emailInput);
    await this.waitForVisible(this.submitButton);
    // Dismiss cookie banner if present
    await this.dismissCookieBannerIfPresent();
  }

  /**
   * Dismiss the cookie banner if it's visible.
   */
  async dismissCookieBannerIfPresent(): Promise<void> {
    const isVisible = await this.cookieBanner.isVisible().catch(() => false);
    if (isVisible) {
      await this.cookieRejectButton.click();
      await expect(this.cookieBanner).toBeHidden({ timeout: 3000 });
    }
  }

  /**
   * Fill the email field.
   */
  async fillEmail(email: string): Promise<void> {
    await this.fillField(this.emailInput, email);
  }

  /**
   * Fill the password field.
   */
  async fillPassword(password: string): Promise<void> {
    await this.fillField(this.passwordInput, password);
  }

  /**
   * Check the "Remember me" checkbox.
   */
  async checkRememberMe(): Promise<void> {
    await this.checkCheckbox(this.rememberMeCheckbox);
  }

  /**
   * Uncheck the "Remember me" checkbox.
   */
  async uncheckRememberMe(): Promise<void> {
    await this.uncheckCheckbox(this.rememberMeCheckbox);
  }

  /**
   * Click the submit button to attempt login.
   */
  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Perform a complete login flow with credentials.
   *
   * @param email - User email
   * @param password - User password
   * @param options - Optional settings for the login
   */
  async login(email: string, password: string, options?: { rememberMe?: boolean }): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);

    if (options?.rememberMe) {
      await this.checkRememberMe();
    }

    await this.clickSubmit();
  }

  /**
   * Login with a test user object.
   */
  async loginAsUser(user: TestUser, options?: { rememberMe?: boolean }): Promise<void> {
    await this.login(user.email, user.password, options);
  }

  /**
   * Login and wait for successful redirect.
   * Use this when you expect the login to succeed.
   *
   * @param user - Test user credentials
   * @param expectedPath - Expected URL path after login (e.g., '/account' or '/admin')
   */
  async loginAndWaitForRedirect(user: TestUser, expectedPath?: string): Promise<void> {
    const targetPath = expectedPath ?? (user.role === "ADMIN" ? "/admin" : "/konto");
    await this.loginAsUser(user);
    await this.waitForUrl(`**${targetPath}`, { timeout: 15000 });
  }

  /**
   * Get the current error message displayed on the page.
   * Returns null if no error is visible.
   */
  async getErrorMessage(): Promise<string | null> {
    const isVisible = await this.errorMessage.isVisible().catch(() => false);
    if (!isVisible) return null;
    return this.getText(this.errorMessage);
  }

  /**
   * Get the email validation error message.
   * Returns null if no validation error is visible.
   */
  async getEmailValidationError(): Promise<string | null> {
    const isVisible = await this.emailValidationError.isVisible().catch(() => false);
    if (!isVisible) return null;
    return this.getText(this.emailValidationError);
  }

  /**
   * Check if the email input shows validation error state.
   */
  async hasEmailValidationError(): Promise<boolean> {
    const classes = await this.emailInput.getAttribute("class");
    return classes?.includes("border-error") ?? false;
  }

  /**
   * Assert that an error message is displayed.
   * Waits for the submit button to be enabled (form submission complete) first.
   */
  async expectError(expectedText?: string | RegExp): Promise<void> {
    // Wait for form submission to complete (button becomes enabled again)
    await expect(this.submitButton).toBeEnabled({ timeout: 15000 });

    // Wait for error message to appear with longer timeout
    const errorDiv = this.page.locator(".border-error.bg-error\\/10");
    await expect(errorDiv).toBeVisible({ timeout: 5000 });

    if (expectedText) {
      await expect(errorDiv).toContainText(expectedText);
    }
  }

  /**
   * Assert that no error message is displayed.
   */
  async expectNoError(): Promise<void> {
    await expect(this.errorMessage).toBeHidden();
  }

  /**
   * Assert that email validation error is shown.
   */
  async expectEmailValidationError(): Promise<void> {
    await expect(this.emailValidationError).toBeVisible();
    expect(await this.hasEmailValidationError()).toBe(true);
  }

  /**
   * Check if the submit button is in loading state.
   */
  async isSubmitButtonLoading(): Promise<boolean> {
    const isDisabled = await this.submitButton.isDisabled();
    const text = await this.submitButton.textContent();
    // The button shows different text when loading
    return isDisabled || text?.toLowerCase().includes("anmelden") === false;
  }

  /**
   * Click the Google OAuth button.
   */
  async clickGoogleOAuth(): Promise<void> {
    await this.googleButton.click();
  }

  /**
   * Click the edu-ID OAuth button.
   */
  async clickEduIdOAuth(): Promise<void> {
    await this.eduIdButton.click();
  }

  /**
   * Navigate to the registration page via the link.
   */
  async goToRegister(): Promise<void> {
    await this.registerLink.click();
    await this.page.waitForURL("**/registrieren");
  }

  /**
   * Navigate to the forgot password page.
   */
  async goToForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  /**
   * Navigate back to home page.
   */
  async goToHome(): Promise<void> {
    await this.backToHomeLink.click();
    await this.page.waitForURL(/\/$/);
  }

  /**
   * Assert that all OAuth buttons are visible.
   */
  async expectOAuthButtonsVisible(): Promise<void> {
    await expect(this.googleButton).toBeVisible();
  }

  /**
   * Get the page title text.
   */
  async getPageTitleText(): Promise<string | null> {
    const heading = this.page.locator("h1");
    return this.getText(heading);
  }

  /**
   * Assert that the login form is displayed correctly.
   */
  async expectFormVisible(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.rememberMeCheckbox).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }
}
