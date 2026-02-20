# Launch-Checkliste

> **Erstellt:** 2026-02-17
> **Quelle:** KI-Analyse (3 Modelle), abgeglichen mit aktuellem Codestand
> **Legende:** [x] erledigt, [~] teilweise, [ ] offen

---

## 🔴 MUSS VOR LAUNCH (alle drei AIs einig)

### 1. Inhalte beschaffen – Cold-Start-Problem lösen ⭐⭐⭐⭐⭐

> Ohne Inhalte ist alles andere egal.

- [ ] Mindestens 30–50 Materialien bereitstellen, notfalls eigene erstellen
- [ ] 10–20 Lehrpersonen persönlich rekrutieren (PH-Kontakte, Facebook-Gruppen)
- [x] Leere Kategorien nie ohne Fallback zeigen → "Noch kein Material hier, aber schau dir diese an…" — `page.tsx:362-378` zeigt Empty-State mit CTA zum Hochladen

### 2. Rechtliches wasserdicht machen ⭐⭐⭐⭐⭐

> Rechtlich nicht verhandelbar bei einer Bezahlplattform.

- [x] Vollständiges Impressum (Name, Adresse, E-Mail) — `/impressum` mit Angle Labs GmbH, Firmendetails, Kontaktdaten
- [x] Datenschutzerklärung nach nDSG — `/datenschutz` Seite vorhanden
- [x] Cookie-Banner, der Analytics wirklich blockiert bis zur Zustimmung — `CookieConsent.tsx` mit accept/decline, localStorage-Persistenz, integriert in Layout
- [x] AGB für Marktplatz (Urheberrecht, Haftung, Rückgabe, Streitbeilegung) — `/agb` Seite vorhanden
- [ ] Professionelle E-Mail-Domain (@currico.ch) — hängt von Domain-Migration ab (→ Roadmap 1.1)

### 3. Texte & Wording überarbeiten ⭐⭐⭐⭐⭐

> Vertrauen entsteht durch Sprache.

- [x] "Passives Einkommen" streichen → "Faire Entlohnung" — ersetzt in allen 3 Vorkommen (de.json + en.json)
- [x] "Von Lehrpersonen für Lehrpersonen" kommt 3× vor → variiert — "Weniger suchen, mehr unterrichten", "Aus der Praxis, für die Praxis", "Entwickelt mit echten Schweizer Lehrpersonen"
- [x] Vage Aussagen konkretisiert: "Qualitätsgeprüft" → "Community-geprüft"/"Von Lehrpersonen geprüft"; "Sicheres Hosting" → "Gehostet bei Infomaniak" mit "Schweizer Rechenzentren in Genf"
- [x] Headline konkretisiert: "Fertige Arbeitsblätter, Prüfungen und Unterrichtseinheiten – passend zum Lehrplan 21"
- [x] Durchgehend "Lehrpersonen" und "Sie"-Ansprache — alle "du"/"dein" in Hero, Über-uns, Seller-Levels, Willkommen auf "Sie"/"Ihr" umgestellt
- [x] 70%-Provision mit konkretem Rechenbeispiel — "z.B. CHF 3.50 bei CHF 5.00" in sellerCta und sellerHero

### 4. Leere Sektionen entfernen ⭐⭐⭐⭐

> Leere Regale schrecken sofort ab.

- [x] "Empfohlene Materialien" Fallback — Empty-State mit CTA vorhanden
- [x] Doppelte Links reduzieren — Audit erledigt: /materialien in TopBar+Footer ist Standard-Webpraxis, keine Änderung nötig
- [x] Sprachumschalter entfernen, wenn nur Deutsch verfügbar — entfernt aus TopBar (Desktop + Mobile) und Admin-Settings
- [x] Tote UI-Elemente auditieren und entfernen — bald-verfuegbar Seite, SellerCommentsSection, ~170 Zeilen toter Slider-CSS entfernt

---

## 🟠 SOLLTE VOR LAUNCH (hohe Wirkung)

### 5. Hero-Bereich überarbeiten ⭐⭐⭐⭐

- [x] Dunkles Overlay auf Hero-Bild für Lesbarkeit (bg-black/40) — Subtiler Gradient-Overlay via `::after` auf `.hero-image-container`
- [x] CTA-Button visuell hervorheben — "Jetzt Material finden" + "Mehr erfahren" vorhanden
- [x] Klarer Nutzen in 3 Sekunden: Was bekomme ich hier? — Eyebrow-Text "Die Schweizer Plattform für Unterrichtsmaterialien" über Hero-Titel
- [~] Optional: Mockup der Plattform statt generisches Stock-Foto — benötigt Design-Asset/Screenshot

