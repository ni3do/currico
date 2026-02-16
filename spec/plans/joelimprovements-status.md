# Joel Improvements - Status nach Seite

Legende: [x] = erledigt, [ ] = offen

---

## 1. Startseite (`/`)

- [x] "Alle Zyklen" Option raus → "Zyklus wählen…" / "Fach wählen…"
- [x] Sprachvarianten ersetzt durch Kompetenzen-Selector
- [x] SwissMade rot gelöscht aus TrustBar
- [x] Empfohlene Materialien laden echte Materialien via API
- [x] "Infomaniak Schweiz" zu "Schweizer Server" ändern plus Emblem
- [x] "Sichere Zahlung" nach rechts verschieben

### Eigene Vorschläge (Startseite)

- [x] Hero-Dropdowns haben `rounded-xl` statt `rounded-full` (inkonsistent mit globalem Dropdown-Style)
- [x] SellerHeroSection: "70% Provision für Sie" ist hardcoded auf Deutsch — sollte über i18n laufen (`t("badge")`)
- [x] `SUBJECT_PILL_MAP` hat "Franzosisch" ohne Umlaut — sollte "Französisch" sein (oder Code-basiert matchen)
- [x] Kein Fallback wenn `/api/materials` keine Materialien zurückgibt — Sektion wird unsichtbar, besser: leerer Zustand mit CTA "Sei der Erste"
- [x] Hero-Bild `hero-teachers.png` hat keinen `sizes`-Prop auf `<Image>` — verschlechtert LCP auf Mobile
- [x] Suchformular hat kein `aria-label` auf dem `<form>` — Screenreader können es nicht identifizieren
- [x] Search-Button zeigt auf Mobile nur das Icon ohne Text — kein `aria-label` auf dem Button
- [x] SwissBrandSection und ValueProposition haben fast identisches Layout — könnten zu einer generischen Sektion vereinheitlicht werden — extracted shared FeatureGrid component with compact/spacious variants, both sections now use it
- [x] TrustBar Items sind nicht verlinkt — z.B. "Schweizer Hosting" könnte auf Über-uns oder Datenschutz verlinken — all 5 items now link to relevant pages (LP21→/materialien, Quality→/verifizierter-verkaeufer, Hosting+nDSG→/datenschutz, Payment→/agb) with hover color transition
- [x] Kein `<meta description>` oder OpenGraph Tags spezifisch für die Startseite (SEO) — enhanced locale layout with OG type/siteName/images + Twitter card
- [x] Featured Materials zeigen keinen Rating/Bewertung — averageRating + reviewCount now passed to MaterialCard on homepage

---

## 2. Materialien (`/materialien`)

### Suche & Darstellung

- [x] Entweder Profil ODER Materialien darstellen (nicht beides gemischt)
- [x] Ersteller als Default ausschalten, "Ersteller" zu "Profil" ändern
- [x] Suchleiste bei Profilen: "nach Lehrpersonen" → "nach Profilen suchen"
- [x] Per Default nur Materialien ausgewählt (nicht Profile)
- [x] Text in Suchleiste verbessern wenn Materialien ausgewählt
- [x] Fuzzy-Match Suche für Materialien — `word_similarity()` + FTS blending in `/app/api/materials/route.ts`, fuzzy banner in frontend
- [x] Upload-Button auf der Materialien-Seite hinzufügen

### Filter

- [x] Aktive Filter Aufpoppen verbessern
- [x] Ersteller + Zyklus/Fachbereich: auch Ersteller anzeigen die das anbieten — creator search filtered by subjects/cycles in `/api/users/search/route.ts`
- [x] Fachbereich + Zyklus Filter nicht resetten wenn im gleichen Zyklus
- [x] ">" aus Preisoptionen rausnehmen
- [x] OneNote als Formatoption hinzufügen
- [x] Andere Formate als Option hinzufügen
- [x] Formate: kein blauer Punkt wenn ausgewählt (wie alle anderen Filter)
- [x] Hover-Effekt bei Filtern verbessern und einheitlich machen
- [x] Nach Kantonen filtern können
- [x] Aktive Filter nur rechts unter "Gefundene Materialien" (nicht links in der Bar)
- [x] Filter-Funktion überarbeiten (Zyklus/Tab-spezifische Suche)

### Bugs

- [x] Profil anklicken führt zu Error → FIX (ProfileCard.tsx: `/profile/` → `/profil/`)

### Neue Bugs (Session 2025-02-11)

- [x] BUG: "0 Materialien gefunden" flash on initial load — show skeleton placeholder while loading
- [x] BUG: Hardcoded wishlist aria-labels in MaterialCard.tsx — now accepts i18n props
- [x] BUG: Hardcoded "PDF" badge on detail page — now uses fileFormat from API (derived from file extension)
- [x] BUG: Hardcoded "Anonymous" fallback in MaterialCard.tsx — now accepts anonymousLabel prop
- [x] BUG: Follow button on detail page only toggles local state — now calls /api/users/[id]/follow with optimistic updates
- [x] BUG: Seller material count not displaying correctly on detail page — fixed interface mismatch (resourceCount → materialCount)

### Neue Quick Wins (Session 2025-02-11)

- [x] QW: Add share button (copy link) to detail page — "Teilen" button with clipboard copy + toast
- [x] QW: Add file info (pages) to detail page metadata row
- [x] QW: Change card image aspect ratio to portrait for documents (16/9 → 4/3)
- [x] QW: Fix related materials showing "Anonymous" seller — API now returns sellerName
- [x] QW: Add "clear all filters" button to search page — shows with 1+ active filters (was 2+)

### UI Verbesserungen — Suchseite (Session 2025-02-11)

- [x] Ergebnis-Zähler hat keine Animation/Transition bei Aktualisierung — AnimatePresence fade+slide added
- [x] Sidebar Fachbereich-Sektion nimmt zu viel Platz ein — defaultOpen={false}, opens when filter active
- [x] Grid/List-Toggle aktiver Zustand ist optisch nicht deutlich genug — pill-style with shadow-sm + faint inactive

### Eigene Vorschläge (Materialien)

