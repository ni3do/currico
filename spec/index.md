# Currico Specification

Swiss platform for teachers to buy, sell, and share teaching materials.

## Structure

Documentation is organized into three tiers:

- **`plans/`** — Active plans and roadmaps. Move to `archive/` when done.
- **`reference/`** — Architecture and reference docs. Keep current with code.
- **`archive/`** — Completed plans. Historical reference only.

## Active Plans

- [Roadmap](./plans/roadmap.md) - Strategic roadmap for Swiss-specific features
- [Joel Improvements Status](./plans/joelimprovements-status.md) - Page-by-page improvements tracker (310+ items)
- [S3 Storage](./plans/s3-storage.md) - Infomaniak S3 file storage integration
- [Stripe Connect Plan](./plans/stripe-connect-implementation-plan.md) - Payment integration implementation
- [UI Improvements](./plans/ui-improvements.md) - Batch UI improvement plans

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

- [Account Structure Refactor](./archive/account-structure-refactor.md)
- [Claude Workflow](./archive/claude-workflow.md)
- [i18n Plan](./archive/i18n-plan.md)
- [OAuth Integration](./archive/oauth-integration.md)
- [Observability Plan](./archive/observability-plan.md) (superseded by [reference/observability.md](./reference/observability.md))

## Design Principles

- **Forms:** Vertical layout, minimal fields per screen
- **Spacing:** Generous whitespace, avoid density
- **Actions:** Primary CTAs use accent color, secondary actions subdued
- **Mobile:** Responsive first, bottom sheets for filters
- **Content:** Only essential info visible, details on drill-down
