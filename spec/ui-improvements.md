# UI Improvements Spec — Upload Path & Account

Scope: Quick wins, medium-effort, and large refactors for the upload wizard and account dashboard.
Branch: `improvements`

---

## Quick Wins (small, isolated changes)

### QW-1: Upload progress — replace full-screen modal with inline toast

**Problem:** The upload modal (`uploadStatus !== "idle"`) in `app/[locale]/upload/page.tsx:818-889` blocks the entire page with `fixed inset-0 z-50 bg-black/60`. Users can't navigate or do anything while uploading.

**Fix:** Replace the full-screen overlay with a fixed bottom-right toast card showing progress, success, or error. Keep the same 3 states (uploading/success/error) but render them in a `fixed bottom-6 right-6` card (~320px wide) with the same progress bar, spinner, and retry button. Add a close/dismiss button for success and error states.

**Files:** `app/[locale]/upload/page.tsx`

---

### QW-2: Legal confirmations — add visual progress indicator

**Problem:** The 5 legal checkboxes in Step 4 (`upload/page.tsx:682-770`) are a wall of text. Users don't know how many they've checked or how many remain.

**Fix:** Add a progress counter above the checkbox list: "3 von 5 bestätigt" with a small progress bar. Use `--ctp-green` when all 5 are checked. Wrap the existing `<div className="space-y-3">` with a header showing the count.

**Files:** `app/[locale]/upload/page.tsx`

---

### QW-3: File thumbnail preview for uploaded files

**Problem:** After selecting a file in Step 4, users only see a file icon + name + size. No visual preview of what they uploaded.

**Fix:** For image preview files, show an `<img>` thumbnail using `URL.createObjectURL()`. For PDFs, show the existing file icon but with a "Vorschau" badge. Keep the click-to-open-in-new-tab behavior. Update the file list items in `upload/page.tsx:592-639`.

**Files:** `app/[locale]/upload/page.tsx`

---

### QW-4: Confirmation dialog for material deletion

**Problem:** In the account page, deleting a material has no confirmation step. Clicking delete immediately triggers the API call.

**Fix:** Add a simple confirmation dialog before deletion. Use a small modal or inline prompt: "Sind Sie sicher? Dieses Material wird dauerhaft gelöscht." with "Abbrechen" and "Löschen" buttons. The delete button should use `text-error` styling.

**Files:** `app/[locale]/account/page.tsx`

---

### QW-5: Debounce search/filter inputs in account

**Problem:** Search/filter inputs in the account library tab trigger filtering on every keystroke with no debounce, causing unnecessary re-renders.

**Fix:** Add a 300ms debounce to search input `onChange` handlers using a simple `setTimeout` / `clearTimeout` pattern (no new dependencies). Apply to any search inputs in the library, uploads, and comments tabs.

**Files:** `app/[locale]/account/page.tsx`

---

## Medium Effort

### ME-1: Upload error messages — specific and actionable

**Problem:** Upload failures show generic German-only messages like "Fehler beim Hochladen" (`upload/page.tsx:243-246`). The XHR error handler at line 250 shows "Netzwerkfehler" but doesn't differentiate between file-too-large, auth expired, server error, or format rejected.

**Fix:**

- Parse the API error response more granularly (status 413 = file too large, 401 = auth expired, 422 = validation, 500 = server error)
- Show specific messages for each case with actionable advice:
  - 413: "Datei zu gross. Maximum: 50 MB. Ihre Datei: X MB."
  - 401: "Sitzung abgelaufen. Bitte melden Sie sich erneut an." + login link
  - 422: Show the specific validation error from the API
  - Network error: "Keine Internetverbindung. Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut."
- Add i18n keys for all messages
- Keep the retry button for retriable errors, show login link for auth errors

**Files:** `app/[locale]/upload/page.tsx`, `messages/de.json`, `messages/en.json`

---

### ME-2: Mobile-friendly drag-and-drop area

**Problem:** The file upload area at `upload/page.tsx:567-590` shows "Klicken Sie hier oder ziehen Sie Dateien hinein" on all devices. Drag-and-drop doesn't work on mobile, making the hint misleading.

**Fix:**

- Detect touch devices using `'ontouchstart' in window` or `navigator.maxTouchPoints > 0`
- On mobile: show "Tippen Sie hier, um Dateien auszuwählen" instead
- Remove the drag-drop hint icon on mobile, show a more prominent "Durchsuchen" button instead
- Keep drag-and-drop working on desktop with the existing UI

