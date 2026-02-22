# Deep Project Audit — February 2026

> **Created:** 2026-02-22
> **Status:** Backlog — prioritized for post-launch hardening
> **Source:** Full automated scan of all components, API routes, pages, database, auth, config, and tests

---

## Summary

| Priority              | Count  | Description                                       |
| --------------------- | ------ | ------------------------------------------------- |
| P0 — Critical         | 10     | Security vulnerabilities, data integrity risks    |
| P1 — High             | 18     | Auth hardening, missing headers, storage security |
| P2 — Medium (SEO)     | 8      | Missing metadata, sitemap, canonical URLs         |
| P2 — Medium (i18n)    | 5      | Hardcoded routes, German strings                  |
| P2 — Medium (DB)      | 6      | Missing indexes, fields, constraints              |
| P2 — Medium (API)     | 3      | Validation gaps                                   |
| P2 — Medium (Testing) | 5      | Massive coverage gaps                             |
| P2 — Medium (Code)    | 6      | Memory leaks, console.error, Sentry config        |
| P2 — Medium (UI)      | 6      | Image optimization, focus styles, debounce        |
| P3 — Low              | 10     | TypeScript strictness, Docker, CI, nice-to-haves  |
| **Total**             | **77** |                                                   |

---

## P0 — Critical (Security & Data Integrity)

### ~~SEC-1: In-memory rate limiting breaks at scale~~ — DEFERRED

- **File:** `lib/rateLimit.ts:21`
- **Issue:** Per-process `Map` store. With N instances, effective rate limit = N times configured limit.
- **Status:** Not a problem for current single-instance Dokploy deployment. Revisit if scaling.

### SEC-2: TOTP encryption key has no rotation support — DEFERRED

- **File:** `lib/totp.ts:11-16`
- **Issue:** Single immutable key. If leaked, ALL 2FA secrets are decryptable. No key versioning.
- **Status:** Needs migration strategy. Current encryption is solid; rotation is defense-in-depth.

### ~~SEC-3: Backup codes use unsalted SHA-256~~ — DONE

- **File:** `lib/totp.ts:92-109`
- **Fix applied:** Added per-code random salt (16 bytes). Backwards compatible with legacy unsalted hashes.

### ~~SEC-4: Email header injection in contact form~~ — DONE

- **File:** `lib/email.ts`
- **Fix applied:** Added `sanitizeHeaderValue()` to strip CRLF from all email subjects and replyTo fields.

### ~~SEC-5: Stripe webhook swallows errors~~ — DONE

- **File:** `app/api/payments/webhook/route.ts:72-75`
- **Fix applied:** Returns 500 with `INTERNAL_ERROR` code so Stripe retries delivery.

### ~~SEC-6: Download count race condition~~ — DONE

- **File:** `app/api/download/[token]/route.ts`
- **Fix applied:** Atomic `updateMany` with `{ download_count: { lt: max_downloads } }` before serving file. Prevents concurrent bypass.

### ~~SEC-7: Material deletion ignores REFUNDED transactions~~ — DONE

- **File:** `app/api/materials/[id]/route.ts:416`
- **Fix applied:** Now checks `status: { in: ["COMPLETED", "REFUNDED"] }`.

### ~~DB-1: Missing cascade/restrict on Resource.seller~~ — DONE

- **File:** `prisma/schema.prisma:270`
- **Fix applied:** Added `onDelete: Restrict`.

### ~~DB-2: Missing cascade/restrict on Transaction.resource~~ — DONE

- **File:** `prisma/schema.prisma:337`
- **Fix applied:** Added `onDelete: Restrict`.

### ~~DB-3: stripe_checkout_session_id not unique~~ — DONE

- **File:** `prisma/schema.prisma:319`
- **Issue:** Multiple transactions can reference the same checkout session (idempotency risk).
- **Fix:** Add `@unique` constraint.

---

## P1 — High (Auth, Headers, Storage)

### ~~AUTH-1: JWT max age is 30 days~~ — DONE

- **File:** `lib/auth.ts:37`
- **Fix applied:** Reduced from 30 days to 7 days.

### AUTH-2: No account lockout after failed 2FA — DEFERRED

- **File:** `lib/auth.ts:85-116`
- **Issue:** Rate limiting exists but no account-level lockout. 6-digit TOTP = 1M combinations.
- **Status:** Requires schema migration (new fields). Rate limiting at 5/15min already mitigates brute-force.

### AUTH-3: No audit trail of failed 2FA attempts — DEFERRED

- **File:** `lib/auth.ts:100-102`
- **Issue:** Failed 2FA attempts not logged. Can't detect brute-force in real-time.
- **Status:** Requires new AuditLog model. Lower priority — rate limiting is the primary defense.

