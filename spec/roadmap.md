# Easy-Lehrer Swiss Market Roadmap

Strategic roadmap for building a Swiss-specific teaching materials marketplace that addresses local friction points international competitors cannot solve.

---

## Phase 0: Urgent Legal & Trust (SOFORT UMSETZEN)

**Goal:** Rechtssicherheit und Vertrauensbasis schaffen - absolute Priorität vor allen anderen Features.

### 0.1 Rechtstexte Live Schalten

**Problem:** Links im Footer (Impressum, Datenschutz, AGB) zeigen auf "Coming Soon"-Seiten. Das ist ein rechtliches Risiko.

- [ ] **Impressum erstellen und veröffentlichen**
  - Vollständiger Name des Unternehmens/Inhabers
  - Adresse (Schweizer Postadresse)
  - Kontaktdaten (E-Mail, optional Telefon)
  - UID-Nummer (falls vorhanden)
  - Handelsregister-Eintrag (falls GmbH)

- [ ] **Datenschutzerklärung live schalten**
  - Konform mit Schweizer nDSG (neues Datenschutzgesetz)
  - DSGVO-Abschnitt für EU-Nutzer
  - Auflistung aller Datenverarbeitungen
  - Kontaktdaten des Datenschutzverantwortlichen
  - Rechte der Nutzer (Auskunft, Löschung, etc.)

- [ ] **AGB (Allgemeine Geschäftsbedingungen) veröffentlichen**
  - Nutzungsbedingungen für Käufer
  - Lizenzumfang (persönlich vs. Schulweite Nutzung)
  - Rückgabe-/Erstattungsrichtlinien
  - Haftungsausschlüsse

- [ ] **Cookie-Consent-Banner implementieren**
  - Falls Google Analytics oder andere Tracking-Tools genutzt werden
  - Opt-in für nicht-essenzielle Cookies
  - Klare Kategorisierung (Notwendig, Statistik, Marketing)

### 0.2 Gründer-Transparenz ("Wer steckt dahinter?")

**Problem:** Die Seite erwähnt "zwei Gründer" (Informatiker & Pädagoge), bleibt aber anonym. Lehrpersonen sind kritisch - sie wollen wissen, wem sie vertrauen.

- [ ] **About-Seite mit echten Personen**
  - Namen der Gründer nennen
  - Echte Fotos (keine Stock-Fotos!)
  - Kurze Hintergrund-Story pro Person
  - Pädagogische Kompetenz hervorheben (z.B. "Simon, 10 Jahre Oberstufenlehrer")

- [ ] **Kontaktmöglichkeit prominent platzieren**
  - Direkter Kontakt zu den Gründern möglich machen
  - Zeigt: "Hier sind echte Menschen erreichbar"

### 0.3 Social Proof & Testimonials

**Problem:** Keine Nutzerstimmen auf der Seite - fehlendes Vertrauen.

- [ ] **Testimonials sammeln und anzeigen**
  - Zitate von Test-Nutzern oder Pilot-Schulen
  - Format: "Das Arbeitsblatt zur Französischen Revolution hat mir 2 Stunden gespart" - Lehrperson XY, Kanton ZH
  - Auf Landing Page und About-Seite einbinden

- [ ] **LP21-Qualitätsversprechen konkretisieren**
  - Konkretes Beispiel zeigen, wie LP21-Kompetenzverweise im Material eingebaut sind
  - "Muster-Material" verlinken oder auf About-Seite zeigen

---

## Phase 0.5: UX/UI & Content-Verbesserungen

**Goal:** Generische Optik durch authentische, vertrauensbildende Elemente ersetzen.

### 0.5.1 Bildsprache verbessern

**Problem:** Stock-Fotos ("Entspannte Lehrperson mit Tablet") wirken unpersönlich und werblich.

- [ ] **Stock-Fotos durch echte Inhalte ersetzen**
  - Screenshots der echten Plattform zeigen
  - Beispiel-PDFs oder Materialvorschauen einbinden
  - Zeigen, wie ein fertiges Material aussieht

### 0.5.2 Text-Auflockerung & Scannability

**Problem:** "Unsere Mission" und "Warum EasyLehrer?" Bereiche sind textlastig.

- [ ] **Icons für USP-Punkte hinzufügen**
  - Schweizer-Kreuz-Icon für "Schweizer Qualität"
  - Uhr-Icon für "Zeitgewinn"
  - Prüfsiegel-Icon für "LP21-geprüft"
  - Macht die Seite scannbarer

### 0.5.3 Call-to-Action optimieren

