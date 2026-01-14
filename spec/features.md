# Feature Specifications

## Complete Features

### Resource Details
- Detail page with title, description, price, primary CTA (Buy/Download)
- Badges: quality status, editability, resource type
- Metadata block: subject, cycle, canton, Lehrplan 21 codes
- Preview gallery with watermarked images
- Seller info, wishlist button, follow seller, report link
- Related resources section

### Quality Status
- Admin can set status: Pending → AI-Checked → Verified
- Admin list view with title, seller, status, last updated
- Status change via selector with optional internal note

### Seller Dashboard
- Key metrics: net earnings, total downloads, followers
- Resources list with title, status, downloads, earnings
- Edit resource and create bundle actions
- Recent transactions view (date, title, gross, fee, payout)
- API: `/api/seller/dashboard`

### Moderation
- "Report Resource" button opens compact form (reason selector + comment)
- Admin dashboard: report list with title, reason, status, date
- Status flow: Open → In Review → Resolved/Dismissed

---

## Partial Features

### Accounts
**Implemented:** Teacher registration, login, profile management
**Missing:** School accounts, school admin features, team licenses

### Catalog
**Implemented:** Grid display, cards (title, description, subject, price, quality badge), search bar, subject selector, advanced filters UI
**Missing:** Filters not wired to API, sorting not functional
- API: `/api/resources` (GET list), `/api/resources/[id]` (GET single)

### Transactions
**Implemented:** Commission config UI, transaction list/detail views
**Missing:** Stripe integration, actual payment processing
- Commission formula: `Platform Fee = Gross × Rate`, `Seller Payout = Gross - Fee`

---

## UI-Only Features

### Bundles
**Implemented:** Bundle creation form, bundle detail page UI
**Missing:** Database model, API endpoints, purchase flow
- Bundle: title, description, cover image, price (discounted), curriculum tags
- Creation: select resources → set details → upload cover → set price → publish

### Upload
**Implemented:** 4-step wizard UI, form validation
**Missing:** File upload backend, watermarking, resource creation API
- Steps: Basics (title, description, language, type) → Curriculum (cycle, subject, canton, competences) → Properties (price, editability, license) → Files

### Wishlist
**Implemented:** Heart icon on cards, save link on details, wishlist page UI
**Missing:** Database persistence, API endpoints

### Social (Follow)
**Implemented:** Follow button UI, updates/following page
**Missing:** Follow database model, API, notifications

