# Playwright E2E Testing Implementation Plan

## Overview

Set up comprehensive E2E testing infrastructure using Playwright for the Currico teaching materials marketplace. The goal is automated browser testing of critical user journeys across both locales (de/en).

## Current State

- Playwright is installed (`@playwright/test: ^1.58.0`)
- npm scripts configured (`test:e2e`, `test:e2e:ui`, `test:e2e:headed`)
- No `playwright.config.ts` exists
- No test files or `e2e/` directory exists
- No test fixtures or utilities exist

---

## Phase 1: Infrastructure Setup

### 1.1 Playwright Configuration

- [ ] Create `playwright.config.ts` with base configuration
  - Configure base URL for localhost:3000
  - Set up Chrome, Firefox, and Safari (webkit) projects
  - Configure screenshots on failure
  - Set reasonable timeouts (30s action, 60s navigation)
  - Enable trace collection on first retry

- [ ] Create `e2e/` directory structure
  - `e2e/tests/` - test files
  - `e2e/fixtures/` - custom fixtures and page objects
  - `e2e/utils/` - helper functions

### 1.2 Test Utilities & Fixtures

- [ ] Create auth fixture (`e2e/fixtures/auth.fixture.ts`)
  - Implement `authenticatedPage` fixture for logged-in tests
  - Implement `adminPage` fixture for admin tests
  - Support session storage reuse for faster tests

- [ ] Create database fixture (`e2e/fixtures/db.fixture.ts`)
  - Implement test user creation/cleanup
  - Implement test resource creation/cleanup
  - Use Prisma directly for setup/teardown

- [ ] Create locale fixture (`e2e/fixtures/locale.fixture.ts`)
  - Support testing both de and en locales
  - Parameterized tests for locale coverage

---

## Phase 2: Core User Journey Tests

### 2.1 Public Pages (No Auth Required)

- [ ] Test homepage (`e2e/tests/homepage.spec.ts`)
  - Verify page loads with correct title
  - Verify navigation links work
  - Verify locale switcher functions
  - Test responsive design (mobile/desktop viewports)

- [ ] Test resources catalog (`e2e/tests/catalog.spec.ts`)
  - Verify resource grid loads
  - Test LP21 filter sidebar interactions
  - Test search functionality
  - Test cycle/subject filters
  - Verify resource cards display correctly
  - Test pagination if resources exist

- [ ] Test resource detail page (`e2e/tests/resource-detail.spec.ts`)
  - Verify resource info displays
  - Test preview gallery if images exist
  - Verify buy/download CTA visible
  - Test related resources section

- [ ] Test static pages (`e2e/tests/static-pages.spec.ts`)
  - About page loads
  - FAQ page loads
  - Terms page loads
  - Privacy page loads
  - Contact page loads
  - Impressum page loads

### 2.2 Authentication Flow

- [ ] Test login page (`e2e/tests/auth/login.spec.ts`)
  - Form validation (empty fields, invalid email)
  - Successful login with valid credentials
  - Error message on invalid credentials
  - OAuth buttons are visible and clickable
  - Remember me checkbox functions
  - Redirect to account page on success
  - Admin redirect to admin page

- [ ] Test registration page (`e2e/tests/auth/register.spec.ts`)
  - Form validation (all required fields)
  - Email format validation
  - Password minimum length (8 chars)
  - Password confirmation match
  - Terms checkbox required
  - Successful registration creates account
  - Auto-login after registration

- [ ] Test logout flow (`e2e/tests/auth/logout.spec.ts`)
  - Logout button in account area
  - Session cleared on logout
  - Redirect to appropriate page

### 2.3 Protected User Pages

- [ ] Test account page (`e2e/tests/account.spec.ts`)
  - Requires authentication (redirects if not logged in)
  - Displays user info correctly
  - Shows user's resources/purchases

- [ ] Test profile pages (`e2e/tests/profile.spec.ts`)
  - Public profile view works
  - Profile edit requires auth
  - Profile edit saves changes

---

## Phase 3: Seller & Admin Features

### 3.1 Seller Features

- [ ] Test seller onboarding (`e2e/tests/seller/onboarding.spec.ts`)
  - Become seller page accessible
  - Terms acceptance flow
  - Redirect to Stripe Connect

