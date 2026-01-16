# Easy-Lehrer Specification

Swiss platform for teachers to buy, sell, and share teaching materials.

## Documents

### Core

- [Features](./features.md) - All feature specifications with implementation status
- [Design System](./design-system.md) - Catppuccin theme, tokens, components
- [Roadmap](./roadmap.md) - Strategic roadmap for Swiss-specific features

### Implementation Plans

- [Stripe Connect Plan](./stripe-connect-implementation-plan.md) - Payment integration implementation
- [Stripe Connect Architecture](./stripe-connect-architecture.md) - How Stripe Connect works (reference)
- [i18n Plan](./i18n-plan.md) - Internationalization implementation
- [OAuth Integration](./oauth-integration.md) - Google/Microsoft/edu-ID OAuth setup
- [Observability Plan](./observability-plan.md) - Monitoring and logging (future)

## Design Principles

- **Forms:** Vertical layout, minimal fields per screen
- **Spacing:** Generous whitespace, avoid density
- **Actions:** Primary CTAs use accent color, secondary actions subdued
- **Mobile:** Responsive first, bottom sheets for filters
- **Content:** Only essential info visible, details on drill-down
