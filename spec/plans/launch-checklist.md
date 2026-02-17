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
- [ ] Cookie-Banner, der Analytics wirklich blockiert bis zur Zustimmung — **FEHLT: kein Consent-Banner vorhanden, nur Cookie-Richtlinien-Seite**
- [x] AGB für Marktplatz (Urheberrecht, Haftung, Rückgabe, Streitbeilegung) — `/agb` Seite vorhanden
- [ ] Professionelle E-Mail-Domain (@currico.ch) — hängt von Domain-Migration ab (→ Roadmap 1.1)

### 3. Texte & Wording überarbeiten ⭐⭐⭐⭐⭐

> Vertrauen entsteht durch Sprache.

- [ ] "Passives Einkommen" streichen → "Faire Entlohnung für Ihr Material" — noch vorhanden in `messages/de.json:1842`
- [ ] "Von Lehrpersonen für Lehrpersonen" kommt 3× vor → variieren — `de.json` Zeilen 211, 388, 392
- [ ] Vage Aussagen konkretisieren: "Qualitätsgeprüft" → Prüfprozess erklären; "Sicheres Hosting" → "Gehostet bei Infomaniak in Genf"
- [ ] Headline konkretisieren: "Fertige Arbeitsblätter, Prüfungen und Unterrichtseinheiten – passend zum Lehrplan 21"
- [~] Durchgehend "Lehrpersonen" und "Sie"-Ansprache — meist formal "Sie", aber Hero-Suche nutzt "du" (`de.json:185`)
- [ ] 70%-Provision mit konkretem Rechenbeispiel zeigen (CHF 5 → CHF 3.50 pro Verkauf)

### 4. Leere Sektionen entfernen ⭐⭐⭐⭐

> Leere Regale schrecken sofort ab.

- [x] "Empfohlene Materialien" Fallback — Empty-State mit CTA vorhanden
- [ ] Doppelte Links reduzieren — Audit nötig
- [ ] Sprachumschalter entfernen, wenn nur Deutsch verfügbar — `LocaleSwitcher.tsx` sichtbar in TopBar, aber nur DE aktiv
- [ ] Tote UI-Elemente auditieren und entfernen

---

## 🟠 SOLLTE VOR LAUNCH (hohe Wirkung)

### 5. Hero-Bereich überarbeiten ⭐⭐⭐⭐

- [ ] Dunkles Overlay auf Hero-Bild für Lesbarkeit (bg-black/40) — **aktuell kein Overlay**
- [x] CTA-Button visuell hervorheben — "Jetzt Material finden" + "Mehr erfahren" vorhanden
- [ ] Klarer Nutzen in 3 Sekunden: Was bekomme ich hier?
- [ ] Optional: Mockup der Plattform statt generisches Stock-Foto

### 6. Suchleiste vereinfachen ⭐⭐⭐⭐

- [ ] "Kompetenz"-Filter aus dem Hero entfernen (zu granular für Einstieg) — **aktuell 3 Dropdowns im Hero: Zyklus, Fach, Kompetenz**
- [ ] Startseite: nur Stichwortsuche + Zyklus
- [ ] Kompetenz-Filter auf Ergebnisseite verschieben (Faceted Search)

### 7. LP21-Konformität prominent zeigen ⭐⭐⭐⭐

- [x] Auf jeder Material-Detailseite als Tag/Badge (z.B. "MA.1.A.2") — Subject-Pills mit LP21-Farben, Cycle-Pills, Kompetenz-Codes als Tags
- [x] Das ist der grösste USP gegenüber deutschen Plattformen – zeig es! — prominent in Detail-Seite, Filter-System, und jetzt auch auf MaterialCards (bis zu 2 Codes pro Karte)

### 8. Vorschau-Funktion für Materialien ⭐⭐⭐⭐

- [x] Mindestens erste Seite als Thumbnail — Auto-generierte PDF-Thumbnails bei Upload (`preview-generator.ts`)
- [x] PDF-Viewer mit 2–3 Seiten — PreviewGallery mit Wasserzeichen (Seite 1 klar, Rest geblurred)
- [ ] "Beliebte Fächer" als klickbare Kacheln auf Startseite

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
- [ ] Konkretes Rechenbeispiel prominent platzieren (70% Provision)

### 12. Navigation & Footer verbessern ⭐⭐⭐

- [x] Icons im Header für Anmelden/Registrieren — TopBar mit User-Icon, Bell-Dropdown
- [~] Footer: Kurzbeschreibung, Navigation, Kontakt, Rechtliches, Social Links — Navigation + Legal vorhanden, aber **kein Kontakt-Info, keine Social-Links, keine Kurzbeschreibung**
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
- [ ] Lighthouse-Test, Core Web Vitals optimieren (LCP < 2.5s)
- [x] WebP/AVIF, Lazy Loading — Next.js Image mit automatischer Optimierung

### 15. SEO-Grundlagen ⭐⭐

- [x] Meta-Title & Description pro Seite — alle Seiten haben `generateMetadata()`
- [x] Open-Graph-Tags für Social Sharing — OG type, images, Twitter cards
- [x] Schema.org-Markup (Organization, SearchAction, Product) — JSON-LD auf vielen Seiten
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
- [ ] **Analytics** — Matomo oder Plausible (nDSG-freundlicher als Google Analytics); aktuell nur Sentry
- [ ] **E-Mail-Marketing** — Newsletter-Signup, Willkommens-Sequenz (→ Newsletter-System offen)
- [x] **"Über uns" ausbauen** — Komplett überarbeitet mit Team, Timeline, Values, Stats
- [~] **Accessibility** — Viel bereits gemacht (aria-labels, focus traps, semantic HTML), Audit noch offen

---

## Zusammenfassung

| Priorität | Total  | Erledigt | Offen  | %       |
| --------- | ------ | -------- | ------ | ------- |
| 🔴 MUSS   | 16     | 4        | 12     | 25%     |
| 🟠 SOLLTE | 10     | 6        | 4      | 60%     |
| 🟡 NACH   | 9      | 6        | 3      | 67%     |
| 🟢 MITTEL | 12     | 10       | 2      | 83%     |
| 🔵 LANG   | 6      | 2        | 4      | 33%     |
| **Total** | **53** | **28**   | **25** | **53%** |

> **Wichtigste Blocker vor Launch:** Domain-Migration (@currico.ch), Content beschaffen, Wording-Überarbeitung
