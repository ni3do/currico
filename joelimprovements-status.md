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
- [ ] SwissBrandSection und ValueProposition haben fast identisches Layout — könnten zu einer generischen Sektion vereinheitlicht werden
- [ ] TrustBar Items sind nicht verlinkt — z.B. "Schweizer Hosting" könnte auf Über-uns oder Datenschutz verlinken
- [ ] Kein `<meta description>` oder OpenGraph Tags spezifisch für die Startseite (SEO)
- [ ] Featured Materials zeigen keinen Rating/Bewertung — hilft Nutzern bei der Entscheidung

---

## 2. Materialien (`/materialien`)

### Suche & Darstellung

- [x] Entweder Profil ODER Materialien darstellen (nicht beides gemischt)
- [x] Ersteller als Default ausschalten, "Ersteller" zu "Profil" ändern
- [x] Suchleiste bei Profilen: "nach Lehrpersonen" → "nach Profilen suchen"
- [x] Per Default nur Materialien ausgewählt (nicht Profile)
- [x] Text in Suchleiste verbessern wenn Materialien ausgewählt
- [ ] Fuzzy-Match Suche für Materialien
- [x] Upload-Button auf der Materialien-Seite hinzufügen

### Filter

- [x] Aktive Filter Aufpoppen verbessern
- [ ] Ersteller + Zyklus/Fachbereich: auch Ersteller anzeigen die das anbieten
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

- [ ] Seite ist 1173 Zeilen lang — Filter-Chips, Pagination und Grid-Rendering sollten in eigene Komponenten extrahiert werden
- [x] `getSubjectPillClass()` ist dupliziert zwischen `page.tsx` (Startseite) und `materialien/page.tsx` — in eine gemeinsame Utility-Funktion auslagern
- [x] Hardcoded deutsche Strings in Filter-Chips: "Kostenlos", "Einzelmaterial", "Bundle", "Alle entfernen", "Zyklus" — müssen über i18n (`t()`) laufen
- [x] Mobile-Filter-Drawer "anzeigen" Button: `{totalCount} {t("results.countLabel")} anzeigen` — uses i18n `t("results.showResults")`
- [x] Kein `aria-label` auf den Pagination Prev/Next Buttons — nur SVG-Icons ohne Text, unzugänglich für Screenreader
- [x] Pagination `<nav>` hat kein `aria-label="Pagination"` — Screenreader können die Navigation nicht identifizieren
- [x] Profil-Suche auf 12 Ergebnisse limitiert ohne Pagination — pagination added for profiles
- [x] Sortierung fehlt: kein "Beliebteste" oder "Beste Bewertung" — sort dropdown with relevant options exists
- [x] `priceType`-Filter hat keine "Nur kostenpflichtig" Option — nur "Kostenlos" und Max-Preis
- [ ] LP21FilterSidebar ist 1769 Zeilen — sollte in Sub-Komponenten aufgeteilt werden (ZyklusFilter, FachbereichFilter, PriceFilter, FormatFilter etc.)
- [ ] Filter-State wird bei jedem Wechsel komplett neu erstellt statt per Spread-Update — könnte zu unnötigen Re-Renders führen
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

- [ ] Tags der hochgeladenen Dokumente überarbeiten
- [ ] Vorschau: Wasserzeichen statt Verschwimmen

### Bewertungen & Kommentare

- [ ] Bewertung-Button an Style angleichen
- [ ] "Material melden" Button grösser machen
- [ ] Bewertung-Look überarbeiten
- [ ] Profil des Bewertenden verlinken (klickbar zum Profil)
- [ ] Kommentar-Bearbeiten Button/Dropdown überarbeiten
- [ ] Bewertungen-Overview verkleinern/verbessern
- [ ] Kommentare Daumen-hoch verbessern und ersichtlicher machen
- [ ] Kommentar-Bearbeitung: Speicherung ohne Refresh anzeigen
- [ ] Kommentare mit Bewertungen verschmelzen (ein Segment)
- [ ] Verkäufer des Dokuments kann nicht bewerten (Logik einbauen)

### UI Verbesserungen — Detail-Seite (Session 2025-02-11)

- [x] Vorschaubild ist zu hoch (aspect-[3/4]) — max-h-[70vh] cap + object-contain added
- [x] Beschreibung wirkt dupliziert — removed brief description from sidebar, kept full section below
- [x] Kein "Zurück zu Ergebnissen"-Button — ArrowLeft + router.back() above breadcrumb, i18n added
- [x] Kauf-Box Rechtstext (AGB/Widerruf-Checkbox) ist zu dicht gepackt — bordered card with responsive text size
- [x] Leere Bewertungssektion nimmt zu viel Platz ein — compact inline message instead of large card