**Files:** `app/[locale]/upload/page.tsx`

---

### ME-3: Account uploads table — card layout on mobile

**Problem:** The uploads management table in the account page overflows on mobile screens with no scroll hint. Column headers and action buttons get cramped.

**Fix:**

- Below `sm` breakpoint, render uploaded materials as stacked cards instead of a table row
- Each card shows: title, status badge, price, download/purchase count, and action buttons
- Use the existing `DashboardMaterialCard` component pattern or a simplified version
- Keep the table layout on `sm` and above
- Use `@media (max-width: 640px)` or Tailwind's `sm:` breakpoint to toggle

**Files:** `app/[locale]/account/page.tsx`

---

### ME-4: Profile completion — prominent welcome banner on overview tab

**Problem:** Profile completion progress is only in the sidebar (`AccountSidebar.tsx`). New users landing on the overview tab don't see a clear "next steps" guide.

**Fix:**

- On the overview tab, if profile completion < 100%, show a prominent banner card at the top
- Content: "Vervollständigen Sie Ihr Profil" with a progress bar, list of missing fields, and a "Profil bearbeiten" button that navigates to settings-profile
- Use `--ctp-blue` accent with the existing `FadeIn` animation
- Dismiss/close button that saves dismissal to localStorage
- Re-show the banner if new fields become incomplete

**Files:** `app/[locale]/account/page.tsx`

---

### ME-5: Accessibility — aria-describedby for form errors

**Problem:** Error messages in the upload form (`FormField.tsx:49-53`) and account settings are not linked to their input fields via `aria-describedby`. Screen readers can't associate errors with fields.

**Fix:**

- Generate a stable `id` per `FormField` instance (e.g., `field-${label}-error`)
- Add `aria-describedby` pointing to the error `<div>` when error is shown
- Pass the `id` down to `FormInput`, `FormTextarea`, `FormSelect` children via a prop or React context
- Also add `aria-invalid="true"` to inputs when `hasError` is true
- Apply the same pattern to checkboxes in `FormCheckbox`

**Files:** `components/upload/FormField.tsx`

---

### ME-6: Accessibility — color-only status indicators need icons/text

**Problem:** Upload status in the account page uses color-coded badges (green = approved, yellow = pending, red = rejected) without icons or text labels. Color-blind users can't distinguish states.

**Fix:**

- Add a small Lucide icon next to each status badge:
  - Approved/Published: `CheckCircle2` (green)
  - Pending: `Clock` (yellow)
  - Rejected: `XCircle` (red)
  - Draft: `FileEdit` (muted)
- Ensure the badge text itself already says the status (it likely does), but the icon provides a second visual cue
- Use `aria-label` on the badge for screen readers

**Files:** `app/[locale]/account/page.tsx`

---

### ME-7: Accessibility — keyboard-accessible tooltips

**Problem:** `InfoTooltip` in `components/upload/InfoTooltip.tsx` opens on `onMouseEnter` / `onMouseLeave` (lines 42-43). The `onClick` toggle also exists but keyboard `Tab` → `Enter` flow doesn't show focus styling, and there's no `onFocus`/`onBlur` handler.

**Fix:**

- Add `onFocus={() => setIsOpen(true)}` and `onBlur={() => setIsOpen(false)}` to the trigger button
- Add visible focus styling: `focus-visible:ring-2 focus-visible:ring-primary/30`
- Add `aria-expanded={isOpen}` to the button
- Add `role="tooltip"` and `id` to the tooltip content, with `aria-describedby` on the button
- Ensure `Escape` key closes the tooltip (already handled by click-outside, but add keydown too)

**Files:** `components/upload/InfoTooltip.tsx`

---

### ME-8: Radio options — add ARIA roles

**Problem:** `RadioOption` in `FormField.tsx:198-231` uses a visible `<input type="radio">` but the wrapping `<label>` has custom styling that makes it a visual card. The native radio is there but lacks `role="radiogroup"` on the parent.

**Fix:**

- In the upload page where `RadioOption` is used (Step 3, pricing), wrap the grid container with `role="radiogroup"` and `aria-label="Preismodell"`
- Add `aria-checked` to the outer label element
- Ensure the radio input has a proper `name` attribute for grouping

**Files:** `app/[locale]/upload/page.tsx`, `components/upload/FormField.tsx`

---

## Large Refactors

### LR-1: Account page split into route segments

**Problem:** `app/[locale]/account/page.tsx` is ~3000 lines containing 7+ tabs (overview, library, uploads, bundles, comments, wishlist, settings) in a single component. This hurts load time (entire page + all tab logic loads upfront), prevents deep-linking to specific tabs, and makes the file unmaintainable.

