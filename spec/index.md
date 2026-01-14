# Easy-Lehrer Specification

This directory contains the feature specifications for the Easy-Lehrer platform, organized by domain.

## Implementation Status Summary

| Spec | Status | Notes |
|------|--------|-------|
| 01-accounts | Partial | Teacher accounts work; school accounts not implemented |
| 02-catalog | Partial | UI complete; advanced filters not wired to API |
| 03-resource-details | Complete | Fully implemented |
| 04-bundles | UI Only | Frontend complete; no backend/DB model |
| 05-upload | UI Only | Multi-step wizard complete; no file upload backend |
| 06-quality | Complete | Quality badge system implemented |
| 07-transactions | Partial | UI complete; Stripe integration pending |
| 08-libraries | Not Implemented | Deferred to future sprint |
| 09-wishlist | UI Only | Client-side state; no persistence |
| 10-social | UI Only | Follow UI exists; no DB models |
| 11-seller-dashboard | Complete | API and UI fully implemented |
| 12-reviews | Not Implemented | Deferred to future sprint |
| 13-moderation | Complete | Admin review system implemented |
| 14-design-system | Complete | Catppuccin theme with semantic tokens |

## Specification Files

1. [Accounts](./01-accounts.md) - Teacher & School Account Management
2. [Catalog](./02-catalog.md) - Resource Catalog & Search
3. [Resource Details](./03-resource-details.md) - Resource Detail Pages
4. [Bundles](./04-bundles.md) - Resource Bundles
5. [Upload](./05-upload.md) - Resource Upload Workflow
6. [Quality](./06-quality.md) - Quality Status Management
7. [Transactions](./07-transactions.md) - Transaction & Commission Management
8. [Libraries](./08-libraries.md) - Purchase, Download & Libraries
9. [Wishlist](./09-wishlist.md) - Wishlist Feature
10. [Social](./10-social.md) - Follow Seller & Notifications
11. [Seller Dashboard](./11-seller-dashboard.md) - Seller Analytics & Management
12. [Reviews](./12-reviews.md) - Reviews & Ratings
13. [Moderation](./13-moderation.md) - Reporting & Admin Review
14. [Design System](./14-design-system.md) - Catppuccin Theme & Components

## Design Principles

- UI forms are visually simple and vertically stacked
- Ample whitespace and minimal fields on each screen
- Primary actions use a distinct primary color
- Secondary actions are subdued
- Mobile-first responsive design
