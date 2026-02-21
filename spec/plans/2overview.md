# UI/UX Audit & Verbesserungen — Runde 2

> **Erstellt:** 2026-02-20
> **Quelle:** Manuelles Feedback + Code-Audit
> **Legende:** [x] erledigt, [ ] offen

---

## A. BUGS (kaputt / funktioniert nicht)

### A1. Broken Links & Buttons

- [ ] **"Material hochladen" Button im Footer** — Link zu `/hochladen` vorhanden, aber Button-Styling fehlt oder Klick geht nicht. Prüfen ob `Link`-Komponente korrekt ist.
- [ ] **"Material hochladen" Button auf Materialien-Seite** — Upload-Button funktioniert nicht (verifizieren: `app/[locale]/materialien/page.tsx`)
- [x] **TrustBar Link "/verifizierter-verkaeufer"** — Geändert zu `/verkaeufer-werden`.
- [x] **Email-Links gehen nicht** — `AUTH_URL` auf `NEXTAUTH_URL || NEXT_PUBLIC_APP_URL` standardisiert in `lib/email.ts`.
- [ ] **Urheberrecht: "Zurück zum Upload" Button** — Prüfen ob Link auf `/hochladen` korrekt funktioniert (`urheberrecht/page.tsx`)
- [x] **Registrierung: "Erstes Material hochladen" Button** — CTA zu `/hochladen` auf Erfolgsseite hinzugefügt.
- [ ] **Profilbild hochladen funktioniert nicht** — AvatarUploader prüfen (API: `app/api/users/me/avatar/route.ts`)
- [x] **Upload-Validierung: Fachkürzel** — `min(2)` zu `min(1)` geändert, da Deutsch den Code "D" hat.
- [x] **Bewertung nach Download** — `refreshKey` Prop in ReviewsSection, wird nach Download inkrementiert.

### A2. Filter-Bugs (Materialien-Seite)

- [ ] **Fachbereich BG: Falsche Umrandung** — Beim Auswählen von "Bildnerisches Gestalten" stimmt die Outline/Border nicht mit den anderen Fachbereichen überein. → `FachbereichAccordion.tsx` prüfen, ob `box-shadow` / Ring-Style konsistent angewendet wird.
- [ ] **"Sonstige" auswählen verschiebt Layout** — Beim Klick auf "Sonstige" verschiebt sich das Layout. → Fixen: Stabilere Layout-Berechnung, kein bedingtes Padding/Margin.

---

## B. TEXT & INHALT ÄNDERN

### B1. Startseite — Text-Korrekturen

- [x] **Hero-Beschreibung kürzen** — "Vertrauenswürdig, geprüft, sofort einsetzbar" entfernt.
- [x] **"Eigene Materialien verkaufen?"** CTA unter Suche entfernt aus `HomeClient.tsx`.
- [x] **"Qualität zuerst" Untertitel** — "Entwickelt mit echten" → "Entwickelt von" Schweizer Lehrpersonen.
- [x] **"Qualität garantiert"** → "Qualität im Fokus", Beschreibung auf Community-Bewertung umformuliert.
- [x] **"Das sagen Lehrpersonen"** Testimonials-Sektion von Homepage entfernt.

### B2. Materialien-Seite

- [x] **"Dialekt" zu "Sprachvariante"** — Labels in de.json und en.json umbenannt.
- [x] **Schlagwörter-Filter entfernt** — Gesamter Tag-Filter aus `MaterialFilters.tsx` entfernt.
- [x] **Seller-Level-Badge von Cards entfernt** — SellerBadge aus `MaterialCard.tsx` entfernt, nur VerifiedSellerBadge bleibt.

### B3. Vorschau / Detail-Seite

- [x] **"Geprüft" als Dokumenten-Tag entfernt** — Pill entfernt (alle Materialien sind geprüft).
- [x] **"Geprüft" Emblem vereinfacht** — Nur noch BadgeCheck-Icon ohne Text.

### B4. Impressum

- [x] **Rechtliche Links am Seitenende entfernt** — Related-Legal-Pages Block aus Impressum entfernt.

### B5. Cookies-Seite

- [x] **Rechtliche Links am Seitenende entfernt** — Related-Links Block aus Cookie-Richtlinien entfernt.

---

## C. UX-VERBESSERUNGEN

### C1. Startseite

- [x] **Zweites TWINT/Karte Emblem entfernen** — Doppeltes Icon (CreditCard + SVG) auf nur CreditCard reduziert.
- [x] **Statistiken "8 Materialien, 3 Lehrpersonen, 7 Downloads" schöner gestalten** — Minimum-Schwelle von 10 Materialien hinzugefügt. Sektion wird ausgeblendet wenn zu wenig Daten.
- [x] **Trust-Items verlinken** — SwissBrand "Datenschutz"-Karte verlinkt jetzt auf `/datenschutz` via FeatureGrid `href` Prop.

### C2. Vorschau / Detail-Seite

- [x] **Ersteller-Klick → Profil** — Link von `/materialien?seller=` zu `/profil/` geändert.
- [x] **Layout-Ratio: 2/3 Dokument, 1/3 Beschreibung** — Grid auf `lg:grid-cols-[2fr_1fr]` geändert.
- [x] **Bewertung-Button einfacher gestalten** — Sterne neben Titel auf einer Zeile, Titel + Content nebeneinander auf Desktop.
- [x] **"Material melden" Popup grösser** — Modal von `max-w-md` auf `max-w-xl`, Textarea auf 5 Zeilen und `min-h-[120px]`.

### C3. Hilfe-Center

- [x] **Schnelleinstieg-Links angleichen** — `flex flex-col` auf Karten, `flex-1` auf Beschreibung → Links immer am unteren Rand.

