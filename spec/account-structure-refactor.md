# Account Structure Refactor Spec

This spec documents the decisions and implementation plan for refactoring the account system to properly support Stripe Connect.

## Summary of Decisions

| Decision | Choice |
|----------|--------|
| Role system | Use `role` enum only, remove `is_seller` boolean |
| Payout fields | Remove all (IBAN, address, legal names) - Stripe handles |
| Seller verification | Trust Stripe KYC only, remove `seller_verified` |
| User roles | BUYER, SELLER, ADMIN (remove SCHOOL for now) |
| Email verification | Required before becoming a seller |
| Seller terms | Show and require acceptance before Stripe onboarding |
| Platform fee | 30% (hardcoded constant) |
| Seller onboarding UI | Prominent CTAs on landing, dashboard, resource pages |
| Guest checkout | Allowed - email delivery + prompt to create account |
| Migration | Fresh start, no existing sellers to migrate |
| Profile edit page | Public profile + account settings combined |

---

## Phase 1: Schema Cleanup

Remove deprecated fields and simplify the role system.

### Tasks

- [x] **1.1** Remove `is_seller` field from User model
- [x] **1.2** Remove `seller_verified` field from User model
- [x] **1.3** Remove `payout_enabled` field from User model
- [x] **1.4** Remove `legal_first_name` field from User model
- [x] **1.5** Remove `legal_last_name` field from User model
- [x] **1.6** Remove `iban` field from User model
- [x] **1.7** Remove `address_street` field from User model
- [x] **1.8** Remove `address_city` field from User model
- [x] **1.9** Remove `address_postal` field from User model
- [x] **1.10** Remove `address_country` field from User model
- [x] **1.11** Remove `SCHOOL` from UserRole enum
- [x] **1.12** Add `stripe_customer_id` field (for buyers making purchases)
- [x] **1.13** Add `stripe_charges_enabled` field (synced from Stripe webhook)
- [x] **1.14** Add `stripe_payouts_enabled` field (synced from Stripe webhook)
- [x] **1.15** Add `seller_terms_accepted_at` field (DateTime, nullable)
- [x] **1.16** Run Prisma migration
- [x] **1.17** Update `publicProfileSelect` in `lib/db.ts`
- [x] **1.18** Update `privateProfileSelect` in `lib/db.ts`
- [x] **1.19** Update `adminProfileSelect` in `lib/db.ts`

### New Schema (Target State)

```prisma
enum UserRole {
  BUYER
  SELLER
  ADMIN
}

model User {
  // Identity
  id              String    @id @default(cuid())
  email           String    @unique
  emailVerified   DateTime?
  name            String?
  display_name    String?
  image           String?
  password_hash   String?

  // Profile
  bio             String?
  subjects        String[]
  cycles          String[]
  cantons         String[]

  // Role
  role            UserRole  @default(BUYER)

  // Stripe
  stripe_customer_id          String?   // Buyer's Stripe customer
  stripe_account_id           String?   // Seller's Express account
  stripe_onboarding_complete  Boolean   @default(false)
  stripe_charges_enabled      Boolean   @default(false)
  stripe_payouts_enabled      Boolean   @default(false)

  // Seller
  seller_terms_accepted_at    DateTime?

  // System
  is_protected    Boolean   @default(false)
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  // Relations...
}
```

---

## Phase 2: API Cleanup

Update API routes to use new schema.

### Tasks

- [x] **2.1** Update `POST /api/auth/register` - remove accountType "school" option
- [x] **2.2** Update `GET /api/users/me` - remove payout fields from response
- [x] **2.3** Update `PATCH /api/users/me` - remove payout field handling
- [x] **2.4** Update `GET /api/admin/users` - remove is_seller/seller_verified logic
- [x] **2.5** Update `PATCH /api/admin/users/[id]` - simplify status logic
- [x] **2.6** Update `GET /api/seller/dashboard` - use `role === 'SELLER'` check
- [x] **2.7** Search codebase for `is_seller` references and update
- [x] **2.8** Search codebase for `seller_verified` references and update
- [x] **2.9** Search codebase for `payout_enabled` references and update

---

## Phase 3: UI Cleanup

Update frontend to match new schema.

### Tasks

- [x] **3.1** Update profile edit page - remove payout info section
- [x] **3.2** Update registration form - remove school account type option
- [x] **3.3** Update dashboard sidebar - use `role` instead of `is_seller`
- [x] **3.4** Update admin user management - simplify status display
- [x] **3.5** Remove any "Payout Information" UI components

---

## Phase 4: Email Verification

Implement email verification requirement for sellers.

### Tasks

- [x] **4.1** Create email verification token model (or use existing)
- [x] **4.2** Create `POST /api/auth/send-verification` endpoint
- [x] **4.3** Create `GET /api/auth/verify-email` endpoint
- [x] **4.4** Create verification email template
- [x] **4.5** Add "Verify Email" prompt in dashboard for unverified users
- [x] **4.6** Block seller onboarding if email not verified
- [x] **4.7** Add resend verification option

---

## Phase 5: Seller Terms

Create seller terms acceptance flow.

### Tasks

- [x] **5.1** Create seller terms content (markdown or page)
  - Platform fee: 30%
  - Payout schedule (Stripe default: 2-7 days)
  - Content policies
  - Prohibited content
