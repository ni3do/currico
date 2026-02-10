/**
 * Register Page Object for Currico user registration flows.
 *
 * Encapsulates all interactions with the registration page including:
 * - Form field validation (name, email, password, confirm password)
 * - Terms and conditions checkbox
 * - OAuth provider buttons
 * - Error handling and validation messages
 * - Navigation to login page
 */

import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class RegisterPage extends BasePage {
  readonly path = "/register";

  // Form fields
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly termsCheckbox: Locator;
  readonly submitButton: Locator;

  // OAuth buttons
  readonly googleButton: Locator;
  readonly microsoftButton: Locator;
  readonly eduIdButton: Locator;

  // Validation error messages
  readonly emailValidationError: Locator;
  readonly passwordValidationError: Locator;
  readonly confirmPasswordValidationError: Locator;
  readonly formError: Locator;

  // Navigation elements
  readonly loginLink: Locator;
  readonly termsLink: Locator;
  readonly privacyLink: Locator;
  readonly backToHomeLink: Locator;

  // Cookie banner
  readonly cookieBanner: Locator;
  readonly cookieAcceptButton: Locator;
  readonly cookieRejectButton: Locator;

  constructor(page: Page) {
    super(page);

    // Form fields - using IDs from the registration page
    this.nameInput = page.locator("#name");
    this.emailInput = page.locator("#email");
    this.passwordInput = page.locator("#password");
    this.confirmPasswordInput = page.locator("#confirmPassword");
    this.termsCheckbox = page.locator("#terms");
    this.submitButton = page.locator('button[type="submit"]');

    // OAuth buttons - using text content for resilience
    this.googleButton = page.getByRole("button", { name: /google/i });
    this.microsoftButton = page.getByRole("button", { name: /microsoft/i });
    this.eduIdButton = page.getByRole("button", { name: /edu-id/i });

    // Validation error messages - these appear below the corresponding fields
    // The page shows error messages as <p> elements with text-error class
    this.emailValidationError = page.locator("#email").locator("..").locator("p.text-error");
    this.passwordValidationError = page.locator("#password").locator("..").locator("p.text-error");
    this.confirmPasswordValidationError = page
      .locator("#confirmPassword")
      .locator("..")
      .locator("p.text-error");

    // Form-level error (API errors like duplicate email)
    this.formError = page.locator(".border-error.bg-error\\/10");

    // Navigation links
    this.loginLink = page.locator('main a[href*="/anmelden"]');
    this.termsLink = page.locator('label[for="terms"] a').first();
    this.privacyLink = page.locator('label[for="terms"] a').last();
    this.backToHomeLink = page.locator('footer a[href="/"]');

    // Cookie banner
    this.cookieBanner = page.getByRole("dialog", { name: /cookie/i });
    this.cookieAcceptButton = page.getByRole("button", { name: /alle akzeptieren|accept all/i });
    this.cookieRejectButton = page.getByRole("button", { name: /nur essentielle|essential only/i });
  }

  /**
   * Wait for the registration page to be fully loaded.
   */
  async waitForPageLoad(): Promise<void> {
    await super.waitForPageLoad();
    await this.waitForVisible(this.nameInput);
    await this.waitForVisible(this.submitButton);
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

  // ===================
  // Form Field Actions
  // ===================

  /**
   * Fill the name field.
   */
  async fillName(name: string): Promise<void> {
    await this.fillField(this.nameInput, name);
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
   * Fill the confirm password field.
   */
  async fillConfirmPassword(confirmPassword: string): Promise<void> {
    await this.fillField(this.confirmPasswordInput, confirmPassword);
  }

  /**
   * Check the terms and conditions checkbox.
   */
  async acceptTerms(): Promise<void> {
    await this.checkCheckbox(this.termsCheckbox);
  }

  /**
   * Uncheck the terms and conditions checkbox.
   */
  async declineTerms(): Promise<void> {
    await this.uncheckCheckbox(this.termsCheckbox);
  }

  /**
   * Click the submit button to attempt registration.
   */
  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  // ===================
  // Complete Registration Flow
  // ===================

  /**
   * Fill out the complete registration form.
   *
   * @param data - Registration form data
   */
  async fillRegistrationForm(data: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    acceptTerms?: boolean;
  }): Promise<void> {
    await this.fillName(data.name);
    await this.fillEmail(data.email);
    await this.fillPassword(data.password);
    await this.fillConfirmPassword(data.confirmPassword ?? data.password);

    if (data.acceptTerms !== false) {
      await this.acceptTerms();
    }
  }

  /**
   * Perform a complete registration flow.
   *
   * @param data - Registration data
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    acceptTerms?: boolean;
  }): Promise<void> {
    await this.fillRegistrationForm(data);
    await this.clickSubmit();
  }

  /**
   * Register and wait for successful redirect to account page.
   *
   * @param data - Registration data
   */
  async registerAndWaitForSuccess(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<void> {
    await this.register({
      ...data,
      confirmPassword: data.password,
      acceptTerms: true,
    });
    await this.waitForUrl("**/account", { timeout: 15000 });
  }

  // ===================
  // Validation Error Checks
  // ===================

  /**
   * Check if the email field shows validation error state (invalid email format).
   */
  async hasEmailValidationError(): Promise<boolean> {
    const classes = await this.emailInput.getAttribute("class");
    return classes?.includes("border-error") ?? false;
  }

  /**
   * Check if the password field shows validation error state (too short).
   */
  async hasPasswordValidationError(): Promise<boolean> {
    const classes = await this.passwordInput.getAttribute("class");
    return classes?.includes("border-error") ?? false;
  }

  /**
   * Check if the confirm password field shows validation error state (mismatch).
   */
  async hasConfirmPasswordValidationError(): Promise<boolean> {
    const classes = await this.confirmPasswordInput.getAttribute("class");
    return classes?.includes("border-error") ?? false;
  }

  /**
   * Get the email validation error message.
   */
  async getEmailValidationError(): Promise<string | null> {
    const isVisible = await this.emailValidationError.isVisible().catch(() => false);
    if (!isVisible) return null;
    return this.getText(this.emailValidationError);
  }

  /**
   * Get the password validation error message.
   */
  async getPasswordValidationError(): Promise<string | null> {
    const isVisible = await this.passwordValidationError.isVisible().catch(() => false);
    if (!isVisible) return null;
    return this.getText(this.passwordValidationError);
  }

  /**
   * Get the confirm password validation error message.
   */
  async getConfirmPasswordValidationError(): Promise<string | null> {
    const isVisible = await this.confirmPasswordValidationError.isVisible().catch(() => false);
    if (!isVisible) return null;
    return this.getText(this.confirmPasswordValidationError);
  }

  /**
   * Get the form-level error message (e.g., duplicate email).
   */
  async getFormError(): Promise<string | null> {
    const isVisible = await this.formError.isVisible().catch(() => false);
    if (!isVisible) return null;
    return this.getText(this.formError);
  }

  // ===================
  // Assertions
  // ===================

  /**
   * Assert that the email validation error is shown.
   */
  async expectEmailValidationError(): Promise<void> {
    await expect(this.emailValidationError).toBeVisible();
    expect(await this.hasEmailValidationError()).toBe(true);
  }

  /**
   * Assert that the password validation error is shown.
   */
  async expectPasswordValidationError(): Promise<void> {
    await expect(this.passwordValidationError).toBeVisible();
    expect(await this.hasPasswordValidationError()).toBe(true);
  }

  /**
   * Assert that the confirm password validation error is shown.
   */
  async expectConfirmPasswordValidationError(): Promise<void> {
    await expect(this.confirmPasswordValidationError).toBeVisible();
    expect(await this.hasConfirmPasswordValidationError()).toBe(true);
  }

  /**
   * Assert that a form error is displayed.
   */
  async expectFormError(expectedText?: string | RegExp): Promise<void> {
    await expect(this.submitButton).toBeEnabled({ timeout: 15000 });
    await expect(this.formError).toBeVisible({ timeout: 5000 });

    if (expectedText) {
      await expect(this.formError).toContainText(expectedText);
    }
  }

  /**
   * Assert that no form error is displayed.
   */
  async expectNoFormError(): Promise<void> {
    await expect(this.formError).toBeHidden();
  }

  /**
   * Assert that all OAuth buttons are visible.
   */
  async expectOAuthButtonsVisible(): Promise<void> {
    await expect(this.googleButton).toBeVisible();
    await expect(this.microsoftButton).toBeVisible();
    await expect(this.eduIdButton).toBeVisible();
  }

  /**
   * Assert that the registration form is displayed correctly.
   */
  async expectFormVisible(): Promise<void> {
    await expect(this.nameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.confirmPasswordInput).toBeVisible();
    await expect(this.termsCheckbox).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  // ===================
  // Submit Button State
  // ===================

  /**
   * Check if the submit button is in loading state.
   */
  async isSubmitButtonLoading(): Promise<boolean> {
    return this.submitButton.isDisabled();
  }

  // ===================
  // OAuth Actions
  // ===================

  /**
   * Click the Google OAuth button.
   */
  async clickGoogleOAuth(): Promise<void> {
    await this.googleButton.click();
  }

  /**
   * Click the Microsoft OAuth button.
   */
  async clickMicrosoftOAuth(): Promise<void> {
    await this.microsoftButton.click();
  }

  /**
   * Click the edu-ID OAuth button.
   */
  async clickEduIdOAuth(): Promise<void> {
    await this.eduIdButton.click();
  }

  // ===================
  // Navigation
  // ===================

  /**
   * Navigate to the login page via the link.
   */
  async goToLogin(): Promise<void> {
    await this.loginLink.click();
    await this.page.waitForURL("**/login");
  }

  /**
   * Navigate to the terms page.
   */
  async goToTerms(): Promise<void> {
    await this.termsLink.click();
  }

  /**
   * Navigate to the privacy policy page.
   */
  async goToPrivacy(): Promise<void> {
    await this.privacyLink.click();
  }

  /**
   * Navigate back to home page.
   */
  async goToHome(): Promise<void> {
    await this.backToHomeLink.click();
    await this.page.waitForURL(/\/$/);
  }

  // ===================
  // Page Info
  // ===================

  /**
   * Get the page title text.
   */
  async getPageTitleText(): Promise<string | null> {
    const heading = this.page.locator("h1");
    return this.getText(heading);
  }

  /**
   * Get the page subtitle text.
   */
  async getPageSubtitleText(): Promise<string | null> {
    const subtitle = this.page.locator("h1 + p");
    return this.getText(subtitle);
  }
}