### Code Quality — Detail-Seite (Session 2025-02-11)

- [ ] Detail-Seite ist 930+ Zeilen — PurchaseBox, SellerCard, FeedbackSection, ReportModal in eigene Komponenten extrahieren
- [ ] `$queryRawUnsafe` in `/api/materials/[id]/route.ts` — SQL-Injection-Risiko bei Related-Materials-Queries, parameterisierte Queries nutzen

### Eigene Vorschläge (Material-Vorschau)

- [x] Hardcoded deutsche Strings: "Material nicht gefunden", "Fehler beim Laden", "Dieses Material wird noch überprüft", "Keine Vorschau verfügbar", "PDF", "Verifiziert", "Wird überprüft", "Folge ich", "+Folgen", "Anonym", "Ähnliche Materialien" — alle in i18n auslagern
- [x] Browser-native Dialoge (`confirm()`/`alert()`) bei Kommentar-Löschung durch i18n-fähige Modals ersetzen — replaced 11 instances across admin pages, sammlungen, and SellerCommentsSection with useToast() and ConfirmDialog
- [x] Report-Modal: Texte komplett hardcoded (Titel, Gründe, Placeholder, Buttons, Erfolgsmeldung) — benötigt eigenen i18n-Namespace
- [ ] Report-Modal schliesst nach 2 Sekunden automatisch — zu schnell, Benutzer könnte verwirrt sein
- [ ] Typ-Duplikation: Interfaces für Material, Comment, Review in mehreren Komponenten definiert — in gemeinsame `lib/types/` auslagern
- [ ] PreviewGallery: Bilder mit raw `<img>` statt Next.js `<Image>` — kein Lazy Loading, keine responsive Sizes, kein Blur-Placeholder
- [ ] Seller-Avatar mit raw `<img>` statt `<Image>` Component geladen
- [ ] Keine `aria-label` auf Download-, Wishlist-, Follow-, Report-Buttons — unzugänglich für Screenreader
- [ ] PreviewGallery Lightbox hat keinen Focus-Trap — Tab-Navigation kann hinter die Lightbox gelangen
- [ ] `window.location.href` für unauthentifizierte Redirects statt Next.js Router — inkonsistent und nicht SEO-freundlich
- [ ] Kein Duplicate-Prevention beim Melden — Benutzer können Material mehrfach hintereinander melden
- [ ] Review-Labels ("Schlecht", "Mangelhaft", "Okay", "Gut", "Ausgezeichnet") sind hardcoded — nicht lokalisierbar
- [ ] Keine Feedback wenn Download startet (`window.open()`) — kein Bestätigungs-Toast
- [ ] Kein Schema.org Markup (`Product`, `AggregateRating`, `BreadcrumbList`) — fehlende Rich Snippets in Suchmaschinen
- [ ] Redundante Datenfelder: `subject`/`subjects` und `cycle`/`cycles` — sollte normalisiert werden
- [ ] Kommentar-/Review-Like-Button State wird nach Vote nicht sofort aktualisiert — fehlendes Optimistic Update
- [ ] Magische Zahlen in PreviewGallery (50px Swipe-Threshold, 80px Thumbnail-Höhe) — als benannte Konstanten definieren

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
- [ ] Keine Suchfunktion für FAQ — bei 30+ Fragen wäre In-App-Suche hilfreich
- [ ] Kategorie-State wird bei Tab-Wechsel / Navigation nicht gespeichert — LocalStorage-Persistierung würde helfen
- [ ] Keine `FAQPage` Schema.org-Daten — Google Featured Snippets werden nicht unterstützt

---

## 5. Urheberrecht (`/urheberrecht`)

- [x] Inhalt-Navigation als Sidebar links (sticky, scroll-spy, responsive)

### Eigene Vorschläge (Urheberrecht)

