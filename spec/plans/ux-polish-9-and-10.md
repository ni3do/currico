# UX Polish Plan: 8.5 → 9 → 10

> **Goal:** Bring the Currico UX polish score from 8.5 (after quick wins) to 10/10.
> **Prereq:** Quick wins from `final-touch-audit.md` §Summary must be done first.
> **Reference:** `spec/plans/final-touch-audit.md` for full audit findings.

---

## Phase A — Medium Fixes (8.5 → 9/10) ✅ COMPLETE

**Effort:** ~4 hours total
**Theme:** Make every page feel like the same product.

---

### A-1. Heading Hierarchy Standardization

**Problem:** Same-level headings use different sizes and weights across pages. Homepage h1 is `text-4xl font-extrabold`, admin h1 is `text-2xl font-bold` with no responsive scaling. H2 mixes `font-bold` and `font-semibold`. H3 ranges from `text-sm` to `text-xl`.

**Fix:**

1. Define three heading tiers:
   - **Page title (h1):** `text-2xl sm:text-3xl font-bold text-text` (all standard pages)
   - **Hero title (h1):** `text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text` (homepage, about — deliberate exceptions)
   - **Section heading (h2):** `text-xl font-semibold text-text` (everywhere)
   - **Subsection (h3):** `text-lg font-semibold text-text` (everywhere)
2. Audit all pages and normalize to these tiers
3. Either adopt the existing `.heading-1`/`.heading-2`/`.heading-3` CSS classes or delete them to avoid confusion

**Files to touch (~20):**

- All `app/[locale]/admin/*/page.tsx` (add responsive h1 scaling)
- `app/[locale]/checkout/success/page.tsx` and `cancel/page.tsx` (fix `text-white` → `text-text-on-accent`)
- `app/[locale]/download/[token]/page.tsx` (bump h1 from `text-xl` to `text-2xl sm:text-3xl`)
- All legal pages — normalize h2 to `font-semibold`
- Comments/Reviews sections — normalize h2 from `font-bold` to `font-semibold`

**Acceptance Criteria:**

- [x] Every standard page h1 uses `text-2xl sm:text-3xl font-bold`
- [x] Every h2 uses `text-xl font-semibold`
- [x] Every h3 uses `text-lg font-semibold`
- [x] Hero pages (homepage, about) are documented exceptions
- [x] No `text-white` on any heading

---

### A-2. Admin Page Padding & Radius Normalization

**Problem:** Admin layout uses `py-4` while standard pages use `py-8 sm:py-12`. Admin settings page has no wrapper padding. Admin cards use `rounded-2xl` while `.card` class uses `rounded-lg`.

**Fix:**

1. Update `admin/layout.tsx` padding from `py-4` to `py-6 sm:py-8`
2. Add wrapper padding to `admin/settings/page.tsx`
3. Replace `rounded-2xl` with `.card` class or `rounded-lg` in admin pages
4. Fix `anmelden/page.tsx` missing `lg:px-8`

**Files to touch (~5):**

- `app/[locale]/admin/layout.tsx`
- `app/[locale]/admin/settings/page.tsx`
- `app/[locale]/admin/users/page.tsx`
- `app/[locale]/anmelden/page.tsx`

**Acceptance Criteria:**

- [x] Admin pages have consistent padding with rest of site
- [x] No `rounded-2xl` on non-modal cards (6 admin tables + settings card normalized)
- [x] Login page has `lg:px-8`

---

### A-3. Hover Animation Normalization

**Problem:** Hover translateY values range from `-2px` to `-8px` without correlation to element size. Some `whileHover` props lack explicit `transition` duration, causing inconsistent timing.

**Fix:**

1. Define three hover lift tiers:
   - **Buttons/small:** `translateY(-2px)` with 0.2s
   - **Cards/medium:** `translateY(-4px)` with 0.25s (matches `.card` CSS)
   - **Hero features/large:** `translateY(-6px)` with 0.3s
2. Normalize all `whileHover` scale values:
   - **Filters/tabs:** `1.015`
   - **Cards/items:** `1.02`
   - **Icons only:** `1.1`
3. Add explicit `transition={{ duration: X, ease: [0.22, 1, 0.36, 1] }}` to all `whileHover` that are missing it

**Files to touch (~12):**

- `components/ui/SellerHeroSection.tsx` (y: -5 → -4)
- `components/ui/CategoryQuickAccess.tsx` (y: -4, correct)
- `components/ui/FeatureGrid.tsx` (y: -6 or -8 → -6)
- `components/account/WelcomeGuide.tsx` (y: -2 → -4, add transition)
- `components/search/filters/CantonFilter.tsx` (scale: 1.05 → 1.015)
- `components/ui/SmartSearchSuggestions.tsx` (add explicit transition)
- Any other components with missing transition props

