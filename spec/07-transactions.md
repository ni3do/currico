# Transaction & Commission Management

## Implementation Status

**Status: Partial**

- Commission configuration UI: Implemented
- Transaction list view UI: Implemented
- Transaction detail view UI: Implemented
- Stripe payment integration: Not implemented
- Actual payment processing: Not implemented

---

## Overview

Handle purchases for resources and bundles with automatic splitting between platform fee and seller payout.

## Commission Configuration

### Admin Settings
- Global Platform Commission Rate
- Single, clearly labeled field
- "Update Commission Rate" button uses primary accent color

## Transaction Data

Each transaction stores:
- Gross amount
- Platform fee (calculated from commission rate)
- Seller payout (gross minus platform fee)

## Transaction Calculation

```
Platform Fee = Gross Amount × Commission Rate
Seller Payout = Gross Amount - Platform Fee
```

## Admin Transaction Views

### Design Principles
- Prioritize readability
- Show only essential columns
- Allow drill-down for details
- Visual elements sparse and easy to scan
- Everything except primary actions stays understated

### List View Columns
- Transaction ID
- Resource/Bundle title
- Buyer
- Date
- Gross amount
- Status

### Detail View
- Full transaction breakdown
- Gross amount
- Platform fee
- Seller payout
- Payment status
- Timestamps
