# Consistency & Quality Audit — Implementation Plan

> Generated from a full-project audit covering all pages, components, API routes, and patterns.
> **53 improvements** organized into 6 phases by priority and dependency.

---

## Phase 1: Security & Critical Fixes ✅ COMPLETE

**Goal:** Fix security vulnerabilities and data integrity risks.
**Estimated scope:** 7 files

### [x] S-1. Protect metrics endpoint

- **File:** `app/api/metrics/route.ts`
- **Issue:** Prometheus metrics exposed with no auth or rate limiting
- **Fix:** Already has `requireAdmin()` + `unauthorizedResponse()` guard

### [x] S-2. Remove password_hash from SELECT

- **File:** `app/api/user/stats/route.ts`
- **Issue:** `password_hash` selected from DB unnecessarily
- **Fix:** Uses `prisma.user.count()` to check password existence without selecting hash

### [x] S-3. Validate admin role PATCH values

- **File:** `app/api/admin/users/[id]/route.ts:97-100`
- **Issue:** `body.role` accepts arbitrary strings
- **Fix:** Validates against `["BUYER", "SELLER", "ADMIN"]` array + allowedFields whitelist

### [x] S-4. Add rate limiting to expensive public routes

- **Files:** `api/curriculum/search`, `api/users/search`, `api/users/[id]/profile-bundle`
- **Issue:** Heavy DB queries (raw SQL, pg_trgm, 6 parallel queries) with no protection
- **Fix:** All three routes have `checkRateLimit()` with configs in `lib/rateLimit.ts:46-48`

### [x] S-5. Fix newsletter subscribe rate limiter

- **File:** `api/newsletter/subscribe/route.ts`
- **Issue:** Ad-hoc rate limiter with memory leak
- **Fix:** Replaced with shared `checkRateLimit()` from `lib/rateLimit.ts`

---

## Phase 2: Auth & API Standardization ✅ COMPLETE

**Goal:** Unify auth patterns, error handling, and response formats across all API routes.
**Estimated scope:** ~25 files

### [x] A-1. Standardize admin auth pattern

- **Files:** All 16 admin route files
- **Fix:** Renamed `unauthorizedResponse()` → `forbiddenResponse()` across all admin routes + added `code: "FORBIDDEN"` field to match `lib/api.ts` pattern. Deprecated alias kept for backwards compatibility.

### [x] A-2. Migrate routes from `auth()` to `requireAuth()`

- All 16 routes already migrated to `requireAuth()` + `unauthorized()` pattern.
- Only exception: `create-checkout-session` uses `auth()` intentionally (guest checkout support).

### [x] A-3. Migrate routes from `getCurrentUserId()` to `requireAuth()`

- All 4 routes already use `requireAuth()`.

### [x] A-4. Consolidate duplicate user/me routes

- Not duplicates: `/api/user/me` (lightweight, for login redirect) vs `/api/users/me` (full profile CRUD). Both serve distinct purposes — no change needed.

### [x] A-5. Standardize error response format

- `admin-auth.ts` `forbiddenResponse()` now returns `{ error: "Zugriff verweigert", code: "FORBIDDEN" }` matching `lib/api.ts` convention.

### [x] A-6. Standardize pagination format

- 5/6 already used `paginationResponse()`. Fixed `admin/materials/route.ts` to use `parsePagination()` + `paginationResponse()` instead of inline construction.

### [x] A-7. Add Zod validation to unvalidated routes

- Added 7 new Zod schemas across 3 validation files:
  - `lib/validations/admin.ts`: `createNewsletterSchema`, `updateNewsletterSchema`, `updateAdminUserSchema`
  - `lib/validations/auth.ts`: `changePasswordSchema`, `newsletterSubscribeSchema`
  - `lib/validations/user.ts`: `addToWishlistSchema`, `followSellerSchema`
- Updated 7 routes to use `.safeParse()`: admin newsletters (POST/PATCH), admin users PATCH, wishlist POST, following POST, change-password POST, newsletter subscribe POST.
- 5 routes already had Zod (admin messages/reports/materials PATCH, forgot-password, reset-password).
- Upload route uses FormData — manual validation is appropriate, kept as-is.

### [x] A-8. Add `isValidId()` checks to route params

- All routes already had `isValidId()` except `users/[id]/materials/route.ts` — now fixed.

### [x] A-9. Fix REST convention violations

- All admin routes already use proper `[id]` sub-routes with IDs from URL params.

### [x] A-10. Add rate limiting to comment/reply creation

- Both `comments/[id]/replies` and `comments/[id]/like` already have `checkRateLimit()`.

---

## Phase 3: Theme & Color Consistency ✅ COMPLETE

**Goal:** Ensure all components use semantic Catppuccin tokens — no hardcoded colors.
**Estimated scope:** ~15 files

### [x] T-1. Replace `bg-white` / hardcoded dark mode colors

- Already uses `bg-surface` in CookieConsent.tsx and Toggle.tsx — pre-fixed.

### [x] T-2. Replace `text-white` with `text-text-on-accent`

