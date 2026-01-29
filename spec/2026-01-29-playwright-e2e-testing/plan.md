# Playwright E2E Testing Implementation Plan

**Goal:** Comprehensive end-to-end browser testing for Currico's core user journeys across all supported browsers and locales.

**Current State:** Basic Playwright setup exists with config and smoke tests. Need to expand with authentication fixtures, test data management, and comprehensive feature coverage.

---

## Phase 1: Test Infrastructure Setup

### 1.1 Authentication & Test Data

- [ ] Create test data seed script (`e2e/fixtures/seed-test-data.ts`) with test users for each role (buyer, seller, admin)
- [ ] Create authentication fixture (`e2e/fixtures/auth.fixture.ts`) with login helper that creates authenticated browser state
- [ ] Add `storageState` support to Playwright config for persisting auth sessions between tests
- [ ] Create test user credentials constants file (`e2e/fixtures/test-users.ts`) with typed test user data

### 1.2 Page Object Models

- [ ] Create base page object class (`e2e/pages/BasePage.ts`) with common navigation and wait helpers
- [ ] Create LoginPage page object (`e2e/pages/LoginPage.ts`) with login form interactions
- [ ] Create RegisterPage page object (`e2e/pages/RegisterPage.ts`) with registration form interactions
- [ ] Create ResourcesPage page object (`e2e/pages/ResourcesPage.ts`) with catalog browsing interactions
- [ ] Create ResourceDetailPage page object (`e2e/pages/ResourceDetailPage.ts`) with resource viewing interactions
- [ ] Create AdminPage page object (`e2e/pages/AdminPage.ts`) with admin panel interactions
- [ ] Create SellerDashboardPage page object (`e2e/pages/SellerDashboardPage.ts`) with seller dashboard interactions
- [ ] Create ProfilePage page object (`e2e/pages/ProfilePage.ts`) with profile viewing and editing interactions

### 1.3 Test Utilities

- [ ] Create i18n test helper (`e2e/utils/i18n-helpers.ts`) for locale-aware text assertions
- [ ] Create API test helper (`e2e/utils/api-helpers.ts`) for direct API calls in test setup/teardown
- [ ] Create database cleanup utility (`e2e/utils/db-cleanup.ts`) for test isolation
- [ ] Update `e2e/utils/test-helpers.ts` with additional helpers (waitForToast, waitForModal, etc.)

---

## Phase 2: Core User Journey Tests

### 2.1 Authentication Tests

- [ ] Create auth test suite (`e2e/tests/auth/login.spec.ts`) with credential login flow tests
- [ ] Add login validation tests (invalid email, wrong password, empty fields)
- [ ] Add successful login redirect tests (buyer → /account, admin → /admin)
- [ ] Create registration test suite (`e2e/tests/auth/register.spec.ts`) with user registration flow
- [ ] Add registration validation tests (password requirements, duplicate email)
- [ ] Add logout test to verify session termination

### 2.2 Public Browsing Tests

- [ ] Create homepage test suite (`e2e/tests/public/homepage.spec.ts`) with landing page verification
- [ ] Add hero section tests (search bar visibility, CTA buttons)
- [ ] Add navigation tests (header links, footer links)
- [ ] Create catalog test suite (`e2e/tests/public/catalog.spec.ts`) with resource browsing
- [ ] Add search functionality tests (text search, filter combinations)
- [ ] Add pagination tests for resource list
- [ ] Create resource detail test suite (`e2e/tests/public/resource-detail.spec.ts`)
- [ ] Add preview gallery tests (image carousel, zoom functionality)
- [ ] Add seller info display tests

### 2.3 Static Page Tests

- [ ] Create static pages test suite (`e2e/tests/public/static-pages.spec.ts`)
- [ ] Add about page test
- [ ] Add FAQ page test
- [ ] Add terms page test
- [ ] Add privacy page test
- [ ] Add impressum page test
- [ ] Add contact page test with form submission