- [ ] **5.2** Create `/become-seller` page with terms display
- [ ] **5.3** Add "I accept the seller terms" checkbox
- [ ] **5.4** Create `POST /api/seller/accept-terms` endpoint
- [ ] **5.5** Record `seller_terms_accepted_at` timestamp
- [ ] **5.6** Gate Stripe onboarding on terms acceptance

---

## Phase 6: Stripe Connect Integration

Implement the actual Stripe Connect flow.

### Tasks

- [ ] **6.1** Install Stripe packages: `npm install stripe @stripe/stripe-js`
- [ ] **6.2** Create `lib/stripe.ts` with Stripe client
- [ ] **6.3** Add environment variables to `.env.example`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- [ ] **6.4** Create `POST /api/seller/connect` - creates Express account + onboarding link
- [ ] **6.5** Create `GET /api/seller/connect/status` - returns current Stripe status
- [ ] **6.6** Create `POST /api/payments/webhook` - handles Stripe webhooks
- [ ] **6.7** Handle `account.updated` webhook - sync charges/payouts enabled
- [ ] **6.8** Create seller onboarding return page `/seller/onboarding/complete`
- [ ] **6.9** Update user role to SELLER when Stripe onboarding complete

### Platform Fee Configuration

```typescript
// lib/constants.ts
export const PLATFORM_FEE_PERCENT = 30;
```

---

## Phase 7: Seller Onboarding UI

Create the "Become a Seller" experience.

### Tasks

- [ ] **7.1** Create `/become-seller` page layout
  - Benefits section (reach teachers, earn money)
  - Fee disclosure (30% platform fee)
  - Requirements (email verified, accept terms)
  - "Start Stripe Onboarding" button
- [ ] **7.2** Create `StripeConnectStatus` component for seller dashboard
  - Shows onboarding status (complete/incomplete)
  - "Open Stripe Dashboard" button (link to Express dashboard for earnings)
  - Status indicators (charges enabled, payouts enabled)
- [ ] **7.3** Add "Start Selling" CTA to landing page
- [ ] **7.4** Add "Start Selling" CTA to buyer dashboard
- [ ] **7.5** Add "Start Selling" CTA to resource browse page
- [ ] **7.6** Create i18n translations for all seller onboarding text

---

## Phase 8: Guest Checkout

Enable purchasing without an account.

### Tasks

- [ ] **8.1** Update checkout flow to accept email without auth
- [ ] **8.2** Create guest transaction record (link by email, no user_id)
- [ ] **8.3** Create download token system for guest access
- [ ] **8.4** Create purchase confirmation email with download link
- [ ] **8.5** Create `/download/[token]` page for guest downloads
- [ ] **8.6** Add "Create account to save to library" prompt after purchase
- [ ] **8.7** Handle account creation - link past purchases by email
- [ ] **8.8** Set download link expiration (7 days, 3 downloads max)

---

## Phase 9: Checkout Flow

Implement actual payment processing.

### Tasks

- [ ] **9.1** Create `POST /api/payments/create-checkout-session` endpoint
- [ ] **9.2** Create `CheckoutButton` component
- [ ] **9.3** Create `/checkout/success` page
- [ ] **9.4** Create `/checkout/cancel` page
- [ ] **9.5** Handle `checkout.session.completed` webhook
- [ ] **9.6** Create Transaction record on successful payment
- [ ] **9.7** Grant resource access to buyer
- [ ] **9.8** Handle `payment_intent.payment_failed` webhook
- [ ] **9.9** Enable TWINT payment method in Stripe dashboard
- [ ] **9.10** Test card payments with test keys
- [ ] **9.11** Test TWINT payments with test keys

---

## Phase 10: Testing & Launch Prep

### Tasks

- [ ] **10.1** Write tests for seller onboarding flow
- [ ] **10.2** Write tests for checkout flow
- [ ] **10.3** Write tests for webhook handlers
- [ ] **10.4** Test guest checkout end-to-end
- [ ] **10.5** Test account creation after guest purchase
- [ ] **10.6** Configure Stripe webhooks in production
- [ ] **10.7** Verify Stripe Connect Express settings
- [ ] **10.8** Update Terms of Service with seller terms

---

## Dependencies Between Phases

```
Phase 1 (Schema)
    ↓
Phase 2 (API) + Phase 3 (UI)  [parallel]
    ↓
Phase 4 (Email Verify)
    ↓
Phase 5 (Seller Terms)
    ↓
Phase 6 (Stripe Connect) + Phase 7 (Onboarding UI)  [parallel]
    ↓
Phase 8 (Guest Checkout) + Phase 9 (Checkout Flow)  [parallel]
    ↓
Phase 10 (Testing)
```

---

## Resolved Questions

1. **Download link expiration**: 7 days, 3 downloads max
2. **Seller dashboard**: Link to Stripe Express dashboard (no custom earnings UI)
3. **Refund policy**: TBD - handle via Stripe dashboard for now

---

## Notes

- Platform fee is 30% and hardcoded in `lib/constants.ts`
- Fee is passed to Stripe as `application_fee_amount` in checkout session
- Stripe calculates: `seller_payout = gross - stripe_fees - platform_fee`
- All monetary amounts should use integers (cents/rappen) to avoid floating point issues