- [x] Seite ist 1173 Zeilen lang — Filter-Chips, Pagination und Grid-Rendering sollten in eigene Komponenten extrahiert werden — page now 259 lines, FilterChips/PaginationControls/ResultsControlBar/MaterialsGrid/ProfilesGrid all extracted
- [x] `getSubjectPillClass()` ist dupliziert zwischen `page.tsx` (Startseite) und `materialien/page.tsx` — in eine gemeinsame Utility-Funktion auslagern
- [x] Hardcoded deutsche Strings in Filter-Chips: "Kostenlos", "Einzelmaterial", "Bundle", "Alle entfernen", "Zyklus" — müssen über i18n (`t()`) laufen
- [x] Mobile-Filter-Drawer "anzeigen" Button: `{totalCount} {t("results.countLabel")} anzeigen` — uses i18n `t("results.showResults")`
- [x] Kein `aria-label` auf den Pagination Prev/Next Buttons — nur SVG-Icons ohne Text, unzugänglich für Screenreader
- [x] Pagination `<nav>` hat kein `aria-label="Pagination"` — Screenreader können die Navigation nicht identifizieren
- [x] Profil-Suche auf 12 Ergebnisse limitiert ohne Pagination — pagination added for profiles
- [x] Sortierung fehlt: kein "Beliebteste" oder "Beste Bewertung" — sort dropdown with relevant options exists
- [x] `priceType`-Filter hat keine "Nur kostenpflichtig" Option — nur "Kostenlos" und Max-Preis
- [x] LP21FilterSidebar ist 1769 Zeilen — sollte in Sub-Komponenten aufgeteilt werden (ZyklusFilter, FachbereichFilter, PriceFilter, FormatFilter etc.) — now 202 lines, 15 sub-components in filters/ + hooks in hooks/
- [x] Filter-State wird bei jedem Wechsel komplett neu erstellt statt per Spread-Update — proper spread operator usage in `useFilterHandlers.ts` and `useMaterialSearch.ts`
- [x] Kein URL-Encoding bei Suchbegriff in der URL — searchParams handles encoding natively
- [x] `MaterialCard` bekommt keinen `rating`-Prop — averageRating + reviewCount props added with StarRating display
- [x] Kein Skeleton-Loading für Profile-Bereich — `ProfileGridSkeleton` imported and used
- [x] Mobile Filter Drawer hat keinen Focus-Trap — FocusTrap component wraps drawer content
- [x] Kein `<meta description>` oder SEO-Tags für `/materialien` (ähnlich wie Startseite)
- [x] Wenn beide Tabs aktiv (Materialien+Profile), wird die Gesamtzahl addiert — tabs are mutually exclusive now, count shows per-tab
- [x] Sort-Dropdown ist nur sichtbar wenn `showMaterials=true` — separate profile sort dropdown now visible
- [x] `EmptySearchState` zeigt Vorschläge zum Zurücksetzen — contextual suggestions per tab (profiles/materials/filtered)

---

## 3. Material-Vorschau (`/materialien/[id]`)

### Vorschau & Tags

- [x] Tags der hochgeladenen Dokumente überarbeiten — subject pills use LP21 colors via getSubjectPillClass(), cycle pills get distinct colored pills (green/sapphire/mauve for Zyklus 1/2/3) via getCyclePillClass(), metadata row split into tags row + stats row, i18n subjectFallback replaces hardcoded "Allgemein", related materials pass subjectPillClass for proper eyebrow coloring
- [x] Vorschau: Wasserzeichen statt Verschwimmen — PreviewOverlay with gradient + lock icon + CTA, server-watermarked images

### Bewertungen & Kommentare

- [x] Bewertung-Button an Style angleichen
- [x] "Material melden" Button grösser machen
- [x] Bewertung-Look überarbeiten
- [x] Profil des Bewertenden verlinken (klickbar zum Profil)
- [x] Kommentar-Bearbeiten Button/Dropdown überarbeiten
- [x] Bewertungen-Overview verkleinern/verbessern
- [x] Kommentare Daumen-hoch verbessern und ersichtlicher machen
- [x] Kommentar-Bearbeitung: Speicherung ohne Refresh anzeigen
- [x] Kommentare mit Bewertungen verschmelzen (ein Segment)
- [x] Verkäufer des Dokuments kann nicht bewerten (Logik einbauen)

### UI Verbesserungen — Detail-Seite (Session 2025-02-11)

- [x] Vorschaubild ist zu hoch (aspect-[3/4]) — max-h-[70vh] cap + object-contain added
- [x] Beschreibung wirkt dupliziert — removed brief description from sidebar, kept full section below
- [x] Kein "Zurück zu Ergebnissen"-Button — ArrowLeft + router.back() above breadcrumb, i18n added
- [x] Kauf-Box Rechtstext (AGB/Widerruf-Checkbox) ist zu dicht gepackt — bordered card with responsive text size
- [x] Leere Bewertungssektion nimmt zu viel Platz ein — compact inline message instead of large card

### Code Quality — Detail-Seite (Session 2025-02-11)

- [x] Detail-Seite ist 930+ Zeilen — PurchasePanel und ReportModal in eigene Komponenten extrahiert (~560 Zeilen)
- [x] `$queryRawUnsafe` in `/api/materials/[id]/route.ts` — SQL-Injection behoben mit `$queryRaw` tagged template literals

### Eigene Vorschläge (Material-Vorschau)

- [x] Hardcoded deutsche Strings: "Material nicht gefunden", "Fehler beim Laden", "Dieses Material wird noch überprüft", "Keine Vorschau verfügbar", "PDF", "Verifiziert", "Wird überprüft", "Folge ich", "+Folgen", "Anonym", "Ähnliche Materialien" — alle in i18n auslagern
- [x] Browser-native Dialoge (`confirm()`/`alert()`) bei Kommentar-Löschung durch i18n-fähige Modals ersetzen — replaced 11 instances across admin pages, sammlungen, and SellerCommentsSection with useToast() and ConfirmDialog
- [x] Report-Modal: Texte komplett hardcoded (Titel, Gründe, Placeholder, Buttons, Erfolgsmeldung) — benötigt eigenen i18n-Namespace
- [x] Report-Modal schliesst nach 2 Sekunden automatisch — zu schnell, Benutzer könnte verwirrt sein — increased to 4 seconds
- [x] Typ-Duplikation: Interfaces für Material, Comment, Review in mehreren Komponenten definiert — centralized in `lib/types/material.ts`, `comments.ts`, `review.ts`
- [x] PreviewGallery: Bilder mit raw `<img>` statt Next.js `<Image>` — replaced main preview, thumbnails, and blurred overlay with Next.js Image (fill + sizes), lightbox kept as img
- [x] Seller-Avatar mit raw `<img>` statt `<Image>` Component geladen — replaced with Next.js Image in PurchasePanel
- [x] Keine `aria-label` auf Download-, Wishlist-, Follow-, Report-Buttons — unzugänglich für Screenreader — added i18n-based aria-labels to all action buttons (follow, download, wishlist, share, report, close dialog, mobile sticky bar)
- [x] PreviewGallery Lightbox hat keinen Focus-Trap — wrapped with FocusTrap component, added role=dialog, aria-modal, aria-labels on all buttons
- [x] `window.location.href` für unauthentifizierte Redirects statt Next.js Router — replaced with router.push() in ReportModal, CheckoutButton, CommentsSection, and detail page
- [x] Kein Duplicate-Prevention beim Melden — server-side duplicate check (409) + client-side error handling with i18n message
- [x] Review-Labels ("Schlecht", "Mangelhaft", "Okay", "Gut", "Ausgezeichnet") sind hardcoded — nicht lokalisierbar — ReviewForm.tsx fully migrated to i18n with reviews.stars.\* keys
- [x] Keine Feedback wenn Download startet (`window.open()`) — kein Bestätigungs-Toast — added success toast + error toast on download
- [x] Kein Schema.org Markup (`Product`, `AggregateRating`, `BreadcrumbList`) — JSON-LD structured data in `/materialien/[id]/layout.tsx`
- [x] Redundante Datenfelder: `subject`/`subjects` und `cycle`/`cycles` — normalisiert: Bundle model fields renamed to `subjects`/`cycles` via Prisma @map (no DB migration), all API routes, Zod schemas, and frontend callers updated to use plural consistently
- [x] Kommentar-/Review-Like-Button State wird nach Vote nicht sofort aktualisiert — optimistic update implemented in MaterialLikeButton and CommentLikeButton
- [x] Magische Zahlen in PreviewGallery (50px Swipe-Threshold, 80px Thumbnail-Höhe) — extracted SWIPE_THRESHOLD_PX, THUMBNAIL_HEIGHT_PX, MAX_VISIBLE_THUMBNAILS, THUMBNAIL_GAP_PX constants

---

## 4. Hilfe (`/hilfe`)