- [ ] Duplizierte Icon + Sektions-Header-Struktur (12 Sektionen gleiches Pattern) — in wiederverwendbare Komponente extrahieren
- [ ] Sticky-TOC Offset `top-24` ist hart kodiert — variiert je nach Header-Höhe, sollte dynamisch sein
- [ ] Mobile TOC verschwindet ab `lg:hidden` (1024px) — auch Tablet-Nutzer verlieren Orientierung, Toggle-Button wäre besser
- [ ] TOC-Links ohne `aria-current="page"` für aktiven Link — nur CSS-Styling, kein Screenreader-Hinweis
- [ ] Sektions-Icons (CheckCircle, XCircle etc.) haben kein `aria-hidden="true"` — werden als Inhalt für Screenreader gelesen
- [ ] "Back to Top" Link hat nur `onClick` — sollte auch echtes `<a href="#top">` sein für Keyboard-Navigation
- [ ] Kein Anker-Navigation beim Seitenladen — wenn User mit `#aiContent` kommt, öffnet Seite oben statt am Anker
- [ ] Fehlende `BreadcrumbList` Schema.org-Daten

---

## 6. Impressum (`/impressum`)

- [ ] GmbH nachtragen (Firmenform aktualisieren)
- [ ] Version update (optional)
- [x] Light mode Inselfarben gleich machen (Farbkonsistenz) — standardized text-text-secondary → text-text-muted
- [x] Kontakt Currico Link führt nach Mainpage (statt toter Link)

### Eigene Vorschläge (Impressum)

- [x] Keine `generateMetadata()` Funktion — Impressum ist wichtig für SEO/Trust
- [x] "Handelsname:" hardcoded statt i18n — now uses `t("company.tradeNameLabel")`
- [ ] Person-Array `["p1", "p2", "p3"]` ist magisch — sollte Konstante oder aus Config geladen werden
- [x] Icons (Building2, Mail, Globe, Scale, Users) haben kein `aria-hidden="true"` — werden als Inhalt gelesen
- [ ] E-Mail-Links ohne `title`-Attribut — Tooltip für Nutzer fehlt
- [x] `grid-cols-2` auf Mobile führt zu sehr schmalen Spalten — sollte `grid-cols-1 md:grid-cols-2` sein
- [ ] Disclaimer-Sektionen nutzen `<div>` statt `<section>` mit `aria-labelledby` — fehlende Semantik
- [ ] Keine `Organization`/`LocalBusiness` Schema.org-Daten — für Suchmaschinen-Vertrauen
- [ ] Links zu anderen Legal-Seiten fehlen (wie bei Cookie-Seite vorhanden)

---

## 7. Cookie-Richtlinien (`/cookie-richtlinien`)

- [ ] Inhalt überprüfen (stimmen die Angaben noch?)

### Eigene Vorschläge (Cookie-Richtlinien)

- [x] Keine `generateMetadata()` Funktion — Cookie Policy ist wichtig für GDPR/Compliance SEO
- [ ] Hardcoded Cookie-Namen `["consent", "session", "csrf", "locale"]` — sollten aus zentraler Konstante kommen (Single Source of Truth mit `CookieConsent.tsx`)
- [ ] Cookie-Listen nutzen `<div>` statt `<dl>`/`<dt>`/`<dd>` — fehlende Semantik für Screenreader
- [ ] Analytics-Cookie-Informationen zu vage ("Um unsere Dienstleistungen zu verbessern") — welche Tools genau? (Sentry, etc.)
- [ ] Keine Table of Contents — im Gegensatz zu Urheberrecht-Seite, bei 5+ Sektionen wäre TOC hilfreich
- [ ] Related-Links Section nutzt `<div>` statt `<nav>` — fehlende Navigation-Semantik
- [ ] Keine visuelle Unterscheidung zwischen Cookie-Typen — Essential vs. Analytics sollten farblich getrennt sein

---

## 8. Verkäufer-Stufen (`/verkaeufer-stufen`)

- [x] "So sammelst du Punkte" Raster einheitlich auf gleiche Höhe bringen — flex-col + mt-auto for equal card heights
- [ ] Lock Tier Upgrade nur bei bestimmten Voraussetzungen (Anzahl Downloads/Uploads)
- [ ] Namen von Leveln überarbeiten
- [ ] Punkte/Level-Aufstieg-System überarbeiten

### Eigene Vorschläge (Verkäufer-Stufen)

