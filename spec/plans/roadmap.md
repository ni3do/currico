# Currico Product Roadmap

**Version:** 2.1
**Last Updated:** February 2026
**Status:** MVP Phase — most features implemented
**Target Audience:** Swiss teachers (Lehrplan 21)

---

## Executive Summary

This roadmap addresses the critical gap between our current MVP state and a production-ready platform that Swiss teachers will trust. The focus is on three pillars: **Trust**, **Supply**, and **Conversion**.

**Current State:** Hosted on `currico.siwachter.com` (subdomain)
**Goal:** Launch-ready platform with Swiss credibility and legal safety

---

## Phase 1: Critical Trust & Core Functionality — MOSTLY DONE

**Goal:** Establish credibility and core search/browse experience before full launch.

| #   | Task                                                                    | Priority | Status |
| --- | ----------------------------------------------------------------------- | -------- | ------ |
| 1.1 | Migrate to `currico.ch` domain                                          | P0       | ⬜     |
| 1.2 | LP21 search & filtering (Zyklus, competence, dialect, hero search)      | P0       | ✅     |
| 1.3 | Product display & preview system (thumbnails, blur preview, watermarks) | P0       | ✅     |

### 1.1 Domain & Branding Migration — OPEN

| Field            | Value         |
| ---------------- | ------------- |
| **Priority**     | P0 - Critical |
| **Effort**       | Medium        |
| **Dependencies** | None          |

**Acceptance Criteria:**

- [ ] Register `currico.ch` domain (Infomaniak or Hostpoint, ~15 CHF/year)
- [ ] Configure DNS (A record → Dokploy server, CNAME for www, CAA for SSL)
- [ ] Set up 301 redirects from old subdomain (maintain 12 months)
- [ ] Update NEXTAUTH_URL, OAuth redirect URIs, Stripe webhooks
- [ ] Update email sending domain (if applicable)
- [ ] Update legal documents with new domain

> **Note:** This is primarily ops/infra work, not application code.

---

## Phase 2: Seller Acquisition & Legal Safety — MOSTLY DONE

**Goal:** Remove friction for teachers to become sellers. Address copyright fears.

| #   | Task                                                | Priority | Status |
| --- | --------------------------------------------------- | -------- | ------ |
| 2.1 | Seller Safety Wizard + copyright checkboxes + guide | P1       | ✅     |
| 2.2 | Seller value proposition reframe                    | P1       | ✅     |
| 2.3 | Pilot Program Enhancement                           | P1       | ⬜     |

### 2.3 Pilot Program Enhancement — OPEN

| Field            | Value                     |
| ---------------- | ------------------------- |
| **Priority**     | P1 - High                 |
| **Effort**       | Small                     |
| **Dependencies** | User roles, credit system |

**Requires business decision:** 50 CHF starting credit OR 100% commission for Year 1.

**Acceptance Criteria:**

- [ ] Choose incentive model
- [ ] Add schema fields: `isPilotTeacher`, `pilotCredits`, `pilotCommissionEnd`
- [ ] Update checkout logic (apply credits) or payout logic (100% commission)
- [ ] Add "Pilot Teacher" badge to profiles
- [ ] Update pilot signup page with new offer
- [ ] Set expiration date for pilot benefits

---

## Phase 3: User Experience Polish & Social Proof — DONE

All items completed:

| #   | Task                                         | Status |
| --- | -------------------------------------------- | ------ |
| 3.1 | "Meet the Team" page with bios + photos      | ✅     |
| 3.2 | Verified Seller badge system (auto + manual) | ✅     |
| 3.3 | Testimonials on landing page                 | ✅     |

---

## Phase 4: Code Quality & Technical Debt — NEW

**Goal:** Improve reliability, performance, and maintainability before scaling.

| #   | Task                                | Priority | Status |
| --- | ----------------------------------- | -------- | ------ |
| 4.1 | Dead code cleanup                   | P3       | ✅     |
| 4.2 | Add missing database indexes        | P2       | ✅     |
| 4.3 | Add database integrity constraints  | P2       | ✅     |
| 4.4 | Standardize API error codes         | P2       | ✅     |
| 4.5 | Query optimization & cache headers  | P2       | ✅     |
| 4.6 | Component optimization (memo, lazy) | P3       | ✅     |
| 4.7 | Code consolidation (DRY)            | P3       | ✅     |
| 4.8 | Type safety fixes                   | P3       | ✅     |

See [Code Quality Improvements](./code-quality-improvements.md) for full details (33 items).

---

## Summary

| Phase     | Description                | Done      | Open  | Status                |
| --------- | -------------------------- | --------- | ----- | --------------------- |
| Phase 1   | Trust & Core Functionality | 7/8       | 1     | Domain migration only |
| Phase 2   | Seller Acquisition & Legal | 4/6       | 2     | Pilot program only    |
| Phase 3   | UX Polish & Social Proof   | 7/7       | 0     | Complete              |
| Phase 4   | Code Quality & Tech Debt   | 8/8       | 0     | Complete              |
| **Total** |                            | **26/29** | **3** | **90%**               |

**Remaining blockers before launch:** Domain migration (ops) + Pilot program (business decision)

---

## Appendix: Priority Definitions

| Priority | Meaning                          | Timeline                    |
| -------- | -------------------------------- | --------------------------- |
| P0       | Critical - Blocks launch         | Before any marketing        |
| P1       | High - Blocks seller acquisition | Before recruitment campaign |
| P2       | Medium - Impacts conversion      | Before scaling              |
| P3       | Low - Nice to have               | Post-launch                 |

## Related Documents

- [Joel Improvements Tracker](./joelimprovements-status.md) - Page-by-page status (364/378 done)
- [Launch Checklist](./launch-checklist.md) - 53-item launch readiness audit
- [Final Touch Audit](./final-touch-audit.md) - Design consistency audit (score: 7.5/10)
- [Design System](../reference/design-system.md) - Theme tokens and components
