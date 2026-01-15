# Stripe Connect + TWINT Integration Plan

## Overview

Integrate Stripe Connect with TWINT support for the Easy-Lehrer marketplace. The codebase already has Stripe fields in the Prisma schema - this plan covers the complete implementation from account setup to production deployment.

---

## Part 1: Account & Provider Setup

### Step 1.1: Create Stripe Account
- [ ] Sign up at https://dashboard.stripe.com/register
- [ ] Complete business verification (Swiss company details)
- [ ] Add bank account for receiving platform fees

### Step 1.2: Enable Stripe Connect
- [ ] Go to Dashboard → Connect → Settings
- [ ] Choose "Express" account type (recommended for marketplaces)
- [ ] Configure branding (Easy-Lehrer logo, colors)
- [ ] Set payout schedule preferences

### Step 1.3: Enable TWINT Payment Method
- [ ] Go to Dashboard → Payments → Payment methods
- [ ] Enable TWINT (requires Swiss Stripe account)
- [ ] Configure TWINT display settings

### Step 1.4: Configure Webhooks
- [ ] Go to Dashboard → Developers → Webhooks
- [ ] Add endpoint: `https://easy-lehrer.ch/api/payments/webhook`
- [ ] Select events:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `account.updated`
  - `payout.paid`
- [ ] Copy webhook signing secret

### Step 1.5: Get API Keys
- [ ] Copy test mode keys for development:
  - `STRIPE_SECRET_KEY` (sk_test_...)
  - `STRIPE_PUBLISHABLE_KEY` (pk_test_...)
  - `STRIPE_WEBHOOK_SECRET` (whsec_...)
- [ ] Store production keys securely for deployment

---

## Part 2: Environment Configuration

### Step 2.1: Add Environment Variables
**File:** `.env` (and `.env.example`)

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Platform Configuration
PLATFORM_FEE_PERCENT=15
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Part 3: Backend Implementation

### Step 3.1: Create Stripe Client Utility
**File:** `lib/stripe.ts`

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});

export const PLATFORM_FEE_PERCENT = 15;

export function calculatePlatformFee(amountCents: number): number {
  return Math.round(amountCents * (PLATFORM_FEE_PERCENT / 100));
}
```

### Step 3.2: Create Checkout Session Endpoint
**File:** `app/api/payments/create-checkout-session/route.ts`

- Validates user authentication
- Verifies resource exists and is purchasable
- Checks seller has completed Stripe onboarding
- Creates Stripe Checkout Session with:
  - `payment_method_types: ['card', 'twint']`
  - `application_fee_amount` (15% platform fee)
  - `transfer_data.destination` (seller's Stripe account)
- Creates Transaction record with PENDING status
- Returns checkout session URL

### Step 3.3: Create Webhook Handler
**File:** `app/api/payments/webhook/route.ts`

- Verifies Stripe signature
- Handles events:
  - `checkout.session.completed` → Update Transaction to COMPLETED, grant resource access
  - `payment_intent.payment_failed` → Update Transaction to FAILED
  - `account.updated` → Update seller onboarding status
- Implements idempotency (check if already processed)

### Step 3.4: Create Seller Connect Endpoints
**Files:**
- `app/api/seller/connect/route.ts` - Create Connect account, generate onboarding link
- `app/api/seller/connect/status/route.ts` - Check onboarding completion status

### Step 3.5: Add Rate Limit Configuration
**File:** `lib/rateLimit.ts`

Add new endpoints:
```typescript
"payments:checkout": { limit: 10, windowMs: 60 * 1000 },
"payments:webhook": { limit: 100, windowMs: 60 * 1000 },
"seller:connect": { limit: 5, windowMs: 60 * 1000 },
```

---

## Part 4: Frontend Implementation

### Step 4.1: Create Checkout Button Component
**File:** `components/checkout/CheckoutButton.tsx`

- Props: `resourceId`, `price`, `sellerStripeAccountId`
- Shows loading state during checkout creation
- Handles free resources (direct download)
- Redirects to Stripe Checkout

### Step 4.2: Update Resource Detail Page
**File:** `app/[locale]/resources/[id]/page.tsx` (line ~220)

- Replace empty button with CheckoutButton component
- Add authentication check (redirect to login if needed)
- Handle already-purchased resources (show download instead)

### Step 4.3: Create Success/Cancel Pages
**Files:**
- `app/[locale]/checkout/success/page.tsx` - Thank you, download link
- `app/[locale]/checkout/cancel/page.tsx` - Retry option

### Step 4.4: Update Seller Dashboard
**File:** `app/[locale]/dashboard/seller/page.tsx`

- Add Stripe Connect onboarding prompt if not connected
- Show Connect status badge
- Link to Stripe Express Dashboard

### Step 4.5: Add Seller Onboarding Component
**File:** `components/seller/StripeConnectSetup.tsx`

- Shows onboarding progress
- "Connect with Stripe" button
- Verification status indicators

---

## Part 5: Database Considerations

The existing schema already includes necessary fields:

**User model:**
- `stripe_account_id` ✅
- `stripe_onboarding_complete` ✅

**Transaction model:**
- `stripe_payment_intent_id` ✅
- `stripe_checkout_session_id` ✅
- `platform_fee_amount` ✅
- `seller_payout_amount` ✅

**Optional additions for production:**
- Add `stripe_payout_id` to Transaction for settlement tracking
- Add webhook event logging table for debugging

---

## Part 6: i18n Translations

**Files:** `messages/de.json`, `messages/en.json`

Add keys for:
- Checkout flow messages
- Payment method labels (Card, TWINT)
- Success/error states
- Seller onboarding prompts

---

## Part 7: Testing & Verification

### Step 7.1: Test Card Payments
- Use test card: `4242 4242 4242 4242`
- Verify Transaction created with COMPLETED status
- Verify seller dashboard shows new sale
- Verify buyer can access/download resource

### Step 7.2: Test TWINT Payments
- Stripe test mode simulates TWINT flow
- Verify redirect to TWINT and back
- Verify same success flow as card

### Step 7.3: Test Webhook Handling
- Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/payments/webhook`
- Trigger test events
- Verify Transaction status updates

