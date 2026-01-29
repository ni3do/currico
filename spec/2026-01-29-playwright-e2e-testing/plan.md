# Playwright E2E Testing Implementation Plan

**Date:** 2026-01-29
**Status:** In Progress
**Goal:** Comprehensive E2E test coverage for Currico platform

---

## Overview

This plan covers creating E2E tests for the Currico platform using Playwright. The existing infrastructure includes:
- Playwright config with multi-browser/locale support (Chrome, Firefox, Safari; de/en)
- Auth fixtures for buyer, seller, admin, and school users
- Global setup for session caching
- Seed script for test data
- Basic smoke tests

---

## Phase 1: Test Infrastructure Enhancement

### 1.1 Page Object Models

- [x] Create base page object class with common utilities
- [x] Create `LoginPage` page object with form interactions
- [ ] Create `RegisterPage` page object with registration flow
- [ ] Create `ResourcesPage` page object for catalog browsing
- [ ] Create `ResourceDetailPage` page object with purchase/download actions
- [ ] Create `AccountPage` page object for user dashboard
- [ ] Create `AdminDashboardPage` page object for admin flows
- [ ] Create `UploadPage` page object for resource upload wizard

### 1.2 Test Data Fixtures

- [x] Test users defined in `e2e/fixtures/test-users.ts`
- [x] Seed script creates test resources (free, paid, pending)
- [ ] Add test data for collections
- [ ] Add test data for wishlists
- [ ] Create factory functions for generating unique test data

---

## Phase 2: Authentication Tests

### 2.1 Login Flow

- [ ] Test successful login with valid credentials redirects buyer to /account
- [ ] Test successful login with admin credentials redirects to /admin
- [ ] Test login with invalid email shows validation error
- [ ] Test login with wrong password shows error message
- [ ] Test login form email field validates format
- [ ] Test "Remember me" checkbox persists session

### 2.2 Registration Flow

- [ ] Test successful registration creates account and logs in
- [ ] Test registration with existing email shows duplicate error
- [ ] Test password validation requires 8+ characters
- [ ] Test password confirmation must match
- [ ] Test terms checkbox is required
- [ ] Test OAuth buttons are present (Google, Microsoft, edu-ID)

### 2.3 Session Management

- [ ] Test authenticated user can access protected routes
- [ ] Test unauthenticated user is redirected from protected routes to login
- [ ] Test logout clears session and redirects to home

---

## Phase 3: Catalog & Resource Tests

### 3.1 Resources Page

- [ ] Test resources page loads and displays resource grid
- [ ] Test search input filters resources by keyword
- [ ] Test LP21 filter sidebar filters by Zyklus
- [ ] Test LP21 filter sidebar filters by Fachbereich
- [ ] Test filter URL params sync with sidebar state
- [ ] Test clearing filters resets results
- [ ] Test pagination works correctly
- [ ] Test sort dropdown changes result order
- [ ] Test mobile filter toggle opens/closes sidebar
- [ ] Test profiles tab displays user search

### 3.2 Resource Detail Page

- [ ] Test resource detail page loads with correct data
- [ ] Test breadcrumb navigation works correctly
- [ ] Test LP21 badges display correctly
- [ ] Test metadata block shows subject, cycle, downloads
- [ ] Test free resource shows download button (not checkout)
- [ ] Test paid resource shows checkout button with price
- [ ] Test wishlist button toggles state for authenticated user
- [ ] Test wishlist button redirects unauthenticated user to login
- [ ] Test follow seller button toggles state
- [ ] Test "Report resource" modal opens and submits
- [ ] Test related resources section displays similar items
- [ ] Test 404 page shown for non-existent resource

### 3.3 Free Resource Download

- [ ] Test authenticated user can download free resource
- [ ] Test download link opens in new tab
- [ ] Test unauthenticated user is prompted to login

---

## Phase 4: User Dashboard Tests

### 4.1 Account Page

- [ ] Test account page loads for authenticated buyer
- [ ] Test account page shows user's purchased resources
- [ ] Test account page shows user's wishlisted items
- [ ] Test account page shows collections
- [ ] Test user can edit profile information
- [ ] Test user can upload avatar

### 4.2 Seller Dashboard

- [ ] Test seller dashboard loads with metrics
- [ ] Test dashboard shows net earnings, downloads, followers
- [ ] Test resource list shows seller's uploaded resources
- [ ] Test "Create new resource" button navigates to upload

---

## Phase 5: Admin Panel Tests

### 5.1 Admin Dashboard

- [ ] Test admin dashboard loads for admin user
- [ ] Test admin redirected from dashboard if not admin role
- [ ] Test dashboard shows key metrics (users, pending, reports, revenue)
- [ ] Test quick action links navigate to correct pages

### 5.2 Document Review

- [ ] Test documents page lists pending resources
- [ ] Test admin can change resource status to AI-Checked
- [ ] Test admin can change resource status to Verified
- [ ] Test admin can add internal notes

### 5.3 User Management

- [ ] Test users page lists all users
- [ ] Test admin can search users by email
- [ ] Test admin can view user details
- [ ] Test admin can change user role

