# Final Touch — Consistency, Hierarchy & Motion Audit

> **Date:** 2026-02-17
> **Branch:** `feat/consistency-audit-fixes`
> **Scope:** Full codebase audit covering all pages, components, and design patterns

---

## 1. Consistency Audit — Design Rule Breaks

### 1.1 Button Border-Radius Mismatch (Critical)

All `.btn-*` CSS classes use `border-radius: var(--radius-md)` (8px), but inline JSX buttons use `rounded-lg` (12px) or `rounded-xl` (16px). This creates two visually distinct button styles depending on whether the developer used a CSS class or Tailwind.

| Location                                           | Pattern                       | Radius         |
| -------------------------------------------------- | ----------------------------- | -------------- |
| `globals.css` `.btn-primary` through `.btn-action` | `var(--radius-md)`            | 8px            |
| `ConfirmDialog.tsx:85`                             | `rounded-xl`                  | 16px           |
| `PublishPreviewModal.tsx:153`                      | `rounded-xl`                  | 16px           |
| `anmelden/page.tsx:151`                            | `rounded-lg`                  | 12px           |
| `admin/users/page.tsx:307`                         | `rounded-lg`                  | 12px           |
| `verkaeufer-werden/page.tsx:280`                   | `.btn-primary` + inline px/py | 8px (from CSS) |

**Impact:** ~47 button elements have inconsistent rounding.

### 1.2 Card Border-Radius Inconsistency (High)

The `.card` CSS class uses `var(--radius-lg)` (12px), but several pages override this:

| Location                     | Radius               | Expected                      |
| ---------------------------- | -------------------- | ----------------------------- |
| `admin/users/page.tsx:191`   | `rounded-2xl` (20px) | `rounded-lg` (12px)           |
| `admin/settings/page.tsx:15` | `rounded-2xl` (20px) | `rounded-lg` (12px)           |
| Modal/dialog content         | `rounded-2xl`        | Correct (modals are distinct) |

### 1.3 Page Container Padding Variance (High)

Standard pattern should be `px-4 py-8 sm:px-6 sm:py-12 lg:px-8`. Deviations:

| Page                            | Pattern             | Issue                              |
| ------------------------------- | ------------------- | ---------------------------------- |
| `admin/layout.tsx:116`          | `py-4`              | Half the standard vertical padding |
| `anmelden/page.tsx:111`         | `px-4 py-8 sm:px-6` | Missing `lg:px-8`                  |
| `materialien/[id]/page.tsx:290` | `pb-24 lg:pb-8`     | Large bottom padding jump          |
| `admin/settings/page.tsx:13`    | `space-y-6` only    | No wrapper padding at all          |

### 1.4 H1 Page Title Sizing Chaos (High)

Same semantic element (page title h1) uses three different base sizes:

| Page Type         | Size                  | Responsive            |
| ----------------- | --------------------- | --------------------- |
| Homepage hero     | `text-4xl → text-6xl` | `font-extrabold`      |
| About page        | `text-3xl → text-5xl` | `font-bold`           |
| Standard pages    | `text-2xl → text-3xl` | `font-bold`           |
| Admin newsletters | `text-2xl` only       | No responsive scaling |
| Download/error    | `text-xl`             | Below standard        |

**Fix:** Standard pages should uniformly use `text-2xl sm:text-3xl font-bold`. Hero pages can deviate as a deliberate design choice.

### 1.5 H2/H3 Font-Weight Inconsistency (Medium)

- H2 mixes `font-bold` (Comments, Reviews sections) and `font-semibold` (legal pages, filters)
- H3 ranges from `text-sm font-medium` (admin stats) to `text-xl font-semibold` (admin panels)
- CSS defines `.heading-2` as `font-weight: 600` (semibold) but it's rarely used

### 1.6 Hardcoded Colors Still Present (Medium)

| File                            | Issue                                         |
| ------------------------------- | --------------------------------------------- |
| `checkout/success/page.tsx:189` | `text-white` instead of `text-text-on-accent` |
| `checkout/cancel/page.tsx`      | `text-white` instead of `text-text-on-accent` |

### 1.7 Unused Design System Utilities (Low)

`globals.css` defines `.heading-1` through `.heading-4`, `.container-standard`, `.modal-overlay`, `.modal-content` — but pages use inline Tailwind instead. These utilities are nearly dead code.

---

## 2. Motion Report — Animation Uniformity

### 2.1 Easing Curves: 3 competing standards