- [x] FAQ-Tab-Farben angepasst
- [x] Doppelpfeile bei Schnelleinstieg entfernt
- [x] Schnelleinstieg-Text voll ausgeschrieben
- [x] Schnelleinstieg: noch zwei Pfeile bei "Wie lade ich Material hoch", "Was darf ich hochladen" und "Wo finde ich Unterrichtsmaterialien" — nur ein Pfeil und Link unten ins Kästchen, uniform machen
- [x] Häufige Fragen: Bild springt wenn man zwischen Tabs wechselt (Allgemein, Materialien kaufen, Materialien verkaufen, Technisches)

### Eigene Vorschläge (Hilfe)

- [x] Keine `generateMetadata()` Funktion — SEO-Metadaten, OpenGraph und Canonical URLs fehlen
- [x] Hardcodierte E-Mail `info@currico.ch` (Zeile 194) statt aus i18n — now uses `t("noResults.contactEmail")`
- [x] FAQ-Tabs haben kein `aria-selected` Attribut — Screenreader können aktiven Tab nicht identifizieren
- [x] Accordion-Buttons fehlt `aria-expanded` Attribut — Screenreader erkennen geöffneten Zustand nicht
- [x] Keine Suchfunktion für FAQ — search input above tabs filters across all categories by question+answer text, shows result count and category badges, uses existing i18n keys
- [x] Kategorie-State wird bei Tab-Wechsel / Navigation nicht gespeichert — active tab persisted to localStorage via `hilfe-faq-tab` key, restored on mount with validation
- [x] Keine `FAQPage` Schema.org-Daten — FAQPage + BreadcrumbList schema in `/hilfe/layout.tsx`

---

## 5. Urheberrecht (`/urheberrecht`)

- [x] Inhalt-Navigation als Sidebar links (sticky, scroll-spy, responsive)

### Eigene Vorschläge (Urheberrecht)

- [x] Duplizierte Icon + Sektions-Header-Struktur (12 Sektionen gleiches Pattern) — in wiederverwendbare Komponente extrahieren — extracted SectionHeader component with SECTION_CONFIG mapping and ICON_COLOR_CLASSES, used across 11 sections
- [x] Sticky-TOC Offset `top-24` ist hart kodiert — variiert je nach Header-Höhe, sollte dynamisch sein — replaced with CSS custom property `--header-offset: 6rem`, referenced via `top-[var(--header-offset)]` and `scroll-mt-[var(--header-offset)]`
- [x] Mobile TOC verschwindet ab `lg:hidden` (1024px) — auch Tablet-Nutzer verlieren Orientierung, Toggle-Button wäre besser — floating FAB button on mobile/tablet opens bottom-sheet TOC overlay with backdrop, auto-closes on link click
- [x] TOC-Links ohne `aria-current="page"` für aktiven Link — nur CSS-Styling, kein Screenreader-Hinweis — added `aria-current="true"` on active TOC link in shared renderTocLinks helper
- [x] Sektions-Icons (CheckCircle, XCircle etc.) haben kein `aria-hidden="true"` — werden als Inhalt für Screenreader gelesen — added `aria-hidden="true"` to all ~40 decorative icons across sections, lists, tips, and warnings
- [x] "Back to Top" Link hat nur `onClick` — sollte auch echtes `<a href="#top">` sein für Keyboard-Navigation — changed to `href="#top"` with `id="top"` on page wrapper, smooth scroll as progressive enhancement
- [x] Kein Anker-Navigation beim Seitenladen — wenn User mit `#aiContent` kommt, öffnet Seite oben statt am Anker — useEffect checks window.location.hash on mount and scrolls to element via requestAnimationFrame
- [x] Fehlende `BreadcrumbList` Schema.org-Daten — JSON-LD BreadcrumbList schema added in layout.tsx with locale-aware breadcrumb items

---

## 6. Impressum (`/impressum`)

- [x] GmbH nachtragen (Firmenform aktualisieren) — already reflected as "Angle Labs GmbH" in company name and "GmbH" in legal form
- [x] Version update (optional) — bumped to Version 1.3
- [x] Light mode Inselfarben gleich machen (Farbkonsistenz) — standardized text-text-secondary → text-text-muted
- [x] Kontakt Currico Link führt nach Mainpage (statt toter Link)

### Eigene Vorschläge (Impressum)

- [x] Keine `generateMetadata()` Funktion — Impressum ist wichtig für SEO/Trust
- [x] "Handelsname:" hardcoded statt i18n — now uses `t("company.tradeNameLabel")`
- [x] Person-Array `["p1", "p2", "p3"]` ist magisch — extracted to `AUTHORIZED_REPRESENTATIVES` constant
- [x] Icons (Building2, Mail, Globe, Scale, Users) haben kein `aria-hidden="true"` — werden als Inhalt gelesen
- [x] E-Mail-Links ohne `title`-Attribut — title attributes added to all legal page mailto links with i18n
- [x] `grid-cols-2` auf Mobile führt zu sehr schmalen Spalten — sollte `grid-cols-1 md:grid-cols-2` sein
- [x] Disclaimer-Sektionen nutzen `<div>` statt `<section>` mit `aria-labelledby` — replaced with `<section>` elements with `aria-labelledby` IDs, disclaimer sections rendered via `DISCLAIMER_SECTIONS` constant
- [x] Keine `Organization`/`LocalBusiness` Schema.org-Daten — enhanced to dual `["Organization", "LocalBusiness"]` type with `ContactPoint`, `founder` array, `areaServed`, and `addressRegion`
- [x] Links zu anderen Legal-Seiten fehlen — cross-links section added to Impressum (privacy, terms, cookies, copyright)

---

## 7. Cookie-Richtlinien (`/cookie-richtlinien`)

- [x] Inhalt überprüfen (stimmen die Angaben noch?) — corrected: actual cookies are `authjs.session-token` and `next-auth.csrf-token` (set by NextAuth), not the previously listed names. `consent`/`theme` are localStorage, not cookies. `locale` is URL-based, not a cookie. Analytics section now specifically mentions Sentry.

### Eigene Vorschläge (Cookie-Richtlinien)

- [x] Keine `generateMetadata()` Funktion — Cookie Policy ist wichtig für GDPR/Compliance SEO
- [x] Hardcoded Cookie-Namen `["consent", "session", "csrf", "locale"]` — extracted to `lib/constants/cookies.ts` with `APP_COOKIES` and `APP_LOCAL_STORAGE` arrays, single source of truth
- [x] Cookie-Listen nutzen `<div>` statt `<dl>`/`<dt>`/`<dd>` — replaced with semantic `<dl>`/`<dt>`/`<dd>` elements for all cookie and localStorage listings
- [x] Analytics-Cookie-Informationen zu vage — now specifically mentions Sentry for error detection and performance monitoring, clarifies no tracking cookies are set
- [x] Keine Table of Contents — TOC with `<nav>` + `<ol>` + anchor links to all 6 sections
- [x] Related-Links Section nutzt `<div>` statt `<nav>` — replaced with `<nav aria-label>` semantic element
- [x] Keine visuelle Unterscheidung zwischen Cookie-Typen — Essential uses green left-border + green tint (`border-success/30 bg-success/5`), Analytics uses blue (`border-primary/30 bg-primary/5`), localStorage uses neutral

---

## 8. Verkäufer-Stufen (`/verkaeufer-stufen`)