### ~~AUTH-4: Role changes not reflected in JWT promptly~~ — DONE

- **File:** `lib/auth.ts:143-144`
- **Fix applied:** Added `roleRefreshedAt` to JWT. Auto-refreshes from DB if older than 1 hour.

### ~~AUTH-5: Password reset token min length is 1 character~~ — DONE

- **File:** `lib/validations/auth.ts:7-13`
- **Fix applied:** Changed `.min(1)` to `.min(32)`.

### AUTH-6: Client-side auth guards flash content (FOUC) — DEFERRED

- **File:** `app/[locale]/konto/layout.tsx`
- **Issue:** `useSession()` client check shows layout before redirect.
- **Status:** Requires middleware refactor. Current behavior is functional, just shows loading briefly.

### HDR-1: Missing Content-Security-Policy — DEFERRED

- **File:** `next.config.ts`
- **Status:** CSP requires careful testing with Next.js inline scripts, Stripe.js, Sentry SDK. Too risky to add without thorough testing.

### ~~HDR-2: Missing Strict-Transport-Security (HSTS)~~ — DONE

- **Fix applied:** Added `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`.

### ~~HDR-3: Missing Permissions-Policy~~ — DONE

- **Fix applied:** Added `Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()`.
- Also added `X-Permitted-Cross-Domain-Policies: none`.

### ~~STOR-1: Path traversal in local storage~~ — DONE

- **File:** `lib/storage/adapters/local.ts:31`
- **Fix applied:** Added `validateKey()` that rejects `..`, leading slashes, and resolves path to ensure it stays within uploadDir.

### STOR-2: Storage adapters don't enforce file size limits

- **File:** `lib/storage/adapters/s3.ts:66`
- **Issue:** `MAX_MATERIAL_FILE_SIZE = 50MB` defined in validations but not enforced in adapter.
- **Fix:** Add size check in `upload()` method before writing.

### STOR-3: No rollback if DB save fails after S3 upload

- **File:** Storage transaction logic
- **Issue:** If DB operation fails after successful S3 upload, file is orphaned.
- **Fix:** Wrap in transaction that deletes S3 file on DB failure.

### ~~SMTP-1: Inconsistent TLS configuration~~ — DONE

- **File:** `lib/email.ts`
- **Fix applied:** `requireTLS: port !== 465` — all non-implicit-TLS ports now require STARTTLS.

### ENV-1: No startup validation of required env vars

- **File:** Multiple
- **Issue:** Missing `AUTH_SECRET`, `STRIPE_SECRET_KEY` etc. cause runtime crashes, not startup failures.
- **Fix:** Create `lib/env-validation.ts` that validates all required vars in `instrumentation.ts`.

### ~~API-1: No self-report prevention~~ — DONE

- **File:** `app/api/reports/route.ts`
- **Fix applied:** Blocks reporting own user ID and own materials (checks `seller_id === userId`).

### API-2: Admin newsletter send lacks CSRF protection — DEFERRED

- **File:** `app/api/admin/newsletters/[id]/send/route.ts`
- **Status:** Already requires ADMIN role via `requireAdmin()`. CSRF via session cookie is mitigated by SameSite cookie attribute. Low risk.

### ~~API-3: No idempotency on newsletter send~~ — ALREADY HANDLED

- **Status:** Code already checks `newsletter.status !== "DRAFT"` and sets to `"SENDING"` before triggering. Second request fails with "Drafts only".

### ~~API-4: Download token info leaks transaction status~~ — DONE

- **File:** `app/api/download/[token]/route.ts:87`
- **Fix applied:** Returns generic 404 ("Download link not found") instead of "Payment not completed".

---

## P2 — Medium: SEO & Metadata

### SEO-1: 20+ pages missing generateMetadata

- **Pages without any metadata:**
  - Homepage (`app/[locale]/page.tsx`)
  - Material detail (`app/[locale]/materialien/[id]/page.tsx`)
  - Profile (`app/[locale]/profil/[id]/page.tsx`)
  - Upload (`app/[locale]/hochladen/page.tsx`)
  - All account subpages (`konto/*`)
  - All admin pages (`admin/*`)
  - Checkout success/cancel
  - Blog posts (`blog/[slug]/page.tsx`)
  - Bundles, collections, willkommen, verkaeufer-werden
- **Impact:** No title/description in search results, no og:image for social sharing.

### SEO-2: Duplicate edit routes

- **Files:** Both `materialien/[id]/bearbeiten/` AND `materialien/[id]/edit/` exist.
- **Fix:** Remove one, add 301 redirect via middleware.

### SEO-3: 6 pages missing error.tsx boundaries

- materialien, hochladen, profil/[id], admin, checkout/success, checkout/cancel