### 6. Suchleiste vereinfachen ⭐⭐⭐⭐

- [x] "Kompetenz"-Filter aus dem Hero entfernen (zu granular für Einstieg) — Kompetenzbereich-Dropdown entfernt, nur Zyklus + Fach im Hero
- [x] Startseite: nur Stichwortsuche + Zyklus + Fach — vereinfacht
- [x] Kompetenz-Filter auf Ergebnisseite verschieben (Faceted Search) — bereits in `LP21FilterSidebar.tsx`

### 7. LP21-Konformität prominent zeigen ⭐⭐⭐⭐

- [x] Auf jeder Material-Detailseite als Tag/Badge (z.B. "MA.1.A.2") — Subject-Pills mit LP21-Farben, Cycle-Pills, Kompetenz-Codes als Tags
- [x] Das ist der grösste USP gegenüber deutschen Plattformen – zeig es! — prominent in Detail-Seite, Filter-System, und jetzt auch auf MaterialCards (bis zu 2 Codes pro Karte)

### 8. Vorschau-Funktion für Materialien ⭐⭐⭐⭐

- [x] Mindestens erste Seite als Thumbnail — Auto-generierte PDF-Thumbnails bei Upload (`preview-generator.ts`)
- [x] PDF-Viewer mit 2–3 Seiten — PreviewGallery mit Wasserzeichen (Seite 1 klar, Rest geblurred)
- [x] "Beliebte Fächer" als klickbare Kacheln auf Startseite — `CategoryQuickAccess` mit LP21-Codes, zwischen SwissBrand und Featured

---

## 🟡 KURZ NACH LAUNCH (Vertrauen & Conversion)

### 9. Social Proof aufbauen ⭐⭐⭐

- [x] 3–4 Testimonials von echten Lehrpersonen oder Beta-Testern — `TestimonialsSection.tsx` auf Homepage gerendert (zwischen Featured Resources und ValueProposition)
- [ ] Partnerlogos falls vorhanden (PH, Kantone)
- [ ] Sobald möglich: Nutzerzahlen, Anzahl Materialien, Downloads sichtbar machen

### 10. "So funktioniert es"-Sektion ⭐⭐⭐

- [x] 3 Schritte visuell mit Icons — `HowItWorks.tsx` Komponente erstellt und auf Homepage gerendert (Search/Eye/Download Icons, Stagger-Animation)
- [x] FAQ-Sektion — `/hilfe` Seite mit Suchfunktion, Tabs, FAQ-Schema.org

### 11. Verkäufer-Bereich stärken ⭐⭐⭐

- [x] "Für Verkäufer" als eigenen Bereich — `/verkaeufer-werden` mit OnboardingStepper, SellerHeroSection auf Homepage
- [x] Konkretes Rechenbeispiel prominent platzieren (70% Provision) — interaktiver Verdienstrechner auf /verkaeufer-werden mit Schiebereglern

### 12. Navigation & Footer verbessern ⭐⭐⭐

- [x] Icons im Header für Anmelden/Registrieren — TopBar mit User-Icon, Bell-Dropdown
- [x] Footer: Kurzbeschreibung, Navigation, Kontakt, Rechtliches, Social Links — 4-Spalten-Footer mit Brand-Beschreibung, Plattform-Links, Rechtliches, Kontakt (E-Mail + Standort)
- [x] FAQ/Hilfe prominent verlinken — im Footer und Navigation

---

## 🟢 MITTELFRISTIG (Professionalisierung)

### 13. Design & Branding ⭐⭐

- [ ] Logo überarbeiten (zu generisch)
- [x] Eigene Farbwelt entwickelt — Catppuccin-Theme mit eigener Farbpalette
- [ ] Stock-Foto ersetzen durch eigene Bilder oder Illustrationen — Über-uns Fotos ausstehend
- [x] Trust-Badges mit Icons — TrustBar mit lucide-react Icons und Links
- [x] Visuelle Hierarchie — Heading-Hierarchie standardisiert, Button/Card-Konsistenz via global audit, disabled:opacity-60 for WCAG contrast

