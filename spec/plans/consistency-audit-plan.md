# Consistency & Quality Audit — Implementation Plan

> Generated from a full-project audit covering all pages, components, API routes, and patterns.
> **53 improvements** organized into 6 phases by priority and dependency.

---

## Phase 1: Security & Critical Fixes

**Goal:** Fix security vulnerabilities and data integrity risks.
**Estimated scope:** 7 files

### S-1. Protect metrics endpoint

- **File:** `app/api/metrics/route.ts`
- **Issue:** Prometheus metrics exposed with no auth or rate limiting
- **Fix:** Add `requireAdmin()` guard or IP allowlist

### S-2. Remove password_hash from SELECT

- **File:** `app/api/user/stats/route.ts:65,104`
- **Issue:** `password_hash` selected from DB unnecessarily
- **Fix:** Use `password_hash: { not: null }` in WHERE clause instead, or select a computed boolean

### S-3. Validate admin role PATCH values

- **File:** `app/api/admin/users/[id]/route.ts:98-105`
- **Issue:** `body.role` accepts arbitrary strings
- **Fix:** Add Zod enum validation for `BUYER | SELLER | ADMIN`

### S-4. Add rate limiting to expensive public routes

- **Files:** `api/curriculum/search`, `api/users/search`, `api/users/[id]/profile-bundle`
- **Issue:** Heavy DB queries (raw SQL, pg_trgm, 6 parallel queries) with no protection
- **Fix:** Add `checkRateLimit()` from `lib/rateLimit.ts`

### S-5. Fix newsletter subscribe rate limiter

- **File:** `api/newsletter/subscribe/route.ts:6-21`
- **Issue:** Ad-hoc rate limiter with memory leak
- **Fix:** Replace with shared `checkRateLimit()`

---

## Phase 2: Auth & API Standardization

**Goal:** Unify auth patterns, error handling, and response formats across all API routes.
**Estimated scope:** ~25 files

### A-1. Standardize admin auth pattern

- **Files:** `api/admin/users/[id]/verify-teacher/route.ts`, `verify-seller/route.ts`
- **Issue:** Return 401 while all other admin routes return 403
- **Fix:** Use `unauthorizedResponse()` from `lib/admin-auth.ts` consistently
- Also rename `unauthorizedResponse()` to `forbiddenResponse()` (it returns 403)

### A-2. Migrate routes from `auth()` to `requireAuth()`

- **Files:** ~16 routes using `auth()` session directly
  - `seller/materials`, `seller/connect`, `seller/connect/status`, `seller/accept-terms`
  - `materials/[id]/comments`, `materials/[id]/like`, `materials/[id]/reviews`
  - `comments/[id]`, `comments/[id]/replies`, `comments/[id]/like`
  - `replies/[id]`, `reviews/[id]`
  - `payments/checkout-session/[sessionId]`
  - `user/resource-comments`, `auth/send-verification`
- **Fix:** Replace `auth()` + manual session check with `requireAuth()` + `unauthorized()`

### A-3. Migrate routes from `getCurrentUserId()` to `requireAuth()`

- **Files:** `materials/[id]/route.ts` (PATCH/DELETE), `upload/route.ts`, `users/me/avatar/route.ts`, `users/me/notifications/route.ts`
- **Fix:** Use standard `requireAuth()` pattern

### A-4. Consolidate duplicate user/me routes

- **Files:** `api/user/me/route.ts` and `api/users/me/route.ts`
- **Fix:** Keep `api/users/me/route.ts` (standard pattern), redirect or remove `api/user/me`

### A-5. Standardize error response format

- **Files:** ~15 admin & user routes returning German strings
- **Fix:** All routes return `{ error: "Human message", code: "ERROR_CODE" }` using helpers from `lib/api.ts`
- Migration: Replace inline German messages with error code constants

### A-6. Standardize pagination format

- **Files:** `admin/messages`, `admin/reports`, `admin/materials`, `user/wishlist`, `user/library`, `user/following`
- **Fix:** Use `paginationResponse()` from `lib/api.ts` everywhere

