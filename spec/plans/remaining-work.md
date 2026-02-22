# Remaining Work Before Launch

> **Last updated:** 2026-02-21
> **Overall status:** 99%+ of planned work complete. Only ops, business, and design tasks remain.

---

## At a Glance

| Category             | Items  | Blocked on                                |
| -------------------- | ------ | ----------------------------------------- |
| Ops / Infrastructure | 4      | Domain purchase                           |
| Business Decisions   | 3      | Founders                                  |
| Design / Assets      | 3      | Photos, logo                              |
| Code (blocked)       | 1      | `db:seed-curriculum`                      |
| Deep Audit           | 77     | See [deep-audit](./deep-audit-2026-02.md) |
| **Total**            | **88** |                                           |

---

## 1. Ops / Infrastructure

These are server, DNS, and deployment tasks — no application code changes needed.

- [ ] **Register `currico.ch` domain** (Infomaniak or Hostpoint, ~15 CHF/year)
- [ ] **Configure DNS & SSL** (A record → Dokploy, CNAME for www, CAA for SSL, 301 redirects from old subdomain for 12 months)
- [ ] **Update environment variables** after domain migration: `AUTH_URL`, OAuth redirect URIs, Stripe webhooks, email sending domain
- [ ] **Set up professional email** (@currico.ch) — depends on domain migration

---

## 2. Business Decisions (founders needed)

These require strategic decisions, not code.

- [ ] **Seed content: 30–50 materials** — Upload real teaching materials to solve the cold-start problem. Recruit 10–20 teachers (PH contacts, Facebook groups).
- [ ] **Pilot Program: choose incentive model** — Either 50 CHF starting credit OR 100% commission for Year 1. Then: add `isPilotTeacher`/`pilotCredits`/`pilotCommissionEnd` schema fields, update checkout/payout logic, add "Pilot Teacher" badge, set expiration.
- [ ] **Clean test data from production DB** — Remove dummy users/materials before public launch. Ops task, no code change.

---

## 3. Design / Assets

These need design work or real photos.

- [ ] **Über-uns team photos** — Replace placeholder images with real founder photos. User will provide.
- [ ] **Hero image** — Replace stock photo with authentic Swiss classroom image or platform screenshot.
- [ ] **Logo refresh** — Current logo is generic. Consider professional redesign.

---

## 4. Code (blocked)

- [ ] **BG filter border inconsistency** — "Bildnerisches Gestalten" filter outline doesn't match other subjects. Likely a DB color data issue. Blocked on running `npm run db:seed-curriculum` to verify.

---

## 5. Deep Audit (77 items)

A full automated project scan was completed on 2026-02-22. See **[deep-audit-2026-02.md](./deep-audit-2026-02.md)** for the complete prioritized list.

| Priority    | Count | Category                                         |
| ----------- | ----- | ------------------------------------------------ |
| P0 Critical | 10    | Security vulns, data integrity                   |
| P1 High     | 18    | Auth, headers, storage, env validation           |
| P2 Medium   | 39    | SEO, i18n, DB indexes, testing, code quality, UI |
| P3 Low      | 10    | TypeScript, Docker, CI, nice-to-haves            |

**Recommended order:** Security hardening (Phase A) before launch, SEO/metadata (Phase C) first week post-launch, testing (Phase E) ongoing.

---

## Nice-to-Have (post-launch)

These are low-priority items that can wait until after launch.

- [ ] Partner logos on homepage (if PH or cantonal partnerships exist)
- [ ] Content marketing blog (`/blog`)
- [ ] Communicate payment methods more prominently (TWINT via Stripe)
- [ ] Show verified seller profiles more prominently (needs real users first)
- [ ] Migrate remaining inline skeleton patterns in `profil/[id]` and admin pages to unified `Skeleton` component

---

## What's Done (archived)

All of these plans are 100% complete and archived in `spec/archive/`:

| Plan                | Items    | Description                                                                                  |
| ------------------- | -------- | -------------------------------------------------------------------------------------------- |
| Joel Improvements   | 375/378  | Page-by-page UI/UX tracker (remaining 3 are OUT OF SCOPE or blocked)                         |
| Code Quality        | 33/33    | Dead code, DB indexes, constraints, error codes, perf                                        |
| Consistency Audit   | 53/53    | Security, API, theme, UI, a11y, polish across 6 phases                                       |
| Final Touch Audit   | All done | Design consistency audit (score: 7.5 → improved)                                             |
| UX Polish 9→10      | All done | Heading hierarchy, hover normalization, page transitions, parallax, magnetic CTAs, card tilt |
| UI/UX Audit Runde 2 | 52/53    | Manual feedback + code audit (1 bug blocked on DB seed)                                      |
| Roadmap Phases 1-4  | 26/29    | Trust, seller acquisition, UX polish, code quality                                           |

See [`spec/archive/`](../archive/) for full historical records.