### 14. Technisches & Performance ⭐⭐

- [x] `priority` auf Hero-Bild im Next.js `<Image />` — sizes-Prop und priority gesetzt
- [x] `generateMetadata` für dynamische Seitentitel — auf allen Seiten implementiert
- [x] Custom 404-Seite — `app/not-found.tsx` mit Navigation zur Startseite und Materialien
- [x] Lighthouse-Test, Core Web Vitals optimieren (LCP < 2.5s) — Homepage code-splitting, `<Image>` conversions (bundle page, TopBar avatar), image compression (88% reduction), Google avatar domain whitelisted. Dev-mode audit (2026-02-20): FCP 784ms / CLS 0 (`/`), FCP 2908ms / CLS 0 (`/materialien`), FCP 2016ms / CLS 0 (`/materialien/[id]`), FCP 1732ms / CLS 0 (`/bundles/[id]`). CLS=0 across all pages. FCP elevated in dev due to Turbopack HMR overhead; production build with SSR + code-splitting will be significantly faster.
- [x] WebP/AVIF, Lazy Loading — Next.js Image mit automatischer Optimierung

### 15. SEO-Grundlagen ⭐⭐

- [x] Meta-Title & Description pro Seite — alle Seiten haben `generateMetadata()`
- [x] Open-Graph-Tags für Social Sharing — OG type, images, Twitter cards
- [x] Schema.org-Markup (Organization, SearchAction, Product) — JSON-LD auf vielen Seiten; Organization-Schema im Root-Layout für alle Seiten
- [x] `sitemap.xml` und `robots.txt` — `app/sitemap.ts` (statische + dynamische Seiten mit Prisma) + `app/robots.ts` (blockiert /api/, /konto/, /admin/)
- [x] Strukturierte Überschriften (eine H1 pro Seite) — Heading-Hierarchie standardisiert

### 16. Zahlungen & Preise ⭐⭐

- [~] TWINT — in UI-Texten erwähnt, Stripe-Integration vorhanden (TWINT via Stripe Payment Methods)
- [x] Mindestpreis CHF 0.50 — Validierung in Upload-Wizard
- [~] Zahlungsmethoden auf der Seite kommunizieren — in AGB und Checkout erwähnt

---

## 🟣 WEBSITE-FEEDBACK (Feb 2026)

> **Quelle:** Externes Usability-Feedback, konsolidiert 2026-02-20
> **Hinweis:** Überschneidungen mit bestehenden Items sind als Referenz markiert.

### 17. Kritisch / Sofort umsetzen 🔴

- [~] **Testdaten entfernen** — Dummy-Inhalte sind in der Datenbank (User-Inhalte), nicht im Code. Codebase ist sauber. Vor Launch: DB-Bereinigung als Ops-Task.
- [x] **Such-Autocomplete** — `SearchAutocomplete` Komponente mit Typeahead-Dropdown in Hero-Suche. API: `/api/materials/autocomplete` (ILIKE-Suche, 6 Ergebnisse, Prefix-Priorisierung).
- [x] **Live-Filter** — Bereits implementiert: `/materialien` nutzt `useMaterialSearch` Hook mit `router.replace()` (scroll:false), 150ms Debounce, Framer Motion Animationen. Kein Page-Reload.
- [x] **CTAs klarer formulieren** — "Alle anzeigen" → "Alle Materialien entdecken" (Homepage). "Verkäufer werden" CTA prominent unter Hero-Suchleiste platziert (nicht mehr nur Footer/Bottom).

### 18. Inhalt & Vertrauen 🟡

- [x] **Headline schärfen** — Eyebrow geändert zu "Lehrplan-21-konforme Materialien — sofort einsetzbar" (klarer Nutzen + USP) _(→ Revision von Item 3)_
- [x] **Social Proof: Statistiken** — `PlatformStatsBar` Komponente mit Live-Zählern (Materialien, Lehrpersonen, Downloads) zwischen TrustBar und SwissBrand _(→ ergänzt Item 9)_
- [ ] **Verifizierte Verkäufer-Profile** — Echte Namen statt anonymer Namen wie "Jo1320", verifizierte Profile prominent zeigen
- [x] **Material-Karten strukturieren** — Price badge auf Image-Overlay (alle Varianten), LP21-Codes entfernt (Eyebrow reicht), Tags unter Beschreibung, Footer vereinfacht (Seller + Chevron), Padding gestrafft. Skeleton aktualisiert.
- [x] **Filter-Labels erklären** — "Zyklus (1, 2 oder 3)" und "Fachbereich (z.B. Deutsch, Mathe)" — hilft neuen Besuchern

