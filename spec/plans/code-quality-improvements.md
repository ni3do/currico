# Code Quality & Technical Improvements

**Created:** 2026-02-21
**Status:** Active
**Goal:** Improve code quality, performance, security, and data integrity across the codebase.

---

## 1. Dead Code Cleanup

- [x] Remove unused exports from `lib/json-array.ts` (`jsonArrayContains`, `jsonArrayHasSome`, `jsonArrayHasEvery`)
- [x] Remove unused hook `lib/hooks/useApiError.ts`
- ~~Remove unused hook `lib/hooks/usePlausible.ts`~~ — KEPT: Plausible is integrated (PlausibleProvider in root layout), hook needed for custom event tracking

---

## 2. Database Indexes

Add missing indexes to `prisma/schema.prisma`:

- [x] `Comment` — `@@index([user_id])`
- [x] `Review` — `@@index([user_id])`
- [x] `Follow` — `@@index([follower_id])`
- [x] `Transaction` — `@@index([created_at])`
- [x] `Resource` — `@@index([is_published, is_public, created_at])` (composite for search)
- [x] `Collection` — `@@index([owner_id, is_public])` (composite for public collections)
- [x] Create migration (`20260221100000_add_missing_indexes`) — apply with `npm run db:migrate`

---

## 3. Database Integrity Constraints

Add check constraints via Prisma migration:

- [x] `Review.rating` — CHECK (rating >= 1 AND rating <= 5)
- [x] `Transaction.amount` — CHECK (amount > 0)
- [x] `Resource.price` — CHECK (price >= 0)
- [x] `Bundle.price` — CHECK (price >= 0)
- [x] `Follow` — CHECK (follower_id != followed_id)
- [x] Migration created (`20260221110000_add_check_constraints`) — apply with `npm run db:migrate`

---

## 4. API Error Code Standardization

Replace hardcoded German/English error messages with error codes from `API_ERROR_CODES` in `lib/api.ts`. Client handles i18n translation.

- [x] `app/api/auth/register/route.ts` — use error codes instead of hardcoded messages
- [x] `app/api/auth/forgot-password/route.ts` — use error codes, use `rateLimited()` helper
- [x] `app/api/contact/route.ts` — use error codes
- [x] `app/api/upload/route.ts` — use error codes
- [x] `app/api/payments/create-checkout-session/route.ts` — replace ~10 hardcoded German messages
- [x] `app/api/payments/checkout-session/[sessionId]/route.ts` — use error codes
- [x] `app/api/reviews/[id]/route.ts` — use error codes
- [x] `app/api/materials/[id]/reviews/route.ts` — use error codes
- [x] Updated test assertions in `__tests__/api/payments/checkout.test.ts`, `__tests__/api/auth/register.test.ts`, `__tests__/api/contact.test.ts`
- [ ] Remaining: ~50+ API routes still have hardcoded German messages (see Step 7)

---

## 5. Performance — Query Optimization

- [x] `api/user/library/route.ts` — combined count queries into main Promise.all (4 parallel queries)
- [x] `api/users/[id]/profile-bundle/route.ts` — added cache headers (`s-maxage=60, stale-while-revalidate=300`)
- [x] `api/users/[id]/materials/route.ts` — added cache headers (`s-maxage=300, stale-while-revalidate=600`)
- [x] `api/seller/dashboard/route.ts` — added cache headers (`private, max-age=30`)

---

## 6. Performance — Component Optimization

- [x] `components/search/MaterialsGrid.tsx` — wrapped with `memo()`
- [ ] Consider lazy-loading: `CurriculumBox`, `PreviewGallery`, `ReviewsSection` (below fold)

---

## 7. Code Consolidation

- [x] Extract shared `getCategoryDir()` into `lib/storage/types.ts`, used by both local and s3 adapters
- [x] Replace `console.error()` calls in API routes with `captureError()` from `lib/api-error.ts` (for Sentry integration) — 0 `console.error` calls remain in `app/api/`
- [x] Replace remaining hardcoded German error messages across all API routes with English equivalents

---

## 8. Type Safety

- [x] Fix `as any` cast in `i18n/request.ts:8` — cast `routing.locales` to `readonly string[]`
- [x] Fix `as any` in `__tests__/api/payments/checkout.test.ts:35` — use `ReturnType<typeof vi.fn>`

---

## Summary

| #         | Category                  | Items  | Priority |
| --------- | ------------------------- | ------ | -------- |
| 1         | Dead Code Cleanup         | 3      | Quick    |
| 2         | Database Indexes          | 7      | High     |
| 3         | Database Integrity        | 5      | High     |
| 4         | API Error Standardization | 8      | Medium   |
| 5         | Query Optimization        | 4      | Medium   |
| 6         | Component Optimization    | 2      | Low      |
| 7         | Code Consolidation        | 2      | Low      |
| 8         | Type Safety               | 2      | Quick    |
| **Total** |                           | **33** |          |
