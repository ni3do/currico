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
- [~] Visuelle Hierarchie — Heading-Hierarchie standardisiert (Phase A UX-Polish), aber Button/Card-Konsistenz noch offen

### 14. Technisches & Performance ⭐⭐

- [x] `priority` auf Hero-Bild im Next.js `<Image />` — sizes-Prop und priority gesetzt
- [x] `generateMetadata` für dynamische Seitentitel — auf allen Seiten implementiert
- [x] Custom 404-Seite — `app/not-found.tsx` mit Navigation zur Startseite und Materialien
- [~] Lighthouse-Test, Core Web Vitals optimieren (LCP < 2.5s) — Homepage code-splitting implementiert, voller Audit nach Launch
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

## 🔵 LANGFRISTIG (Wachstum)

- [x] **Bewertungssystem** — Sterne + Textbewertungen vorhanden (ReviewForm, StarRating)
- [ ] **Content-Marketing** — Blog unter /blog mit SEO-relevanten Artikeln
- [x] **Analytics** — Plausible CE integriert (PlausibleProvider, usePlausible Hook), Umgebungsvariablen in Produktion setzen
- [x] **E-Mail-Marketing** — Newsletter-Digest-System implementiert (`lib/digest.ts`, Cron-Route, Unsubscribe, GitHub Actions Workflow)
- [x] **"Über uns" ausbauen** — Komplett überarbeitet mit Team, Timeline, Values, Stats
- [~] **Accessibility** — Viel bereits gemacht (aria-labels, focus traps, semantic HTML), Audit noch offen

---

## Zusammenfassung

> Letzte Aktualisierung: 2026-02-18

| Priorität | Total  | Erledigt | Offen | %       |
| --------- | ------ | -------- | ----- | ------- |
| 🔴 MUSS   | 16     | 14       | 2     | 88%     |
| 🟠 SOLLTE | 10     | 10       | 0     | 100%    |
| 🟡 NACH   | 10     | 8        | 2     | 80%     |
| 🟢 MITTEL | 12     | 10       | 2     | 83%     |
| 🔵 LANG   | 6      | 4        | 2     | 67%     |
| **Total** | **54** | **46**   | **8** | **85%** |

> **Wichtigste Blocker vor Launch:**
>
> 1. **Content beschaffen** — 30-50 Materialien, 10-20 Lehrpersonen rekrutieren
> 2. **Domain-Migration** — currico.ch registrieren, @currico.ch E-Mail (→ Roadmap 1.1)
>
> **Hinweis:** Viele offene Items sind Business/Ops (nicht Code) oder überschneiden sich mit `joelimprovements-status.md`
