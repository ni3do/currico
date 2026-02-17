# Backend & Technical Improvements Plan

Compiled from 11 parallel codebase analyses. Excludes auth/OAuth/password-reset (handled on `oauth-salt` branch).

---

## Tier 1: Already Done / Trivial Fixes

### 1.1 Seller Cannot Review Own Material

**Status: ALREADY IMPLEMENTED** — backend guard at `app/api/materials/[id]/reviews/route.ts:181-186`, frontend conditional via `canReview` flag, E2E test exists.

**Optional UX fix (5 min):** The fallback message for sellers shows "must purchase" instead of "you own this". Add `isOwner` boolean to API response and a `cannotReviewOwn` i18n key.

- `app/api/materials/[id]/reviews/route.ts` — add `isOwner` to GET response
- `components/reviews/ReviewsSection.tsx` — conditional message based on `isOwner`
- `messages/de.json` / `messages/en.json` — add `reviews.cannotReviewOwn`

### 1.2 Total Earnings (not monthly)

**Status: ALREADY IMPLEMENTED** — API returns all-time totals, translation value already says "Gesamt".

**Fix (2 min):** Rename misleading i18n key.

- `messages/de.json:3296` — rename `"thisMonth"` key to `"total"`
- `messages/en.json:3268` — same
- `app/[locale]/konto/page.tsx:191` — `t("overview.thisMonth")` → `t("overview.total")`

---

## Tier 2: Quick Wins (< 1 hour each)

### 2.1 Minimum Price 0.50 CHF + 0.50 Steps

**Backend validation already exists** in `lib/validations/material.ts` (Zod refine). Gaps:

| What                 | File                                              | Change                                                   |
| -------------------- | ------------------------------------------------- | -------------------------------------------------------- |
| Auto-round on blur   | `app/[locale]/hochladen/page.tsx:631`             | Add `onBlur` handler calling `roundToNearestHalfFranc()` |
| Bundle API schema    | `app/api/bundles/route.ts:10`                     | Add same Zod refine as material schema                   |
| Bundle update schema | `app/api/bundles/[id]/route.ts:107`               | Same                                                     |
| Bundle form min      | `app/[locale]/hochladen/bundle/page.tsx:447`      | `min="0"` → `min="0.50"` + onBlur                        |
| Edit page            | `app/[locale]/materialien/[id]/edit/page.tsx:240` | Add onBlur + step validation                             |
| Tooltip text         | `components/upload/InfoTooltip.tsx:144`           | "CHF 1" → "CHF 0.50"                                     |
| i18n                 | `messages/de.json:1433`                           | `priceMin`: "CHF 1" → "CHF 0.50"                         |
| Shared utility       | `lib/utils/price.ts` (new)                        | `roundToNearestHalfFranc()` function                     |
| Tests                | `__tests__/price.test.ts` (new)                   | Unit tests for rounding                                  |

### 2.2 Fix Download Counts (Free + Paid)

**Root cause:** `Download` model = free, `Transaction` model = paid. Dashboard only counts transactions.

| File                                  | Change                                                     |
| ------------------------------------- | ---------------------------------------------------------- |
| `app/api/seller/dashboard/route.ts`   | Add `_count.downloads`, combine with `_count.transactions` |
| `app/api/materials/[id]/route.ts:228` | Combine both counts for `downloadCount`                    |
| `app/api/seller/level/route.ts:30-33` | Include free download count in level calc                  |
| `app/api/user/library/route.ts:90`    | Add `_count.transactions` to uploaded items                |

No frontend changes needed.

### 2.3 Show Pending/Rejected Uploads

**All statuses already fetched** — the API has no status filter. Gaps:

| File                                          | Change                                                             |
| --------------------------------------------- | ------------------------------------------------------------------ |
| `app/[locale]/konto/uploads/page.tsx:114-127` | Fix REJECTED badge (currently falls through to raw enum)           |
| `app/[locale]/konto/uploads/page.tsx`         | Add status filter pills (All / Under Review / Verified / Rejected) |
| `components/ui/DashboardMaterialCard.tsx`     | Add `"error"` badge variant for rejected                           |
| `messages/de.json` / `messages/en.json`       | Add `statusRejected`, filter labels                                |