- [x] "So sammelst du Punkte" Raster einheitlich auf gleiche Höhe bringen — flex-col + mt-auto for equal card heights
- [x] Lock Tier Upgrade nur bei bestimmten Voraussetzungen (Anzahl Downloads/Uploads) — `getCurrentLevel()` checks `minUploads`/`minDownloads`; page shows lock/unlock states
- [x] Namen von Leveln überarbeiten — bronze/silber/gold/platin/diamant
- [x] Punkte/Level-Aufstieg-System überarbeiten — new thresholds, rating multipliers, verified bonus

### Eigene Vorschläge (Verkäufer-Stufen)

- [x] Hardcoded deutsche Strings ("1 Material", "5 Materialien", "25 Downloads", "1 Bewertung" etc.) — now use i18n plural forms
- [x] Hardcoded "Level" Text in Badge — now uses `t("page.levelBadge", { level })`
- [x] Layout-Metadata nutzt Canonical URL "seller-levels" statt "verkaeufer-stufen" — SEO-Fehler
- [x] `tipIcons` Array wird per Index gemappt — fragile Zuordnung, bricht wenn Array-Länge ändert — replaced with `TIP_CONFIG` record keyed by string
- [x] Keine visuelle Hierarchie zwischen aktuellem und angestrebtem Level — alle Level gleich dargestellt — current/unlocked/next/locked states with ring, opacity, lock icons
- [x] Breadcrumb zeigt nur Seitentitel ohne Home-Link — fehlende Hierarchie — `Breadcrumb` component has `showHome=true` by default
- [x] Keine Schema.org-Daten für Punkte-System — ItemList JSON-LD describing 5 levels added in layout.tsx

---

## 9. Verifizierter Verkäufer (`/verifizierter-verkaeufer`)

- [x] "Keine offenen Meldungen" Kriterium entfernen
- [x] Text-Blur beim Hover fixen (Text muss scharf und lesbar bleiben) — removed scale() from card hover, keeping translateY only

### Eigene Vorschläge (Verifizierter Verkäufer)

- [x] Keine `generateMetadata()` Funktion — SEO-Metadaten und Canonical URLs fehlen
- [x] Keine Validierung dass `VERIFIED_SELLER_CRITERIA` genau 5 Items hat passend zu `criteriaIcons` Array — unified into `CRITERIA_CONFIG` array mapping keys to icons, typed with `LucideIcon`
- [x] Benefits-Section nutzt inline SVG-Icons statt lucide-react wie andere Sektionen — all icons now from lucide-react via `BENEFITS` config (BadgeCheck, Shield, Eye, Award, Star)
- [x] Nur 3 Benefits gelistet — expanded to 5 benefits with distinct icons and i18n keys (credibility + recognition added)
- [x] "How it works" hat 3 kurze Absätze ohne visuelle Differenzierung oder Icons — replaced with `HOW_STEPS` config: numbered cards with icons (Zap, AlertTriangle, UserCog), title+description per step
- [x] Kein Vergleich mit nicht-verifizierten Verkäufern — comparison table with 6 feature rows, check/X marks, highlighted verified column with green tint
- [x] Metadata in Layout nutzt falschen Canonical-Pfad

---

## 10. Über uns (`/ueber-uns`)

- [x] Ganze Seite überarbeiten und persönlicher gestalten — full overhaul with 9 sections: Hero (with animations), Stats Bar (new), Origin Story (with pull-quote), Timeline/Journey (new vertical timeline with 6 milestones), Meet the Team (with MotionCard + funFact), Founders Quote (dedicated section with circular photos), Values (Swiss-specific: LP21, Swiss servers, peer-reviewed, fair pay), Help Us Grow (with stagger animations), Final CTA
- [ ] Bilder überarbeiten und einheitlicher machen — user will provide real photos

### Eigene Vorschläge (Über uns)

- [x] `Link` aus "next/link" importiert statt aus `@/i18n/navigation` — umgeht Locale-Handling, kann Mehrsprachigkeit brechen
- [x] Layout-Metadata nutzt Canonical "/about" statt "/ueber-uns" — SEO-Fehler
- [x] Hardcoded SVG-Icons für Values statt lucide-react — inkonsistentes Icon-System — now uses lucide-react icons via VALUES_CONFIG array (BookOpen, Shield, Users, Coins)
- [x] Persönliches Zitat (Kursiv-Serif) ohne klaren Kontext wer spricht — mehrdeutig — extracted to dedicated Quote section with context heading, circular founder photos, and clear attribution
- [x] Values-Section nutzt sehr generische Beschreibungen — nicht differenziert von anderen EdTech-Plattformen — rewritten with Swiss-specific values: LP21 im Kern, Schweizer Daten/Server, Von Kolleg:innen geprüft, Faire Vergütung
- [x] Kein CTA-Button am Seitenanfang — erst ganz unten nach viel Text — Hero section now has 2 CTA buttons (Materialien entdecken + Kostenlos registrieren)
- [ ] Kein Schema.org `Organization` Markup — fehlende strukturierte Daten — already exists in layout.tsx
- [x] Meta-Description zu generisch — sollte spezifischer für Schweizer Kontext sein — updated to "Lerne Simon und Laurent kennen — die zwei Schweizer hinter Currico..."
- [x] Keine Social-Media-Links oder Kontaktmöglichkeiten beim Team — Nutzer können Team nicht kontaktieren — email icons on both founder cards link to info@currico.ch
- [x] Kein Fallback wenn Team-Member-Bilder nicht laden — both founders have onError fallback to gradient + initials (SW/LZ)

---

## 11. Kontakt (`/kontakt`)

- [x] Grüner Kasten rechts löschen
- [x] E-Mail-Adresse "example" ändern zu "Max Muster"
- [x] "Schnelle Antworten gesucht" → Verlinkung nach Hilfe, Sektion ganz nach oben verschieben
- [x] "Worum geht es": Widerruf/Rückgabe von Gekauftem als Option hinzufügen

### Eigene Vorschläge (Kontakt)

- [x] E-Mail "info@currico.ch" hardcoded statt aus Config-Konstante — now uses i18n `t("direct.emailAddress")`
- [x] Kein Spam-Schutz (kein Honeypot, kein reCaptcha, kein Rate-Limiting sichtbar) — honeypot field added + API already has rate limiting via `checkRateLimit()`
- [x] Telefonnummer-Feld hat keine Formatvalidierung — Swiss phone pattern validation (`+41`/`0` prefix) with i18n error message
- [x] Formular-State nur Client-seitig (useState) — beforeunload warning when navigating away with unsaved form data
- [x] Erfolgs-Nachricht erklärt keine nächsten Schritte — success view now shows response time ("within 24h") via i18n key `form.successNextSteps`
- [x] Keine Referenznummer nach Absenden — API-returned ID now displayed in success view with `form.referenceLabel`
- [x] Fehlende `autocomplete`-Hints auf Formularfeldern (z.B. `autocomplete="email"`) — schlechte Accessibility
- [x] Keine Schema.org `ContactPoint` Markup — JSON-LD ContactPage + ContactPoint schema in layout.tsx
- [x] Antwortzeit "24-48 Stunden" ist statischer Text — now uses i18n key `form.successNextSteps`, configurable per locale

---

## 12. Anmelden (`/anmelden`)

