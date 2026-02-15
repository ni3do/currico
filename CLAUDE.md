# CLAUDE.md

## Project

Currico: Swiss platform for teachers to buy, sell, and share teaching materials.

## Stack

- Next.js 16 (App Router, Turbopack)
- TypeScript, Tailwind CSS
- Prisma ORM, PostgreSQL
- NextAuth v5 (Google, Credentials)
- next-intl for i18n (de active, en prepared)
- Stripe Connect for payments
- Infomaniak S3 for file storage
- Sentry for error monitoring
- Nodemailer for transactional email

## Structure

```
app/
  [locale]/          # Localized pages (German URL slugs: anmelden, materialien, konto, etc.)
  api/               # API routes (auth, materials, payments, seller, admin, user, etc.)
components/
  ui/                # Reusable UI (MaterialCard, TopBar, Footer, Toast, etc.)
  account/           # Account dashboard components
  checkout/          # Checkout flow
  comments/          # Comment system
  reviews/           # Review system
  search/            # Search & filter (LP21FilterSidebar, FilterChips, Pagination)
  upload/            # Upload wizard components
  providers/         # ThemeProvider
lib/
  auth.ts            # NextAuth config
  db.ts              # Prisma client singleton
  stripe.ts          # Stripe Connect client
  email.ts           # Transactional email (Nodemailer)
  metrics.ts         # Prometheus metrics
  storage/           # S3/local file storage abstraction
  validations/       # Zod schemas
  hooks/             # React hooks
  utils/             # Helpers (price, seller-levels, preview-generator)
i18n/                # next-intl config (routing, navigation, request)
prisma/
  schema.prisma      # Database schema
  migrations/        # Prisma migrations
messages/            # i18n translations (de.json, en.json)
proxy.ts             # Next.js middleware (i18n locale routing)
spec/                # Plans and reference docs (see spec/index.md)
```

## Development

```bash
docker compose up           # App + PostgreSQL on localhost:3000
npm run dev                 # Local dev server (needs separate postgres)
npm run lint                # ESLint
npm run validate:all        # Lint + build + test (full check)
```

## Testing

```bash
npm run test                # Vitest unit tests
npm run test:e2e            # Playwright e2e tests
npm run test:coverage       # Vitest with coverage
```

## Database

```bash
npm run db:migrate          # Create/apply migrations
npm run db:push             # Push schema without migration
npm run db:studio           # Prisma Studio GUI
npm run db:seed-curriculum   # Seed LP21 curriculum data
npm run db:bootstrap-admin   # Create admin user
```

## Rules

- **Never skip tests.** Do not use `SKIP_TESTS=1`, `SKIP_E2E=1`, `--no-verify`, or similar flags to bypass test hooks. If tests fail, fix the underlying issue. If e2e tests fail because the dev server isn't running, ask the user to start it rather than skipping.

## Production

Deployed via Dokploy. Docker image built by GitHub Actions, pushed to GHCR.

## Specs

Documentation lives in `spec/`, organized into three tiers:

```
spec/
  plans/              # Active plans and roadmaps (move to archive/ when done)
  reference/          # Architecture and reference docs (keep current with code)
  archive/            # Completed plans (historical reference only)
```

**Maintaining specs:**

- New features/plans go in `spec/plans/` with a descriptive filename
- When a plan is fully implemented, `git mv` it to `spec/archive/`
- Reference docs (`spec/reference/`) describe the current system — update them when the architecture changes
- `spec/index.md` is the entry point — keep it linked to all active docs

Key files:

- `spec/reference/features.md` - All features by implementation status
- `spec/reference/design-system.md` - Catppuccin theme tokens and components
- `spec/plans/roadmap.md` - Product roadmap
- `spec/plans/joelimprovements-status.md` - Active page-by-page improvements tracker