| Easing                                 | Where Used                              | Status                                |
| -------------------------------------- | --------------------------------------- | ------------------------------------- |
| `[0.22, 1, 0.36, 1]` / `--ease-smooth` | ~90% of animations                      | **Primary, correct**                  |
| `[0.25, 0.1, 0.25, 1]`                 | WelcomeGuide, ProfileCompletionProgress | **Outlier — should match primary**    |
| `"easeOut"` (string)                   | LikeButton, NotificationDropdown        | **Outlier — should use cubic-bezier** |

**Verdict:** Mostly uniform, but 2-3 components use non-standard easing curves.

### 2.2 Duration Tiers: Well-structured but with outliers

The codebase naturally falls into these duration tiers:

| Tier    | Duration  | Usage                         | Status                         |
| ------- | --------- | ----------------------------- | ------------------------------ |
| Instant | 0.1s      | Tap/press feedback            | Consistent                     |
| Quick   | 0.15s     | Tooltips, dropdowns           | Consistent                     |
| Normal  | 0.2s      | Hover effects, filter buttons | **Mostly consistent**          |
| Medium  | 0.25-0.3s | Cards, content switches       | Consistent                     |
| Slow    | 0.4-0.5s  | Page entrances, fade-ins      | Consistent                     |
| Outlier | 1.0s      | SellerLevelCard progress      | **Only instance — feels slow** |

### 2.3 Hover Scale Values: No clear hierarchy

| Scale   | Components                         | Suggested Tier |
| ------- | ---------------------------------- | -------------- |
| `1.01`  | SmartSearchSuggestions             | Micro          |
| `1.015` | Filter buttons, tabs               | Small          |
| `1.02`  | Cards, category items, CTA buttons | Medium         |
| `1.05`  | CantonFilter, feature items        | Large          |
| `1.1`   | Icons, close buttons               | Extra-large    |

**Issue:** CantonFilter uses `1.05` while sibling filters use `1.015`. This makes canton selection feel "jumpier" than other filters.

### 2.4 Hover Translate-Y: Gradual but inconsistent

Values range from `-2px` to `-8px` without clear correlation to component size:

| Value  | Component                  | Expected by Size |
| ------ | -------------------------- | ---------------- |
| `-2px` | WelcomeGuide cards (large) | Should be -4px   |
| `-3px` | Buttons (small)            | Correct          |
| `-4px` | Cards (medium)             | Correct          |
| `-5px` | SellerHero cards (medium)  | Should be -4px   |
| `-6px` | FeatureGrid items (medium) | Should be -4px   |
| `-8px` | FeatureGrid items (medium) | Should be -4px   |

### 2.5 Stagger Delays: No standard

| Component               | Stagger Increment | Offset |
| ----------------------- | ----------------- | ------ |
| StaggerChildren default | 80ms              | None   |
| AccountSidebar          | 30ms              | None   |
| WelcomeGuide            | 50ms              | 100ms  |
| Search filters          | 30-40ms           | None   |
| TopBar mobile menu      | 50ms              | 50ms   |

**Fix:** Standardize on 50ms increment with no offset for lists, 80ms for grid items.

### 2.6 AnimatePresence Mode: Inconsistent

- `mode="wait"` (sequential): ProfileTabs, LikeButton, search results
- `mode="popLayout"` (layout): Toast, FilterChips
- No mode (simultaneous): CommentCard, TopBar dropdown

No clear rule for when each mode is appropriate.

### 2.7 Overall Motion Verdict

The motion system is **80% cohesive**. The `animations.tsx` shared components (`FadeIn`, `StaggerChildren`, `MotionCard`) provide good consistency for page-level animations. The remaining 20% inconsistency comes from:

- Component-level hover interactions using ad-hoc values
- 2-3 components with non-standard easing curves
- Missing explicit duration on some `whileHover` props (falling back to framer-motion defaults)

---

## 3. Ideas for Improvement — Elevating to World-Class

### Idea 1: Unified Page Transition System

Currently there are no page-level transitions between routes. Adding a subtle cross-fade (200ms, opacity 0.95→1 + translateY 4px→0) on route changes would make navigation feel fluid and intentional. Next.js App Router supports this via a `template.tsx` wrapper with `AnimatePresence`.

### Idea 2: Scroll-Linked Parallax on Hero Sections

The homepage hero and about page hero are static. Adding subtle scroll-linked parallax (background moves at 0.3x scroll speed, floating elements at 0.5x) would add depth without being distracting. Use `useScroll` + `useTransform` from framer-motion — no performance cost since it uses CSS transforms.

### Idea 3: Magnetic Cursor Effect on Primary CTAs

For the 2-3 most important CTA buttons (homepage "Materialien entdecken", seller hero "Jetzt starten"), add a magnetic cursor effect where the button subtly follows the mouse within a 20px radius. This is a signature micro-interaction used by premium SaaS products (Linear, Vercel). Implementation: `onMouseMove` handler with `transform: translate(dx*0.3, dy*0.3)`.