- [x] Weiterleitung nach Login anpassen — role-based redirect with `isValidCallbackUrl()` in anmelden/page.tsx
- [x] "Vergessenes Passwort" Seite/Link erstellen (mit E-Mail-Reset) — forgot-password link fixed on login page
- [x] Google-Anmeldung → direkt zum Profil, nicht zurück zum Login (auth.ts redirect fallback → `/konto`)
- [x] Google-Anmeldung überarbeiten (Flow verbessern) — onboarding flow for new OAuth users via /willkommen
- [x] Erneute Google-Anmeldung → braucht Zwischenfenster von Google — prompt: "select_account" added
- [x] "Zurück zur Startseite" sichtbar machen ohne Scrollen — moved from footer to above login card
- [x] Security: Password Salt implementieren (Simon) — bcrypt with 12 rounds already includes salt
- [x] Login über Google Auth überarbeiten (Simon) — account picker + needsOnboarding flow + /willkommen page

### Eigene Vorschläge (Anmelden)

- [x] "Remember Me" Kontrollkästchen ist vorhanden, aber Auswahl wird nicht gespeichert — saves/restores email to localStorage, pre-fills on return
- [x] Nach fehlgeschlagenem Login werden E-Mail und Passwort geleert — already working correctly, fields are preserved after failed login
- [x] OAuth-Fehler haben keine spezifischen Fehlermeldungen — maps OAuthAccountNotLinked, AccessDenied, etc. to specific German messages
- [x] Keine sichtbare Brute-Force-Schutz-Anzeige (z.B. "Zu viele Versuche, bitte warten") — detects 429 status and shows "Zu viele Anmeldeversuche" message
- [x] Keine Capslock-Warnung beim Passwort-Feld — onKeyDown/onKeyUp CapsLock detection with inline warning
- [x] Passwort vergessen führt zu "/bald-verfuegbar" statt zu echter Reset-Funktionalität — link now points to /forgot-password

## 12b. Registrieren (`/registrieren`)

### Eigene Vorschläge (Registrieren)

- [x] Passwort-Anforderungen (8 Zeichen Minimum) werden nicht vor dem Absenden angezeigt — PasswordRequirements component shows live checklist (8 chars, uppercase, lowercase, number)
- [x] Keine Prüfung auf häufig verwendete Passwörter (z.B. "password123") — client-side common passwords list blocks submission + shows warning
- [x] Keine Passwort-Stärke-Anzeige — 3-bar strength meter (Schwach/Mittel/Stark) with color coding
- [x] AGB/Datenschutz-Links zeigen "/bald-verfuegbar" — already fixed, links point to /agb and /datenschutz (real pages)
- [x] Keine klare Indication nach Registrierung, dass E-Mail bestätigt werden muss — post-registration screen with mail icon, "check your inbox" message, resend button

---

## 13. Konto - Übersicht (`/konto`)

### Übersicht

- [x] "Profil vervollständigen" nicht in der Übersicht anzeigen — already only shown in settings page
- [x] "Neues Material" und "Material entdecken" Buttons löschen — not present in current code
- [x] Buttons in der Übersicht einheitlich machen — already consistent across overview
- [x] Uploads auch in Übersicht unter "Meine Uploads" anzeigen — "Meine Materialien" table already exists

### Navigation

- [x] Navigationsbar Farben und ausgewählte Tags überarbeiten — sidebar + layout polished with Catppuccin theme
- [x] Mitteilungen als Tab in der Profil-Navigationsbar haben — notifications tab in sidebar + mobile bar
- [x] Benachrichtigungen: richtige URL — /notification gibt 404 (moved page to `/konto/notifications/`)
- [ ] E-Mail-Benachrichtigungen: schönere Nachricht gestalten — **OUT OF SCOPE: email templates are backend/transactional, not frontend UI**
- [x] "Geld verdienen" als Titel für Stripe-Anmeldung ist zu offensiv — changed to "Verkäufer werden" via i18n

### Profil vervollständigen

- [x] "Profil vervollständigen" überarbeiten und sicherstellen dass es funktioniert + Buttons — `ProfileCompletionProgress.tsx` with progress bar, checklist, and completion tracking

### Eigene Vorschläge (Konto-Übersicht)

- [ ] Profile-Completion-Banner nutzt localStorage mit Prozentwert-Key — könnte bei mehrfachem Speichern zu verwirrenden Zuständen führen
- [x] "Pending" Status wird als "Ausstehend" hardcoded — sollte i18n nutzen
- [x] Keine Filterung nach Material-Status auf der Overview — status filter pills (All/Pending/Verified/Rejected) with counts added to overview
- [ ] Recent Downloads zeigt max 6 Items ohne Pagination — bei mehr werden diese nicht angezeigt
- [x] Download-Funktion öffnet neues Fenster ohne Error-Handling für fehlgeschlagene Downloads — animated error toast with retry option
- [x] Seller-Materials-Tabelle hat keine Sortier-Funktionalität — sort dropdown (newest/downloads/earnings) with ArrowUpDown icon

### Eigene Vorschläge (Konto-Layout)

- [x] Mobile Tab Bar scrollt aktiven Tab nicht immer in die Mitte — replaced scrollIntoView with manual scrollTo centering calculation
- [ ] Keine Bestätigung beim Navigieren weg von ungespeicherten Änderungen in Settings
- [x] Keine Skeleton-Animationen für die Quick-Stats Desktop-Ansicht — skeleton pulse loaders matching KPI card shape
- [ ] Fallback `displayData` nutzt potenziell veraltete Session-Daten beim Seitenwechsel

---

## 14. Konto - Einstellungen (`/konto/settings`)

### Profil-Einstellungen

- [x] Überschneidungen von Text und Emblem fixen
- [x] Speichern von Änderungen verschönern (besseres Feedback)
- [x] Fächer im Profil schöner darstellen (LP21-Farben verwenden)
- [x] Kanton aus Kontakt-Sektion rausnehmen, im Profil nach oben verschieben
- [x] "Bevorzugte Sprache" entfernen im Profil
- [x] Profil-Namenlänge auf 32 Zeichen limitieren

### Einstellungen entfernen

- [x] "Darstellung" raus aus Einstellungen — section never existed in code
- [x] "Konto Datenexport" entfernen — section never existed in code
- [x] "Konto löschen" überarbeiten — proper confirmation dialog with "LÖSCHEN" typed input

### Profilbild

- [x] Profilbild hochladen/löschen Funktion überarbeiten — AvatarUploader works correctly with upload + delete
- [x] Nur JPG, PNG, WebP erlauben + Grössenlimite einrichten — 2MB limit, image/\* validation enforced

### E-Mail

- [x] "Wichtig" aus der E-Mail-Verifizierung rausnehmen — banner title is "E-Mail-Adresse bestätigen" (no "Wichtig")

### Eigene Vorschläge (Einstellungen)

- [x] Bio-Feld `maxLength={500}` — Zeichenzähler ist sofort sichtbar: `{bio.length}/500`
- [x] Passwort ändern Funktion fehlt komplett — POST /api/auth/change-password with bcrypt verify, rate limiting, strength validation; form in account settings with show/hide toggles, autocomplete hints, error code→i18n mapping, OAuth-only fallback message
- [x] "E-Mail ändern → kontaktieren Sie uns" ohne Link/Button zu Support — rich text with Link to /kontakt added
- [x] Instagram/Pinterest-Felder: keine Validierung der Benutzernamen — regex validation (alphanumeric, dots, underscores) with error display
- [x] Profil-Visibility-Toggle hat keine Bestätigung vor Änderung zu Private — confirmation dialog with warning when switching to private
- [ ] Floating Save Bar könnte Position bei kleinen Screens falsch berechnen
- [ ] Keine Vorschau-Funktion für öffentliches Profil vor dem Speichern
- [x] "Datenexport"-Button hat keine Funktionalität implementiert — button does not exist in the UI, non-issue
- [x] "Konto löschen"-Button hat keine Funktionalität — full confirmation flow with typed "LÖSCHEN" input implemented
- [x] Keine Warnung, dass Konto-Löschung permanent ist und Materialien/Käufe betroffen — consequences list with X icons (materials, purchases, reviews, earnings, followers)
- [ ] Keine Zwei-Faktor-Authentifizierung (2FA) Option
- [x] Benachrichtigungs-Prefs zeigen nur Erfolg/Fehler als kurze Toast — descriptive feedback shows which notification was toggled with animated pill
- [x] Keine Unterteilung in "E-Mail" vs. "In-App" Benachrichtigungen — info banner explains toggles control email only, E-Mail badge on each toggle, in-app always active
- [x] Keine Batch-Option "Alle Benachrichtigungen deaktivieren" — batch toggle with Bell/BellOff icons at top of notifications page