- [ ] **Zusätzlicher CTA: "Gratis-Beispiel herunterladen"**
  - Senkt die Hürde für Registrierung
  - Lead-Generierung ohne Kaufzwang

### 0.5.4 Der "Schweiz-Faktor" visuell

**Kontext:** Explizites Werben mit "Kein ß, sondern ss" - das muss sichtbar sein.

- [ ] **Visueller Vergleich erstellen**
  - Kleine Grafik: "Deutsche Plattform vs. EasyLehrer"
  - Zeigt Unterschiede auf einen Blick (ß vs. ss, Euro vs. CHF, etc.)

### 0.5.5 FAQ-Sektion

**Problem:** Lehrpersonen haben spezifische Fragen, die nirgends beantwortet werden.

- [ ] **FAQ-Bereich erstellen**
  - "Darf ich das Material an Kollegen weitergeben?"
  - "Welche Dateiformate gibt es (Word/PDF)?"
  - "Ist es editierbar?"
  - "Wie funktioniert die Bezahlung über die Schule?"
  - "Was bedeutet LP21-konform?"

### 0.5.6 Öffentliche Roadmap

- [ ] **"Coming Soon"-Bereich auf der Seite**
  - Zeigt: "Was kommt als Nächstes?" (z.B. "Bald auch Französisch-Lehrmittel")
  - Signalisiert: Die Plattform lebt und entwickelt sich weiter

---

## Phase 1: Business & Legal Foundation

**Goal:** Create an entity that schools can legally pay and teachers can legally trust.

### 1.1 Corporate Structure

- [ ] Register as GmbH (Sàrl) - min. 20k CHF capital
  - Why: Swiss schools/cantons rarely work with "Einzelfirma" due to liability concerns
  - Register in Handelsregister (Commercial Register)
- [ ] Open business bank account with Swiss IBAN
- [ ] Set up accounting system for CHF transactions

### 1.2 VAT & Merchant of Record Setup

**Context:** As of Jan 2025, Swiss VAT laws for electronic platforms require you to act as seller of record.

- [ ] Register for MWST (VAT) immediately
- [ ] Set up "Merchant of Record" model:
  - Teacher sells to Platform (Royalties)
  - Platform sells to School (Official Invoice)
- [ ] Configure invoice generation with valid Swiss VAT number
- [ ] **B2B Selling Point:** Schools receive one invoice from your Swiss company, not separate receipts from individual teachers

### 1.3 Legal Terms of Service

- [ ] Draft Terms of Service with IP lawyer
- [ ] Create "Copyright Indemnification" clause
  - Teachers warrant they hold rights to uploads
  - Define line between "legal teaching use" and copyright infringement
- [ ] Create mandatory "Seller Agreement" checkbox in sign-up flow
- [ ] Draft Privacy Policy (FADP/DSG compliant - Swiss data protection)
- [ ] Create refund/dispute resolution policy

**Legal Templates Needed:**
| Document | Purpose |
|----------|---------|
| Seller Agreement | IP warranty, payout terms, content guidelines |
| Buyer Terms | License scope, school vs personal use |
| Privacy Policy | Data handling, Swiss hosting declaration |
| Cookie Policy | Analytics, essential cookies only |

---

## Phase 2: Data Architecture & Curriculum Mapping

**Goal:** Build the navigation system that makes the platform feel native to Swiss teachers.

### 2.1 Lehrplan 21 (LP21) Data Structure

**Challenge:** LP21 is hierarchical. A simple "Math" tag is useless.

```
Database Schema for LP21:
├── Fachbereich (Subject Area) - e.g., Mathematik
│   ├── Kompetenzbereich (Competency Area) - e.g., Zahl und Variable
│   │   ├── Handlungs-/Themenaspekt (Action/Theme) - e.g., Operieren und Benennen
│   │   │   └── Kompetenzstufe (Competency Level) - e.g., MA.1.A.1
```