### SEO-4: 5 pages missing loading.tsx boundaries

- materialien, sammlungen, verkaeufer-werden, seller/onboarding/complete, materialien/[id]/bearbeiten

### SEO-5: No sitemap.ts for dynamic routes

- **Fix:** Create `app/sitemap.ts` that queries DB for materials, profiles, bundles, blog posts.

### SEO-6: No canonical URLs on dynamic routes

- Material detail, profile, blog posts need canonical link tags.

### SEO-7: Missing breadcrumbs on 7 pages

- Admin pages, checkout pages, willkommen, konto/folge-ich

### SEO-8: 2 pages missing "use client" directive

- `konto/page.tsx` and `admin/page.tsx` use React hooks but no `"use client"` declaration.

---

## P2 — Medium: i18n

### I18N-1: Hardcoded router.push bypasses i18n routing

- **Files:** `anmelden/page.tsx:81,83`, `registrieren/page.tsx:164,171`
- **Fix:** Use `useRouter()` from `@/i18n/navigation`.

### I18N-2: Admin pages use hardcoded `/admin/*` paths

- **File:** `admin/page.tsx:112-161`
- **Fix:** Use i18n-aware Link/router.

### I18N-3: Upload form has hardcoded German "Zyklus" in JSON

- **File:** `hochladen/page.tsx:345,348`
- **Fix:** Use translation key.

### I18N-4: Locale config mismatch

- **Issue:** `locales = ["de"]` only, but `en` metadata defined in layout.tsx.
- **Fix:** Either enable `en` locale or remove `en` metadata to avoid confusion.

### I18N-5: TagInput has hardcoded German error messages

- **File:** `components/upload/TagInput.tsx:26,28`
- **Fix:** Accept translation keys instead of hardcoded strings.

---

## P2 — Medium: Database

### ~~DB-4: Missing compound index on Resource~~ — DONE

- **Fix applied:** Added `@@index([seller_id, is_published, is_public])`.

### ~~DB-5: Missing compound index on Transaction~~ — DONE

- **Fix applied:** Added `@@index([buyer_id, status, created_at])`.

### ~~DB-6: Missing indexes on Report model~~ — DONE

- **Fix applied:** Added `@@index([reported_user_id])`, `@@index([resource_id])`, `@@index([handled_by_id])`.

### ~~DB-7: Missing index on Bundle~~ — DONE

- **Fix applied:** Added `@@index([seller_id, is_published])`.

### DB-8: Transaction model missing refund tracking fields

- Add: `refund_reason String?`, `refunded_at DateTime?`, `refund_transaction_id String?`

### DB-9: User model missing brute-force protection fields

- Add: `failed_login_attempts Int @default(0)`, `locked_until DateTime?`

---

## P2 — Medium: API Validation

### ~~VAL-1: No max offset cap on materials list~~ — DONE

- **File:** `app/api/materials/route.ts:76`
- **Fix applied:** Capped page at 500 (`Math.min(500, ...)`) to prevent deep-pagination abuse.

### VAL-2: No file format validation in download endpoint

- **File:** `app/api/materials/[id]/download/route.ts:41-44`
- **Fix:** Validate `file_url` extension against allowlist before serving.

### VAL-3: Missing reusable ownership check helper

- **File:** `lib/api.ts`
- **Fix:** Add `requireOwnership(userId, ownerId)` helper to DRY ownership checks across routes.

---

## P2 — Medium: Testing

### TEST-1: Zero component tests

- 101 component files, 0 test files. No UI testing at all.
- **Fix:** Set up component testing with Vitest + React Testing Library. Start with critical components: MaterialCard, TopBar, Toast, SearchInput, CheckoutButton.

### TEST-2: Only 7 API test files for 88 routes

- **Missing tests for:** auth 2FA, payments, seller verification, upload, admin CRUD, bundles, comments.
- **Fix:** Prioritize payment and auth flows.

### TEST-3: E2E tests are smoke-only

- Only 2 tests that check page loads. No user flow coverage.
- **Fix:** Add flows: search → view → purchase, upload → publish, login → 2FA, guest checkout.

### TEST-4: No coverage thresholds in Vitest config

- **File:** `vitest.config.ts:13-23`
- **Fix:** Add `coverage.thresholds` with minimum line/branch/function targets.

### TEST-5: Missing integration tests for critical paths

- No tests for: purchase flow, seller upload workflow, 2FA setup, guest checkout linking.

---

## P2 — Medium: Code Quality

### ~~CQ-1: console.error in production hooks~~ — DONE

- **Files:** `lib/hooks/useWishlist.ts`, `useFollowing.ts`, `useAccountData.ts`
- **Fix applied:** Replaced all `console.error` with `Sentry.captureException()`.