- All listed files already use `text-text-on-accent` — pre-fixed.

### [x] T-3. Replace hardcoded Tailwind colors with semantic tokens

- All listed files already use semantic tokens (`text-error`, `text-primary`, `ring-surface`, etc.) — pre-fixed.

### [x] T-4. Replace raw CSS variable references with semantic classes

- `var(--ctp-*)` references in page.tsx, hochladen/page.tsx, SellerHeroSection.tsx — already fixed (pre-existing).
- `var(--badge-*)` references replaced with Tailwind semantic classes:
  - `admin/documents/page.tsx`: `bg-[var(--badge-X-bg)]` → `bg-X/20`, `text-[var(--badge-X-text)]` → `text-X`
  - `admin/users/page.tsx`: Same pattern for error badge colors
  - `admin/settings/page.tsx`: `hover:bg-[var(--badge-error-bg)]` → `hover:bg-error/20`
  - `admin/messages/page.tsx`: Success badge colors → semantic
  - `components/ui/Footer.tsx`: `bg-[color-mix(...var(--ctp-red)...)]` → `bg-error/[0.12]`

### [x] T-5. Fix About page hardcoded gradients

- Already uses semantic gradients (`from-success to-primary`, `from-primary to-accent`) — pre-fixed.

---

## Phase 4: UI Consistency & Missing States ✅ COMPLETE

**Goal:** Standardize card styles, form inputs, loading/error/empty states, and page structure.
**Estimated scope:** ~20 files

### [x] U-1. Add error UI to silently-failing pages

- Added `fetchError` state + error banner with retry to `konto/page.tsx` and `konto/uploads/page.tsx`
- Added i18n keys for error messages in both `de.json` and `en.json`

### [x] U-2. Add mobile card layout for bundles

- Added responsive card view (`md:hidden`) alongside desktop table (`hidden md:block`) in `konto/bundles/page.tsx`
- Mobile cards show title, subject/cycle, status badges, publish state, and stats (materials, price, savings)

### [x] U-3. Add Footer to login page

- Already has `<Footer />` at line 516 — pre-fixed.

### [x] U-4. Add Footer to material detail loading state

- Added `<Footer />` to loading return in `materialien/[id]/page.tsx`

### [x] U-5. Verify material detail has `<h1>`

- `PurchasePanel.tsx:99` already renders `<h1>` — pre-fixed.

### [x] U-6. Standardize card border-radius

- `rounded-2xl` → `rounded-xl` in `konto/page.tsx` (5 instances), `konto/layout.tsx` (3 instances), `admin/messages/page.tsx` (1 instance)
- All konto area now consistently uses `rounded-xl`

### [x] U-7. Standardize form input styles

- Settings password inputs: `bg-surface` → `bg-bg` in `settings/account/page.tsx` (6 inputs)
- Bundle upload inputs: `rounded-xl` → `rounded-lg` in `hochladen/bundle/page.tsx` (4 inputs)

### [x] U-8. Fix filter pill size mismatch

- Already uses `text-xs` — pre-fixed.

### [x] U-9. Wrap notifications in card container

- Wrapped notifications page in `border-border bg-surface rounded-xl border p-6` container
- Removed redundant `border-border bg-surface` from inner error/empty states

### [x] U-10. Fix admin mobile nav error color

- No `hover:border-error` or `hover:text-error` found in admin layout — pre-fixed.

### [x] U-11. Standardize button usage

- `PublishPreviewModal.tsx`: Replaced custom inline button styles with `btn-tertiary` (cancel) and `btn-primary` (confirm)
- `ProfileCompletionBanner.tsx`: Already uses `btn-primary` — pre-fixed.
- `ConfirmDialog.tsx`: Already uses `btn-tertiary`/`btn-danger`/`btn-primary` — pre-fixed.
- `ProfileHero.tsx`: Kept inline Tailwind — buttons have conditional logic (follow/unfollow/share/edit) that doesn't map cleanly to btn-\* classes.

### [x] U-12. Standardize account sub-page headers

- `folge-ich/page.tsx`: Replaced `.card p-8` with `border-border bg-surface rounded-xl border p-6`, added subtitle using existing `t("description")`
- Library, Uploads, Bundles, Wishlist: All use title + subtitle + optional CTA pattern consistently
- Notifications: Title with icon, consistent after U-9 card wrapper
- Comments: Delegates to `SellerReviewsSection` which has its own header

### [x] U-13. Fix PreviewGallery conflicting styles

- No conflicting styles found — only `right-4` class used, no inline `style` override. Pre-fixed.

### [x] U-14. Use `card` class consistently

- By design: `.card` CSS class has hover:transform effects (translateY, shadow), making it appropriate only for clickable/interactive cards (e.g., material cards, profile cards). Static containers correctly use `border-border bg-surface rounded-xl border` to avoid unwanted hover animations.
- `folge-ich/page.tsx` was incorrectly using `.card` for a static container — fixed in U-12.

---

## Phase 5: Accessibility & i18n ✅ COMPLETE

