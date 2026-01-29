# Playwright E2E Testing Implementation Plan

This plan sets up comprehensive end-to-end browser testing for Currico using Playwright.

## Phase 1: Playwright Infrastructure Setup

- [ ] Install Playwright dependencies (`@playwright/test`) and add npm scripts (`test:e2e`, `test:e2e:ui`, `test:e2e:headed`)
- [ ] Create `playwright.config.ts` with projects for chromium, firefox, webkit and webServer config for dev server
- [ ] Create `e2e/fixtures/test-fixtures.ts` with authenticated user fixtures (buyer, seller, admin) using storageState
- [ ] Create `e2e/helpers/test-utils.ts` with common helpers (login, waitForNavigation, assertToast, etc.)
- [ ] Create `e2e/helpers/db-seed.ts` with test data seeding utilities (createTestUser, createTestResource, cleanup)
- [ ] Add `e2e/.auth/` directory to `.gitignore` for storing authentication state files

## Phase 2: Authentication E2E Tests

- [ ] Create `e2e/auth/login.spec.ts` testing: successful login, invalid credentials, form validation, redirect after login
- [ ] Create `e2e/auth/register.spec.ts` testing: successful registration, duplicate email, password validation, terms checkbox
- [ ] Create `e2e/auth/logout.spec.ts` testing: logout from various pages, session cleared
- [ ] Create `e2e/auth/protected-routes.spec.ts` testing: redirect to login for protected pages (/account, /admin, /upload)

## Phase 3: Public Pages E2E Tests

- [ ] Create `e2e/public/homepage.spec.ts` testing: hero section renders, search works, navigation links, locale switcher
- [ ] Create `e2e/public/resources-browse.spec.ts` testing: resource grid loads, pagination, subject filter chips work
- [ ] Create `e2e/public/resource-detail.spec.ts` testing: resource info displays, seller info, price shown, buy button visible
- [ ] Create `e2e/public/static-pages.spec.ts` testing: /about, /faq, /terms, /privacy, /contact pages load without errors

## Phase 4: Buyer Flow E2E Tests

- [ ] Create `e2e/buyer/account-dashboard.spec.ts` testing: dashboard loads, library section, settings accessible
- [ ] Create `e2e/buyer/wishlist.spec.ts` testing: add to wishlist, remove from wishlist, wishlist page shows items
- [ ] Create `e2e/buyer/collections.spec.ts` testing: create collection, add resource, remove resource, delete collection
- [ ] Create `e2e/buyer/profile.spec.ts` testing: edit profile form, avatar upload preview, save changes

## Phase 5: Seller Flow E2E Tests

- [ ] Create `e2e/seller/become-seller.spec.ts` testing: navigation to become-seller, terms acceptance flow
- [ ] Create `e2e/seller/dashboard.spec.ts` testing: seller dashboard loads with stats, resources list, transaction history
- [ ] Create `e2e/seller/upload-resource.spec.ts` testing: 4-step wizard navigation, form validation, draft saving
- [ ] Create `e2e/seller/manage-resources.spec.ts` testing: edit resource, unpublish resource, view resource stats

## Phase 6: Admin Flow E2E Tests

- [ ] Create `e2e/admin/admin-access.spec.ts` testing: admin can access /admin, non-admin redirected
- [ ] Create `e2e/admin/dashboard.spec.ts` testing: stats cards load, recent activity shown
- [ ] Create `e2e/admin/user-management.spec.ts` testing: user list pagination, search users, view user detail
- [ ] Create `e2e/admin/resource-moderation.spec.ts` testing: pending resources list, approve/reject workflow
- [ ] Create `e2e/admin/reports.spec.ts` testing: reports list, status change flow (Open → In Review → Resolved)

## Phase 7: Checkout & Download E2E Tests

- [ ] Create `e2e/checkout/guest-checkout.spec.ts` testing: guest email form, redirect to Stripe (mocked)
- [ ] Create `e2e/checkout/authenticated-checkout.spec.ts` testing: logged-in user checkout, Stripe redirect
- [ ] Create `e2e/checkout/success-page.spec.ts` testing: success page displays purchase info, download link
- [ ] Create `e2e/download/download-token.spec.ts` testing: download via token, expiry handling, download count

## Phase 8: Internationalization E2E Tests

- [ ] Create `e2e/i18n/locale-switching.spec.ts` testing: switch de→en, URL updates, content changes
- [ ] Create `e2e/i18n/locale-persistence.spec.ts` testing: locale preserved on navigation, correct default locale

## Phase 9: Accessibility & Error Handling E2E Tests

- [ ] Create `e2e/accessibility/keyboard-navigation.spec.ts` testing: tab order, focus management, skip links
- [ ] Create `e2e/accessibility/aria-labels.spec.ts` testing: buttons have labels, images have alt text
- [ ] Create `e2e/errors/404-page.spec.ts` testing: 404 page displays for unknown routes
- [ ] Create `e2e/errors/api-error-handling.spec.ts` testing: graceful error messages when API fails

## Phase 10: CI/CD Integration

- [ ] Create `.github/workflows/e2e-tests.yml` running Playwright on PR and push to main
- [ ] Configure Playwright to generate HTML report and upload as artifact
- [ ] Add Playwright sharding for parallel test execution in CI
- [ ] Create `e2e/global-setup.ts` for CI database seeding and test user creation

---

## Acceptance Criteria

Each test file must:
1. Pass in CI with chromium, firefox, and webkit
2. Use page objects or fixtures for reusability
3. Not depend on external services (Stripe, OAuth providers) - use mocks
4. Clean up test data after each test suite
5. Have descriptive test names explaining the expected behavior

## Test Data Strategy

- Use Prisma to seed minimal test data before each test suite
- Create isolated test users with unique emails (e.g., `test-{timestamp}@example.com`)
- Reset database state between test suites using transactions or truncation
- Store authentication state in `e2e/.auth/` for session reuse across tests