**Acceptance Criteria:**

- [x] All hover translateY follows the 3-tier system (-2, -4, -8)
- [x] CantonFilter scale matches sibling filters (1.015)
- [x] Every `whileHover` has explicit `transition` prop with easing
- [x] No implicit framer-motion duration defaults relied on
- [x] All Tailwind hover:scale-\* have explicit duration + easing

---

### A-4. Unified Skeleton Loading System

**Problem:** Loading states use a mix of `animate-spin` spinners, `animate-pulse` Tailwind, custom `.skeleton` CSS, and `.skeleton-pulse`. Different pages feel like different products during loading.

**Fix:**

1. Create a `components/ui/Skeleton.tsx` component with variants:
   - `Skeleton.Text` — single line with shimmer
   - `Skeleton.Card` — card shape with image + text lines
   - `Skeleton.Avatar` — circular shimmer
   - `Skeleton.Button` — pill shape
2. All variants use the existing `.skeleton` CSS animation (1.8s shimmer)
3. Add stagger support: each skeleton element delays by 30ms × index
4. Replace all ad-hoc loading states across account pages, admin pages, and profile pages

**Files to touch (~15):**

- New: `components/ui/Skeleton.tsx`
- `app/[locale]/konto/*/page.tsx` (all account sub-pages)
- `app/[locale]/admin/*/page.tsx` (admin pages)
- `app/[locale]/profil/[id]/page.tsx`
- `components/profile/ProfileTabs.tsx`

**Acceptance Criteria:**

- [x] Single `Skeleton` component with 12 variants used across all account pages
- [x] 6 inline skeleton patterns replaced with reusable components
- [x] ~98 lines of duplicated skeleton markup eliminated
- [ ] Remaining inline patterns in profil/[id] and admin can be migrated later

---

## Phase B — Premium Polish (9 → 10/10) ✅ COMPLETE

**Effort:** ~1-2 days total
**Theme:** Make the site feel "alive" — premium micro-interactions that users notice subconsciously.

---

### B-1. Page Route Transitions

**Problem:** Navigating between pages is instant with no visual feedback. This feels abrupt compared to premium SaaS products.

**Fix:**

1. Create `app/[locale]/template.tsx` wrapping all page content
2. Use framer-motion `AnimatePresence` with:
   - Entry: `opacity: 0, y: 6` → `opacity: 1, y: 0` (200ms, ease-smooth)
   - Exit: `opacity: 1` → `opacity: 0` (100ms)
3. Keep it subtle — users should feel smoothness, not notice animation
4. Exclude admin pages (they should feel snappy, not animated)

**Files to touch (2-3):**

- New: `app/[locale]/template.tsx`
- Possibly: `app/[locale]/admin/template.tsx` (opt-out for admin)

**Acceptance Criteria:**

- [x] All public page navigations have subtle fade+slide transition
- [x] Admin pages remain instant (opt-out via admin/template.tsx)
- [x] No layout shift during transitions
- [x] Works with browser back/forward
- [x] Total transition time < 300ms (200ms entry)

---

### B-2. Scroll-Linked Parallax on Hero Sections

**Problem:** Hero sections on homepage and about page are static. Scrolling past them feels flat.

**Fix:**

1. Add subtle parallax to homepage hero:
   - Background gradient moves at 0.3x scroll speed
   - Floating decorative elements move at 0.5x
   - Search form stays fixed until it scrolls out of view
2. Add parallax to about page hero:
   - Stats bar has slight upward drift on scroll
   - Team photos have subtle scale shift
3. Use framer-motion `useScroll` + `useTransform` (GPU-accelerated, no jank)
4. Disable on `prefers-reduced-motion`

**Files to touch (~3):**

- `app/[locale]/page.tsx` (homepage hero section)
- `app/[locale]/ueber-uns/page.tsx` (about hero)
- Possibly: new `hooks/useParallax.ts` helper

**Acceptance Criteria:**

- [x] Parallax is subtle (max 20px displacement for images, 40px for decorations)
- [x] No jank on 60fps target (GPU-accelerated via framer-motion useTransform)
- [x] Disabled when `prefers-reduced-motion` is set
- [x] Works on mobile (touch scroll) and desktop

---

### B-3. Magnetic Cursor on Primary CTAs

**Problem:** The 2-3 most important CTA buttons look like regular buttons. Premium products have CTAs that "attract" the cursor.