- [x] Hardcoded deutsche Strings ("1 Material", "5 Materialien", "25 Downloads", "1 Bewertung" etc.) — now use i18n plural forms
- [x] Hardcoded "Level" Text in Badge — now uses `t("page.levelBadge", { level })`
- [x] Layout-Metadata nutzt Canonical URL "seller-levels" statt "verkaeufer-stufen" — SEO-Fehler
- [ ] `tipIcons` Array wird per Index gemappt — fragile Zuordnung, bricht wenn Array-Länge ändert
- [ ] Keine visuelle Hierarchie zwischen aktuellem und angestrebtem Level — alle Level gleich dargestellt
- [ ] Breadcrumb zeigt nur Seitentitel ohne Home-Link — fehlende Hierarchie
- [ ] Keine Schema.org-Daten für Punkte-System

---

## 9. Verifizierter Verkäufer (`/verifizierter-verkaeufer`)

- [ ] "Keine offenen Meldungen" Kriterium entfernen
- [x] Text-Blur beim Hover fixen (Text muss scharf und lesbar bleiben) — removed scale() from card hover, keeping translateY only

### Eigene Vorschläge (Verifizierter Verkäufer)

- [x] Keine `generateMetadata()` Funktion — SEO-Metadaten und Canonical URLs fehlen
- [ ] Keine Validierung dass `VERIFIED_SELLER_CRITERIA` genau 5 Items hat passend zu `criteriaIcons` Array — Icon-Text-Mismatch möglich
- [ ] Benefits-Section nutzt inline SVG-Icons statt lucide-react wie andere Sektionen — inkonsistentes Icon-System
- [ ] Nur 3 Benefits gelistet — fühlt sich unvollständig an, Nutzer wollen mehr Detail was "verifiziert" praktisch bedeutet
- [ ] "How it works" hat 3 kurze Absätze ohne visuelle Differenzierung oder Icons — schwer zu scannen
- [ ] Kein Vergleich mit nicht-verifizierten Verkäufern — Nutzer sehen keinen konkreten Unterschied
- [x] Metadata in Layout nutzt falschen Canonical-Pfad

---

## 10. Über uns (`/ueber-uns`)

- [ ] Ganze Seite überarbeiten und persönlicher gestalten
- [ ] Bilder überarbeiten und einheitlicher machen

### Eigene Vorschläge (Über uns)

- [x] `Link` aus "next/link" importiert statt aus `@/i18n/navigation` — umgeht Locale-Handling, kann Mehrsprachigkeit brechen
- [x] Layout-Metadata nutzt Canonical "/about" statt "/ueber-uns" — SEO-Fehler
- [ ] Hardcoded SVG-Icons für Values statt lucide-react — inkonsistentes Icon-System
- [ ] Persönliches Zitat (Kursiv-Serif) ohne klaren Kontext wer spricht — mehrdeutig
- [ ] Values-Section nutzt sehr generische Beschreibungen — nicht differenziert von anderen EdTech-Plattformen
- [ ] Kein CTA-Button am Seitenanfang — erst ganz unten nach viel Text
- [ ] Kein Schema.org `Organization` Markup — fehlende strukturierte Daten
- [ ] Meta-Description zu generisch — sollte spezifischer für Schweizer Kontext sein
- [ ] Keine Social-Media-Links oder Kontaktmöglichkeiten beim Team — Nutzer können Team nicht kontaktieren
- [ ] Kein Fallback wenn Team-Member-Bilder nicht laden

---

## 11. Kontakt (`/kontakt`)

- [x] Grüner Kasten rechts löschen
- [x] E-Mail-Adresse "example" ändern zu "Max Muster"
- [x] "Schnelle Antworten gesucht" → Verlinkung nach Hilfe, Sektion ganz nach oben verschieben
- [x] "Worum geht es": Widerruf/Rückgabe von Gekauftem als Option hinzufügen

### Eigene Vorschläge (Kontakt)

- [x] E-Mail "info@currico.ch" hardcoded statt aus Config-Konstante — now uses i18n `t("direct.emailAddress")`
- [ ] Kein Spam-Schutz (kein Honeypot, kein reCaptcha, kein Rate-Limiting sichtbar) — Formular könnte missbraucht werden
- [ ] Telefonnummer-Feld hat keine Formatvalidierung — akzeptiert ungültige Nummern
- [ ] Formular-State nur Client-seitig (useState) — bei Navigation weg sind Daten ohne Warnung verloren
- [ ] Erfolgs-Nachricht erklärt keine nächsten Schritte (z.B. "Wir melden uns in 24-48 Stunden")
- [ ] Keine Referenznummer nach Absenden — Nutzer kann Anfrage nicht nachverfolgen
- [x] Fehlende `autocomplete`-Hints auf Formularfeldern (z.B. `autocomplete="email"`) — schlechte Accessibility
- [ ] Keine Schema.org `ContactPoint` Markup
- [ ] Antwortzeit "24-48 Stunden" ist statischer Text — nicht konfigurierbar oder dynamisch