### 2.4 Wire Missing `notifyReview()` Call

**Function exists but is never called.** One-line fix.

| File                                           | Change                                                                            |
| ---------------------------------------------- | --------------------------------------------------------------------------------- |
| `app/api/materials/[id]/reviews/route.ts:~263` | Import and call `notifyReview(material.seller_id, resource.title, review.rating)` |

### 2.5 Fix Stripe Return URLs (Critical Bug)

**Return URLs use English paths that 404:**

- `/become-seller` should be `/verkaeufer-werden`
- `/account` should be `/seller/onboarding/complete`

| File                                    | Change                                   |
| --------------------------------------- | ---------------------------------------- |
| `app/api/seller/connect/route.ts:57-58` | Fix `return_url` and `refresh_url` paths |

---

## Tier 3: Medium Effort (2-4 hours each)

### 3.1 Fuzzy Search for Materials

**Infrastructure exists:** pg_trgm extension, GIN indexes on resources.title/description, sequential fallback.

**Steps:**

1. Combine FTS + trigram into blended query in `app/api/materials/route.ts`
2. Return `searchMeta` (matchMode: exact/fuzzy) in API response
3. Add fuzzy search to `app/api/users/search/route.ts` (currently only `contains`)
4. Add GIN trigram indexes on `users.name`, `users.display_name` via migration + schema
5. Show fuzzy match indicator in `app/[locale]/materialien/page.tsx`
6. Tune similarity thresholds (title: 0.2, description: 0.15, name: 0.25)
7. Add "relevance" sort option when search query is active

**Sequence:** Migration first → API changes → frontend last.

### 3.2 Combined Creator + Cycle/Subject Filter

**Problem:** Profile search filters by self-reported subjects/cycles on user profile instead of actual published materials.

**Core change in `app/api/users/search/route.ts:44-75`:**

- Replace JSONB user-profile filtering with resource-based seller lookup
- Query `resources` table for `DISTINCT seller_id` where materials match filters
- Use `Prisma.sql` tagged templates (not `$queryRawUnsafe`)
- Optionally return `matchingResourceCount` per seller

**Files:** Only `app/api/users/search/route.ts` must change. Frontend already sends correct params.

### 3.3 Login Redirect (callbackUrl)

**Problem:** 15+ locations redirect to `/anmelden` without `callbackUrl`. Users always land on `/konto`.

**Architecture:**

1. New utility `lib/utils/login-redirect.ts` — `getLoginUrl(returnTo)`, `isValidCallbackUrl(url)`
2. New component `components/ui/LoginLink.tsx` — auto-appends current pathname
3. Login page reads `callbackUrl` from search params for both credentials + OAuth
4. Registration page forwards `callbackUrl`
5. Update ~15 call sites across the app