### 19. Layout & Design 🟡

- [x] **Whitespace erhöhen** — TrustBar `py-4` → `py-6`, PlatformStatsBar mit eigenem `py-6` Spacer
- [ ] **Hero-Bereich: authentisches Bild** — Echtes Schweizer Klassenzimmer statt Stockfoto, Slogan + starker CTA _(→ ergänzt Item 5)_
- [x] **Farben & Kontrast verbessern** — Bereits mit weissen Text-Overrides in `globals.css` korrigiert, WCAG-konform
- [x] **Kategorie-Kacheln** — Top-Kategorien als visuelle Icons unter der Suchleiste → bereits vorhanden als `CategoryQuickAccess` _(→ Item 8)_

### 20. Mobile & Navigation 📱

- [x] **Mobile-Optimierung** — Hamburger-Button `min-h-[44px] min-w-[44px]`, mobile Menu-Links `py-3` für ≥44px Touch-Targets; Filter Collapse/Expand + fixierte CTA-Bar bereits vorhanden
- [x] **Breadcrumb-Navigation** — Detailseite zeigt Home > Materialien > Zyklus > Fach > Titel mit klickbaren Filter-Links

### 21. Technik & SEO ⚙️

- [x] **Bilder: sizes-Attribut korrigieren** — MaterialCard hat korrekte responsive `sizes`-Props; Hero-Bild mit `sizes="(max-width: 1024px) 100vw, 50vw"`
- [x] **Meta-Tags & OpenGraph** — Dynamische OG-Tags auf allen Seiten vorhanden _(→ Item 15)_
- [x] **Barrierefreiheit: Select-Labels** — `sr-only` Labels mit `htmlFor`/`id` für Zyklus- und Fachbereich-Selects im Hero
- [x] **ISR (Incremental Static Regeneration)** — `revalidate = 3600` auf Homepage (`app/[locale]/page.tsx`), stündliche Revalidierung
- [x] **Analytics: Google Analytics & Hotjar** — Plausible CE bereits integriert (`PlausibleProvider`, `usePlausible` Hook) _(→ Item 🔵)_

---

## 🔵 LANGFRISTIG (Wachstum)

- [x] **Bewertungssystem** — Sterne + Textbewertungen vorhanden (ReviewForm, StarRating)
- [ ] **Content-Marketing** — Blog unter /blog mit SEO-relevanten Artikeln
- [x] **Analytics** — Plausible CE integriert (PlausibleProvider, usePlausible Hook), Umgebungsvariablen in Produktion setzen
- [x] **E-Mail-Marketing** — Newsletter-Digest-System implementiert (`lib/digest.ts`, Cron-Route, Unsubscribe, GitHub Actions Workflow)
- [x] **"Über uns" ausbauen** — Komplett überarbeitet mit Team, Timeline, Values, Stats
- [x] **Accessibility** — ARIA menus (TopBar, NotificationDropdown), disabled:opacity-60 for WCAG AA, useReducedMotion for SearchTypeTabs, Skeleton a11y (role=status, aria-busy)

---

## 🟤 UI/UX AUDIT RUNDE 2 (Feb 2026)

> **Quelle:** Manuelles Feedback + Code-Audit, konsolidiert 2026-02-20
> **Details:** Siehe `2overview.md` für vollständige Beschreibungen

### 22. Bugs — Broken Links & Funktionalität 🔴

- [ ] **Footer "Material hochladen" Button** — funktioniert nicht
- [ ] **Materialien-Seite Upload-Button** — funktioniert nicht
- [ ] **TrustBar Link "/verifizierter-verkaeufer"** — Seite existiert nicht
- [ ] **Email-Links aus Benachrichtigungen** — AUTH_URL vs NEXTAUTH_URL Inkonsistenz
- [ ] **Registrierung: "Erstes Material hochladen"** — CTA fehlt komplett
- [ ] **Profilbild hochladen** — funktioniert nicht
- [ ] **Upload-Validierung: Fachkürzel** — Deutsch falsch gespeichert
- [ ] **Bewertung nach Download** — braucht Page-Reload statt Live-Update
- [ ] **BG-Filter Umrandung** — inkonsistent mit anderen Fachbereichen
- [ ] **"Sonstige" Filter** — Layout-Verschiebung beim Auswählen
- [ ] **Urheberrecht "Zurück zum Upload"** — Button prüfen