### ~~CQ-2: Sentry session replay at 100% on errors~~ — DONE

- **File:** `sentry.client.config.ts:11`
- **Fix applied:** Reduced `replaysOnErrorSampleRate` from 1.0 to 0.2.

### ~~CQ-3: ESLint missing no-console rule~~ — DONE

- **File:** `eslint.config.mjs`
- **Fix applied:** Added `"no-console": ["warn", { allow: ["warn"] }]`.

### ~~CQ-4: SearchAutocomplete memory leak~~ — FALSE POSITIVE

- **File:** `components/search/SearchAutocomplete.tsx`
- **Status:** Cleanup already exists (lines 96-101). No fix needed.

### ~~CQ-5: SessionProvider refetchOnWindowFocus disabled~~ — DONE

- **File:** `app/providers.tsx:9`
- **Fix applied:** Changed `refetchOnWindowFocus={false}` to `true`.

### ~~CQ-6: useAccountData race condition~~ — DONE

- **File:** `lib/hooks/useAccountData.ts`
- **Fix applied:** Added AbortController with cleanup. Fetch calls cancelled on unmount, state updates skipped if aborted.

---

## P2 — Medium: UI Components

### UI-1: `<img>` used instead of `<Image>` in 2 components

- **Files:** `components/ui/PreviewGallery.tsx:335,361`, `components/profile/AvatarUploader.tsx:89`
- **Fix:** Replace with `next/image` for optimization.

### UI-2: Inconsistent focus-visible ring styles

- Various components use different focus ring patterns.
- **Fix:** Create a shared Tailwind utility class or CSS custom property for focus rings.

### UI-3: Inconsistent error message styling across forms

- Mix of `.text-error`, `.text-error mt-1 text-xs` patterns.
- **Fix:** Standardize on a single error message component.

### ~~UI-4: MaterialCard free detection relies on string comparison~~ — DONE

- **File:** `components/ui/MaterialCard.tsx:102`
- **Fix applied:** Now relies only on numeric `price === 0` check.

### UI-5: Missing debounce on wishlist/like rapid clicks

- **Files:** MaterialCard (wishlist), LikeButton
- **Fix:** Add debounce/throttle to prevent multiple API calls.

### ~~UI-6: Mobile logout button missing type="button"~~ — DONE

- **File:** `components/ui/TopBar.tsx:330`
- **Fix applied:** Added `type="button"` to mobile logout button.

---

## P3 — Low (Post-launch)

### LOW-1: TypeScript missing noUnusedLocals/noUnusedParameters

- **File:** `tsconfig.json`

### LOW-2: Extraneous @emnapi/runtime dependency

- **Fix:** Run `npm prune`.

### LOW-3: Package.json overrides unexplained

- `hono: 4.11.4`, `@auth/core: 0.41.1`, `@swc/helpers: 0.5.18` — add comments explaining why.

### LOW-4: Docker missing HEALTHCHECK directive

- **File:** `Dockerfile`

### LOW-5: CI pipeline not parallelized

- **File:** `.github/workflows/ci.yml`
- **Fix:** Split into parallel jobs: lint, typecheck, test, e2e.

### LOW-6: Health endpoint only checks DB

- **File:** `app/api/health/route.ts`
- **Fix:** Add S3, Stripe, auth provider connectivity checks.

### LOW-7: No feature flag system

- Useful for gradual rollout of new features post-launch.

### LOW-8: Missing Prisma query logging in dev mode

- **Fix:** Add `log: ["query", "warn"]` to Prisma client config in development.

### LOW-9: Footer Swiss flag emoji has no aria-label

- **File:** `components/ui/Footer.tsx:27`

### LOW-10: StarRating aria-label not contextual

- **File:** `components/ui/StarRating.tsx:88`
- Same label regardless of hover state.

---

## Suggested Implementation Order

### Phase A — Security hardening (before launch)

Items: SEC-1 through SEC-7, DB-1 through DB-3, HDR-1 through HDR-3, ENV-1, SMTP-1

### Phase B — Auth + critical API fixes (before launch)

Items: AUTH-1 through AUTH-6, API-1 through API-4, STOR-1 through STOR-3

### Phase C — SEO & metadata (first week post-launch)

Items: SEO-1 through SEO-8

### Phase D — i18n + database improvements (first month post-launch)

Items: I18N-1 through I18N-5, DB-4 through DB-9, VAL-1 through VAL-3

### Phase E — Testing foundation (ongoing)

Items: TEST-1 through TEST-5

### Phase F — Code quality + UI polish (ongoing)

Items: CQ-1 through CQ-6, UI-1 through UI-6

### Phase G — Low priority (when convenient)

Items: LOW-1 through LOW-10