---

## 12. Anmelden (`/anmelden`)

- [ ] Weiterleitung nach Login anpassen (wohin wird man geleitet?)
- [ ] "Vergessenes Passwort" Seite/Link erstellen (mit E-Mail-Reset)
- [x] Google-Anmeldung → direkt zum Profil, nicht zurück zum Login (auth.ts redirect fallback → `/konto`)
- [ ] Google-Anmeldung überarbeiten (Flow verbessern)
- [ ] Erneute Google-Anmeldung → braucht Zwischenfenster von Google
- [x] "Zurück zur Startseite" sichtbar machen ohne Scrollen — moved from footer to above login card
- [ ] Security: Password Salt implementieren (Simon)
- [ ] Login über Google Auth überarbeiten (Simon)

### Eigene Vorschläge (Anmelden)

- [ ] "Remember Me" Kontrollkästchen ist vorhanden, aber Auswahl wird nicht gespeichert — Funktionalität fehlt
- [ ] Nach fehlgeschlagenem Login werden E-Mail und Passwort geleert — sollten bestehen bleiben für schnelleres Ausprobieren
- [ ] OAuth-Fehler haben keine spezifischen Fehlermeldungen — nur generischer Fehler
- [ ] Keine sichtbare Brute-Force-Schutz-Anzeige (z.B. "Zu viele Versuche, bitte warten")
- [ ] Keine Capslock-Warnung beim Passwort-Feld
- [ ] Passwort vergessen führt zu "/bald-verfuegbar" statt zu echter Reset-Funktionalität

## 12b. Registrieren (`/registrieren`)

### Eigene Vorschläge (Registrieren)

- [ ] Passwort-Anforderungen (8 Zeichen Minimum) werden nicht vor dem Absenden angezeigt — nur bei der Eingabe
- [ ] Keine Prüfung auf häufig verwendete Passwörter (z.B. "password123")
- [ ] Keine Passwort-Stärke-Anzeige — nur Mindestlänge wird validiert
- [ ] AGB/Datenschutz-Links zeigen "/bald-verfuegbar" — sollten auf echte Seiten verlinken
- [ ] Keine klare Indication nach Registrierung, dass E-Mail bestätigt werden muss

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

- [ ] "Profil vervollständigen" überarbeiten und sicherstellen dass es funktioniert + Buttons — profile completion banner exists in settings, needs functional review

### Eigene Vorschläge (Konto-Übersicht)

- [ ] Profile-Completion-Banner nutzt localStorage mit Prozentwert-Key — könnte bei mehrfachem Speichern zu verwirrenden Zuständen führen
- [x] "Pending" Status wird als "Ausstehend" hardcoded — sollte i18n nutzen
- [ ] Keine Filterung nach Material-Status auf der Overview
- [ ] Recent Downloads zeigt max 6 Items ohne Pagination — bei mehr werden diese nicht angezeigt
- [ ] Download-Funktion öffnet neues Fenster ohne Error-Handling für fehlgeschlagene Downloads
- [ ] Seller-Materials-Tabelle hat keine Sortier-Funktionalität

### Eigene Vorschläge (Konto-Layout)

- [ ] Mobile Tab Bar scrollt aktiven Tab nicht immer in die Mitte — `scrollIntoView` Positionierung verbessern
- [ ] Keine Bestätigung beim Navigieren weg von ungespeicherten Änderungen in Settings
- [ ] Keine Skeleton-Animationen für die Quick-Stats Desktop-Ansicht
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

- [ ] Bio-Feld `maxLength={500}` — Zeichenzähler sollte früher sichtbar sein (z.B. ab 400 Zeichen)
- [ ] Passwort ändern Funktion fehlt komplett — sollte in diesem Bereich sein
- [ ] "E-Mail ändern → kontaktieren Sie uns" ohne Link/Button zu Support — Sackgasse
- [ ] Instagram/Pinterest-Felder: keine Validierung der Benutzernamen
- [ ] Profil-Visibility-Toggle hat keine Bestätigung vor Änderung zu Private
- [ ] Floating Save Bar könnte Position bei kleinen Screens falsch berechnen
- [ ] Keine Vorschau-Funktion für öffentliches Profil vor dem Speichern
- [ ] "Datenexport"-Button hat keine Funktionalität implementiert — sollte disabled oder funktional sein
- [ ] "Konto löschen"-Button hat keine Funktionalität — sollte zu Bestätigungsdialog führen
- [ ] Keine Warnung, dass Konto-Löschung permanent ist und Materialien/Käufe betroffen
- [ ] Keine Zwei-Faktor-Authentifizierung (2FA) Option
- [ ] Benachrichtigungs-Prefs zeigen nur Erfolg/Fehler als kurze Toast — besseres Feedback nötig
- [ ] Keine Unterteilung in "E-Mail" vs. "In-App" Benachrichtigungen
- [ ] Keine Batch-Option "Alle Benachrichtigungen deaktivieren"