---

## 15. Konto - Wunschliste (`/konto/wishlist`)

- [x] "Materialien entdecken" Button oben rechts hinzufügen — header has "Mehr entdecken" link
- [x] Suchfunktion einbauen — client-side search already exists

### Eigene Vorschläge (Wunschliste)

- [x] Wenn Item entfernt wird, werden Stats nicht aktualisiert — stats recalculated on item removal
- [x] Keine Benachrichtigung wenn Artikel auf Wunschliste Preisänderung hat — `notify_wishlist_price_drops` preference implemented
- [x] Keine Sortier- oder Filteroptionen — search + sort (newest, oldest, alphabetical) implemented
- [ ] Herz-Icon für Wunschliste könnte konsistenter mit anderen Seiten sein

---

## 16. Konto - Bibliothek (`/konto/library`)

- [x] Suchfunktion einbauen — server-side search with 300ms debounce

### Eigene Vorschläge (Bibliothek)

- [x] Statistik-Karten verwenden hardcoded deutsche Texte ("Gesamt in Bibliothek", "Gratis erhalten", "Gekauft") — already using i18n t("stats.total/free/purchased")
- [x] Suchfunktion: wenn Suchfeld geleert wird, wird nicht neu geladen — debounced fetch on searchQuery change
- [x] Keine Filteroptionen für Material-Typ (kostenlos vs. kostenpflichtig) — filter pills (All/Free/Purchased) with counts
- [x] Badge-Text "Verifiziert" ist hardcoded statt i18n — already using t("badgeVerified")
- [x] Keine Sortieroptionen (nach Datum, Preis, Bewertung etc.) — sort by newest, oldest, alphabetical implemented
- [ ] Keine Bulk-Actions (z.B. mehrere auswählen und zu Sammlung hinzufügen)

---

## 17. Konto - Uploads (`/konto/uploads`)

- [x] Suchfunktion einbauen — search with debounce exists
- [ ] "Meine Materialien bearbeiten" führt zu Error 404 → **KNOWN ISSUE: full material editing page is a larger feature, out of scope for UI polish**
- [x] "Link zur Vorschau" Button bei Meine Materialien löschen — no separate preview button exists; card links directly to material
- [x] Meine Materialien sortieren möglich machen — sort dropdown exists (newest, oldest, alphabetical, popular)
- [x] Dokumente in Überprüfung in Uploads anzeigen — status pills (ALL/PENDING/VERIFIED/REJECTED) in uploads page

### Eigene Vorschläge (Uploads)

- [x] Suchfeld wird nur angezeigt wenn `uploadedItems.length > 0` — already fixed, search field is unconditional, added aria-label
- [x] Badge-Texte ("Verifiziert", "Ausstehend") sind hardcoded statt i18n — already using t("statusVerified")/t("statusPending")
- [x] Placeholder-Text "Uploads durchsuchen..." ist hardcoded (nicht i18n) — already using t("search")
- [ ] Keine Anzeige von Upload-Fortschritt für Materials im Draft-Status
- [ ] Keine Möglichkeit, Material zu duplizieren

---

## 18. Folge ich (`/folge-ich`)

- [x] "Gefolgte Profile" Wording überarbeiten — proper i18n key `following.followedProfiles` with correct wording
- [x] Bei Klick auf Profil → zur Profilansicht wechseln — links to `/profil/${id}` (correct German path)
- [x] Man kann sich nicht selber folgen (Logik einbauen) — already handled server-side: `CANNOT_FOLLOW_SELF` check in POST `/api/user/following`

### Eigene Vorschläge (Folge ich)

- [x] `getSubjectPillClass` ist dupliziert (erscheint in 3+ Dateien) — konsolidiert in `lib/constants/subject-colors.ts`
- [x] Link href zu `/profile/{id}` statt `/profil/{id}` — URL-Inkonsistenz (alter englischer Pfad) — fixed in folge-ich & sammlungen
- [x] Unfollow-Button zeigt Hover-State mit Error-Farben (`hover:border-error`) — changed to hover:border-primary hover:text-primary
- [x] "Discover profiles" Button im Empty-State verlinkt auf `/materialien?showCreators=true` — now links to profiles tab
- [x] "Followed since" Datumsformat nutzt `toLocaleDateString` aber matcht nicht Rest der App — fixed en-CH → en-US for consistency
- [x] Alle gefolgten Seller werden auf einmal geladen — paginated API (`page`/`limit` params, `total`/`hasMore` response) with "Load more" button, 20 per page
- [x] Keine Metadata für `/folge-ich` Route — layout.tsx with generateMetadata added
- [x] API-Response-Struktur wird nicht validiert — `isValidFollowingResponse()` type guard validates shape before setting state, graceful fallback on invalid data

---

## 19. Hochladen (`/hochladen`)

### Formular-Validierung

- [x] Titel-Limite auf 64 Zeichen — maxLength={64} on input + validation in UploadWizardContext
- [x] Fächer-Abkürzungen mindestens 2 Buchstaben — enforced by design: subjects selected from LP21 data, not free-text
- [x] Vorschaubild auf 5 MB limitieren — 5*1024*1024 check in hochladen/page.tsx
- [x] Nur eine Datei aufs Mal hochladen — no `multiple` attribute on file input
- [x] Wenn zwei verschiedene Material-Typen hochgeladen → nicht erlauben (nur ein Typ) — enforced by design: single dropdown for resourceType, single file input

### Kompetenzen

- [x] Kompetenz-Auswahl im gleichen Style und Layout wie Zyklus/Fach — EnhancedCurriculumSelector uses consistent card-based pattern (rounded-xl, border-2, same active state) for cycles, subjects, and competencies
- [x] Maximal 5 Kompetenzen auswählen — MAX_COMPETENCIES = 5 in EnhancedCurriculumSelector

### Preise

- [x] Mindestpreis 0.50 CHF — validation in UploadWizardContext
- [x] Kosten nur in 0.50-Schritten erlauben — step="0.50" + Math.round validation

### Fehlermeldungen

- [x] "Profil vervollständigen" Fehlermeldung → Link zum Profil — structured error parsing (PROFILE_INCOMPLETE, STRIPE_REQUIRED) with i18n error messages and links to settings/become-seller pages
- [x] Alle Fehlermeldungen mit Link zum Problem + Rechtschreibung prüfen — error toast shows actionable link buttons for profile/email/Stripe errors

### Nach dem Upload