### A-7. Add Zod validation to unvalidated routes

- **Files:** 14+ routes (see audit)
  - Admin: messages, reports, materials, newsletters, users PATCH
  - User: wishlist POST, following POST
  - Auth: forgot-password, reset-password, change-password
  - Upload: route.ts
- **Fix:** Create Zod schemas in `lib/validations/` and validate request bodies

### A-8. Add `isValidId()` checks to route params

- **Files:** ~10 routes missing ID validation
- **Fix:** Add `isValidId()` check before DB queries

### A-9. Fix REST convention violations

- **Files:** `admin/messages`, `admin/reports`, `admin/materials`
- **Fix:** Create proper `[id]` sub-routes for PATCH/DELETE operations; stop reading IDs from request body

### A-10. Add rate limiting to comment/reply creation

- **Files:** `comments/[id]/replies/route.ts`, `comments/[id]/like/route.ts`
- **Fix:** Add `checkRateLimit()`

---

## Phase 3: Theme & Color Consistency

**Goal:** Ensure all components use semantic Catppuccin tokens — no hardcoded colors.
**Estimated scope:** ~15 files

### T-1. Replace `bg-white` / hardcoded dark mode colors

| File                              | Line(s) | Fix                                         |
| --------------------------------- | ------- | ------------------------------------------- |
| `components/ui/CookieConsent.tsx` | 106     | `bg-white dark:bg-[#1e1e2e]` → `bg-surface` |
| `components/ui/Toggle.tsx`        | 25      | `bg-white` → `bg-surface`                   |

### T-2. Replace `text-white` with `text-text-on-accent`

| File                                        | Line(s)  |
| ------------------------------------------- | -------- |
| `components/ui/ConfirmDialog.tsx`           | 46       |
| `components/ui/MaterialCard.tsx`            | 150, 245 |
| `components/ui/SwissBrandSection.tsx`       | 42-43    |
| `components/ui/ProfileCard.tsx`             | 90, 113  |
| `components/profile/ProfileHero.tsx`        | 88, 153  |
| `components/upload/PublishPreviewModal.tsx` | 90       |

### T-3. Replace hardcoded Tailwind colors with semantic tokens

| File                                    | Line(s)     | Fix                                              |
| --------------------------------------- | ----------- | ------------------------------------------------ |
| `components/ui/MaterialTypeBadge.tsx`   | 5-9         | `text-red-500` etc → theme colors                |
| `components/ui/MaterialCard.tsx`        | 161         | `text-red-500` → `text-error`                    |
| `components/profile/ProfileHero.tsx`    | 232,244,255 | `hover:bg-blue-500/10` etc → semantic            |
| `app/[locale]/konto/layout.tsx`         | 166         | `ring-white dark:ring-gray-800` → `ring-surface` |
| `app/[locale]/konto/folge-ich/page.tsx` | 196         | `text-white` → `text-text-on-accent`             |

### T-4. Replace raw CSS variable references with semantic classes

| File                                    | Line(s)       | Fix                                                   |
| --------------------------------------- | ------------- | ----------------------------------------------------- |
| `app/[locale]/page.tsx`                 | 170, 187, 204 | `focus:ring-[var(--ctp-blue)]` → `focus:ring-primary` |
| `app/[locale]/hochladen/page.tsx`       | 1196, 1213    | `text-[var(--ctp-green)]` → `text-success`            |
| `components/ui/SellerHeroSection.tsx`   | 20-70         | Direct `--ctp-*` refs → semantic classes              |
| `app/[locale]/admin/documents/page.tsx` | 11-14, 449+   | `var(--badge-*)` → `bg-warning/10` pattern            |

### T-5. Fix About page hardcoded gradients

- **File:** `app/[locale]/ueber-uns/page.tsx:226,273,333,347`
- **Fix:** `from-emerald-500 to-teal-600` → Catppuccin-based gradient