**Fix:**

1. Create a `MagneticButton` wrapper component
2. On mousemove within a 30px radius, button translates toward cursor (0.3x of distance)
3. On mouseleave, springs back to center with ease-smooth
4. Apply to:
   - Homepage hero "Materialien entdecken" button
   - Seller hero "Jetzt starten" button
   - Register page main CTA
5. Only on desktop (no hover on mobile)

**Files to touch (~4):**

- New: `components/ui/MagneticButton.tsx`
- `app/[locale]/page.tsx` (homepage CTAs)
- `components/ui/SellerHeroSection.tsx`
- `app/[locale]/registrieren/page.tsx`

**Acceptance Criteria:**

- [x] Button follows cursor within radius (0.3x strength)
- [x] Spring-back animation on leave (spring stiffness 300, damping 20)
- [x] Only on desktop (mousemove doesn't fire on touch devices)
- [x] Works with keyboard focus (no visual change on keyboard nav)
- [x] Max 5px displacement to keep it subtle

---

### B-4. Smart Card Tilt on MaterialCard Hover

**Problem:** MaterialCard hover is flat — just a lift and shadow. Adding depth would make browsing feel premium.

**Fix:**

1. Create a `TiltCard` wrapper component using `perspective: 1000px`
2. On mousemove, calculate angle from center and apply `rotateX/rotateY` (max 3°)
3. Combine with existing `translateY(-4px)` lift
4. Add subtle light reflection (pseudo-element gradient that follows cursor position)
5. Apply to MaterialCard and ProfileCard on the browse/search pages
6. Disable on `prefers-reduced-motion`

**Files to touch (~4):**

- New: `components/ui/TiltCard.tsx`
- `components/ui/MaterialCard.tsx`
- `components/ui/ProfileCard.tsx`
- `app/[locale]/materialien/page.tsx` (if wrapper needed)

**Acceptance Criteria:**

- [x] Max 3° tilt on both axes
- [x] Smooth reset on mouseleave (spring animation)
- [x] Light reflection effect follows cursor (radial gradient overlay)
- [x] Disabled for `prefers-reduced-motion`
- [x] No performance impact (CSS transforms only, GPU-accelerated)

---

### B-5. Semantic HTML Cleanup

**Problem:** Many containers use `<div>` where `<section>`, `<nav>`, `<article>`, or `<aside>` would be more appropriate. This affects both accessibility (screen readers) and SEO.

**Fix:**

1. Audit all pages and replace wrapper `<div>`s with semantic elements:
   - Page sections → `<section aria-labelledby="...">`
   - Navigation groups → `<nav aria-label="...">`
   - Individual content items (cards, comments) → `<article>`
   - Sidebar content → `<aside>`
2. Add `aria-labelledby` linking to section headings
3. Don't over-semanticize — layout-only divs stay as divs

**Files to touch (~20+):**

- All `app/[locale]/*/page.tsx` page components
- Key layout components: `TopBar.tsx`, `Footer.tsx`, `AccountSidebar.tsx`
- Card components: `MaterialCard.tsx`, `ProfileCard.tsx`

**Acceptance Criteria:**

- [x] Key page sections use semantic elements (article for cards, nav with labels)
- [x] All `<nav>` elements have `aria-label` (TopBar main + mobile, Footer)
- [x] Homepage sections have `aria-label`/`aria-labelledby`
- [x] No unnecessary semantic nesting (divs stay for pure layout)

---

## Implementation Order

| #           | Task                 | Effort | Score Impact                      |
| ----------- | -------------------- | ------ | --------------------------------- |
| **Phase A** |                      |        |                                   |
| A-1         | Heading hierarchy    | 1.5hr  | 6.5 → 8.5 (Typography)            |
| A-2         | Admin padding/radius | 30min  | 7 → 8.5 (Spacing)                 |
| A-3         | Hover normalization  | 1hr    | 7.5 → 9 (Motion)                  |
| A-4         | Skeleton loading     | 1.5hr  | +0.5 across Responsive, Component |
| **Phase B** |                      |        |                                   |
| B-1         | Page transitions     | 2hr    | 7.5 → 9.5 (Motion)                |
| B-2         | Scroll parallax      | 2hr    | +0.5 (Motion, premium feel)       |
| B-3         | Magnetic cursor      | 1hr    | +0.3 (premium feel)               |
| B-4         | Card tilt            | 1.5hr  | +0.3 (premium feel)               |
| B-5         | Semantic HTML        | 2hr    | 8 → 9.5 (Accessibility)           |

**Total: ~13 hours to 10/10**