---

## Phase 3: Authenticated User Tests

### 3.1 Buyer Flow Tests

- [ ] Create buyer test suite (`e2e/tests/buyer/account.spec.ts`) with authenticated buyer tests
- [ ] Add profile viewing test
- [ ] Add profile editing test (display name, bio, subjects)
- [ ] Add notification preferences test
- [ ] Create wishlist test suite (`e2e/tests/buyer/wishlist.spec.ts`)
- [ ] Add add-to-wishlist test
- [ ] Add remove-from-wishlist test
- [ ] Add wishlist page display test
- [ ] Create collections test suite (`e2e/tests/buyer/collections.spec.ts`)
- [ ] Add create collection test
- [ ] Add add resource to collection test
- [ ] Add collection management tests

### 3.2 Purchase Flow Tests

- [ ] Create checkout test suite (`e2e/tests/buyer/checkout.spec.ts`)
- [ ] Add purchase initiation test (clicking buy button)
- [ ] Add checkout success page test (mock Stripe redirect)
- [ ] Add checkout cancel page test
- [ ] Create download test suite (`e2e/tests/buyer/download.spec.ts`)
- [ ] Add download page access test with valid token
- [ ] Add download page access test with invalid/expired token
- [ ] Add library page test (purchased resources)

---

## Phase 4: Seller Tests

### 4.1 Seller Onboarding Tests

- [ ] Create seller onboarding test suite (`e2e/tests/seller/onboarding.spec.ts`)
- [ ] Add become-seller page test
- [ ] Add terms acceptance test
- [ ] Add Stripe Connect initiation test
- [ ] Add onboarding complete page test

### 4.2 Seller Dashboard Tests

- [ ] Create seller dashboard test suite (`e2e/tests/seller/dashboard.spec.ts`)
- [ ] Add dashboard metrics display test
- [ ] Add resources list test
- [ ] Add earnings display test
- [ ] Add transactions list test

### 4.3 Resource Upload Tests

- [ ] Create upload test suite (`e2e/tests/seller/upload.spec.ts`)
- [ ] Add upload wizard step 1 test (basics - title, description, type)
- [ ] Add upload wizard step 2 test (curriculum - cycles, subjects)
- [ ] Add upload wizard step 3 test (properties - price, editability)
- [ ] Add upload wizard step 4 test (file upload - mock file)
- [ ] Add upload validation tests (required fields, file types)
- [ ] Add bundle creation test (`e2e/tests/seller/bundle.spec.ts`)

---

## Phase 5: Admin Tests

### 5.1 Admin Dashboard Tests

- [ ] Create admin dashboard test suite (`e2e/tests/admin/dashboard.spec.ts`)
- [ ] Add admin stats display test
- [ ] Add admin navigation test (all admin sections accessible)

### 5.2 Admin User Management Tests

- [ ] Create admin users test suite (`e2e/tests/admin/users.spec.ts`)
- [ ] Add user list display test
- [ ] Add user search/filter test
- [ ] Add user role change test
- [ ] Add protected user handling test

### 5.3 Admin Resource Management Tests

- [ ] Create admin resources test suite (`e2e/tests/admin/resources.spec.ts`)
- [ ] Add resource list display test
- [ ] Add resource status change test (pending → verified)
- [ ] Add resource quality check test

### 5.4 Admin Reports & Transactions Tests

- [ ] Create admin reports test suite (`e2e/tests/admin/reports.spec.ts`)
- [ ] Add reports list display test
- [ ] Add report status change test
- [ ] Create admin transactions test suite (`e2e/tests/admin/transactions.spec.ts`)
- [ ] Add transactions list test
- [ ] Add transaction detail test

---

## Phase 6: i18n & Responsive Tests

### 6.1 Internationalization Tests

