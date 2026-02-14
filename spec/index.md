# Currico Specification

Swiss platform for teachers to buy, sell, and share teaching materials.

## Documents

### Core

- [Features](./features.md) - All feature specifications with implementation status
- [Design System](./design-system.md) - Catppuccin theme, tokens, components
- [Roadmap](./roadmap.md) - Strategic roadmap for Swiss-specific features

### Implementation Plans

- [Playwright E2E Testing](./2026-01-29-playwright-e2e-testing/plan.md) - End-to-end browser testing setup
- [Stripe Connect Plan](./stripe-connect-implementation-plan.md) - Payment integration implementation
- [Stripe Connect Architecture](./stripe-connect-architecture.md) - How Stripe Connect works (reference)
- [Observability Plan](./observability-plan.md) - Monitoring and logging (future)
- [Observability Implementation](./observability-implementation.md) - Current monitoring setup

### Environment

- [Development Environment](./development-env.md) - Local development setup and variables
- [Production Environment](./production-env.md) - Production deployment configuration

### Archive

Completed implementation plans are in [`archive/`](./archive/). These are kept for historical reference.

## Design Principles

- **Forms:** Vertical layout, minimal fields per screen
- **Spacing:** Generous whitespace, avoid density
- **Actions:** Primary CTAs use accent color, secondary actions subdued
- **Mobile:** Responsive first, bottom sheets for filters
- **Content:** Only essential info visible, details on drill-down