**Goal:** Fix missing translations, ARIA labels, keyboard navigation, and focus indicators.
**Estimated scope:** ~12 files

### [x] I-1. Add i18n to ProfileCompletionBanner

- Already uses `useTranslations("profileCompletion")` with `t("title")`, `t("description")`, `t("button")` — pre-fixed.

### [x] I-2. Add i18n to ThemeToggle labels

- Already uses `useTranslations("theme")` with `t("light")`, `t("system")`, `t("dark")`, `t("toggle")`, `t("currentTheme")` — pre-fixed.

### [x] I-3. Add i18n to ScrollToTop

- Already uses `useTranslations("common")` with `t("scrollToTop")` — pre-fixed.

### [x] I-4. Add i18n to TopBar hamburger

- Already uses `t("toggleNavigation")` from common namespace — pre-fixed.

### [x] I-5. Fix MultiSelect accessibility

- ARIA attributes already present: `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`, `aria-label`, keyboard handling (Enter/Space/Escape) — pre-fixed.
- Default placeholder strings: Replaced hardcoded German defaults with `useTranslations("common")` for `multiSelect.placeholder`, `multiSelect.search`, `multiSelect.noResults`.
- Added `common.multiSelect.*` keys to both `de.json` and `en.json`.
- Fixed `profil/edit/page.tsx`: Added `useTranslations("settingsProfile")` and replaced hardcoded German MultiSelect labels/placeholders with `t()` calls.

### [x] I-6. Add focus-visible to card links

- All three cards already have `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`:
  - `MaterialCard.tsx:323`, `ProfileCard.tsx:90`, `DashboardMaterialCard.tsx:142` — pre-fixed.

### [x] I-7. Fix MaterialCard empty aria-label

- Added `useTranslations("common")` to MaterialCard.
- Replaced German fallback strings ("Von Wunschliste entfernen" / "Zur Wunschliste hinzufügen") with `tCommon("wishlistRemove")` / `tCommon("wishlistAdd")`.
- Added `common.wishlistAdd` and `common.wishlistRemove` keys to both `de.json` and `en.json`.

### [x] I-8. Fix Toggle missing visible label

- Added `useTranslations("common")` to Toggle component.
- Changed `aria-label={label}` to `aria-label={label || t("toggle")}` so there's always a fallback.
- Label already renders visually when provided (line 30).
- Added `common.toggle` key to both `de.json` and `en.json`.

### [x] I-9. Add aria-label to uploads sort select

- Already has `aria-label={t("sort.label")}` at line 160 — pre-fixed.

---

## Phase 6: Animation & Polish ✅ COMPLETE

**Goal:** Add consistent animations across all pages, replace inline SVGs with Lucide icons.
**Estimated scope:** ~18 files

### [x] P-1. Add FadeIn animations to key pages

- **Material detail:** FadeIn on hero section after skeleton, replaced 4 inline SVGs (Frown, AlertTriangle, Clock, FileText)
- **Contact:** FadeIn on form card and info sidebar, replaced 3 inline SVGs (Check, AlertCircle, Mail)
- **Help:** AnimatedCollapse on FAQ accordion open/close (both search results and category tabs)

### [x] P-2. Migrate Seller levels / Verified seller to FadeIn

- **Files:** `verkaeufer-stufen/page.tsx`, `verifizierter-verkaeufer/page.tsx`
- **Fix:** Replaced all `motion.section`/`motion.div` wrappers with `FadeIn`, `StaggerChildren`, `StaggerItem`. Kept `motion.div` only for animated progress bars (width animation).

### [x] P-3. Replace inline SVGs with Lucide icons (high-traffic components)

- TopBar, MaterialCard, ProfileCard: Already clean (no inline SVGs) — pre-fixed.
- `PreviewGallery.tsx` — 8 inline SVGs → Lock×3, FileText, ZoomIn, X, ChevronLeft, ChevronRight
- `PurchasePanel.tsx` — 3 inline SVGs → BadgeCheck, ChevronRight, Share2

### [x] P-4. Replace inline SVGs with Lucide icons (remaining components)

- `MultiSelect.tsx` — 2 SVGs → X, Check
- `PaginationControls.tsx` — 2 SVGs → ChevronLeft, ChevronRight
- `PasswordRequirements.tsx` — 3 SVGs → Check, Circle, AlertTriangle
- `CheckoutButton.tsx` — 2 SVGs → Loader2, ShoppingCart
- `ReportModal.tsx` — 3 SVGs → X, Check, AlertCircle
- `AvatarUploader.tsx` — 1 SVG → Camera
- `konto/wishlist/page.tsx` — 1 SVG → Heart
- ProfileCard, ProfileCompletionBanner, admin/documents: Already clean — pre-fixed.

### [x] P-5. Clean up dual export patterns

- `ReportModal.tsx` and `PurchasePanel.tsx`: Removed redundant `export default` (only named exports used).
- MaterialCard, ProfileCard, DashboardMaterialCard, SellerHeroSection: Already use only named exports — pre-fixed.

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