### Step 7.4: Test Seller Onboarding
- Create test seller account
- Complete Express onboarding flow
- Verify `stripe_onboarding_complete` set to true
- Test payout flow

### Step 7.5: Test Edge Cases
- Purchase already-owned resource (should prevent)
- Seller not onboarded (should show error)
- Free resource (should bypass Stripe)
- Failed payment (should update status)

---

## File Summary

| File | Action |
|------|--------|
| `.env` | Add Stripe keys |
| `lib/stripe.ts` | Create - Stripe client |
| `lib/rateLimit.ts` | Modify - Add payment endpoints |
| `app/api/payments/create-checkout-session/route.ts` | Create |
| `app/api/payments/webhook/route.ts` | Create |
| `app/api/seller/connect/route.ts` | Create |
| `app/api/seller/connect/status/route.ts` | Create |
| `components/checkout/CheckoutButton.tsx` | Create |
| `components/seller/StripeConnectSetup.tsx` | Create |
| `app/[locale]/resources/[id]/page.tsx` | Modify - Add checkout |
| `app/[locale]/checkout/success/page.tsx` | Create |
| `app/[locale]/checkout/cancel/page.tsx` | Create |
| `app/[locale]/dashboard/seller/page.tsx` | Modify - Add Connect UI |
| `messages/de.json` | Modify - Add translations |
| `messages/en.json` | Modify - Add translations |

---

## Implementation Order

1. **Account Setup** (Part 1) - Stripe account, Connect, TWINT, webhooks
2. **Environment** (Part 2) - Add API keys to env
3. **Stripe Client** (Step 3.1) - Create utility
4. **Checkout API** (Steps 3.2-3.3) - Backend routes
5. **Seller Connect API** (Step 3.4) - Onboarding endpoints
6. **Checkout UI** (Steps 4.1-4.3) - Frontend components
7. **Seller Dashboard** (Steps 4.4-4.5) - Connect integration
8. **Translations** (Part 6) - i18n strings
9. **Testing** (Part 7) - End-to-end verification

---

## Dependencies

```bash
npm install stripe @stripe/stripe-js
```

- `stripe` - Server-side SDK for API calls
- `@stripe/stripe-js` - Client-side SDK for Stripe Elements (optional, using hosted Checkout)