---

## Phase 4: UI Consistency & Missing States

**Goal:** Standardize card styles, form inputs, loading/error/empty states, and page structure.
**Estimated scope:** ~20 files

### U-1. Add error UI to silently-failing pages

- `app/[locale]/konto/page.tsx:109` — Add user-visible error state with retry
- `app/[locale]/konto/uploads/page.tsx:39-43` — Same

### U-2. Add mobile card layout for bundles

- **File:** `app/[locale]/konto/bundles/page.tsx:228-369`
- **Fix:** Add responsive card view matching account overview pattern (mobile cards, desktop table)

### U-3. Add Footer to login page

- **File:** `app/[locale]/anmelden/page.tsx`
- **Fix:** Add `<Footer />` or at minimum a link to legal pages

### U-4. Add Footer to material detail loading state

- **File:** `app/[locale]/materialien/[id]/page.tsx:178-215`

### U-5. Verify material detail has `<h1>`

- **File:** Check `components/materials/PurchasePanel.tsx`
- **Fix:** Ensure material title renders as `<h1>` for SEO/a11y

### U-6. Standardize card border-radius

- **Decision:** Use `rounded-xl` everywhere (majority pattern)
- **Files:** Update account overview (`rounded-2xl` → `rounded-xl`), admin dashboard inconsistencies

### U-7. Standardize form input styles

- **Decision:** `bg-bg rounded-lg` for all inputs
- **Files:** Settings password inputs (`bg-surface` → `bg-bg`), bundle upload (`rounded-xl` → `rounded-lg`)

### U-8. Fix filter pill size mismatch

- **File:** `app/[locale]/konto/uploads/page.tsx`
- **Fix:** `text-sm` → `text-xs` to match other account pages

### U-9. Wrap notifications in card container

- **File:** `app/[locale]/konto/notifications/page.tsx:127`
- **Fix:** Add `border-border bg-surface rounded-xl border p-6` wrapper

### U-10. Fix admin mobile nav error color

- **File:** `app/[locale]/admin/layout.tsx:134`
- **Fix:** `hover:border-error hover:text-error` → `hover:border-border hover:text-primary`

### U-11. Standardize button usage

- **Files:** `ProfileHero.tsx`, `ProfileCompletionBanner.tsx`, `PublishPreviewModal.tsx`, `ConfirmDialog.tsx`
- **Fix:** Replace custom inline button styles with `btn-primary`/`btn-secondary` classes

### U-12. Standardize account sub-page headers

- **Files:** Library, Uploads, Bundles, Wishlist, Notifications, Following
- **Fix:** Pick one header pattern (title + subtitle + optional CTA) and use consistently

### U-13. Fix PreviewGallery conflicting styles

- **File:** `components/ui/PreviewGallery.tsx:394`
- **Fix:** Remove either `right-4` class or `style={{ right: "4rem" }}`

### U-14. Use `card` class consistently

- **Files:** `ProfileStats.tsx:55`, `ProfileCompletionBanner.tsx:15`, account sub-pages mixing `card` class with explicit border/bg
- **Fix:** Use `card` class everywhere, with modifiers for variants (warning, etc.)

---

## Phase 5: Accessibility & i18n

**Goal:** Fix missing translations, ARIA labels, keyboard navigation, and focus indicators.
**Estimated scope:** ~12 files

### I-1. Add i18n to ProfileCompletionBanner

- **File:** `components/profile/ProfileCompletionBanner.tsx:33-55`
- **Fix:** Add `useTranslations()`, move all German strings to `de.json`/`en.json`

### I-2. Add i18n to ThemeToggle labels

- **File:** `components/ui/ThemeToggle.tsx:65-112`
- **Fix:** Replace hardcoded "Hell"/"Dunkel"/"Light"/"Dark" with translations

### I-3. Add i18n to ScrollToTop

- **File:** `components/ui/ScrollToTop.tsx:27`
- **Fix:** Replace `"Nach oben scrollen"` with translated aria-label

