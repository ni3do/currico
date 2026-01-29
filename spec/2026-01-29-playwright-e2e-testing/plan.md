# Playwright E2E Testing Implementation Plan

This plan outlines the tasks to expand E2E test coverage for the Currico platform. The infrastructure is already in place (playwright.config.ts, global setup, auth fixtures, page objects). This plan focuses on creating comprehensive test coverage for all user flows.

## Current State

**Implemented:**
- ✓ Playwright configuration with multi-browser, multi-locale support
- ✓ Global setup with authenticated session storage
- ✓ Auth fixtures for buyer, seller, admin, school roles
- ✓ Base page object class
- ✓ Login page object and tests
- ✓ Smoke tests
- ✓ Test users and seed data script

**Gap Analysis:**
- Missing page objects for most pages (33 pages, only 1 has page object)
- Missing tests for resources catalog, admin, seller dashboard, registration, etc.
- No visual regression tests
- No API testing utilities

---

## Phase 1: Core Page Objects

Create page objects for high-traffic, high-value pages.

- [ ] Create RegisterPage page object (`e2e/pages/register.page.ts`)
  - Form fields: email, password, displayName, role selector
  - OAuth buttons
  - Validation error handling
  - Success redirect verification

- [ ] Create HomePage page object (`e2e/pages/home.page.ts`)
  - Navigation elements
  - Featured resources section
  - Search functionality
  - CTA buttons

- [ ] Create ResourcesPage page object (`e2e/pages/resources.page.ts`)
  - Resource grid/list
  - Filter sidebar (subject, cycle, price range)
  - Search bar
  - Sorting controls
  - Pagination

- [ ] Create ResourceDetailPage page object (`e2e/pages/resource-detail.page.ts`)
  - Title, description, price display
  - Buy/Download CTA
  - Preview gallery
  - Seller info section
  - Wishlist button
  - Related resources

- [ ] Create AccountPage page object (`e2e/pages/account.page.ts`)
  - Profile summary
  - Recent purchases
  - Collections/wishlists
  - Settings link
  - Logout functionality

- [ ] Create ProfileEditPage page object (`e2e/pages/profile-edit.page.ts`)
  - Edit form fields
  - Avatar upload area
  - Save/cancel actions
  - Validation handling

---

## Phase 2: Authentication & Registration Tests

- [ ] Create registration flow tests (`e2e/tests/auth/register.spec.ts`)
  - Successful registration with valid data
  - Email validation error handling
  - Password strength validation
  - Duplicate email handling
  - Role selection (buyer vs seller)
  - OAuth button presence verification

- [ ] Expand login tests with edge cases (`e2e/tests/auth/login.spec.ts`)
  - Remember me functionality verification
  - Session persistence after browser close
  - Concurrent session handling
  - Logout flow verification