- [ ] Create `Curriculum` model in Prisma schema
- [ ] Create `CurriculumCompetency` model for competency codes
- [ ] Import LP21 structure (German-speaking regions)
- [ ] Import PER structure (Plan d'études romand - French-speaking regions)
- [ ] Create curriculum selection UI component
- [ ] Add competency search/autocomplete

**LP21 Subject Areas (Fachbereiche):**
| Code | German | French (PER) |
|------|--------|--------------|
| MA | Mathematik | Mathématiques |
| D | Deutsch | - |
| F | Französisch | Français |
| E | Englisch | Anglais |
| NMG | Natur, Mensch, Gesellschaft | Sciences de la nature |
| BG | Bildnerisches Gestalten | Arts visuels |
| TTG | Textiles und Technisches Gestalten | Activités créatrices |
| MU | Musik | Musique |
| BS | Bewegung und Sport | Éducation physique |
| MI | Medien und Informatik | MITIC |

### 2.2 Cantonal Layer (Secret Sauce)

**Insight:** Education is cantonal. A Zurich teacher uses "Zahlenbuch"; Bern might use another.

- [ ] Create `Lehrmittel` (Textbook) model
- [ ] Build "Textbook Compatibility" filter
- [ ] Map popular textbooks to cantons
- [ ] Add "Aligned with Lehrmittel..." field to resources

**Priority Textbooks to Map:**
| Subject | Textbook | Cantons |
|---------|----------|---------|
| Math | Schweizer Zahlenbuch | ZH, AG, SG |
| French | Mille feuilles | ZH, BE |
| French | Dis donc! | ZH, SG |
| German | Die Sprachstarken | ZH, AG |
| NMG | NaTech | Multiple |

### 2.3 Canton-Specific Features

- [ ] Add canton selector to user profile
- [ ] Create canton-specific homepage collections
- [ ] Map cantonal holidays/events (Sechseläuten ZH, Fasnacht BS)
- [ ] Track cantonal email domains for "Verified Teacher" badges

**Cantonal Email Domains:**

```
@vsa.zh.ch - Zürich
@be.ch - Bern
@sg.ch - St. Gallen
@lu.ch - Luzern
@edu.bs.ch - Basel-Stadt
```

---

## Phase 3: Platform Development & UX

**Goal:** Build the MVP with "Swiss Quality" UI.

### 3.1 Safe Upload Workflow

3-step upload wizard:

- [ ] **Step 1: File Upload**
  - Drag & drop PDF/DOCX
  - Client-side preview with pdf.js
  - Heavy watermarking ("Vorschau") to prevent screenshot theft

- [ ] **Step 2: Curriculum Tagging**
  - User selects Cycle -> Subject -> Auto-suggest competencies
  - Textbook alignment selector
  - Canton relevance tags

- [ ] **Step 3: Legal Check**
  - [ ] "I created the images myself or used CC0"
  - [ ] "I did not scan textbook pages"
  - [ ] "I have not used trademarked characters (e.g., Disney)"
  - [ ] "This material does not contain Eszett (ß)"

### 3.2 School-Ready Checkout

**Requirement:** Schools cannot pay by credit card. They need a bill.

- [ ] **Swiss QR-Bill Integration**
  - Use `node-swissqrbill` or similar library
  - Generate PDF invoice with valid QR code
  - "Purchase for School" flow generates printable invoice

- [ ] **TWINT Integration** (70%+ of Swiss mobile payments)
  - Via Stripe TWINT payment method
  - QR code for desktop, app redirect for mobile

- [ ] **Payment Method Priority:**
  1. TWINT (individual teachers, quick purchases)
  2. Card (international, convenience)
  3. Invoice/QR-Bill (school purchases, requires approval)

### 3.3 Dual-Language Interface

**Status:** ✅ Already using next-intl with de/en

- [ ] Ensure all database fields support French labels
- [ ] Add French (fr) locale to next-intl
- [ ] Translate UI strings to French
- [ ] Translate curriculum labels (Mathematik = Mathématiques)
- [ ] Support Italian (future - Ticino market)

### 3.4 Swiss Quality Indicators

- [ ] **No-Eszett (ß) Policy**
  - Switzerland does not use ß - use "ss" instead
  - Flag/reject uploads containing ß
  - Add automated check in upload flow

- [ ] **Trust Badges:**
  - [ ] "Swiss Server" badge in footer (e.g., "Hosted in Lausanne")
  - [ ] "Verified by [Canton] Teachers" on products rated by cantonal email users
  - [ ] "LP21 Aligned" badge for properly tagged resources
  - [ ] "Swiss Quality" badge for admin-verified content

---

## Phase 4: Supply Side & Quality Assurance

**Goal:** Secure 500 high-quality resources before public launch.

### 4.1 Golden 50 Recruitment Drive

Target: 50 top Swiss teachers already selling on German platforms (eduki) or sharing on Instagram/Pinterest.

- [ ] Identify target creators from:
  - eduki.com Swiss sellers
  - Instagram #lehrermaterial #unterrichtsmaterial
  - Pinterest Swiss teacher boards
  - Facebook "Lehrerzimmer" groups

- [ ] **Recruitment Pitch:**

  > "Stop losing 50% to platforms that don't understand Swiss invoicing.
  > Join as 'Founding Creator' for 85% royalties and legal protection."

- [ ] **Concierge Service:** Offer to manually migrate their files
- [ ] Create "Founding Creator" badge/tier
- [ ] Set up referral program for creators

### 4.2 Swiss Quality Review Process

- [ ] Hire 2 part-time moderators (retired teachers or PH students)
- [ ] Create quality checklist:
  - [ ] No Eszett (ß) - reject if found
  - [ ] Swiss German terminology (not High German)
  - [ ] LP21/PER alignment verified
  - [ ] No copyright violations visible
  - [ ] Preview images are clear

- [ ] **Terminology Guide:**
      | Reject | Accept |
      |--------|--------|
      | Jänner | Januar |
      | ß | ss |
      | Samstag | Samstag ✓ (both OK in CH) |

### 4.3 Content Categories

Priority categories for launch:

1. [ ] Mathematik (Zyklus 1-2) - Zahlenbuch aligned
2. [ ] Deutsch (Rechtschreibung, Lesen)
3. [ ] NMG (Sachunterricht)
4. [ ] Französisch (Mille feuilles, Dis donc!)
5. [ ] Classroom management (Belohnungssysteme, Klassenzimmer)

---

## Phase 5: Launch & Marketing

**Goal:** Penetrate the "Lehrerzimmer" (Teacher's Room).

### 5.1 Secretariat Strategy

**Insight:** Teachers find resources; Secretaries pay for them.

- [ ] Create physical "Procurement Pack" for school secretariats
- [ ] Content: "How to reimburse teacher expenses legally. A guide for School Administrators."
- [ ] Include platform info card and QR code
- [ ] Target large schools in launch canton

### 5.2 Canton-Specific Launch

**Strategy:** Don't launch Switzerland-wide. Launch "Zurich-First" or "Bern-First."

- [ ] Choose launch canton (recommendation: Zurich - largest market)
- [ ] Align homepage collections with cantonal calendar:
  - Sechseläuten (April) - Zurich
  - Fasnacht (February/March) - Basel, Luzern
  - Räbeliechtli (November) - Swiss German regions
  - 1. August (National Day) - All

- [ ] Partner with cantonal teacher association (LCH Sektion)
- [ ] Attend cantonal teacher conferences (Schulkongress)

### 5.3 Digital Marketing

- [ ] Create Instagram presence @easylehrer
- [ ] Pinterest boards with free samples
- [ ] Facebook group for Swiss teachers
- [ ] Newsletter for product updates
- [ ] SEO for "Unterrichtsmaterial Schweiz", "Arbeitsblätter LP21"

### 5.4 Trust Building

- [ ] Launch with 100% Swiss-hosted infrastructure
- [ ] Display data protection compliance (DSG/FADP)
- [ ] Publish transparent fee structure
- [ ] Create teacher testimonial videos
- [ ] Partner with 1-2 well-known Swiss edu-influencers

---

## Technical Implementation Checklist

### Database Changes Needed

```prisma
// Add to schema.prisma

model Curriculum {
  id          String @id @default(cuid())
  code        String @unique // e.g., "LP21", "PER"
  name_de     String
  name_fr     String?
  name_it     String?
  region      String // "de-CH", "fr-CH", "it-CH"

  subjects    CurriculumSubject[]
}

model CurriculumSubject {
  id            String @id @default(cuid())
  code          String // e.g., "MA", "D", "NMG"
  name_de       String
  name_fr       String?

  curriculum_id String
  curriculum    Curriculum @relation(fields: [curriculum_id], references: [id])

  competencies  CurriculumCompetency[]
}

model CurriculumCompetency {
  id          String @id @default(cuid())
  code        String @unique // e.g., "MA.1.A.1"
  description_de String
  description_fr String?
  cycle       Int // 1, 2, or 3

  subject_id  String
  subject     CurriculumSubject @relation(fields: [subject_id], references: [id])

  resources   Resource[] @relation("ResourceCompetencies")
}

model Lehrmittel {
  id          String @id @default(cuid())
  name        String
  publisher   String
  subject     String
  cantons     String[] // Which cantons use this textbook

  resources   Resource[] @relation("ResourceLehrmittel")
}

// Update Resource model
model Resource {
  // ... existing fields ...

  // Add curriculum alignment
  competencies    CurriculumCompetency[] @relation("ResourceCompetencies")
  lehrmittel      Lehrmittel[] @relation("ResourceLehrmittel")

  // Swiss quality checks
  eszett_checked  Boolean @default(false)
  swiss_verified  Boolean @default(false)
}

// Update User model for Stripe Connect
model User {
  // ... existing fields ...

  stripe_account_id          String?
  stripe_onboarding_complete Boolean @default(false)
}

// Update Transaction for payment tracking
model Transaction {
  // ... existing fields ...

  stripe_payment_intent_id   String? @unique
  stripe_checkout_session_id String?
  invoice_number             String? // For QR-Bill
  invoice_pdf_url            String?
}
```

### API Routes to Create

| Route                                        | Purpose                      |
| -------------------------------------------- | ---------------------------- |
| `POST /api/payments/create-checkout-session` | Initiate purchase            |
| `POST /api/payments/webhook`                 | Stripe webhook handler       |
| `POST /api/payments/create-invoice`          | Generate QR-Bill             |
| `POST /api/seller/connect`                   | Onboard seller to Stripe     |
| `GET /api/curriculum/search`                 | Search LP21 competencies     |
| `GET /api/curriculum/subjects`               | List subjects by curriculum  |
| `POST /api/upload/validate`                  | Check for ß and other issues |

### Environment Variables

```env
# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Swiss QR-Bill
QR_BILL_IBAN=CH...
QR_BILL_CREDITOR_NAME="Easy Lehrer GmbH"
QR_BILL_CREDITOR_ADDRESS="..."

# VAT
VAT_NUMBER=CHE-...
VAT_RATE=8.1 # Current Swiss VAT rate
```

---

## Summary Checklist

### Phase 0: Urgent Legal & Trust (SOFORT)

- [ ] Impressum live schalten (Name, Adresse, Kontakt)
- [ ] Datenschutzerklärung veröffentlichen (nDSG + DSGVO)
- [ ] AGB veröffentlichen
- [ ] Cookie-Consent-Banner (falls Tracking aktiv)
- [ ] Gründer mit Namen und Fotos auf About-Seite
- [ ] Testimonials/Social Proof einbinden
- [ ] LP21-Beispiel konkret zeigen

### Phase 0.5: UX/UI Verbesserungen

- [ ] Stock-Fotos durch echte Screenshots ersetzen
- [ ] Icons für USP-Punkte hinzufügen
- [ ] "Gratis-Beispiel herunterladen" CTA
- [ ] Schweiz vs. Deutschland Vergleichsgrafik
- [ ] FAQ-Sektion erstellen
- [ ] Öffentliche Roadmap / "Coming Soon" Bereich

### Phase 1: Legal Foundation

- [ ] GmbH/AG founded & registered in Handelsregister
- [ ] VAT (MWST) registered
- [ ] Business bank account opened
- [ ] Terms of Service drafted with IP lawyer
- [ ] Seller Agreement created
- [ ] Privacy Policy (DSG compliant)

### Phase 2: Data Architecture

- [ ] LP21 data tree imported and mapped to SQL
- [ ] PER (French curriculum) imported
- [ ] Cantonal textbook mapping complete
- [ ] Curriculum selection UI component built

### Phase 3: Platform Development

- [ ] QR-Bill generation working
- [ ] TWINT integrated via Stripe
- [ ] Upload wizard with legal checks
- [ ] No-Eszett (ß) policy enforced
- [ ] French locale added

### Phase 4: Content & Quality

- [ ] 50 founding creators onboarded
- [ ] 500 resources uploaded
- [ ] Moderation team hired
- [ ] Quality review process documented

### Phase 5: Launch

- [ ] Launch canton selected
- [ ] Physical mailers sent to school secretariats
- [ ] Social media presence established
- [ ] First marketing campaign launched

---

## Timeline Notes

This roadmap is organized by phases, not weeks. Implementation order matters more than calendar dates. Focus on completing each phase before moving to the next:

0. **Phase 0 ist NICHT optional** - Rechtstexte (Impressum, Datenschutz, AGB) sind gesetzlich vorgeschrieben. Ohne diese Seiten ist der Betrieb in der DACH-Region riskant. Gründer-Transparenz und Social Proof sind essenziell für das Vertrauen der Zielgruppe Lehrpersonen.
1. **Phase 0.5 parallel zu Phase 1** - UX-Verbesserungen können parallel zur Business-Gründung umgesetzt werden
2. **Legal foundation must come first** - Cannot accept payments without proper structure
3. **Data architecture before UI** - Curriculum system affects all product features
4. **Supply before demand** - Need quality content before marketing to buyers
5. **Canton-first before national** - Concentrated launch beats thin coverage

**Zusammenfassung der Analyse:** Die Basis ("Pitch") stimmt, aber es fehlt das Gesicht hinter der Plattform und die rechtliche Sicherheit. Ersetzt die Anonymität durch Persönlichkeit und die Platzhalter durch echte Rechtsseiten.

Prioritize based on dependencies, not arbitrary deadlines.
