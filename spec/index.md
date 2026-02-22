# Currico Specification

Swiss platform for teachers to buy, sell, and share teaching materials.

## Structure

Documentation is organized into three tiers:

- **`plans/`** — Active plans and roadmaps. Move to `archive/` when done.
- **`reference/`** — Architecture and reference docs. Keep current with code.
- **`archive/`** — Completed plans. Historical reference only.

## Active Plans

- [Remaining Work](./plans/remaining-work.md) - **Start here.** All open items: 4 ops, 3 business, 3 design, 1 code bug (11 total)
- [Roadmap](./plans/roadmap.md) - Strategic roadmap (domain migration + pilot program remaining)
- [Launch Checklist](./plans/launch-checklist.md) - 115-item launch readiness audit (104/115 done, 90%)

## Reference

- [Features](./reference/features.md) - All features by implementation status
- [Design System](./reference/design-system.md) - Catppuccin theme tokens and components
- [Stripe Connect Architecture](./reference/stripe-connect-architecture.md) - How Stripe Connect works
- [Observability](./reference/observability.md) - Monitoring, metrics, Sentry, and health checks
- [E2E Testing](./reference/e2e-testing.md) - Playwright end-to-end testing setup
- [LP21 Filter Sidebar](./reference/lp21-filter-sidebar.md) - Curriculum filter implementation
- [Cost Analysis](./reference/cost-analysis.md) - Infrastructure cost breakdown

### Environment

- [Development Environment](./reference/development-env.md) - Local development setup and variables
- [Production Environment](./reference/production-env.md) - Production deployment configuration

## Archive

Completed implementation plans in [`archive/`](./archive/):

- [Joel Improvements Status](./archive/joelimprovements-status.md) - Page-by-page tracker: 375 done / 3 remaining (99%)
- [Code Quality Improvements](./archive/code-quality-improvements.md) - Technical debt: 33/33 items complete
- [Consistency Audit Plan](./archive/consistency-audit-plan.md) - Full-project audit: 53/53 items complete
- [Final Touch Audit](./archive/final-touch-audit.md) - Design consistency audit (score: 7.5/10)
- [UX Polish 9-10](./archive/ux-polish-9-and-10.md) - Path from 8.5 → 10/10 UX polish
- [UI/UX Audit Runde 2](./archive/2overview.md) - Manual feedback + code audit: 52/53 items complete
- [Account Structure Refactor](./archive/account-structure-refactor.md)
- [Backend Improvements](./archive/backend-improvements.md)
- [Claude Workflow](./archive/claude-workflow.md)
- [i18n Plan](./archive/i18n-plan.md)
- [OAuth Integration](./archive/oauth-integration.md)
- [Observability Plan](./archive/observability-plan.md) (superseded by [reference/observability.md](./reference/observability.md))
- [S3 Storage](./archive/s3-storage.md)
- [Stripe Connect Plan](./archive/stripe-connect-implementation-plan.md)
- [UI Improvements](./archive/ui-improvements.md)

## Design Principles

- **Forms:** Vertical layout, minimal fields per screen
- **Spacing:** Generous whitespace, avoid density
- **Actions:** Primary CTAs use accent color, secondary actions subdued
- **Mobile:** Responsive first, bottom sheets for filters
- **Content:** Only essential info visible, details on drill-down