### Idea 4: Smart Loading Skeletons with Stagger

Replace the current mix of spinner/pulse/skeleton loading states with a unified skeleton system that staggers in from top to bottom. Each skeleton element fades in with a 30ms delay, creating a "waterfall" reveal effect. When data loads, content fades in with the same stagger pattern, creating visual continuity.

### Idea 5: Card Tilt Effect on Material Cards

Add a subtle 3D tilt effect on MaterialCard hover (max 3° rotation on X/Y axes based on mouse position). Combined with the existing translateY lift, this creates a "floating card" feel. Use `perspective: 1000px` on the parent and `transform: rotateX(Xdeg) rotateY(Ydeg)` on mousemove. Keep it subtle (max 3°) to avoid motion sickness.

---

## 4. UX Polish Score

### Scoring Breakdown

| Category                  | Score  | Notes                                                                                                           |
| ------------------------- | ------ | --------------------------------------------------------------------------------------------------------------- |
| **Color System**          | 9/10   | Catppuccin theme is well-implemented, semantic tokens used consistently. Minor hardcoded `text-white` remnants. |
| **Typography**            | 6.5/10 | Good body text, but heading hierarchy is inconsistent across pages. CSS utility classes exist but aren't used.  |
| **Spacing & Layout**      | 7/10   | Standard pages follow a good pattern, but admin pages deviate. Button padding/radius is the biggest gap.        |
| **Motion & Animation**    | 7.5/10 | Shared animation components are excellent. Hover interactions have too many ad-hoc values. No page transitions. |
| **Component Consistency** | 8/10   | Cards, pills, badges are well-standardized. Buttons are the weak spot (CSS class vs inline Tailwind split).     |
| **Accessibility**         | 8/10   | Focus-visible rings, aria-labels, semantic HTML all improved significantly in recent work.                      |
| **Responsive Design**     | 7.5/10 | Mobile menu, card layouts work well. Some admin pages lack responsive scaling on headings.                      |
| **Dark Mode**             | 8.5/10 | Catppuccin Mocha theme works well with semantic tokens. Card shadows have dedicated dark variants.              |

### Overall UX Polish Score: **7.5 / 10**

**What makes it good (7+):**

- Cohesive color system with Catppuccin theme
- Well-designed card components with premium hover effects
- Good animation foundation via shared `animations.tsx`
- Consistent i18n and accessibility improvements
- Dark mode that actually looks good

**What prevents it from being great (8+):**

- Button styling split between CSS classes and inline Tailwind
- Heading hierarchy lacks discipline
- No page transitions between routes
- Hover interactions use too many different scale/translate values
- Some admin pages feel like a different product (tighter padding, different radius)

**What would make it world-class (9+):**

- Unified page transitions
- Magnetic cursor on CTAs
- Standardized heading sizes and button radius
- Scroll-linked depth effects on hero sections
- Smart loading skeleton system replacing ad-hoc spinners

---

## Summary of Actionable Fixes — ALL COMPLETE

> Implemented via `ux-polish-9-and-10.md` phases A+B and additional cleanup.

### Quick Wins (< 30min each) ✅

1. ~~Fix `--radius-md` → `--radius-lg` in all `.btn-*` CSS classes~~ — Already `--radius-lg`
2. ~~Replace `text-white` → `text-text-on-accent` in checkout pages~~ — Already semantic
3. ~~Add responsive scaling to admin newsletter h1~~ — Already `text-2xl sm:text-3xl`
4. ~~Standardize CantonFilter hover scale from `1.05` to `1.015`~~ — Fixed in A-3
5. ~~Replace `"easeOut"` string with `[0.22, 1, 0.36, 1]`~~ — Fixed in 5 files (verkaeufer-stufen ×3, settings ×2)

### Medium Effort (1-2hr each) ✅

6. ~~Standardize all page h1s to `text-2xl sm:text-3xl font-bold`~~ — Done in A-1
7. ~~Unify admin page padding to match standard pages~~ — Done in A-2
8. ~~Add explicit `transition` prop to all `whileHover` usages missing it~~ — Done in A-3
9. ~~Standardize hover translateY to `-3px` (buttons), `-4px` (cards), `-6px` (feature items)~~ — Done in A-3

### Larger Projects (half-day each) ✅

10. ~~Adopt CSS heading classes across pages~~ — heading-2/heading-4 used where appropriate; dead heading-1/heading-3/container-standard CSS removed
11. ~~Create unified skeleton loading system~~ — Done in A-4 (Skeleton component with 12 variants)
12. ~~Add page-level route transitions via `template.tsx`~~ — Done in B-1