---

## 15. Konto - Wunschliste (`/konto/wishlist`)

- [x] "Materialien entdecken" Button oben rechts hinzufügen — header has "Mehr entdecken" link
- [x] Suchfunktion einbauen — client-side search already exists

### Eigene Vorschläge (Wunschliste)

- [ ] Wenn Item entfernt wird, werden Stats nicht aktualisiert — inkonsistente Zahlen möglich
- [ ] Keine Benachrichtigung wenn Artikel auf Wunschliste Preisänderung hat
- [ ] Keine Sortier- oder Filteroptionen
- [ ] Herz-Icon für Wunschliste könnte konsistenter mit anderen Seiten sein

---

## 16. Konto - Bibliothek (`/konto/library`)

- [x] Suchfunktion einbauen — server-side search with 300ms debounce

### Eigene Vorschläge (Bibliothek)

- [ ] Statistik-Karten verwenden hardcoded deutsche Texte ("Gesamt in Bibliothek", "Gratis erhalten", "Gekauft") — sollten i18n nutzen
- [ ] Suchfunktion: wenn Suchfeld geleert wird, wird nicht neu geladen
- [ ] Keine Filteroptionen für Material-Typ (kostenlos vs. kostenpflichtig)
- [ ] Badge-Text "Verifiziert" ist hardcoded statt i18n
- [ ] Keine Sortieroptionen (nach Datum, Preis, Bewertung etc.)
- [ ] Keine Bulk-Actions (z.B. mehrere auswählen und zu Sammlung hinzufügen)

---

## 17. Konto - Uploads (`/konto/uploads`)

- [x] Suchfunktion einbauen — search with debounce exists
- [ ] "Meine Materialien bearbeiten" führt zu Error 404 → **KNOWN ISSUE: full material editing page is a larger feature, out of scope for UI polish**
- [ ] "Link zur Vorschau" Button bei Meine Materialien löschen
- [x] Meine Materialien sortieren möglich machen — sort dropdown exists (newest, oldest, alphabetical, popular)
- [ ] Dokumente in Überprüfung in Uploads anzeigen

### Eigene Vorschläge (Uploads)

- [ ] Suchfeld wird nur angezeigt wenn `uploadedItems.length > 0` — sollte immer sichtbar sein
- [ ] Badge-Texte ("Verifiziert", "Ausstehend") sind hardcoded statt i18n
- [ ] Placeholder-Text "Uploads durchsuchen..." ist hardcoded (nicht i18n)
- [ ] Keine Anzeige von Upload-Fortschritt für Materials im Draft-Status
- [ ] Keine Möglichkeit, Material zu duplizieren

---

## 18. Folge ich (`/folge-ich`)

- [x] "Gefolgte Profile" Wording überarbeiten — proper i18n key `following.followedProfiles` with correct wording
- [x] Bei Klick auf Profil → zur Profilansicht wechseln — links to `/profil/${id}` (correct German path)
- [ ] Man kann sich nicht selber folgen (Logik einbauen) — **OUT OF SCOPE: backend API logic, not frontend UI**

### Eigene Vorschläge (Folge ich)

- [x] `getSubjectPillClass` ist dupliziert (erscheint in 3+ Dateien) — konsolidiert in `lib/constants/subject-colors.ts`
- [x] Link href zu `/profile/{id}` statt `/profil/{id}` — URL-Inkonsistenz (alter englischer Pfad) — fixed in folge-ich & sammlungen
- [ ] Unfollow-Button zeigt Hover-State mit Error-Farben (`hover:border-error`) — impliziert Gefahr statt einfaches Entfolgen
- [ ] "Discover profiles" Button im Empty-State verlinkt auf `/materialien` statt auf Profil-Suche
- [ ] "Followed since" Datumsformat nutzt `toLocaleDateString` aber matcht nicht Rest der App
- [ ] Alle gefolgten Seller werden auf einmal geladen — keine Pagination für grosse Listen
- [ ] Keine Metadata für `/folge-ich` Route
- [ ] API-Response-Struktur wird nicht validiert — nimmt an dass `data.sellers` existiert

