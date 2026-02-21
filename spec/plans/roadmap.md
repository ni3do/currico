# Currico Product Roadmap

**Version:** 2.2
**Last Updated:** February 2026
**Status:** Pre-launch — all feature development complete, only ops/business/design tasks remain.

---

## Completed Phases

| Phase   | Description                                                             | Status   |
| ------- | ----------------------------------------------------------------------- | -------- |
| Phase 1 | Trust & Core Functionality (LP21 search, previews, watermarks)          | 7/8 done |
| Phase 2 | Seller Acquisition & Legal (safety wizard, copyright, value prop)       | 4/6 done |
| Phase 3 | UX Polish & Social Proof (team page, verified sellers, testimonials)    | 7/7 done |
| Phase 4 | Code Quality & Tech Debt (dead code, indexes, constraints, error codes) | 8/8 done |

---

## Remaining (2 items)

### 1. Domain Migration — `currico.ch`

| Field        | Value                |
| ------------ | -------------------- |
| **Priority** | P0 - Blocks launch   |
| **Type**     | Ops / Infrastructure |
| **Effort**   | Medium               |

**Tasks:**

- [ ] Register `currico.ch` domain
- [ ] Configure DNS (A record → Dokploy, CNAME for www, CAA for SSL)
- [ ] Set up 301 redirects from `currico.siwachter.com` (12 months)
- [ ] Update `AUTH_URL`, OAuth redirect URIs, Stripe webhooks
- [ ] Update email sending domain
- [ ] Update legal documents with new domain

> This is ops/infra work, not application code.

### 2. Pilot Program

| Field        | Value                          |
| ------------ | ------------------------------ |
| **Priority** | P1 - Blocks seller recruitment |
| **Type**     | Business decision + code       |
| **Effort**   | Small (once decision made)     |

**Requires founders to decide:** 50 CHF starting credit OR 100% commission for Year 1.

**Tasks (after decision):**

- [ ] Add schema fields: `isPilotTeacher`, `pilotCredits`, `pilotCommissionEnd`
- [ ] Update checkout logic (apply credits) or payout logic (100% commission)
- [ ] Add "Pilot Teacher" badge to profiles
- [ ] Update pilot signup page with new offer
- [ ] Set expiration date for pilot benefits

---

## Related

- [Remaining Work](./remaining-work.md) — Full list of all open items (ops, business, design, code)
- [Launch Checklist](./launch-checklist.md) — 115-item launch readiness audit (104/115 done)