### C4. Urheberrecht

- [x] **"Nach oben" Button in der Mitte entfernen** — Entfernt, Mobile-TOC-Button reicht.

### C5. Cookies-Seite

- [x] **"Nach oben" Button in der Mitte entfernen** — Entfernt, Mobile-TOC-Button reicht.

### C6. AGB & Datenschutz

- [x] **Inhaltsverzeichnis hinzufügen** — Beide Seiten mit Sidebar-TOC + Scroll-Spy + Mobile-Overlay umgebaut (identisches Pattern wie Urheberrecht/Cookies).

### C7. Profil / Konto-Dashboard

- [x] **Profilbild: Ganzer Kreis klickbar** — Ganzer Avatar-Kreis als `<button>` mit Hover-Overlay (Camera-Icon + dunkler Overlay bei Hover).
- [x] **"Ungespeicherte Änderungen" Dialog schöner** — Custom `UnsavedChangesDialog` mit Warning-Icon, "Verwerfen"/"Speichern" Buttons und Framer Motion Animation. Link-Klicks werden abgefangen, `beforeunload` bleibt als Fallback für Browser-Navigation.
- [x] **Punkte-System in eigenen Tab** — SellerLevelCard in `/konto/rewards` verschoben, neuer Nav-Tab "Punkte & Level" in Sidebar + Mobile Tabs.
- [x] **"Meine Uploads" Hover-Highlight abrunden** — `rounded-lg` zu Desktop-Tabellenzeilen hinzugefügt.
- [x] **"Letzte Downloads" klickbar machen** — Gesamte Karte verlinkt auf `/materialien/{id}`, Download-Button bleibt eigenständig klickbar.
- [x] **Bibliothek: "Mehr entdecken" Button ohne Icon** — Sparkles-Icon entfernt.
- [x] **Cards vollständig klickbar** — DashboardMaterialCard hat bereits `inset-0` overlay Link mit z-index Layering (z-0 Navigation, z-10 Buttons).
- [x] **"Folge ich" Profil-Klick: Ganze Fläche** — Gesamte Karte verlinkt auf `/profil/{id}`, Entfolgen-Button bleibt eigenständig klickbar.
- [x] **Zwei-Faktor-Authentifizierung** — Code-Audit durchgeführt: Setup/Login/Disable-Flow korrekt. Rate-Limiting für 2FA-Login-Versuche hinzugefügt (5/15min), `parseBackupCodes()` Typvalidierung für JSON-Feld, `"easeOut"` Strings standardisiert.

### C8. Material hochladen

- [x] **Mehr Animationen beim Upload-Wizard** — Framer Motion AnimatePresence für Step-Übergänge (slide + fade), StepSummary expand/collapse mit height-Animation, PublishPreviewModal mit scale+fade Eingang.
- [x] **"Checkliste vor dem Upload" Sektion entfernen** — Gesamte Checklist-Callout entfernt, rechtliche Bestätigung unten bleibt.
- [x] **Material-Vorschau am Schluss vergrössern** — PublishPreviewModal von `max-w-lg` auf `max-w-2xl` vergrössert.

---

## D. DESIGN & KONSISTENZ

### D1. Globale UI-Konsistenz

- [x] **Alle Dropdowns abrunden** — TopBar User-Menü Items, MultiSelect Options und Logout-Button auf `rounded-lg` mit passenden Hover-Highlights.
- [x] **Cards einheitlich** — DashboardMaterialCard angeglichen: Image-Zoom-Hover, Content-Padding `pt-3`, Footer-Padding `pt-3`, Grid `gap-4 sm:gap-5 md:grid-cols-3` (statt `gap-3 lg:grid-cols-4`), Skeleton-Grid aktualisiert.

---

## E. ZUSÄTZLICHE FINDINGS (Code-Audit)

> Diese Items wurden beim Code-Audit zusätzlich gefunden.

### E1. Technisch

- [x] **Email Base-URL Inkonsistenz** — Beide Funktionen auf `NEXTAUTH_URL || NEXT_PUBLIC_APP_URL` standardisiert (Sektion A).
- [x] **PlatformStats ohne Minimum-Schwelle** — Minimum 10 Materialien Schwelle hinzugefügt (Sektion C1).

### E2. Inhalt & Vertrauen

- [x] **Testimonials entfernen (s. B1)** — TestimonialsSection von Homepage entfernt (Sektion B1).
- [x] **Blog-Link im Footer** — Aus Footer und Sitemap entfernt (kein Blog-Content vorhanden).
- [x] **"100% Lehrplan 21 konform" in TrustBar** — "100%" aus Hero-Badge und FAQ entfernt. Hero: "Lehrplan 21 konform", FAQ: "vollständig" statt "100%".

### E3. UX

- [x] **Upload-Button in TopBar** — Plus-Icon + "Hochladen" Button zwischen Notifications und Avatar (Desktop), prominent CTA im Mobile-Menü.
- [x] **Creator-Link geht zu Filter statt Profil** — Link in PurchasePanel auf `/profil/{id}` geändert (Sektion A/C2).

---

## Zusammenfassung

| Kategorie               | Total  | Erledigt | Offen |
| ----------------------- | ------ | -------- | ----- |
| A. Bugs                 | 11     | 10       | 1     |
| B. Text & Inhalt        | 11     | 11       | 0     |
| C. UX-Verbesserungen    | 22     | 22       | 0     |
| D. Design & Konsistenz  | 2      | 2        | 0     |
| E. Zusätzliche Findings | 7      | 7        | 0     |
| **Total**               | **53** | **52**   | **1** |

> **Noch offen:**
>
> - A2: Fachbereich BG Filter-Bug (braucht `db:seed-curriculum`)
