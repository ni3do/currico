# Stripe Connect Architecture Guide

This document explains how Stripe Connect works for the Currico marketplace, including account types, money flow, and the various processes involved.

---

## Table of Contents

1. [What is Stripe Connect?](#what-is-stripe-connect)
2. [Account Types Explained](#account-types-explained)
3. [The Three Parties](#the-three-parties)
4. [Money Flow in a Marketplace](#money-flow-in-a-marketplace)
5. [The Checkout Process](#the-checkout-process)
6. [TWINT Payment Flow](#twint-payment-flow)
7. [Webhooks and Events](#webhooks-and-events)
8. [Seller Onboarding Process](#seller-onboarding-process)
9. [Payouts and Settlements](#payouts-and-settlements)
10. [Platform Fees](#platform-fees)
11. [Refunds and Disputes](#refunds-and-disputes)

---

## What is Stripe Connect?

Stripe Connect is Stripe's solution for **marketplace and platform businesses** where money needs to flow between multiple parties. Instead of:

1. Buyer pays Platform
2. Platform manually pays Seller

Stripe Connect enables:

1. Buyer pays → Stripe automatically splits → Platform keeps fee, Seller receives rest

This removes the platform from being a "money transmitter" (which requires licenses) and automates the entire payment split.

### Why Use Connect Instead of Regular Stripe?

| Regular Stripe                    | Stripe Connect                     |
| --------------------------------- | ---------------------------------- |
| One merchant account              | Multiple connected accounts        |
| You receive all money             | Money splits automatically         |
| You handle payouts manually       | Stripe handles payouts             |
| You're responsible for seller KYC | Stripe handles seller verification |
| Simple e-commerce                 | Marketplaces, platforms            |

---

## Account Types Explained

Stripe Connect offers three account types. Currico uses **Express**.

### Express Accounts (Recommended)

```
┌─────────────────────────────────────────────────────┐
│                   EXPRESS ACCOUNT                    │
├─────────────────────────────────────────────────────┤
│  Stripe handles:                                     │
│  ✓ Onboarding UI (hosted forms)                     │
│  ✓ Identity verification (KYC)                      │
│  ✓ Tax form collection                              │
│  ✓ Payout scheduling                                │
│  ✓ Dashboard for sellers                            │
│                                                      │
│  Platform handles:                                   │
│  ✓ Triggering onboarding                            │
│  ✓ Checking onboarding status                       │
│  ✓ Creating payment sessions                        │
└─────────────────────────────────────────────────────┘
```

**Best for:** Most marketplaces. Minimal development effort, Stripe handles compliance.

### Standard Accounts

Sellers create their own full Stripe accounts and connect them via OAuth. They have full dashboard access and control.

**Best for:** Platforms connecting existing businesses that already have Stripe.

### Custom Accounts

Platform builds all UI and handles all verification. Maximum control, maximum responsibility.

**Best for:** Large enterprises with dedicated compliance teams.

### Why Express for Currico?

- Teachers don't need to understand Stripe
- Stripe handles Swiss compliance and tax requirements
- Onboarding takes 5-10 minutes
- Platform has no liability for seller verification
- Sellers still get a dashboard to view their earnings

---

## The Three Parties

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    BUYER     │     │   PLATFORM   │     │    SELLER    │
│  (Teacher)   │     │ (Currico)│     │  (Teacher)   │
├──────────────┤     ├──────────────┤     ├──────────────┤
│              │     │              │     │              │
│ Pays for     │────>│ Orchestrates │────>│ Receives     │
│ resources    │     │ transactions │     │ payouts      │
│              │     │              │     │              │
│ No Stripe    │     │ Has Stripe   │     │ Has Express  │
│ account      │     │ account      │     │ account      │
│ needed       │     │ (platform)   │     │ (connected)  │
│              │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Platform Account (Currico)

- The main Stripe account
- Receives platform fees (30%)
- Creates checkout sessions
- Manages webhooks
- Has API keys

### Connected Accounts (Sellers)

- Express accounts linked to the platform
- Each seller has a unique `stripe_account_id` (acct_xxx)
- Receives 70% of each sale
- Can view earnings in Stripe Express Dashboard
- Payouts go to their Swiss IBAN

### Buyers

- No Stripe account needed
- Pay via card or TWINT
- Stripe handles their payment method securely

---

## Money Flow in a Marketplace

### Example: CHF 10 Resource Purchase

```
┌─────────────────────────────────────────────────────────────────┐
│                        PAYMENT FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   BUYER                                                          │
│     │                                                            │
│     │ Pays CHF 10.00                                             │
│     ▼                                                            │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                      STRIPE                              │   │
│   │                                                          │   │
│   │   Gross Payment: CHF 10.00                               │   │
│   │                                                          │   │
│   │   ┌─────────────────┐    ┌─────────────────┐            │   │
│   │   │ Stripe Fees     │    │ Remaining       │            │   │
│   │   │ ~CHF 0.59       │    │ CHF 9.41        │            │   │
│   │   │ (2.9% + 0.30)   │    │                 │            │   │
│   │   └─────────────────┘    └────────┬────────┘            │   │
│   │                                   │                      │   │
│   │                    ┌──────────────┴──────────────┐      │   │
│   │                    │                             │      │   │
│   │                    ▼                             ▼      │   │
│   │          ┌─────────────────┐          ┌─────────────────┐│   │
│   │          │ Platform Fee    │          │ Seller Payout   ││   │
│   │          │ CHF 3.00 (30%)  │          │ CHF 6.41 (70%)  ││   │
│   │          │                 │          │                 ││   │
│   │          │ → Currico   │          │ → Teacher IBAN  ││   │
│   │          └─────────────────┘          └─────────────────┘│   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Fee Breakdown

| Component          | Amount    | Recipient |
| ------------------ | --------- | --------- |
| Gross payment      | CHF 10.00 | —         |
| Stripe processing  | ~CHF 0.59 | Stripe    |
| Platform fee (30%) | CHF 3.00  | Currico   |
| Seller payout      | CHF 6.41  | Teacher   |

**Note:** The 30% platform fee is calculated on the gross amount. Stripe fees come off the top before the split.

---

## The Checkout Process

### Step-by-Step Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                      CHECKOUT SEQUENCE                              │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. INITIATE CHECKOUT                                               │
│     ┌──────────┐      ┌──────────────┐      ┌──────────┐           │
│     │  Buyer   │ ──── │ Currico  │ ──── │  Stripe  │           │
│     │  clicks  │ POST │   creates    │ API  │  returns │           │
│     │  "Buy"   │ ───> │   session    │ ───> │  URL     │           │
│     └──────────┘      └──────────────┘      └──────────┘           │
│                                                                     │
│  2. PAYMENT                                                         │
│     ┌──────────┐      ┌──────────────┐                             │
│     │  Buyer   │ ──── │   Stripe     │                             │
│     │ redirects│      │  Checkout    │                             │
│     │ to Stripe│ ───> │    Page      │                             │
│     └──────────┘      └──────────────┘                             │
│                              │                                      │
│                              │ Buyer enters card or selects TWINT   │
│                              ▼                                      │
│                       ┌──────────────┐                             │
│                       │   Payment    │                             │
│                       │  Processed   │                             │
│                       └──────────────┘                             │
│                                                                     │
│  3. CONFIRMATION                                                    │
│     ┌──────────┐      ┌──────────────┐      ┌──────────┐           │
│     │  Stripe  │ ──── │ Currico  │ ──── │  Buyer   │           │
│     │  sends   │ POST │   updates    │ ───> │ sees     │           │
│     │ webhook  │ ───> │  database    │      │ success  │           │
│     └──────────┘      └──────────────┘      └──────────┘           │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### Checkout Session Parameters

When creating a checkout session, we specify:

```javascript
{
  // What payment methods to accept
  payment_method_types: ['card', 'twint'],

  // The item being purchased
  line_items: [{
    price_data: {
      currency: 'chf',
      unit_amount: 1000,  // CHF 10.00 in cents
      product_data: {
        name: 'Mathematik Arbeitsblatt',
      },
    },
    quantity: 1,
  }],

  // Platform fee (30%)
  payment_intent_data: {
    application_fee_amount: 150,  // CHF 1.50 in cents
    transfer_data: {
      destination: 'acct_seller123',  // Seller's Stripe account
    },
  },

  // Redirect URLs
  success_url: 'https://currico.ch/checkout/success?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'https://currico.ch/resources/123',
}
```

---

## TWINT Payment Flow

TWINT is Switzerland's most popular mobile payment method (~5 million users). Stripe supports it natively.

### How TWINT Works

```
┌────────────────────────────────────────────────────────────────────┐
│                       TWINT PAYMENT FLOW                            │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  DESKTOP FLOW:                                                      │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │  Buyer   │    │   Stripe     │    │   Buyer's    │              │
│  │ selects  │───>│   shows      │───>│   TWINT      │              │
│  │  TWINT   │    │  QR code     │    │    App       │              │
│  └──────────┘    └──────────────┘    └──────────────┘              │
│                                              │                      │
│                                              │ Scans QR, confirms   │
│                                              ▼                      │
│                                       ┌──────────────┐              │
│                                       │   Payment    │              │
│                                       │  Confirmed   │              │
│                                       └──────────────┘              │
│                                                                     │
│  MOBILE FLOW:                                                       │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │  Buyer   │    │   Stripe     │    │   TWINT      │              │
│  │ selects  │───>│  redirects   │───>│    App       │              │
│  │  TWINT   │    │  to app      │    │   opens      │              │
│  └──────────┘    └──────────────┘    └──────────────┘              │
│                                              │                      │
│                                              │ Buyer confirms       │
│                                              ▼                      │
│                                       ┌──────────────┐              │
│                                       │  Redirect    │              │
│                                       │   back       │              │
│                                       └──────────────┘              │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### TWINT Limitations

- Maximum transaction: CHF 5,000
- Only available for Swiss customers
- Requires Swiss Stripe account
- Test mode simulates the flow (no real TWINT app needed)

---

## Webhooks and Events

Webhooks are HTTP callbacks that Stripe sends to your server when events occur. They're essential because:

1. Payment confirmation happens asynchronously
2. Browser might close before redirect completes
3. They're the authoritative source of payment status

### Key Webhook Events

```
┌────────────────────────────────────────────────────────────────────┐
│                        WEBHOOK EVENTS                               │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  checkout.session.completed                                         │
│  ├── Triggered when: Buyer completes checkout                       │
│  ├── Action: Create Transaction, grant resource access              │
│  └── Contains: session_id, payment_intent, customer email           │
│                                                                     │
│  payment_intent.succeeded                                           │
│  ├── Triggered when: Payment is confirmed                           │
│  ├── Action: Verify payment, update status                          │
│  └── Contains: amount, currency, payment_method                     │
│                                                                     │
│  payment_intent.payment_failed                                      │
│  ├── Triggered when: Payment fails                                  │
│  ├── Action: Update Transaction to FAILED, notify user              │
│  └── Contains: error message, failure reason                        │
│                                                                     │
│  account.updated                                                    │
│  ├── Triggered when: Seller's account status changes                │
│  ├── Action: Update stripe_onboarding_complete                      │
│  └── Contains: account_id, charges_enabled, payouts_enabled         │
│                                                                     │
│  payout.paid                                                        │
│  ├── Triggered when: Money arrives in seller's bank                 │
│  ├── Action: Log payout, optional notification                      │
│  └── Contains: amount, arrival_date, destination                    │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### Webhook Security

Webhooks must be verified to prevent fake events:

```javascript
const sig = request.headers["stripe-signature"];
const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
```

### Idempotency

Webhooks can be sent multiple times. Always check if already processed:

```javascript
// Check if we already processed this event
const existing = await prisma.transaction.findUnique({
  where: { stripe_checkout_session_id: session.id },
});

if (existing?.status === "COMPLETED") {
  return; // Already processed, skip
}
```

---

## Seller Onboarding Process

Before sellers can receive payments, they must complete Stripe's onboarding (KYC/identity verification).

### Onboarding Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                    SELLER ONBOARDING FLOW                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. INITIATE                                                        │
│     ┌──────────────┐      ┌──────────────┐      ┌──────────────┐   │
│     │   Seller     │      │ Currico  │      │    Stripe    │   │
│     │   clicks     │ ──── │   creates    │ ──── │   returns    │   │
│     │ "Connect"    │      │  Express     │      │  onboarding  │   │
│     │              │      │  account     │      │    URL       │   │
│     └──────────────┘      └──────────────┘      └──────────────┘   │
│                                                        │            │
│  2. ONBOARDING (Hosted by Stripe)                      │            │
│     ┌──────────────────────────────────────────────────┘            │
│     │                                                               │
│     │  Seller provides:                                             │
│     │  ├── Legal name                                               │
│     │  ├── Date of birth                                            │
│     │  ├── Address                                                  │
│     │  ├── Bank account (IBAN)                                      │
│     │  ├── ID verification (passport/ID card)                       │
│     │  └── Tax information                                          │
│     │                                                               │
│     └──────────────────────────────────────────────────┐            │
│                                                        │            │
│  3. VERIFICATION                                       ▼            │
│     ┌──────────────┐      ┌──────────────┐      ┌──────────────┐   │
│     │   Stripe     │      │ Currico  │      │   Seller     │   │
│     │  verifies    │ ──── │   updates    │ ──── │   can now    │   │
│     │   seller     │ hook │  database    │      │    sell      │   │
│     └──────────────┘      └──────────────┘      └──────────────┘   │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### Account States

```javascript
// Check if seller can receive payments
const account = await stripe.accounts.retrieve(seller.stripe_account_id);

account.charges_enabled; // Can accept payments
account.payouts_enabled; // Can receive payouts
account.details_submitted; // Completed onboarding form

// All three must be true for fully functional seller
```

### Onboarding Link Generation

```javascript
// Create Express account
const account = await stripe.accounts.create({
  type: "express",
  country: "CH",
  email: seller.email,
  capabilities: {
    card_payments: { requested: true },
    transfers: { requested: true },
  },
});

// Generate onboarding link
const accountLink = await stripe.accountLinks.create({
  account: account.id,
  refresh_url: "https://currico.ch/seller/connect/refresh",
  return_url: "https://currico.ch/seller/connect/complete",
  type: "account_onboarding",
});

// Redirect seller to accountLink.url
```

---

## Payouts and Settlements

### How Payouts Work

```
┌────────────────────────────────────────────────────────────────────┐
│                       PAYOUT TIMELINE                               │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Day 0: Payment                                                     │
│  ├── Buyer pays CHF 10.00                                           │
│  ├── Stripe captures payment                                        │
│  └── Funds held in Stripe balance                                   │
│                                                                     │
│  Day 1-2: Processing                                                │
│  ├── Payment clears                                                 │
│  ├── Available in seller's Stripe balance                           │
│  └── Platform fee separated                                         │
│                                                                     │
│  Day 2-7: Payout (depends on schedule)                              │
│  ├── Stripe initiates bank transfer                                 │
│  ├── IBAN transfer to seller's Swiss bank                           │
│  └── Seller receives CHF 7.91                                       │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### Payout Schedules

Sellers can have different payout schedules:

| Schedule | When                      |
| -------- | ------------------------- |
| Daily    | Every business day        |
| Weekly   | Every week (e.g., Monday) |
| Monthly  | Once per month            |
| Manual   | Only when requested       |

For Express accounts, Stripe sets a default schedule (usually 2-day rolling).

### Platform Payouts

The platform (Currico) receives its 30% fee separately:

- Accumulates in platform Stripe balance
- Can set up automatic payouts to platform bank account
- Typically daily or weekly schedule

---

## Platform Fees

### How Application Fees Work

The `application_fee_amount` parameter tells Stripe to keep a portion for the platform:

```javascript
// In checkout session creation
payment_intent_data: {
  application_fee_amount: 300,  // 30% of CHF 10.00 = CHF 3.00 (300 cents)
  transfer_data: {
    destination: 'acct_seller123',
  },
}
```

### Fee Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION FEE FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Payment: CHF 10.00                                              │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Stripe Processing                     │    │
│  │                                                          │    │
│  │  1. Receive CHF 10.00                                    │    │
│  │  2. Deduct Stripe fee (~CHF 0.59)                        │    │
│  │  3. Remaining: CHF 9.41                                  │    │
│  │                                                          │    │
│  │  4. Application fee: CHF 1.50                            │    │
│  │     └── Goes to: Platform Stripe balance                 │    │
│  │                                                          │    │
│  │  5. Remainder: CHF 7.91                                  │    │
│  │     └── Goes to: Seller's connected account              │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Who Pays Stripe Fees?

By default, Stripe fees come off the top before splitting. Options:

1. **Default:** Seller effectively pays (receives less)
2. **Platform pays:** Deduct Stripe fee from application_fee_amount
3. **Buyer pays:** Add Stripe fee to the price

Currico uses the default approach.

---

## Refunds and Disputes

### Refund Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                        REFUND PROCESS                               │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Refund initiated (by platform or seller)                        │
│                                                                     │
│  2. Stripe processes refund                                         │
│     ├── Reverses payment to buyer                                   │
│     ├── Debits seller's Stripe balance                              │
│     └── Optionally reverses application fee                         │
│                                                                     │
│  3. Database update                                                 │
│     └── Transaction status → REFUNDED                               │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### Refund Options

```javascript
// Full refund, including platform fee
await stripe.refunds.create({
  payment_intent: "pi_xxx",
  refund_application_fee: true, // Platform also refunded
});

// Full refund, platform keeps fee
await stripe.refunds.create({
  payment_intent: "pi_xxx",
  refund_application_fee: false, // Platform keeps 30%
});
```

### Disputes (Chargebacks)

When a buyer disputes a charge with their bank:

1. Stripe notifies via `charge.dispute.created` webhook
2. Funds are held pending resolution
3. Platform can submit evidence
4. Bank makes final decision
5. If lost, seller's balance is debited

**Tip:** Digital goods with proof of delivery (download logs) have good dispute win rates.

---

## Glossary

| Term                  | Definition                                             |
| --------------------- | ------------------------------------------------------ |
| **Connected Account** | Seller's Stripe Express account linked to the platform |
| **Platform Account**  | Currico's main Stripe account                          |
| **Application Fee**   | Platform's commission (30%) taken from each payment    |
| **Payment Intent**    | Stripe object representing a payment attempt           |
| **Checkout Session**  | Stripe-hosted payment page                             |
| **Webhook**           | HTTP callback sent by Stripe when events occur         |
| **Payout**            | Transfer from Stripe balance to bank account           |
| **KYC**               | Know Your Customer - identity verification             |
| **Express Dashboard** | Stripe-hosted dashboard for sellers to view earnings   |

---

## Further Reading

- [Stripe Connect Documentation](https://docs.stripe.com/connect)
- [Stripe TWINT Integration](https://docs.stripe.com/payments/twint)
- [Stripe Checkout](https://docs.stripe.com/payments/checkout)
- [Handling Webhooks](https://docs.stripe.com/webhooks)
- [Testing Stripe Integration](https://docs.stripe.com/testing)