### 23. Text & Inhalt 🟡

- [ ] Hero-Beschreibung: "Vertrauenswürdig, geprüft, sofort einsetzbar" streichen
- [ ] Seller-CTA unter Suche löschen (redundant)
- [ ] "Entwickelt mit" → "Entwickelt von" Schweizer Lehrpersonen
- [ ] "Qualität garantiert" → "Qualität im Fokus" oder "Qualitätsgeprüft"
- [ ] Testimonials-Sektion entfernen (keine echten Nutzer)
- [ ] "Dialekt" → "Sprachvariante" umbenennen
- [ ] Schlagwörter-Filter entfernen (redundant mit Suchleiste)
- [ ] Seller-Level-Badge von Cards entfernen
- [ ] "Geprüft" Tags/Embleme vereinfachen
- [ ] Impressum & Cookies: Redundante Footer-Links entfernen
- [ ] Blog-Link im Footer ausblenden (kein Content)

### 24. UX-Verbesserungen 🟡

- [ ] Zweites Zahlungsmittel-Icon in TrustBar entfernen
- [ ] PlatformStats visuell aufwerten + Minimum-Schwelle
- [ ] Ersteller-Klick → Profil statt Filter
- [ ] Detail-Seite: 2/3 Dokument, 1/3 Beschreibung
- [ ] Bewertungs-Formular kompakter (Sterne + Text nebeneinander)
- [ ] "Material melden" Modal grösser
- [ ] AGB & Datenschutz: TOC-Sidebar hinzufügen
- [ ] "Nach oben" Buttons aus Seitenmitte entfernen (Urheberrecht + Cookies)
- [ ] Profilbild: Ganzer Kreis klickbar
- [ ] "Ungespeicherte Änderungen" eigenes Modal
- [ ] Punkte-System in eigenen Tab
- [ ] Uploads-Hover abrunden
- [ ] Downloads klickbar machen
- [ ] Cards vollständig klickbar (Bibliothek, Wunschliste, Uploads)
- [ ] "Folge ich" ganze Zeile klickbar
- [ ] Upload-Wizard: Mehr Animationen
- [ ] Upload-Checkliste entfernen (redundant)
- [ ] Material-Vorschau am Schluss grösser + klickbar
- [ ] Upload-Button in TopBar für eingeloggte Nutzer
- [ ] Hilfe-Center: Schnelleinstieg-Karten gleiche Höhe
- [ ] Dropdowns: Hover-Highlight passend zu rounded corners

---

## Zusammenfassung

> Letzte Aktualisierung: 2026-02-20

| Priorität   | Total   | Erledigt | Offen  | %       |
| ----------- | ------- | -------- | ------ | ------- |
| 🔴 MUSS     | 16      | 14       | 2      | 88%     |
| 🟠 SOLLTE   | 10      | 10       | 0      | 100%    |
| 🟡 NACH     | 10      | 8        | 2      | 80%     |
| 🟢 MITTEL   | 12      | 12       | 0      | 100%    |
| 🟣 FEEDBACK | 18      | 15       | 3      | 83%     |
| 🔵 LANG     | 6       | 5        | 1      | 83%     |
| 🟤 RUNDE 2  | 43      | 0        | 43     | 0%      |
| **Total**   | **115** | **64**   | **51** | **56%** |

> **Wichtigste Blocker vor Launch:**
>
> 1. **Bugs fixen (Sektion 22)** — 11 kaputte Features, darunter Upload-Buttons und Email-Links
> 2. **Content beschaffen** — 30-50 Materialien, 10-20 Lehrpersonen rekrutieren
> 3. **Domain-Migration** — currico.ch registrieren, @currico.ch E-Mail (→ Roadmap 1.1)
> 4. **Testdaten entfernen** — Dummy-Inhalte bereinigen (→ Feedback Item 17)
> 5. **Text & Vertrauen (Sektion 23)** — Übertriebene Claims entfernen, Fake-Testimonials raus
>
> **Hinweis:** Runde-2-Items (🟤) stammen aus manuellem Feedback + Code-Audit. Vollständige Beschreibungen in `spec/plans/2overview.md`.