---

## 19. Hochladen (`/hochladen`)

### Formular-Validierung

- [ ] Titel-Limite auf 64 Zeichen
- [ ] Fächer-Abkürzungen mindestens 2 Buchstaben
- [ ] Vorschaubild auf 5 MB limitieren
- [ ] Nur eine Datei aufs Mal hochladen (nicht mehrere gleichzeitig)
- [ ] Wenn zwei verschiedene Material-Typen hochgeladen → nicht erlauben (nur ein Typ)

### Kompetenzen

- [ ] Kompetenz-Auswahl im gleichen Style und Layout wie Zyklus/Fach
- [ ] Maximal 5 Kompetenzen auswählen

### Preise

- [ ] Mindestpreis 0.50 CHF (0 darf nicht als kostenpflichtig durchgehen)
- [ ] Kosten nur in 0.50-Schritten erlauben, automatisch auf/abrunden

### Fehlermeldungen

- [ ] "Profil vervollständigen" Fehlermeldung → Link zum Profil
- [ ] Alle Fehlermeldungen mit Link zum Problem + Rechtschreibung prüfen

### Nach dem Upload

- [ ] Mehrere Dokumente vom gleichen Typ uploaden möglich machen
- [ ] "Zurück zum Profil" Link richtig verlinken
- [ ] Tag von Material-Typ angleichen
- [ ] Vor Veröffentlichung: Übersicht wie es auf der Materialseite aussehen wird
- [ ] "Verifizierte Dokumente" umbenennen zu "Geprüft"

### Verkäufer-Dashboard

- [ ] Downloads überarbeiten (funktioniert noch nicht)
- [ ] Einnahmen total anzeigen (nicht monatlich)

### Eigene Vorschläge (Hochladen)

- [x] ~30 hardcoded German strings in upload wizard replaced with i18n — step titles, subtitles, form labels, legal checkboxes, navigation buttons, file upload text, preview text, error messages all now use tWizard/tSteps/tFields/tLegal/tNav translation functions
- [ ] Eszett (ß) Warnung nur in Step 1, aber User kann in Step 3 auch Text eingeben — nicht alle Felder geprüft
- [ ] Draft-System speichert Felder aber keine Dateien — bei Browser-Cache-Leerung sind Dateien weg
- [ ] Keine Anzeige von verbleibender Datei-Grösse/Speicher-Limit
- [ ] "Automatische Vorschau" Info nur für PDF erwähnt — andere Formate?
- [ ] Keine Duplikat-Erkennung — User könnte versehentlich gleiches Material mehrmals hochladen
- [ ] "Lehrplan-Zuordnung" Selektor ist sehr gross — könnte Search-Funktionalität haben
- [ ] Keine Warnung beim Tab-Schliessen mit ungespeicherten Änderungen
- [ ] Validierung von Dateinamen wird nicht durchgeführt (z.B. zu lange Namen)
- [ ] Preview-Bild: keine Vorschau der finalen Galerie-Ansicht
- [ ] Bundle: Subject und Cycle sind fixiert auf Bundle-Level — sollten optional sein da Bundle mehrere Subjects haben kann
- [ ] Bundle: Discount-Berechnung zeigt nur Prozentsatz — sollte auch Ersparnis in CHF zeigen
- [ ] Bundle: Keine Validierung dass Bundle-Preis unter Summe der Einzelpreise liegt
- [ ] Bundle: Materials-Liste hat keine Pagination — bei 100+ Materials sehr lang

---

## 20. Öffentliches Profil (`/profil/[id]`)

- [ ] Profilseite komplett überarbeiten und funktionierend machen

### Eigene Vorschläge (Öffentliches Profil)