- ~~Mehrere Dokumente vom gleichen Typ uploaden möglich machen~~ — **DROPPED: feature not needed**
- [x] "Zurück zum Profil" Link richtig verlinken — auto-redirect removed, "Back to uploads" button added
- [x] Tag von Material-Typ angleichen — shared `getFileFormat` utility extracted to `lib/utils/file-format.ts`, MaterialTypeBadge now shown on DashboardMaterialCard (uploads page) and seller dashboard overview (konto page), detail API refactored to use shared utility
- [x] Vor Veröffentlichung: Übersicht wie es auf der Materialseite aussehen wird — PublishPreviewModal shows card preview + data summary before publishing
- [x] "Verifizierte Dokumente" umbenennen zu "Geprüft" — renamed 12 document-status i18n keys from "Verifiziert"/"Verified" to "Geprüft"/"Reviewed" in both de.json and en.json

### Verkäufer-Dashboard

- [x] Downloads überarbeiten (funktioniert noch nicht) — seller dashboard API now returns `totalPurchases` and per-material `purchases` count; KPI cards expanded to 4 (earnings, downloads, purchases, contributions); materials table gains purchases column; `SellerStats` type updated with `totalPurchases`; i18n keys added for de/en
- [x] Einnahmen total anzeigen (nicht monatlich) — i18n key `accountPage.overview.thisMonth` already reads "Gesamt", API returns lifetime total

### Eigene Vorschläge (Hochladen)

- [x] ~30 hardcoded German strings in upload wizard replaced with i18n — step titles, subtitles, form labels, legal checkboxes, navigation buttons, file upload text, preview text, error messages all now use tWizard/tSteps/tFields/tLegal/tNav translation functions; StepNavigationBar also migrated (17 hardcoded strings → i18n keys for step labels, descriptions, progress indicator, validation messages, and aria-labels)
- [x] Eszett (ß) Warnung nur in Step 1, aber User kann in Step 3 auch Text eingeben — both title and description (the only free-text fields) are checked
- [x] Draft-System speichert Felder aber keine Dateien — IndexedDB storage for File objects via draft-file-storage.ts, auto-save with 1s debounce, restored on mount with toast notification
- [x] Keine Anzeige von verbleibender Datei-Grösse/Speicher-Limit — shows X.XX MB / 50 MB with color-coded progress bar
- [x] "Automatische Vorschau" Info nur für PDF erwähnt — format-specific messages for PDF, images, and other document types
- [x] Keine Duplikat-Erkennung — exact match (yellow warning) + fuzzy pg_trgm word_similarity match (blue info) via /api/materials/check-title
- [x] "Lehrplan-Zuordnung" Selektor ist sehr gross — unified search with hint text added below search bar
- [x] Keine Warnung beim Tab-Schliessen mit ungespeicherten Änderungen — beforeunload handler added when form has data, skipped after successful upload
- [x] Validierung von Dateinamen wird nicht durchgeführt — `validateFileName()` with dangerous char checks, 100 char max, path traversal prevention
- [x] Preview-Bild: keine Vorschau der finalen Galerie-Ansicht — PublishPreviewModal shows MaterialCard-like preview with image, title, subject pill, cycle, and price
- [x] Bundle: Subject und Cycle sind fixiert auf Bundle-Level — made optional in API schemas and form, shows "auto-derived from materials" hint
- [x] Bundle: Discount-Berechnung zeigt nur Prozentsatz — calculateSavingsChf() + formatPrice() displays savings in CHF
- [x] Bundle: Keine Validierung dass Bundle-Preis unter Summe der Einzelpreise liegt — blocks if `calculateDiscount() <= 0`
- [x] Bundle: Materials-Liste hat keine Pagination — show first 5 materials with "Show all X materials" expand/collapse toggle

---

## 20. Öffentliches Profil (`/profil/[id]`)

- [x] Profilseite komplett überarbeiten und funktionierend machen — SSR metadata layout with OG/Twitter/JSON-LD, seller level badge, teacher badge, school, experience, website, improved private profile (shows material count + partial notice), id validation

### Eigene Vorschläge (Öffentliches Profil)

- [x] Hardcoded deutsche Strings: "Profil nicht gefunden", "Das gesuchte Profil existiert nicht", "Benutzer", "Materialien durchsuchen", "Profil wird geladen..." — alles in i18n auslagern
- [x] `getSubjectPillClass` lokal definiert statt aus Shared Utility — jetzt aus `lib/constants/subject-colors.ts` importiert
- [x] `formatPrice` ist lokal definiert statt aus Shared Utility — now imports from `lib/utils/price.ts`
- [x] Keine Validierung dass `params.id` ein gültiger UUID/Slug ist vor dem Fetchen — isValidId() check in page.tsx + API route, skips fetch for invalid ids
- [ ] 4 parallele API-Calls bei Seitenaufruf — könnten zu einem einzelnen Endpoint gebündelt werden
- [x] Keine SSR/Static Generation — alle Daten Client-seitig gefetcht, schlecht für SEO — SSR layout.tsx with generateMetadata() + JSON-LD (Person + BreadcrumbList)
- [x] Keine OpenGraph Meta-Tags für Profil-Sharing in sozialen Medien — OG type:profile, Twitter summary card, canonical + language alternates
- [x] Follow-Button zeigt "Gefolgt" erst nach erfolgreicher Action — optimistic update with immediate `setProfile()` state change
- [x] Private-Profile-Notice versteckt zu viel — Verkäufer wollen evtl. kein privates Profil — new noticePartial text, materials stat shown, seller level badge visible
- [ ] Kein Caching von Profil-Daten — jeder Besuch fetcht frische Daten
- [x] "Beste Uploads" Titel ist hardcoded Deutsch — already uses t("bestUploads")

---

## 21. Verkäufer werden (`/verkaeufer-werden`)

- [x] Stripe Konto einrichten Button + Bestätigungsbutton überarbeiten — buttons polished with ArrowRight icons, larger padding, better visual hierarchy for Stripe CTA

### Eigene Vorschläge (Verkäufer werden)

- [x] Hardcoded deutsche Strings in gesamter Komponente — nicht lokalisierbar — page already uses useTranslations("becomeSeller") throughout, all strings from i18n
- [x] Inline SVG-Icons statt lucide-react — inkonsistent mit Rest der App — replaced all ~15 inline SVGs with lucide-react (Check, AlertTriangle, Coins, Users, RefreshCw, ExternalLink, ArrowRight, Info)
- [x] Seller-Terms-Inhalt direkt in Komponente eingebettet — terms content uses i18n via tTerms("sellerTerms"), copyright callout integrated into terms card header
- [x] Terms-Section hat nur 500px max-height mit `overflow-y-auto` — beengtes Leseerlebnis — increased to max-h-[70vh] for better reading experience
- [x] Requirements-Section zeigt 3 Anforderungen ohne Anzeige welche der User schon erfüllt hat (z.B. grüner Haken für erledigt) — dynamic checklist with green circle+check when completed, gray empty circle when pending
- [x] Kein Fortschrittsanzeiger für den 4-Schritte-Prozess — `OnboardingStepper` component with 4-step progress tracker
- [x] E-Mail-Verifizierungs-Fehler hat keinen direkten Link zu Einstellungen — link changed from /konto to /konto/settings/profile
- [x] Stripe Redirect nutzt `window.location.href` statt Next.js Navigation — correct, Stripe is an external URL, Next.js router can't navigate there
- [x] CTA-Buttons erklären nicht per Tooltip warum sie disabled sind — title attributes with i18n tooltips for login/email/terms disabled states
- [x] Copyright-Section fühlt sich vom Hauptflow abgekoppelt an — moved copyright callout into terms card header as subtle badge link

---

## 22. Stripe Konto (Seller Onboarding)