### 5.4 Reports Management

- [ ] Test reports page lists open reports
- [ ] Test admin can view report details
- [ ] Test admin can change report status to In Review
- [ ] Test admin can resolve or dismiss report

---

## Phase 6: Upload Flow Tests

### 6.1 Upload Wizard Steps

- [ ] Test upload page accessible only for sellers
- [ ] Test Step 1: Basics form validates required fields
- [ ] Test Step 1: Title and description are required
- [ ] Test Step 2: Curriculum filters are selectable
- [ ] Test Step 3: Price, editability, license options work
- [ ] Test Step 4: File upload UI renders correctly
- [ ] Test wizard navigation between steps
- [ ] Test form data persists across step changes

---

## Phase 7: i18n Tests

### 7.1 Locale Switching

- [ ] Test German locale loads German translations
- [ ] Test English locale loads English translations
- [ ] Test locale switcher changes URL and content
- [ ] Test navigation preserves locale prefix

### 7.2 Content Translation

- [ ] Test login page displays correctly in German
- [ ] Test login page displays correctly in English
- [ ] Test resources page displays correctly in both locales
- [ ] Test error messages display in correct locale

---

## Phase 8: Mobile Responsiveness Tests

### 8.1 Mobile Navigation

- [ ] Test mobile menu toggle works
- [ ] Test mobile menu displays navigation links
- [ ] Test mobile filter sidebar opens as bottom sheet

### 8.2 Mobile Forms

- [ ] Test login form is usable on mobile viewport
- [ ] Test registration form is usable on mobile viewport
- [ ] Test resource cards display correctly on mobile

---

## Phase 9: Error Handling & Edge Cases

### 9.1 API Error States

- [ ] Test network error shows retry option
- [ ] Test 500 error shows error page
- [ ] Test unauthorized API call redirects to login

### 9.2 Form Validation

- [ ] Test all forms show inline validation errors
- [ ] Test forms prevent submission with invalid data
- [ ] Test error messages clear on valid input

---

## Phase 10: Checkout Flow Tests (Stripe)

### 10.1 Checkout Process

- [ ] Test checkout button creates Stripe session
- [ ] Test redirect to Stripe checkout page
- [ ] Test success page loads after successful payment
- [ ] Test cancel page loads after cancelled payment
- [ ] Test download token is generated on success

---

## Implementation Order

Priority order based on risk and usage:

1. **Phase 2: Authentication** - Core functionality, security critical
2. **Phase 3: Catalog & Resources** - Primary user journey
3. **Phase 4: User Dashboard** - Authenticated user experience
4. **Phase 5: Admin Panel** - Content moderation critical
5. **Phase 7: i18n** - Swiss localization important
6. **Phase 8: Mobile** - Mobile-first user base
7. **Phase 10: Checkout** - Revenue critical
8. **Phase 6: Upload** - Seller onboarding
9. **Phase 9: Error Handling** - Edge cases
10. **Phase 1: Page Objects** - Refactor as tests grow

---

## Test File Structure

```
e2e/
├── fixtures/
│   ├── auth.fixture.ts        # Auth fixtures (exists)
│   ├── test-users.ts          # Test user data (exists)
│   └── seed-test-data.ts      # DB seeding (exists)
├── pages/                     # Page Object Models (to create)
│   ├── base.page.ts
│   ├── login.page.ts
│   ├── register.page.ts
│   ├── resources.page.ts
│   ├── resource-detail.page.ts
│   ├── account.page.ts
│   ├── admin.page.ts
│   └── upload.page.ts
├── tests/
│   ├── smoke.spec.ts          # Smoke tests (exists)
│   ├── auth/
│   │   ├── login.spec.ts
│   │   ├── register.spec.ts
│   │   └── session.spec.ts
│   ├── catalog/
│   │   ├── resources.spec.ts
│   │   ├── resource-detail.spec.ts
│   │   └── download.spec.ts
│   ├── user/
│   │   ├── account.spec.ts
│   │   └── seller-dashboard.spec.ts
│   ├── admin/
│   │   ├── dashboard.spec.ts
│   │   ├── documents.spec.ts
│   │   ├── users.spec.ts
│   │   └── reports.spec.ts
│   ├── upload/
│   │   └── wizard.spec.ts
│   ├── i18n/
│   │   └── locale.spec.ts
│   ├── mobile/
│   │   ├── navigation.spec.ts
│   │   └── forms.spec.ts
│   └── checkout/
│       └── stripe.spec.ts
└── utils/
    └── test-helpers.ts        # Utilities (exists)
```

---

## Running Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test e2e/tests/auth/login.spec.ts

# Run tests for specific project (browser/locale)
npx playwright test --project=chromium-de

# Run tests with UI mode
npx playwright test --ui

# Run tests in headed mode
npx playwright test --headed

# Generate report
npx playwright show-report
```

---

## CI Integration Notes

The Playwright config already supports CI mode:
- Single worker for stability (`workers: 1`)
- 2 retries on failure
- GitHub Actions reporter
- HTML report generation

Tests should be added to CI pipeline in `.github/workflows/` when ready.