- [x] Hardcoded deutsche Strings: "Profil nicht gefunden", "Das gesuchte Profil existiert nicht", "Benutzer", "Materialien durchsuchen", "Profil wird geladen..." — alles in i18n auslagern
- [x] `getSubjectPillClass` lokal definiert statt aus Shared Utility — jetzt aus `lib/constants/subject-colors.ts` importiert
- [ ] `formatPrice` ist lokal definiert statt aus Shared Utility — Code-Duplikation
- [ ] Keine Validierung dass `params.id` ein gültiger UUID/Slug ist vor dem Fetchen
- [ ] 4 parallele API-Calls bei Seitenaufruf — könnten zu einem einzelnen Endpoint gebündelt werden
- [ ] Keine SSR/Static Generation — alle Daten Client-seitig gefetcht, schlecht für SEO
- [ ] Keine OpenGraph Meta-Tags für Profil-Sharing in sozialen Medien
- [ ] Follow-Button zeigt "Gefolgt" erst nach erfolgreicher Action — kein sofortiges Feedback (kein Optimistic Update)
- [ ] Private-Profile-Notice versteckt zu viel — Verkäufer wollen evtl. kein privates Profil
- [ ] Kein Caching von Profil-Daten — jeder Besuch fetcht frische Daten
- [ ] "Beste Uploads" Titel ist hardcoded Deutsch

---

## 21. Verkäufer werden (`/verkaeufer-werden`)

- [ ] Stripe Konto einrichten Button + Bestätigungsbutton überarbeiten

### Eigene Vorschläge (Verkäufer werden)

- [ ] Hardcoded deutsche Strings in gesamter Komponente — nicht lokalisierbar
- [ ] Inline SVG-Icons statt lucide-react — inkonsistent mit Rest der App
- [ ] Seller-Terms-Inhalt direkt in Komponente eingebettet — sollte in separater Datei oder von CMS geladen werden
- [ ] Terms-Section hat nur 500px max-height mit `overflow-y-auto` — beengtes Leseerlebnis
- [ ] Requirements-Section zeigt 3 Anforderungen ohne Anzeige welche der User schon erfüllt hat (z.B. grüner Haken für erledigt)
- [ ] Kein Fortschrittsanzeiger für den 4-Schritte-Prozess (Login → E-Mail verifizieren → Terms akzeptieren → Stripe verbinden)
- [ ] E-Mail-Verifizierungs-Fehler hat keinen direkten Link zu Einstellungen
- [ ] Stripe Redirect nutzt `window.location.href` statt Next.js Navigation
- [ ] CTA-Buttons erklären nicht per Tooltip warum sie disabled sind
- [ ] Copyright-Section fühlt sich vom Hauptflow abgekoppelt an

---

## 22. Stripe Konto (Seller Onboarding)

- [ ] Einstellungen verbessern
- [ ] Weniger Angaben bei der Einrichtung
- [ ] Rückkehr von Stripe zu Currico → Buttons überarbeiten und funktionierend machen

---

## 23. Benachrichtigungen

- [ ] Autoren-Benachrichtigungen einrichten
- [ ] Newsletter-System
- [ ] Gesamtes Benachrichtigungssystem überarbeiten

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

## Zusammenfassung

| Seite                     | Erledigt | Offen (Joel) | Offen (Eigene) | Total Offen |
| ------------------------- | -------- | ------------ | -------------- | ----------- |
| Startseite                | 4        | 2            | 11             | 13          |
| Materialien               | 1        | 20           | 19             | 39          |
| Material-Vorschau         | 0        | 12           | 17             | 29          |
| Hilfe                     | 4        | 2            | 6              | 8           |
| Urheberrecht              | 1        | 0            | 8              | 8           |
| Impressum                 | 1        | 3            | 9              | 12          |
| Cookie-Richtlinien        | 0        | 1            | 7              | 8           |
| Verkäufer-Stufen          | 2        | 4            | 5              | 9           |
| Verifizierter Verkäufer   | 1        | 1            | 6              | 7           |
| Über uns                  | 0        | 2            | 10             | 12          |
| Kontakt                   | 0        | 4            | 8              | 12          |
| Anmelden                  | 2        | 6            | 6              | 12          |
| Registrieren              | 0        | 0            | 5              | 5           |
| Konto (alle Unterseiten)  | 19       | 11           | 39             | 50          |
| Folge ich                 | 3        | 1            | 7              | 8           |
| Hochladen                 | 0        | 18           | 13             | 31          |
| Öffentliches Profil       | 0        | 1            | 10             | 11          |
| Verkäufer werden / Stripe | 0        | 4            | 10             | 14          |
| Benachrichtigungen        | 0        | 3            | 0              | 3           |
| Global                    | 9        | 1            | 13             | 14          |
| **Total**                 | **48**   | **93**       | **207**        | **300**     |
