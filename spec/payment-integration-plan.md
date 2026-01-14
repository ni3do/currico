# Payment Integration Plan for Easy Lehrer

## Executive Summary

Easy Lehrer is a Swiss educational resource marketplace with a 15% platform fee model. The database models, seller payout fields (IBAN), and transaction tracking already exist—only the actual payment processor integration is missing.

**Recommendation: Stripe Connect + TWINT**

---

## Research Findings

### Current State of the Codebase

| Component | Status |
|-----------|--------|
| Transaction model (Prisma) | ✅ Exists - amount in cents, status enum |
| Platform fee calculation | ✅ Exists - 15% hardcoded |
| Seller payout fields | ✅ Exists - IBAN, legal name, address |
| Seller dashboard | ✅ Exists - shows earnings with fee breakdown |
| Admin transaction monitoring | ✅ Exists - daily/weekly/monthly summaries |
| Payment processor integration | ❌ Missing |
| Checkout flow | ❌ Missing |
| Webhook handlers | ❌ Missing |

### Payment Gateway Comparison

#### Option 1: Stripe Connect (Recommended)

**Pros:**
- Industry standard for marketplaces (Shopify, DoorDash use it)
- Built-in split payments with configurable fee retention
- Native TWINT support (Swiss customers can pay via their banking app)
- Handles seller onboarding, KYC, tax forms
- Supports Swiss IBAN payouts
- Delayed payouts / escrow-like functionality
- Excellent documentation and SDKs
- Stripe Elements for embedded checkout

**Cons:**
- ~2.9% + CHF 0.30 per transaction (standard card fees)
- TWINT has 5,000 CHF max per transaction
- Requires functional public website (you have this)

**TWINT via Stripe:**
- Single integration handles both cards AND TWINT
- Customers scan QR code (desktop) or redirect to TWINT app (mobile)
- Immediate payment confirmation
- Very popular in Switzerland (~5 million users)

#### Option 2: Payrexx (Swiss Alternative)

**Pros:**
- Swiss company headquartered in Lugano
- Native TWINT + PostFinance support
- Simple API with redirect or modal integration
- CHF 15/month for Standard plan with API access
- 30% discount for startups

**Cons:**
- Less sophisticated marketplace features
- No built-in split payments (manual handling needed)
- Smaller ecosystem compared to Stripe
- Less documentation and community support

#### Option 3: Mollie

**Pros:**
- Available in Switzerland
- Split payments with delayed routing
- Good for EUR transactions

**Cons:**
- Split payments only support EUR/GBP (not CHF)
- No native TWINT support
- Better suited for EU-focused businesses

---

## Recommendation: Stripe Connect + TWINT

### Why Stripe Connect?

1. **Perfect marketplace fit** - Handles the complexities of multi-party payments
2. **Single integration** - One codebase handles cards, TWINT, Apple Pay, Google Pay
3. **Swiss compliance** - Supports CH businesses and CHF currency
4. **Seller management** - Automated onboarding, KYC verification, tax reporting
5. **Your 15% fee** - Natively supported via `application_fee_amount` parameter
6. **IBAN payouts** - Works with your existing payout fields