- [x] Einstellungen verbessern — replaced all inline SVGs with lucide-react, added breadcrumb, back-to-account link, arrow icons on buttons
- [x] Weniger Angaben bei der Einrichtung — `lib/stripe.ts:102` already uses `future_requirements: "omit"`
- [x] Rückkehr von Stripe zu Currico → Buttons überarbeiten und funktionierend machen — polished buttons with ArrowRight/ExternalLink icons, added "Zurück zur Kontoübersicht" secondary link

---

## 23. Benachrichtigungen

- [x] Autoren-Benachrichtigungen einrichten — added notifyMaterialApproved, notifyMaterialRejected, notifyManualVerification, checkDownloadMilestone; wired into admin materials PATCH, verify-seller POST, download routes, and payment webhook
- [ ] Newsletter-System
- [x] Gesamtes Benachrichtigungssystem überarbeiten — bell dropdown on desktop with latest 5 notifications, mark-all-read, shared notification display utils; settings page shows email clarification banner, E-Mail badge on toggles, toast feedback; admin rejection reason dialog with author notification

---

## 24. Global / Alle Seiten

- [x] Cursor pointer auf alle klickbaren Elemente
- [x] Alle Dropdowns abgerundet (rounded-full)
- [x] Alle URL-Pfade auf Deutsch
- [x] ScrollToTop-Button auf allen Seiten
- [x] Keine ß in Content-Text
- [x] Fehlermeldungen lokalisiert
- [x] Kantone vervollständigt (26 Kantone)
- [x] Hintergrundfarben einheitlich
- [x] Kaufstornierung/Widerrufsrecht in AGB dokumentiert
- [ ] Info bei Fehlermeldungen auf Deutsch bzw. der Sprache angepasst (restliche prüfen)
- check the badges, verifiziert is only who is a verifizierter verkäufer, that has to be unique. documents are all verified. so it doesn`t realy say something so we take that verified out. then display the level of the creator in his profile and also when he uploads something

### Eigene Vorschläge (Global)

- [x] `getSubjectPillClass()` ist in 3+ Dateien dupliziert — in gemeinsame Utility-Funktion `lib/constants/subject-colors.ts` auslagern
- [x] Viele Canonical-URLs in Metadata nutzen noch englische Pfade ("/about", "/seller-levels") statt deutsche ("/ueber-uns", "/verkaeufer-stufen") — SEO-Fehler
- [ ] Inkonsistente Loading-States: manche Seiten nutzen Spinner, andere Skeleton, andere Pulse — vereinheitlichen
- [ ] Inkonsistente Button-Styles (ghost, outline, solid) nicht überall einheitlich verwendet
- [ ] Card-Layouts nutzen teils `rounded-xl`, teils `rounded-lg` — inkonsistent
- [x] Viele Seiten haben keine `generateMetadata()` Funktion — fehlende SEO-Metadaten (hilfe, impressum, cookie-richtlinien, verifizierter-verkaeufer)
- [ ] Keine CSRF-Token-Validierung sichtbar bei POST-Requests
- [ ] localStorage wird für sensitive Daten genutzt (Drafts, Preferences) — könnte XSS-anfällig sein
- [x] `Link` aus "next/link" statt aus `@/i18n/navigation` auf einigen Seiten — umgeht Locale-Handling
- [x] Dekorative Icons (lucide-react) haben oft kein `aria-hidden="true"` — werden von Screenreadern vorgelesen (Impressum, TrustBar, SellerHeroSection)
- [ ] Viele `<div>`-Container sollten semantische Elemente sein (`<section>`, `<nav>`, `<article>`) für bessere Accessibility
- [ ] Keine Schema.org-Daten auf den meisten Seiten — fehlende Rich Snippets
- [ ] API-Fehler werden oft als generische "Ein Fehler ist aufgetreten" angezeigt — keine spezifischen Hilfe für 401/403/404/500

---

## Final Touch — Consistency, Hierarchy & Motion Audit

**Task:** Perform a comprehensive Consistency, Hierarchy, and Motion Audit of the website design. The goal is to ensure the entire site follows a strict "Design System" logic and feels like a premium, cohesive product.

### Design Context & Standards

- **The Vibe:** Sleek SaaS / Modern Ed-Tech Platform
- **Typography:** System font stack (H1: distinct sizing, Body: readable) — Ensure hierarchy is distinct and readable
- **Button & UI Rules:** Catppuccin theme tokens, `rounded-xl`/`rounded-full` border radii, solid primary color, ghost secondary buttons
- **Layout Logic:** Responsive grid, specific padding/margins between sections, Tailwind semantic classes (`text-text`, `bg-surface`, `border-border`)
- **Animation Style:** Subtle fades, hover scale-ups, AnimatePresence transitions — minimal and cohesive

### Audit Criteria

1. **Uniform Hierarchy:** Does the visual weight (size/boldness) of elements guide the eye correctly on every page?
2. **Structural Consistency:** Are section heights, container widths, and "white space" uniform across the entire site?
3. **Motion Cohesion:** Are the animations (hovers, page transitions, load-ins) following the same easing and duration? Nothing should feel "jittery" or out of place.
4. **UI Integrity:** Are buttons, icons, and form fields identical in behavior and appearance everywhere?

### Required Deliverables

- [ ] **Consistency Audit:** A list of any "breaks" in the rules (e.g., "Page B has a different header margin than Page A")
- [ ] **Motion Report:** Evaluate if the animations feel "uniform." If one page uses a bounce and another a linear fade, flag it
- [ ] **Ideas for Improvement:** Beyond just fixing errors, give 3-5 creative ideas to elevate the design. Focus on "Micro-interactions" or layout tweaks that would make the site feel more "World Class"
- [ ] **UX Polish Score:** A rating from 1-10 on the professional "Modern-ness" of the current setup

---

## Zusammenfassung

| Seite                     | Erledigt | Offen (Joel) | Offen (Eigene) | Total Offen |
| ------------------------- | -------- | ------------ | -------------- | ----------- |
| Startseite                | 16       | 0            | 0              | 0           |
| Materialien               | 53       | 0            | 0              | 0           |
| Material-Vorschau         | 37       | 0            | 0              | 0           |
| Hilfe                     | 12       | 0            | 0              | 0           |
| Urheberrecht              | 9        | 0            | 0              | 0           |
| Impressum                 | 13       | 0            | 0              | 0           |
| Cookie-Richtlinien        | 8        | 0            | 0              | 0           |
| Verkäufer-Stufen          | 11       | 0            | 0              | 0           |
| Verifizierter Verkäufer   | 9        | 0            | 0              | 0           |
| Über uns                  | 10       | 1            | 1              | 2           |
| Kontakt                   | 13       | 0            | 0              | 0           |
| Anmelden                  | 9        | 0            | 5              | 5           |
| Registrieren              | 0        | 0            | 5              | 5           |
| Konto (alle Unterseiten)  | 52       | 1            | 16             | 17          |
| Folge ich                 | 9        | 0            | 0              | 0           |
| Hochladen                 | 31       | 0            | 0              | 0           |
| Öffentliches Profil       | 5        | 1            | 6              | 7           |
| Verkäufer werden / Stripe | 14       | 0            | 0              | 0           |
| Benachrichtigungen        | 2        | 1            | 0              | 1           |
| Global                    | 14       | 2            | 8              | 10          |
| Final Touch Audit         | 0        | 4            | 0              | 4           |
| **Total**                 | **321**  | **10**       | **51**         | **61**      |