**Security:** Validate callbackUrl starts with `/`, not `//`, no `\`.

**Files touched:** 18 files (2 new, 16 modified). See detailed plan for full list.

### 3.4 Seller Points/Levels Rework

**Problems found:**

- Activity gates (`minUploads`/`minDownloads`) invisible to users
- `SellerBadge` calls `getCurrentLevel(points)` without stats → wrong level
- Free downloads not counted for XP
- No level-up notification
- Hardcoded German strings bypass i18n

**Steps:**

1. Refactor `lib/utils/seller-levels.ts` — add `DetailedProgress` type with `blockers` array
2. Fix `app/api/seller/level/route.ts` — count free downloads, add level-up notification
3. Enhance `components/account/SellerLevelCard.tsx` — render blockers, wire verification
4. Fix `SellerBadge` — accept cached level or stats
5. Update `app/[locale]/verkaeufer-stufen/page.tsx` — show activity requirements, i18n
6. Add i18n keys

---

## Tier 4: Larger Features (1-2 days each)

### 4.1 Notification System Overhaul

#### Phase 1: Author Notifications (half day)

1. Add `COMMENT` to `NotificationType` enum in schema + migrate
2. Add `notifyComment()` + `notifyCommentReply()` to `lib/notifications.ts`
3. Wire `notifyReview()` into review route (Tier 2.4 above)
4. Wire `notifyComment()` into `app/api/materials/[id]/comments/route.ts`
5. Wire reply notification into `app/api/comments/[id]/replies/route.ts`
6. Wire "new material from followed seller" notification on publish
7. Fix `TYPE_TO_PREF` mapping (FOLLOW maps to wrong preference)
8. Add COMMENT icon/color to notification list page
9. Add `notify_comments`, `notify_new_followers` to User model

#### Phase 2: Email Templates + Unsubscribe (half day)

1. Create shared email template in `lib/email-templates.ts`
2. HMAC-based unsubscribe tokens (no DB change)
3. `GET /api/unsubscribe` endpoint
4. Add unsubscribe footer to all notification emails

#### Phase 3: Newsletter System (1 day)

1. `Newsletter` model + `NewsletterSubscriber` model in schema
2. Admin CRUD API at `app/api/admin/newsletters/`
3. Admin UI page
4. Batch sending logic with rate limiting
5. Double opt-in for non-user subscribers
6. Public signup CTA

#### Phase 4: Polish

1. Notification type filtering + pagination
2. Expand `NotificationType` enum (NEW_MATERIAL, PRICE_DROP, MATERIAL_UPDATE)
3. Reduce poll interval to 30s (SSE later)
4. Notification cleanup/retention (90 day TTL)

### 4.2 Stripe Onboarding Flow

**Critical bug fix** (Tier 2.5) plus:

1. Handle `?stripe_refresh=true` on verkaeufer-werden page
2. Add status awareness — call `/api/seller/connect/status` on page load
3. Add visual progress stepper (4 steps: Login → Verify Email → Accept Terms → Connect Stripe)
4. Pre-fill seller data (name) into Stripe account creation via `lib/stripe.ts`
5. Fix onboarding complete page buttons to generate new Stripe link directly
6. Fix account StripeConnectStatus component's "Einrichtung abschliessen" button
7. Add i18n keys for all new UI states

---

## Implementation Priority (Suggested Order)

| Priority | Item                         | Effort | Impact                                    |
| -------- | ---------------------------- | ------ | ----------------------------------------- |
| P0       | 2.5 Fix Stripe return URLs   | 5 min  | Critical bug — users get 404 after Stripe |
| P0       | 2.4 Wire notifyReview()      | 5 min  | Author notifications broken               |
| P0       | 1.2 Rename earnings i18n key | 2 min  | Code hygiene                              |
| P1       | 2.2 Fix download counts      | 30 min | Seller dashboard shows wrong numbers      |
| P1       | 2.1 Price validation         | 45 min | Upload integrity                          |
| P1       | 2.3 Pending uploads display  | 30 min | Seller UX                                 |
| P2       | 3.1 Fuzzy search             | 3 hrs  | Search UX                                 |
| P2       | 3.2 Creator + filter         | 2 hrs  | Search accuracy                           |
| P2       | 3.3 Login redirect           | 3 hrs  | Auth UX (18 files)                        |
| P2       | 3.4 Levels rework            | 4 hrs  | Seller motivation                         |
| P3       | 4.1 Notifications Phase 1    | 4 hrs  | Author engagement                         |
| P3       | 4.2 Stripe onboarding        | 4 hrs  | Seller onboarding                         |
| P4       | 4.1 Notifications Phase 2-4  | 2 days | Platform maturity                         |

---

## Cross-Cutting Discovery: Download vs Transaction Model

Multiple analyses independently flagged the same issue: `Download` (free) and `Transaction` (paid) are separate Prisma models. Features that only count one miss the other:

| Feature                       | Currently counts    | Should count |
| ----------------------------- | ------------------- | ------------ |
| Seller dashboard downloads    | Transactions only   | Both         |
| Material detail downloadCount | Depends on endpoint | Both         |
| Seller level XP               | Transactions only   | Both         |
| Uploads page download count   | Downloads only      | Both         |

**Fix once, benefits 4+ features.**
