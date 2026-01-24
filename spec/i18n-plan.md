# Plan: Implement Multi-Language Support with next-intl

## Implementation Status

| Phase | Status |
|-------|--------|
| Phase 1: Install and Configure | Complete |
| Phase 2: Create Message Files | Complete |
| Phase 3: Restructure App Directory | Complete |
| Phase 4: Update Components | In Progress |
| Phase 5: Add Language Switcher | Complete |
| Phase 6: Cleanup | Complete |

**Current State:** Core i18n infrastructure is in place. All pages migrated to `[locale]` structure. Locale switcher added to TopBar. Some components still need `useTranslations` conversion from `content.ts` pattern.

---

## Overview

Add internationalization to Currico using `next-intl`, the recommended i18n library for Next.js App Router. This will migrate the existing `lib/content.ts` (German text) to JSON message files and enable locale-based routing.

**Current state:** All German text centralized in `lib/content.ts`, some hardcoded strings in components.
**Target state:** JSON translation files per locale, locale-prefixed routes (`/de/...`, `/en/...`), language switcher.

---

## Phase 1: Install and Configure next-intl

1. Install package: `npm install next-intl`

2. Create `i18n/config.ts`:
   - Define supported locales: `['de', 'en']` (extensible)
   - Set default locale: `'de'`

3. Create `i18n/request.ts`:
   - Configure `getRequestConfig` to load messages by locale

4. Create `middleware.ts`:
   - Locale detection and routing
   - Matcher excludes `/api`, `/_next`, static files
   - Use `localePrefix: 'as-needed'` (no prefix for German)

5. Update `next.config.ts`:
   - Wrap config with `createNextIntlPlugin`

---

## Phase 2: Create Message Files

1. Create `messages/de.json`:
   - Convert `lib/content.ts` structure to JSON
   - Add missing error messages from hardcoded strings

2. Create `messages/en.json`:
   - Same structure, English translations (can start with placeholders)

**Structure mirrors current content.ts:**
```
{
  "common": { "brand", "navigation", "footer", "buttons" },
  "homePage": { "hero", "categories", ... },
  "loginPage": { ... },
  "registerPage": { ... },
  "resourcesPage": { ... },
  "sellerDashboard": { ... },
  "errors": { ... }
}
```

---

## Phase 3: Restructure App Directory

Move all pages into `[locale]` dynamic segment:

```
app/
  [locale]/
    layout.tsx      <- Locale-aware layout with NextIntlClientProvider
    page.tsx
    login/page.tsx
    register/page.tsx
    resources/page.tsx
    resources/[id]/page.tsx
    dashboard/seller/page.tsx
    admin/...
    profile/...
    account/...
    upload/...
    following/...
  api/              <- Keep at root (no locale)
  layout.tsx        <- Minimal root layout
  globals.css
  providers.tsx
```

---

## Phase 4: Update Components

1. Create `i18n/navigation.ts`:
   - Export locale-aware `Link`, `useRouter`, `usePathname`

2. Update all components to use `useTranslations`:
   ```tsx
   import { useTranslations } from 'next-intl';
   const t = useTranslations('homePage');
   // {t('hero.title')} instead of {homePage.hero.title}
   ```

3. Replace `next/link` with `@/i18n/navigation` Link

4. Fix hardcoded strings in:
   - `app/login/page.tsx` (error messages)
   - `app/register/page.tsx` (error messages, labels)
   - `app/resources/page.tsx` (filter labels)

---

## Phase 5: Add Language Switcher

Create `components/ui/LocaleSwitcher.tsx`:
- Dropdown to switch between locales
- Add to TopBar component

---

## Phase 6: Cleanup

1. Delete `lib/content.ts` after migration complete
2. Remove old imports from all files

---

## Critical Files to Modify

| File | Change |
|------|--------|
| `next.config.ts` | Add next-intl plugin |
| `app/layout.tsx` | Minimal wrapper (just `{children}`) |
| `app/[locale]/layout.tsx` | New - locale provider, html lang attr |
| `components/ui/TopBar.tsx` | Use `useTranslations`, add LocaleSwitcher |
| `app/login/page.tsx` | Move to `[locale]/`, use translations |
| `app/register/page.tsx` | Move to `[locale]/`, fix hardcoded strings |
| `app/resources/page.tsx` | Move to `[locale]/`, use translations |
| All other pages | Move to `[locale]/` folder |

---

## Files to Create

- `i18n/config.ts` - Locale configuration
- `i18n/request.ts` - Server-side message loading
- `i18n/navigation.ts` - Locale-aware navigation helpers
- `middleware.ts` - Locale routing middleware
- `messages/de.json` - German translations
- `messages/en.json` - English translations
- `app/[locale]/layout.tsx` - Locale layout
- `components/ui/LocaleSwitcher.tsx` - Language switcher

---

## Verification

1. **Build succeeds:** `npm run build`
2. **Routes work:**
   - `/` redirects or serves German content
   - `/en` serves English content
   - `/de/resources` and `/en/resources` both work
3. **Language switching:** Switcher changes locale, persists navigation
4. **No regressions:** All existing functionality works (auth, resources, dashboard)
5. **API routes:** `/api/*` endpoints unaffected by locale routing
