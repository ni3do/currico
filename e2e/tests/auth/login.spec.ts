/**
 * Login flow E2E tests using the LoginPage page object.
 *
 * These tests verify the authentication flow including:
 * - Successful login with valid credentials
 * - Error handling for invalid credentials
 * - Form validation
 * - OAuth button presence
 */

import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/login.page";
import { TEST_BUYER, TEST_ADMIN } from "../../fixtures/test-users";

test.describe("Login Page", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test.describe("Page Load", () => {
    test("displays login form with all elements", async () => {
      await loginPage.expectFormVisible();
      await loginPage.expectOAuthButtonsVisible();

      // Verify page title
      const title = await loginPage.getPageTitleText();
      expect(title).toBeTruthy();
    });

    test("shows register link", async () => {
      await expect(loginPage.registerLink).toBeVisible();
    });

    test("shows forgot password link", async () => {
      await expect(loginPage.forgotPasswordLink).toBeVisible();
    });
  });

  test.describe("Form Validation", () => {
    test("shows email validation error for invalid email format", async () => {
      // Type an invalid email
      await loginPage.fillEmail("invalid-email");
      // Blur the field to trigger validation
      await loginPage.passwordInput.focus();

      // Check for validation error
      await loginPage.expectEmailValidationError();
    });

    test("email field accepts valid email format", async () => {
      await loginPage.fillEmail("valid@example.com");
      await loginPage.passwordInput.focus();

      // Should not show validation error
      const hasError = await loginPage.hasEmailValidationError();
      expect(hasError).toBe(false);
    });
  });

  test.describe("Login Flow", () => {
    test("successful login with buyer credentials redirects to account", async () => {
      await loginPage.loginAndWaitForRedirect(TEST_BUYER, "/konto");

      // Verify we're on the account page
      expect(loginPage.getUrl()).toContain("/konto");
    });

    test("successful login with admin credentials redirects to admin", async () => {
      await loginPage.loginAndWaitForRedirect(TEST_ADMIN, "/admin");

      // Verify we're on the admin page
      expect(loginPage.getUrl()).toContain("/admin");
    });

    test("login with invalid password shows error message", async () => {
      await loginPage.login(TEST_BUYER.email, "WrongPassword123!");

      // Wait for and verify error message
      await loginPage.expectError();
    });

    test("login with non-existent email shows error message", async () => {
      await loginPage.login("nonexistent@example.com", "SomePassword123!");

      // Wait for and verify error message
      await loginPage.expectError();
    });
  });

  test.describe("Navigation", () => {
    test("register link navigates to registration page", async () => {
      await loginPage.goToRegister();

      expect(loginPage.getUrl()).toContain("/registrieren");
    });
  });
});