### I-4. Add i18n to TopBar hamburger

- **File:** `components/ui/TopBar.tsx:269`
- **Fix:** Replace `"Toggle navigation"` with translated aria-label

### I-5. Fix MultiSelect accessibility

- **File:** `components/ui/MultiSelect.tsx`
- **Fix:** Add `role="combobox"`, `aria-expanded`, keyboard arrow navigation
- Also translate default placeholder strings

### I-6. Add focus-visible to card links

- **Files:** `MaterialCard.tsx:277`, `ProfileCard.tsx:77`, `DashboardMaterialCard.tsx:124`
- **Fix:** Add `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`

### I-7. Fix MaterialCard empty aria-label

- **File:** `components/ui/MaterialCard.tsx:163`
- **Fix:** Provide meaningful fallback instead of `""` (e.g., "Add to wishlist")

### I-8. Fix Toggle missing visible label

- **File:** `components/ui/Toggle.tsx`
- **Fix:** Render `label` visually when provided; ensure `aria-label` always has a value

### I-9. Add aria-label to uploads sort select

- **File:** `app/[locale]/konto/uploads/page.tsx:147-156`

---

## Phase 6: Animation & Polish

**Goal:** Add consistent animations across all pages, replace inline SVGs with Lucide icons.
**Estimated scope:** ~18 files

### P-1. Add FadeIn animations to key pages

- **Material detail:** FadeIn on hero section after skeleton
- **Contact:** FadeIn on form card and info sidebar
- **Help:** Smooth height transition on FAQ accordion open/close

### P-2. Migrate Seller levels / Verified seller to FadeIn

- **Files:** `verkaeufer-stufen/page.tsx`, `verifizierter-verkaeufer/page.tsx`
- **Fix:** Replace raw `motion.div` with project's `FadeIn`/`StaggerChildren`

### P-3. Replace inline SVGs with Lucide icons (high-traffic components)

- **Priority files:**
  - `components/ui/TopBar.tsx` — 7 inline SVGs → Lucide (also remove unused imports)
  - `components/ui/PreviewGallery.tsx` — 8 inline SVGs
  - `components/ui/MaterialCard.tsx` — 2 inline SVGs
  - `components/materials/PurchasePanel.tsx` — 3 inline SVGs

### P-4. Replace inline SVGs with Lucide icons (remaining components)

- `components/ui/ProfileCard.tsx`, `MultiSelect.tsx`, `PaginationControls.tsx`
- `components/auth/PasswordRequirements.tsx`
- `components/checkout/CheckoutButton.tsx`
- `components/materials/ReportModal.tsx`
- `components/profile/ProfileCompletionBanner.tsx`, `AvatarUploader.tsx`
- `app/[locale]/admin/documents/page.tsx`
- `app/[locale]/konto/wishlist/page.tsx:173-185` (raw SVG heart → Lucide `Heart`)

### P-5. Clean up dual export patterns

- **Files:** `MaterialCard`, `ProfileCard`, `DashboardMaterialCard`, `SellerHeroSection`, `ReportModal`, `PurchasePanel`
- **Fix:** Pick named exports consistently, remove redundant default exports

---

## Implementation Order

```
Phase 1 (Security)     ████░░░░░░  ~1 day    — Must do first
Phase 2 (API)          ████████░░  ~3 days   — Foundation for future work
Phase 3 (Theme)        ████░░░░░░  ~1 day    — Visual consistency
Phase 4 (UI States)    ██████░░░░  ~2 days   — UX improvements
Phase 5 (A11y & i18n)  ████░░░░░░  ~1 day    — Accessibility compliance
Phase 6 (Polish)       ██████░░░░  ~2 days   — Final polish
```

Phases 3-5 can be worked in parallel. Phase 6 should come last.

---

## Tracking

Each item uses a unique ID (e.g., S-1, A-5, T-3) for reference in commits and PRs.
Mark items as done by adding `[x]` prefix or striking through.