**Fix:**

- Create a shared layout at `app/[locale]/account/layout.tsx` containing TopBar, Footer, Breadcrumb, and the sidebar navigation
- Split each tab into its own route segment:
  - `app/[locale]/account/page.tsx` — overview (stats, recent activity)
  - `app/[locale]/account/library/page.tsx` — purchased/free materials
  - `app/[locale]/account/uploads/page.tsx` — uploaded materials management
  - `app/[locale]/account/bundles/page.tsx` — bundle management
  - `app/[locale]/account/comments/page.tsx` — seller comments
  - `app/[locale]/account/wishlist/page.tsx` — wishlist
  - `app/[locale]/account/settings/page.tsx` — profile, appearance, notifications, account settings
- Sidebar navigation uses `<Link>` instead of `useState` tab switching, with `usePathname()` for active state
- Each sub-page fetches only its own data (enables LR-2)
- Move shared types/interfaces to `lib/types/account.ts`
- Update all internal links that point to `/account` with tab params

**Files:** `app/[locale]/account/` (new layout + 7 page files), `components/account/AccountSidebar.tsx`, `lib/types/account.ts` (new)

---

### LR-2: Lazy-load data per tab

**Problem:** The current account page fires 8+ parallel API calls via `Promise.all()` on mount — stats, library, uploads, bundles, comments, wishlist, notifications, profile — regardless of which tab the user visits. Most of this data is never seen.

**Fix:**

- After LR-1 (account page split), each route segment fetches only its own data
- Each sub-page uses its own `useEffect` or data-fetching pattern on mount
- Add a simple stale-while-revalidate cache using `useRef` to store fetched data:
  - On mount: show cached data immediately (if exists), fetch fresh data in background
  - On success: update cache + UI
  - On error: keep showing cached data with an error toast
- Add loading skeletons per sub-page (reuse existing `Skeleton` component)
- The overview page fetches only summary stats (1 API call), not full lists

**Depends on:** LR-1

**Files:** All `app/[locale]/account/*/page.tsx` sub-pages

---

### LR-3: Server-side draft saving for uploads

**Problem:** Upload drafts only persist in `localStorage` (`UploadWizardContext.tsx`). If the user clears their browser, uses a different device, or the cache expires, all progress is lost. There's no indication of how safe the draft is.

**Fix:**

- Add a `drafts` table to Prisma schema:
  ```
  model Draft {
    id        String   @id @default(cuid())
    userId    String
    type      String   // "material" | "bundle"
    data      Json     // serialized form state
    updatedAt DateTime @updatedAt
    createdAt DateTime @default(now())
    user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  }
  ```
- Add API routes:
  - `POST /api/drafts` — create/update draft (upsert by userId + type)
  - `GET /api/drafts?type=material` — fetch latest draft
  - `DELETE /api/drafts/:id` — delete draft
- Update `UploadWizardContext.tsx`:
  - On form change: debounce (2s) and save to server + localStorage (dual-write)
  - On page load: fetch server draft, fall back to localStorage
  - Show "Entwurf gespeichert" indicator with timestamp
  - On successful publish: delete server draft
- Keep localStorage as offline fallback
- Add migration script

**Files:** `prisma/schema.prisma`, `app/api/drafts/route.ts` (new), `app/api/drafts/[id]/route.ts` (new), `components/upload/UploadWizardContext.tsx`, `components/upload/DraftIndicator.tsx`

---

## Implementation Order

**Quick Wins:**

1. QW-1 (upload toast) — most visible UX improvement
2. QW-2 (legal progress) — reduces friction
3. QW-3 (file thumbnails) — builds confidence
4. QW-4 (delete confirmation) — prevents data loss
5. QW-5 (debounce) — performance

**Accessibility:** 6. ME-5 (aria-describedby) — foundational a11y fix 7. ME-7 (keyboard tooltips) — a11y 8. ME-8 (radio ARIA) — a11y 9. ME-6 (status icons) — a11y

**Medium UX:** 10. ME-1 (error messages) — UX 11. ME-2 (mobile drag-drop) — UX 12. ME-3 (mobile cards) — UX 13. ME-4 (welcome banner) — UX

**Large Refactors:** 14. LR-1 (account page split) — architecture 15. LR-2 (lazy-load per tab) — depends on LR-1 16. LR-3 (server-side drafts) — independent, can run alongside LR-1