- [ ] Test seller dashboard (`e2e/tests/seller/dashboard.spec.ts`)
  - Dashboard loads with metrics
  - Resources list displays
  - Transaction history visible

- [ ] Test resource upload (`e2e/tests/seller/upload.spec.ts`)
  - Multi-step wizard navigation
  - Form validation at each step
  - File upload interaction
  - Curriculum tag selection

### 3.2 Admin Features

- [ ] Test admin dashboard (`e2e/tests/admin/dashboard.spec.ts`)
  - Admin-only access (non-admin redirected)
  - Stats cards display
  - Navigation to sub-sections

- [ ] Test admin users management (`e2e/tests/admin/users.spec.ts`)
  - User list loads
  - User search works
  - User detail view

- [ ] Test admin resources management (`e2e/tests/admin/resources.spec.ts`)
  - Resource list with quality status
  - Status change functionality
  - Resource detail view

- [ ] Test admin reports (`e2e/tests/admin/reports.spec.ts`)
  - Report list loads
  - Report status workflow

---

## Phase 4: E-commerce Flow

### 4.1 Purchase Flow

- [ ] Test checkout initiation (`e2e/tests/checkout/initiate.spec.ts`)
  - Buy button creates checkout session
  - Redirect to Stripe checkout (mock or verify redirect)
  - Requires authentication

- [ ] Test checkout success page (`e2e/tests/checkout/success.spec.ts`)
  - Success page displays confirmation
  - Download link available
  - Order details shown

- [ ] Test checkout cancel page (`e2e/tests/checkout/cancel.spec.ts`)
  - Cancel page displays appropriately
  - Link to return to resources

### 4.2 Download Flow

- [ ] Test download token flow (`e2e/tests/download.spec.ts`)
  - Valid token allows download
  - Invalid token shows error
  - Expired token handled

---

## Phase 5: Cross-Cutting Concerns

### 5.1 Internationalization

- [ ] Test locale switching (`e2e/tests/i18n.spec.ts`)
  - Switch from DE to EN
  - Switch from EN to DE
  - URL updates with locale
  - Content updates to match locale
  - Form labels change language

### 5.2 Error Handling

- [ ] Test error pages (`e2e/tests/errors.spec.ts`)
  - 404 page for invalid routes
  - Graceful handling of API errors
  - Network error handling (offline simulation)

### 5.3 Responsive Design

- [ ] Test mobile viewports (`e2e/tests/responsive.spec.ts`)
  - Mobile navigation (hamburger menu)
  - Mobile filter panel toggle
  - Touch-friendly interactions
  - Viewport-specific layouts

---

## Phase 6: CI/CD Integration

### 6.1 GitHub Actions

- [ ] Create workflow file (`.github/workflows/e2e.yml`)
  - Run on PR and push to main
  - Install dependencies with caching
  - Start Next.js dev server
  - Run Playwright tests
  - Upload test artifacts (screenshots, traces)
  - Report test results

- [ ] Add test database configuration
  - Use separate test database
  - Run migrations before tests
  - Seed required test data

---

## Test Data Requirements

For comprehensive E2E testing, the following test data must exist or be created:

1. **Test Users**
   - Regular user (teacher account)
   - Seller user (with Stripe Connect)
   - Admin user

2. **Test Resources**
   - At least 5 resources for catalog testing
   - Various subjects and cycles
   - Different price points (free and paid)

3. **Test Transactions**
   - Sample purchase records for seller dashboard

---

## Acceptance Criteria

Each task is considered complete when:

1. **Config tasks**: File exists, tests can run with `npm run test:e2e`
2. **Fixture tasks**: Fixture works in at least one test
3. **Test tasks**: Test passes locally and covers stated functionality
4. **CI tasks**: Pipeline runs and reports results on PRs

---

## Notes

- OAuth providers (Google, Microsoft, edu-ID) cannot be E2E tested directly; test that buttons render and initiate flow
- Stripe checkout redirect can be verified but actual payment flow requires mock mode
- File uploads may need mock or small test files
- All tests should work with both German and English locales where applicable
