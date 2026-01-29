# Playwright E2E Testing Implementation Plan

This plan covers the implementation of comprehensive E2E browser tests for Currico using Playwright.

## Current State

**Implemented:**
- ✅ Playwright configuration with multi-browser/locale support
- ✅ Global setup for authentication
- ✅ Auth fixtures (buyerPage, sellerPage, adminPage, schoolPage)
- ✅ Base page object pattern
- ✅ LoginPage and RegisterPage page objects
- ✅ Test user definitions and seed script
- ✅ Smoke tests and login flow tests

**Missing:**
- Page objects for catalog, resources, admin, seller dashboard, account, etc.
- Test suites for core user flows
- Registration flow tests
- Catalog browsing and filtering tests
- Resource detail page tests
- Seller dashboard tests
- Admin panel tests
- Account management tests

---

## Phase 1: Page Object Foundation

Create page objects for all major application pages to enable clean, maintainable tests.

### Core Public Pages

- [x] Create HomePage page object (e2e/pages/home.page.ts)
  - Navigation links, hero section, featured resources
  - Locale switcher interaction
  - Acceptance: Can navigate from home to login, register, catalog

- [x] Create CatalogPage page object (e2e/pages/catalog.page.ts)
  - Resource grid, search input, filters sidebar
  - Pagination controls
  - Acceptance: Can search, filter by subject/cycle, navigate pages

- [x] Create ResourceDetailPage page object (e2e/pages/resource-detail.page.ts)
  - Title, description, price, CTA button
  - Preview gallery, metadata, seller info
  - Wishlist button, report link
  - Acceptance: Can view resource, add to wishlist, access seller profile

### Authenticated User Pages

- [x] Create AccountPage page object (e2e/pages/account.page.ts)
  - Profile info, edit link, purchases list
  - Collections/wishlist links
  - Acceptance: Can view account info, navigate to edit profile

- [x] Create ProfileEditPage page object (e2e/pages/profile-edit.page.ts)
  - Name, bio, avatar upload form fields
  - Save/cancel buttons
  - Acceptance: Can update profile fields

- [x] Create CollectionsPage page object (e2e/pages/collections.page.ts)
  - Collection list, create collection button
  - Collection cards with resource count
  - Acceptance: Can view collections, navigate to collection detail

### Seller Pages

- [x] Create SellerDashboardPage page object (e2e/pages/seller-dashboard.page.ts)
  - Metrics cards (earnings, downloads, followers)
  - Resources table, transactions list
  - Create resource button
  - Acceptance: Can view metrics, navigate to resource management

- [x] Create UploadPage page object (e2e/pages/upload.page.ts)
  - Multi-step wizard (basics, curriculum, properties, files)
  - Form validation, step navigation
  - Acceptance: Can navigate wizard steps, validate form inputs

### Admin Pages

- [x] Create AdminDashboardPage page object (e2e/pages/admin-dashboard.page.ts)
  - Stats overview, navigation to sub-pages
  - Acceptance: Can access admin sections

- [x] Create AdminUsersPage page object (e2e/pages/admin-users.page.ts)
  - User list table, role filters
  - User detail/edit modal
  - Acceptance: Can search users, view user details

- [x] Create AdminReportsPage page object (e2e/pages/admin-reports.page.ts)
  - Reports list, status filters
  - Report detail view, status change actions
  - Acceptance: Can view reports, change report status

- [x] Update e2e/pages/index.ts to export all new page objects
  - Acceptance: All page objects importable from single entry point

---

## Phase 2: Core User Flow Tests

### Authentication Tests

- [x] Create registration flow test suite (e2e/tests/auth/register.spec.ts)
  - Test: displays registration form with all fields
  - Test: validates email format
  - Test: validates password requirements
  - Test: validates password confirmation match
  - Test: requires terms acceptance
  - Test: shows error for duplicate email
  - Test: successful registration redirects to account
  - Acceptance: All tests pass on chromium-de project