- [ ] Create password reset flow tests (`e2e/tests/auth/password-reset.spec.ts`)
  - Request reset email (UI only, can't test email receipt)
  - Invalid email handling
  - Navigation from login page

---

## Phase 3: Resource Catalog Tests

- [ ] Create resource browsing tests (`e2e/tests/resources/browse.spec.ts`)
  - Page loads with resource grid
  - Resource cards display correct info (title, price, subject)
  - Clicking card navigates to detail page
  - Empty state handling

- [ ] Create resource filtering tests (`e2e/tests/resources/filter.spec.ts`)
  - Filter by subject
  - Filter by cycle
  - Filter by price (free/paid)
  - Combined filters
  - Filter persistence after navigation
  - Clear filters functionality

- [ ] Create resource search tests (`e2e/tests/resources/search.spec.ts`)
  - Search by title
  - Search by keyword
  - No results handling
  - Search result highlighting

- [ ] Create resource detail tests (`e2e/tests/resources/detail.spec.ts`)
  - Detail page displays all metadata
  - Preview gallery navigation
  - Seller info link works
  - Related resources displayed
  - Buy button visibility (paid)
  - Download button visibility (free)

---

## Phase 4: Wishlist & Collections Tests

- [ ] Create wishlist tests (`e2e/tests/wishlist/wishlist.spec.ts`)
  - Add resource to wishlist (authenticated)
  - Remove resource from wishlist
  - Wishlist heart icon state
  - Wishlist page displays saved items
  - Unauthenticated wishlist redirect to login

- [ ] Create collections tests (`e2e/tests/collections/collections.spec.ts`)
  - View collections page
  - Create new collection
  - Add resource to collection
  - Remove resource from collection
  - Delete collection
  - Collection visibility toggle

---

## Phase 5: Admin Panel Tests

Create admin page objects and tests for quality assurance workflows.

- [ ] Create AdminDashboardPage page object (`e2e/pages/admin/dashboard.page.ts`)
  - Stats overview
  - Navigation to sub-sections
  - Quick actions

- [ ] Create AdminUsersPage page object (`e2e/pages/admin/users.page.ts`)
  - User list table
  - Search/filter users
  - User detail view
  - Role change controls

- [ ] Create AdminDocumentsPage page object (`e2e/pages/admin/documents.page.ts`)
  - Documents queue list
  - Status filter (Pending, AI-Checked, Verified)
  - Document detail view
  - Status change controls

- [ ] Create AdminReportsPage page object (`e2e/pages/admin/reports.page.ts`)
  - Reports list
  - Status filter (Open, In Review, Resolved)
  - Report detail view
  - Resolution actions

- [ ] Create admin dashboard tests (`e2e/tests/admin/dashboard.spec.ts`)
  - Admin can access dashboard
  - Stats display correctly
  - Navigation works
  - Non-admin redirect handling

- [ ] Create admin user management tests (`e2e/tests/admin/users.spec.ts`)
  - View user list
  - Search for users
  - View user details
  - Role restrictions (can't demote self)

- [ ] Create admin document moderation tests (`e2e/tests/admin/documents.spec.ts`)
  - View pending documents
  - Change document status
  - Add internal notes
  - Filter by status

- [ ] Create admin reports tests (`e2e/tests/admin/reports.spec.ts`)
  - View open reports
  - Update report status
  - Resolve/dismiss reports

---

## Phase 6: Seller Dashboard Tests

- [ ] Create SellerDashboardPage page object (`e2e/pages/seller/dashboard.page.ts`)
  - Earnings overview
  - Resources list
  - Recent transactions
  - Upload CTA

- [ ] Create seller dashboard tests (`e2e/tests/seller/dashboard.spec.ts`)
  - Seller can access dashboard
  - Earnings display correctly
  - Resources listed with stats
  - Transaction history visible

- [ ] Create seller onboarding tests (`e2e/tests/seller/onboarding.spec.ts`)
  - Become seller page loads
  - Terms acceptance flow
  - Stripe Connect redirect (UI verification only)
  - Onboarding completion page

---

## Phase 7: Upload Flow Tests (UI Only)

The upload functionality is UI-only (no backend), so tests verify UI behavior.

- [ ] Create UploadPage page object (`e2e/pages/upload.page.ts`)
  - Step indicators
  - Form fields per step
  - Navigation (next/back)
  - Validation messages

- [ ] Create upload wizard tests (`e2e/tests/upload/wizard.spec.ts`)
  - Step 1: Basics form validation
  - Step 2: Curriculum tag selection
  - Step 3: Properties and pricing
  - Step navigation (forward/back)
  - Form state persistence between steps
  - Cancel flow

---

## Phase 8: Checkout Flow Tests (UI Only)

- [ ] Create checkout success/cancel tests (`e2e/tests/checkout/flow.spec.ts`)
  - Success page displays confirmation
  - Cancel page displays message
  - Navigation from checkout pages

---

## Phase 9: Static Pages Tests

- [ ] Create static pages tests (`e2e/tests/static/pages.spec.ts`)
  - About page loads
  - FAQ page loads
  - Terms page loads
  - Privacy page loads
  - Impressum page loads
  - Cookies page loads
  - Contact page loads and form displays

---

## Phase 10: Internationalization Tests

- [ ] Create i18n tests (`e2e/tests/i18n/locale.spec.ts`)
  - German locale page content
  - English locale page content
  - Language switcher functionality
  - URL locale prefix handling
  - Locale persistence

---

## Phase 11: Mobile Responsiveness Tests

- [ ] Create mobile navigation tests (`e2e/tests/mobile/navigation.spec.ts`)
  - Mobile menu toggle
  - Mobile menu navigation
  - Touch-friendly interactions

- [ ] Create mobile layout tests (`e2e/tests/mobile/layout.spec.ts`)
  - Resource grid adapts to mobile
  - Forms are usable on mobile
  - Buttons have appropriate touch targets

---

## Phase 12: Accessibility Tests

- [ ] Create accessibility audit tests (`e2e/tests/a11y/audit.spec.ts`)
  - Run axe-core on key pages
  - Verify keyboard navigation
  - Check focus management
  - Screen reader landmark regions

---

## Phase 13: Error Handling Tests

- [ ] Create error page tests (`e2e/tests/errors/pages.spec.ts`)
  - 404 page for invalid routes
  - Error boundary handling
  - API error display to users

---

## Phase 14: Test Infrastructure Improvements

- [ ] Add npm script for seeding test data (`package.json`)
  - Add `test:e2e:seed` script
  - Integrate seed into global setup

- [ ] Create test data factory utilities (`e2e/fixtures/factories.ts`)
  - Resource factory
  - User factory
  - Collection factory

- [ ] Add visual regression testing setup
  - Install @playwright/test visual comparisons
  - Create baseline screenshots for key pages
  - Add visual comparison to smoke tests

---

## Acceptance Criteria

Each phase is complete when:
1. All page objects compile without TypeScript errors
2. All tests pass on chromium-de project
3. Tests use the auth fixtures appropriately (buyerPage, sellerPage, adminPage)
4. Page objects follow the established BasePage pattern
5. Tests are organized in logical describe blocks
6. No hardcoded timeouts (use Playwright's built-in waiting)

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode for debugging
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/tests/auth/login.spec.ts

# Run tests for a specific project (browser/locale)
npx playwright test --project=chromium-de
```