- [ ] Create i18n test suite (`e2e/tests/i18n/locale-switching.spec.ts`)
- [ ] Add German locale content test
- [ ] Add English locale content test
- [ ] Add locale switching test (de ↔ en)
- [ ] Add URL locale prefix test
- [ ] Add language persistence test across navigation

### 6.2 Responsive Design Tests

- [ ] Create mobile test suite (`e2e/tests/responsive/mobile.spec.ts`)
- [ ] Add mobile navigation test (hamburger menu)
- [ ] Add mobile resource card test
- [ ] Add mobile filter sidebar test (bottom sheet behavior)
- [ ] Create tablet test suite (`e2e/tests/responsive/tablet.spec.ts`)
- [ ] Add tablet layout tests

---

## Phase 7: Visual & Accessibility Tests

### 7.1 Visual Regression Tests

- [ ] Create visual test suite (`e2e/tests/visual/screenshots.spec.ts`)
- [ ] Add homepage screenshot test
- [ ] Add resource detail screenshot test
- [ ] Add login page screenshot test
- [ ] Add dashboard screenshot test
- [ ] Configure screenshot comparison thresholds in Playwright config

### 7.2 Accessibility Tests

- [ ] Install and configure @axe-core/playwright
- [ ] Create accessibility test suite (`e2e/tests/accessibility/a11y.spec.ts`)
- [ ] Add homepage accessibility scan test
- [ ] Add login form accessibility test (labels, focus)
- [ ] Add resource card accessibility test
- [ ] Add navigation accessibility test (keyboard navigation)

---

## Phase 8: CI/CD Integration

### 8.1 GitHub Actions Setup

- [ ] Create Playwright CI workflow (`.github/workflows/e2e-tests.yml`)
- [ ] Configure parallel test execution across browsers
- [ ] Add test artifact upload (screenshots, videos, traces)
- [ ] Configure retry strategy for flaky tests
- [ ] Add Playwright report as GitHub Action summary

### 8.2 Test Environment Configuration

- [ ] Create `.env.test` file with test-specific environment variables
- [ ] Update Playwright config to support CI environment detection
- [ ] Add database setup/teardown hooks for CI
- [ ] Create Docker Compose test configuration (`docker-compose.test.yml`) for isolated test database

---

## Implementation Notes

### Test Data Strategy
- Use dedicated test users with predictable credentials
- Seed minimal required data before test runs
- Clean up test-created data after each test suite
- Avoid shared mutable state between tests

### Authentication Strategy
- Use `storageState` to persist authenticated sessions
- Create separate auth states for each role (buyer, seller, admin)
- Re-authenticate only when session expires

### Page Object Pattern
- Each page object encapsulates locators and actions for one page
- Use descriptive method names that match user intent
- Handle waiting internally within page object methods
- Return page objects for navigation actions (fluent interface)

### Locale Testing Strategy
- Run core tests in German (primary locale)
- Run subset of tests in English for i18n verification
- Use data-testid attributes for stable locators that work across locales

### File Structure
```
e2e/
├── fixtures/
│   ├── auth.fixture.ts
│   ├── seed-test-data.ts
│   └── test-users.ts
├── pages/
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   ├── RegisterPage.ts
│   ├── ResourcesPage.ts
│   ├── ResourceDetailPage.ts
│   ├── AdminPage.ts
│   ├── SellerDashboardPage.ts
│   └── ProfilePage.ts
├── tests/
│   ├── auth/
│   ├── public/
│   ├── buyer/
│   ├── seller/
│   ├── admin/
│   ├── i18n/
│   ├── responsive/
│   ├── visual/
│   └── accessibility/
└── utils/
    ├── test-helpers.ts
    ├── i18n-helpers.ts
    ├── api-helpers.ts
    └── db-cleanup.ts
```

---

## Success Criteria

- All core user journeys covered with E2E tests
- Tests pass consistently on CI (< 2% flakiness)
- Tests run in under 10 minutes for full suite
- Clear test reports with screenshots on failure
- Accessibility issues caught before production