### Implementation Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Easy Lehrer                          │
├─────────────────────────────────────────────────────────────┤
│  Buyer                  Platform                   Seller   │
│    │                       │                          │     │
│    │  1. Purchase          │                          │     │
│    ├──────────────────────>│                          │     │
│    │                       │                          │     │
│    │  2. Stripe Checkout   │                          │     │
│    │<──────────────────────│                          │     │
│    │                       │                          │     │
│    │  3. Pay (Card/TWINT)  │                          │     │
│    ├───────────────────────┼──────────────────────────│     │
│    │                       │                          │     │
│    │                       │  4. Webhook: payment     │     │
│    │                       │<─────────────────────────│     │
│    │                       │     succeeded            │     │
│    │                       │                          │     │
│    │                       │  5. Split: 85% to seller │     │
│    │                       │─────────────────────────>│     │
│    │                       │  Keep: 15% platform fee  │     │
│    │                       │                          │     │
│    │  6. Access resource   │                          │     │
│    │<──────────────────────│                          │     │
└─────────────────────────────────────────────────────────────┘
```

### Stripe Connect Account Types

| Type | Recommendation |
|------|----------------|
| **Express** | ✅ Best for Easy Lehrer - Stripe handles onboarding UI, KYC |
| Standard | More control but you handle everything |
| Custom | Enterprise - overkill for this use case |

---

## Implementation Steps

### Phase 1: Stripe Setup
1. Create Stripe account (if not exists)
2. Enable Stripe Connect in Dashboard
3. Enable TWINT as payment method
4. Set up webhook endpoint URL

### Phase 2: Backend Integration
1. Install Stripe SDK: `npm install stripe`
2. Create API routes:
   - `POST /api/payments/create-checkout-session` - Initiate purchase
   - `POST /api/payments/webhook` - Handle Stripe events
   - `POST /api/seller/connect` - Onboard seller to Stripe
   - `GET /api/seller/connect/status` - Check onboarding status
3. Update Transaction model to store Stripe payment intent ID
4. Implement webhook handlers for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `account.updated` (seller onboarding)

### Phase 3: Seller Onboarding
1. Create Stripe Connect Express account for each seller
2. Generate onboarding link
3. Store Stripe account ID in User model
4. Verify seller can receive payouts before allowing sales

### Phase 4: Checkout Flow
1. Create checkout session with:
   - Resource price
   - `payment_method_types: ['card', 'twint']`
   - `application_fee_amount` (15% of price)
   - `transfer_data.destination` (seller's Stripe account)
2. Redirect buyer to Stripe Checkout
3. Handle success/cancel redirects

### Phase 5: Post-Purchase
1. On webhook success: Create Transaction record with COMPLETED status
2. Grant buyer access to resource download
3. Update seller dashboard with new sale

---

## Database Changes Needed

```prisma
model User {
  // Existing fields...

  // Add for Stripe Connect
  stripe_account_id     String?   // Stripe Connect account ID
  stripe_onboarding_complete Boolean @default(false)
}

model Transaction {
  // Existing fields...

  // Add for payment tracking
  stripe_payment_intent_id String?  @unique
  stripe_checkout_session_id String?
}
```

---

## Files to Modify/Create

| File | Action |
|------|--------|
| `prisma/schema.prisma` | Add Stripe fields to User and Transaction |
| `app/api/payments/create-checkout-session/route.ts` | Create - checkout initiation |
| `app/api/payments/webhook/route.ts` | Create - Stripe webhook handler |
| `app/api/seller/connect/route.ts` | Create - seller onboarding |
| `components/checkout/CheckoutButton.tsx` | Create - purchase UI component |
| `app/resources/[id]/page.tsx` | Modify - add checkout button |
| `lib/stripe.ts` | Create - Stripe client initialization |
| `.env` | Add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |

---

## Cost Analysis

| Item | Cost |
|------|------|
| Stripe fee (cards) | ~2.9% + CHF 0.30 |
| Stripe fee (TWINT) | Similar to cards |
| Stripe Connect fee | Included |
| Your platform fee | 15% (retained) |

**Example CHF 10 resource:**
- Stripe takes: ~CHF 0.59 (2.9% + 0.30)
- Platform keeps: CHF 1.50 (15%)
- Seller receives: CHF 7.91

---

## Verification Plan

1. **Test card payments** using Stripe test cards (4242 4242 4242 4242)
2. **Test TWINT** using Stripe test mode (simulated TWINT flow)
3. **Verify webhook** receives events and updates Transaction status
4. **Check seller dashboard** shows correct earnings after purchase
5. **Confirm resource access** is granted after successful payment

---

## Alternative: TWINT-Only via Payrexx

If you prefer a simpler Swiss-only solution without full marketplace features:

1. Sign up for Payrexx (CHF 15/month)
2. Use their redirect integration
3. Manually handle seller payouts via your existing IBAN fields
4. Less automation but simpler initial setup

This is viable for MVP but will require more manual work as you scale.

---

## Sources

- [Stripe Connect Documentation](https://docs.stripe.com/connect)
- [Stripe TWINT Integration](https://docs.stripe.com/payments/twint)
- [Stripe Marketplace Guide](https://docs.stripe.com/connect/marketplace)
- [Payrexx API Documentation](https://developers.payrexx.com/docs/payrexx-gateway)
- [Payrexx Pricing](https://payrexx.com/en/prices)
- [Mollie Marketplace Payments](https://docs.mollie.com/docs/connect-marketplaces-processing-payments)
