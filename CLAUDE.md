# CLAUDE.md

## Project

Currico: Swiss platform for teachers to buy, sell, and share teaching materials.

## Stack

- Next.js 16 (App Router, Turbopack)
- TypeScript, Tailwind CSS
- Prisma ORM, PostgreSQL
- NextAuth for authentication
- next-intl for i18n (de/en)

## Structure

```
app/
  [locale]/          # Localized pages (login, register, resources, dashboard, admin)
  api/               # API routes (auth, resources, seller, admin)
components/
  ui/                # Reusable UI components
  providers/         # Context providers (theme, auth)
prisma/
  schema.prisma      # Database schema
  seed.ts            # Seed data
spec/                # Feature specs and plans
messages/            # i18n translations (de.json, en.json)
```

## Development

```bash
docker compose up    # Starts app + postgres on localhost:3000
```

## Production

Deployed via Dokploy. Uses `Dockerfile` with multi-stage build.

## Specs

See `spec/index.md` for feature documentation. Key files:

- `spec/features.md` - All features organized by implementation status
- `spec/design-system.md` - Catppuccin theme tokens and components