### Catalog Tests

- [x] Create catalog browsing test suite (e2e/tests/catalog/browse.spec.ts)
  - Test: displays resource grid on page load
  - Test: search filters resources by title
  - Test: subject filter shows relevant resources
  - Test: clicking resource card navigates to detail page
  - Acceptance: All tests pass, verify with seeded test resources

### Resource Tests

- [x] Create resource detail test suite (e2e/tests/resources/detail.spec.ts)
  - Test: displays resource title and description
  - Test: shows price and purchase CTA
  - Test: displays seller information
  - Test: preview gallery shows images
  - Test: authenticated user can add to wishlist
  - Acceptance: Tests use TEST_RESOURCE_IDS from fixtures

---

## Phase 3: Authenticated User Flow Tests

### Account Management

- [x] Create account page test suite (e2e/tests/account/account.spec.ts)
  - Test: buyer sees account overview
  - Test: can navigate to profile edit
  - Test: can view purchase history
  - Test: can access collections/wishlist
  - Acceptance: Uses buyerPage fixture for authentication

### Seller Dashboard

- [x] Create seller dashboard test suite (e2e/tests/seller/dashboard.spec.ts)
  - Test: displays earnings metrics
  - Test: shows resources list with status
  - Test: can navigate to create new resource
  - Test: transactions list shows recent activity
  - Acceptance: Uses sellerPage fixture for authentication

---

## Phase 4: Admin Flow Tests

### Admin Panel

- [x] Create admin dashboard test suite (e2e/tests/admin/dashboard.spec.ts)
  - Test: admin can access dashboard
  - Test: displays platform statistics
  - Test: navigation links to all admin sections work
  - Acceptance: Uses adminPage fixture for authentication

- [x] Create admin users test suite (e2e/tests/admin/users.spec.ts)
  - Test: displays user list
  - Test: can search users by email
  - Test: can filter by role
  - Test: can view user details
  - Acceptance: Test users visible in list

- [x] Create admin reports test suite (e2e/tests/admin/reports.spec.ts)
  - Test: displays reports list
  - Test: can filter by status
  - Test: can view report details
  - Acceptance: Uses seeded test data or creates report via UI

---

## Phase 5: Cross-Cutting Tests

### Internationalization

- [x] Create i18n test suite (e2e/tests/i18n/locale-switching.spec.ts)
  - Test: default locale is German (de)
  - Test: can switch to English via locale switcher
  - Test: URLs include locale prefix
  - Test: content updates when locale changes
  - Acceptance: Run on both chromium-de and chromium-en projects

### Responsive Design

- [x] Create mobile responsiveness test suite (e2e/tests/responsive/mobile.spec.ts)
  - Test: navigation collapses to hamburger menu
  - Test: catalog displays in single column
  - Test: forms are usable on mobile viewport
  - Acceptance: Run on mobile-chrome-de project

### Accessibility

- [x] Create accessibility test suite (e2e/tests/accessibility/a11y.spec.ts)
  - Test: login page has no critical a11y violations
  - Test: catalog page has proper heading structure
  - Test: forms have associated labels
  - Acceptance: Use @axe-core/playwright for automated checks

---

## Phase 6: CI/CD Integration

### Pipeline Configuration

- [x] Add Playwright to CI workflow (.github/workflows/e2e.yml)
  - Run on PR and push to main
  - Use Docker for consistent environment
  - Upload test artifacts on failure
  - Acceptance: Tests run in GitHub Actions

- [x] Configure test parallelization for CI
  - Shard tests across multiple jobs
  - Set appropriate worker count
  - Acceptance: CI runs complete in under 10 minutes

---

## Notes

- All tests should be idempotent and not depend on test execution order
- Use the seeded test data (TEST_BUYER, TEST_SELLER, TEST_ADMIN) for consistent test state
- Page objects should handle cookie banner dismissal automatically
- Tests should work across German and English locales where applicable
