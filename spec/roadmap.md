# EasyLehrer Product Roadmap

**Version:** 2.0
**Last Updated:** January 2026
**Status:** MVP Phase
**Target Audience:** Swiss teachers (Lehrplan 21)

---

## Executive Summary

This roadmap addresses the critical gap between our current MVP state and a production-ready platform that Swiss teachers will trust. The focus is on three pillars: **Trust**, **Supply**, and **Conversion**.

**Current State:** Hosted on `easy-lehrer.siwachter.com` (subdomain)
**Goal:** Launch-ready platform with Swiss credibility and legal safety

---

## Phase 1: Critical Trust & Core Functionality

**Goal:** Establish credibility and core search/browse experience before full launch.
**Priority:** MUST complete before marketing push.

---

### 1.1 Domain & Branding Migration

| Field            | Value         |
| ---------------- | ------------- |
| **Priority**     | P0 - Critical |
| **Effort**       | Medium        |
| **Dependencies** | None          |

**User Story:**

> As a Swiss teacher visiting the platform, I want to see a `.ch` domain so that I trust this is a legitimate Swiss service and not a student project or foreign platform.

**Problem:**
The current subdomain (`easy-lehrer.siwachter.com`) signals "hobby project" to skeptical teachers. Swiss educators expect professional, local platforms.

**Acceptance Criteria:**

- [ ] Register `easylehrer.ch` domain
- [ ] Configure DNS and SSL certificates
- [ ] Set up 301 redirects from old subdomain
- [ ] Update all internal links and OAuth callbacks
- [ ] Update email sending domain (if applicable)
- [ ] Update legal documents with new domain

**Technical Implementation Notes:**

```
1. Domain Registration
   - Register via Infomaniak or Hostpoint (Swiss registrars)
   - Cost: ~15 CHF/year

2. DNS Configuration
   - Point A record to Dokploy server IP
   - Configure CNAME for www subdomain
   - Set up CAA record for SSL

3. Application Updates
   - Update NEXTAUTH_URL in .env.production
   - Update all OAuth provider redirect URIs (Google, Microsoft, edu-ID)
   - Update Stripe webhook endpoints
   - Run migration script to update stored URLs in database

4. Redirect Strategy
   - Configure nginx/Caddy to 301 redirect old domain
   - Maintain old domain for 12 months minimum
```

---

### 1.2 Lehrplan 21 Search & Filtering

| Field            | Value            |
| ---------------- | ---------------- |
| **Priority**     | P0 - Critical    |
| **Effort**       | Large            |
| **Dependencies** | LP21 data import |

**User Story:**

> As a Cycle 2 math teacher, I want to filter resources by "Zyklus 2" and competence code "MA.1.A.1" so that I find materials that exactly match my lesson plan requirements.

**Problem:**
Current search is too generic. Swiss teachers navigate by LP21 structure, not generic categories.

**Acceptance Criteria:**

- [ ] Implement Zyklus filter (Cycle 1, 2, 3)
- [ ] Implement LP21 competence code search with autocomplete
- [ ] Add "Dialect" toggle: Schweizerdeutsch vs. Hochdeutsch
- [ ] Move search bar to Hero section
- [ ] Add integrated dropdowns for Subject + Cycle in hero
- [ ] Search results respect all active filters

**Technical Implementation Notes:**

```prisma
// Add to schema.prisma
model Resource {
  // ... existing fields
  dialect     Dialect @default(HIGH_GERMAN)
}

enum Dialect {
  HIGH_GERMAN      // Hochdeutsch
  SWISS_GERMAN     // Schweizerdeutsch
  BOTH             // Works for both
}
```

```typescript
// Hero search component structure
// components/search/HeroSearch.tsx

interface HeroSearchProps {
  onSearch: (params: SearchParams) => void;
}

interface SearchParams {
  query: string;
  subject?: string; // MA, D, NMG, etc.
  cycle?: 1 | 2 | 3;
  competenceCode?: string; // MA.1.A.1
  dialect?: "HIGH_GERMAN" | "SWISS_GERMAN" | "BOTH";
}

// API endpoint update
// GET /api/resources?cycle=2&subject=MA&competence=MA.1.A.1&dialect=SWISS_GERMAN
```

```
UI Changes:
1. Hero Section
   - Search bar with placeholder: "Suche nach Thema, Kompetenz..."
   - Inline dropdowns: [Alle Fächer ▼] [Alle Zyklen ▼]
   - Competence code input with autocomplete (fetches from /api/curriculum/search)

2. Filter Sidebar (existing)
   - Add "Sprache/Dialekt" toggle section
   - LP21 competence tree selector (expandable)

3. Search Results
   - Show matched competence codes as pills
   - Highlight dialect badge when filtered
```

---

### 1.3 Product Display & Preview System

| Field            | Value                      |
| ---------------- | -------------------------- |
| **Priority**     | P0 - Critical              |
| **Effort**       | Large                      |
| **Dependencies** | S3 storage, PDF processing |

**User Story:**

> As a teacher browsing resources, I want to see actual preview images of the worksheet so that I can assess the font size, layout, and visual quality before purchasing.

**Problem:**
Generic stock icons (pencil for Math, book for German) hide the actual quality of materials. Teachers cannot assess if the style matches their needs.

**Acceptance Criteria:**

- [ ] Replace category stock images with actual content previews
- [ ] Auto-generate thumbnail from first page of PDF on upload
- [ ] Implement "Blur Preview" for full document (first page clear, rest blurred)
- [ ] Add "First Page Free" viewer option for sellers
- [ ] Preview images are watermarked with "VORSCHAU"
- [ ] Mobile-optimized preview gallery

**Technical Implementation Notes:**

```
1. PDF Thumbnail Generation (Upload Flow)
   - Use pdf-lib or pdf.js for client-side preview
   - Generate 3 preview images: thumbnail (300px), card (600px), full (1200px)
   - Server-side: Use sharp + pdf-poppler for production-quality renders
   - Store in S3 bucket: /previews/{resourceId}/thumb.webp

2. Blur Preview Implementation
   - CSS filter: blur(8px) for pages 2+
   - Or: Generate blurred versions server-side for performance
   - Overlay with "Kaufen für vollständige Ansicht"

3. Preview Gallery Component
   // components/resource/PreviewGallery.tsx
   - Swipeable on mobile (use embla-carousel)
   - Zoom on desktop (react-medium-image-zoom)
   - Page indicator: "Seite 1 von 5"

4. Database Changes
   model Resource {
     // ... existing
     previewImages    String[]  // Array of S3 URLs
     firstPageFree    Boolean   @default(false)
     previewGenerated Boolean   @default(false)
   }

5. Background Job
   - Queue preview generation on upload
   - Use Bull/BullMQ with Redis
   - Retry failed generations 3x
```

---

## Phase 2: Seller Acquisition & Legal Safety

**Goal:** Remove friction for teachers to become sellers. Address copyright fears.
**Priority:** Complete before seller recruitment campaign.

---

### 2.1 Seller Safety Wizard

| Field            | Value              |
| ---------------- | ------------------ |
| **Priority**     | P1 - High          |
| **Effort**       | Medium             |
| **Dependencies** | Upload flow exists |

**User Story:**

> As a teacher uploading my first resource, I want clear guidance on copyright rules so that I feel confident I won't face legal trouble for selling my materials.

**Problem:**
Teachers are terrified of copyright infringement. They worry about using fonts, images, or accidentally including copyrighted content.

**Acceptance Criteria:**

- [ ] Add "Copyright Check" step to upload wizard
- [ ] Checkbox confirmations for ownership of images/fonts
- [ ] Link to "Copyright Guide for Teachers" (static page)
- [ ] Warning about common pitfalls (Disney characters, textbook scans)
- [ ] Checkbox: "This material does not contain Eszett (ß)"
- [ ] Save confirmation state to database for legal protection

**Technical Implementation Notes:**

```typescript
// Upload wizard step 4: Legal Check
// app/[locale]/dashboard/upload/LegalCheckStep.tsx

interface LegalConfirmations {
  ownsImages: boolean;        // "Ich besitze alle verwendeten Bilder"
  ownsFonts: boolean;         // "Ich habe Nutzungsrechte für alle Schriftarten"
  noTextbookScans: boolean;   // "Enthält keine gescannten Lehrmittelseiten"
  noTrademarks: boolean;      // "Enthält keine geschützten Figuren (Disney, etc.)"
  noEszett: boolean;          // "Enthält kein Eszett (ß)"
  acceptsTerms: boolean;      // "Ich akzeptiere die Verkäufer-AGB"
}

// Store in database
model Resource {
  // ... existing
  legalConfirmations Json?    // Store the confirmations object
  legalConfirmedAt   DateTime?
}
```

```
Copyright Guide Page:
- Create /[locale]/seller/copyright-guide
- Sections:
  1. "Was darf ich verkaufen?" (eigene Arbeitsblätter, ✓)
  2. "Was darf ich NICHT verkaufen?" (Lehrmittel-Kopien, ✗)
  3. "Bilder: Was ist erlaubt?" (CC0, eigene Fotos, ✓)
  4. "Schriftarten: Darauf achten" (Google Fonts ✓, gekaufte mit Lizenz ✓)
  5. "Häufige Fehler" (Disney, Pixar, Lehrmittel-Scans)
```

---

### 2.2 Seller Value Proposition Reframe

| Field            | Value     |
| ---------------- | --------- |
| **Priority**     | P1 - High |
| **Effort**       | Small     |
| **Dependencies** | None      |

**User Story:**

> As a teacher considering selling materials, I want to understand how much I'll earn and feel good about helping colleagues so that I'm motivated to upload my resources.

**Problem:**
Current messaging focuses on "Make Money" which feels transactional. Teachers respond better to community contribution framing.

**Acceptance Criteria:**

- [ ] Update "Become a Seller" page copy
- [ ] Highlight 70% commission prominently (comparison to competitors)
- [ ] Add "Help colleagues & get rewarded" messaging
- [ ] Show earnings calculator ("10 Verkäufe à 5 CHF = 35 CHF für dich")
- [ ] Add testimonials from pilot sellers

**Technical Implementation Notes:**

```
1. Page Updates: /[locale]/become-seller

   Hero Section:
   - Headline: "Teile dein Wissen. Verdiene dabei."
   - Subhead: "70% Provision – mehr als bei jeder anderen Plattform"

2. Comparison Table Component:
   | Platform      | Deine Provision |
   |---------------|-----------------|
   | EasyLehrer    | 70%            |
   | eduki.com     | 50%            |
   | Lehrermarkt   | 60%            |

3. Earnings Calculator:
   // components/seller/EarningsCalculator.tsx
   - Slider: "Preis pro Material" (1-50 CHF)
   - Slider: "Verkäufe pro Monat" (1-100)
   - Output: "Dein monatlicher Verdienst: X CHF"

4. Copy Updates (messages/de.json):
   "seller.cta.primary": "Kolleg:innen helfen & verdienen"
   "seller.commission.highlight": "70% für dich – 30% für die Plattform"
```

---

### 2.3 Pilot Program Enhancement

| Field            | Value                     |
| ---------------- | ------------------------- |
| **Priority**     | P1 - High                 |
| **Effort**       | Small                     |
| **Dependencies** | User roles, credit system |

**User Story:**

> As an early adopter teacher, I want a tangible reward for joining the pilot so that I feel valued and motivated to actively participate.

**Problem:**
"Exclusive Access" is a weak incentive. Teachers need concrete value.

**Acceptance Criteria:**

- [ ] Offer "50 CHF Starting Credit" for pilot teachers
- [ ] OR offer "100% Commission for Year 1" (choose one)
- [ ] Update pilot signup page with new offer
- [ ] Implement credit/commission tracking for pilot users
- [ ] Add "Pilot Teacher" badge to profiles
- [ ] Set expiration date for pilot benefits

**Technical Implementation Notes:**

```prisma
// Database changes
model User {
  // ... existing
  isPilotTeacher     Boolean   @default(false)
  pilotJoinedAt      DateTime?
  pilotCredits       Decimal   @default(0) // in CHF
  pilotCommissionEnd DateTime? // When 100% commission expires
}

// Pilot badge component
// components/badges/PilotBadge.tsx
```

```typescript
// Checkout logic update
// If user.isPilotTeacher && user.pilotCredits > 0
// Apply credit to order, reduce pilotCredits balance

// Payout logic update
// If seller.isPilotTeacher && now < seller.pilotCommissionEnd
// Commission rate = 100% (platform fee = 0)
```

```
Landing Page Updates:
- Hero: "Werde Pilot-Lehrer:in"
- Benefit 1: "50 CHF Startguthaben" OR "100% Provision im ersten Jahr"
- Benefit 2: "Exklusiver Zugang zu neuen Features"
- Benefit 3: "Direkter Draht zum Gründerteam"
- CTA: "Jetzt als Pilot starten" (limited slots messaging)
```

---

## Phase 3: User Experience Polish & Social Proof

**Goal:** Increase conversion through trust signals and human connection.
**Priority:** Complete before scaling marketing.

---

### 3.1 Team & Mission Page

| Field            | Value       |
| ---------------- | ----------- |
| **Priority**     | P2 - Medium |
| **Effort**       | Small       |
| **Dependencies** | Team photos |

**User Story:**

> As a skeptical teacher visiting the site, I want to see who built this platform so that I can trust it's made by people who understand Swiss education.

**Problem:**
The site feels anonymous. Teachers want to know the humans behind the platform.

**Acceptance Criteria:**

- [ ] Create "Über uns" / "Meet the Team" page
- [ ] Real photos of founders (no stock photos!)
- [ ] Short bio for each team member
- [ ] Highlight pedagogical credentials ("10 Jahre Erfahrung als Lehrperson")
- [ ] Mission statement with Swiss education focus
- [ ] Contact information (shows accessibility)

**Technical Implementation Notes:**

```
Page Structure: /[locale]/about

1. Hero Section
   - Headline: "Wir sind EasyLehrer"
   - Subhead: "Zwei Pädagogen mit einer Mission"

2. Team Grid
   // components/about/TeamMember.tsx
   interface TeamMember {
     name: string;
     role: string;
     photo: string;        // Real photo, not stock!
     bio: string;
     credentials: string;  // "10 Jahre Oberstufe, Kanton ZH"
     linkedin?: string;
   }

3. Mission Section
   - "Unsere Vision": Swiss-quality materials for Swiss classrooms
   - "Das Problem": German platforms don't understand Swiss needs
   - "Unsere Lösung": Built by teachers, for teachers

4. Contact Section
   - Direct email to founders
   - Optional: Calendar link for feedback calls
```

---

### 3.2 Verified Seller Badges

| Field            | Value                 |
| ---------------- | --------------------- |
| **Priority**     | P2 - Medium           |
| **Effort**       | Medium                |
| **Dependencies** | Seller profiles exist |

**User Story:**

> As a buyer browsing resources, I want to see which sellers are verified and trusted so that I can confidently purchase from quality contributors.

**Problem:**
Claiming to check every document doesn't scale. Badge system provides trust without manual review burden.

**Acceptance Criteria:**

- [ ] Create "Verified Seller" badge criteria
- [ ] Display badge on seller profiles and resource cards
- [ ] Automatic verification triggers (e.g., 10+ sales, 4.5+ rating)
- [ ] Manual verification option for admin
- [ ] Show verification criteria publicly (transparency)

**Technical Implementation Notes:**

```prisma
// Database changes
model User {
  // ... existing
  isVerifiedSeller    Boolean   @default(false)
  verifiedAt          DateTime?
  verificationMethod  String?   // 'auto' | 'manual'
}

// Auto-verification criteria
const VERIFICATION_CRITERIA = {
  minSales: 10,
  minRating: 4.5,
  minResources: 3,
  accountAge: 30, // days
  noReports: true,
};
```

```typescript
// Verification check job (runs daily)
// jobs/checkSellerVerification.ts

async function checkAutoVerification(userId: string) {
  const stats = await getSellerStats(userId);

  if (
    stats.totalSales >= 10 &&
    stats.averageRating >= 4.5 &&
    stats.resourceCount >= 3 &&
    stats.accountAgeDays >= 30 &&
    stats.openReports === 0
  ) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isVerifiedSeller: true,
        verifiedAt: new Date(),
        verificationMethod: "auto",
      },
    });
  }
}
```

```
Badge Display:
// components/badges/VerifiedSellerBadge.tsx
- Blue checkmark icon
- Tooltip: "Verifizierte:r Verkäufer:in"
- Link to /verified-seller-info page explaining criteria
```

---

### 3.3 Testimonials & Social Proof

| Field            | Value       |
| ---------------- | ----------- |
| **Priority**     | P2 - Medium |
| **Effort**       | Small       |
| **Dependencies** | Pilot users |

**User Story:**

> As a new visitor, I want to see what other teachers say about the platform so that I feel confident this is a legitimate and useful service.

**Problem:**
No social proof = no trust. Teachers rely on peer recommendations.

**Acceptance Criteria:**

- [ ] Collect testimonials from pilot teachers
- [ ] Display on landing page (rotating carousel or grid)
- [ ] Include: quote, name, canton, school type
- [ ] Add to "Become a Seller" page
- [ ] Video testimonials (optional, high impact)

**Technical Implementation Notes:**

```typescript
// components/testimonials/TestimonialCard.tsx

interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string; // "Primarlehrerin"
  authorCanton: string; // "Kanton Zürich"
  authorPhoto?: string; // Optional real photo
  rating?: number; // 1-5 stars
}

// Static data initially, can move to CMS later
const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    quote:
      "Das Arbeitsblatt zur Französischen Revolution hat mir 2 Stunden Vorbereitungszeit gespart.",
    authorName: "Sarah M.",
    authorRole: "Sekundarlehrerin",
    authorCanton: "Kanton Zürich",
  },
  // ...
];
```

```
Placement:
1. Landing page - Below hero, above features
2. Become Seller page - Above CTA
3. Resource detail page - "Was andere sagen" section (if reviews exist)
```

---

## Summary: Implementation Checklist

### Phase 1: Critical Trust & Core Functionality

| #    | Task                                          | Priority | Status |
| ---- | --------------------------------------------- | -------- | ------ |
| 1.1  | Migrate to `easylehrer.ch` domain             | P0       | ⬜     |
| 1.2a | Implement Zyklus filter (Cycle 1, 2, 3)       | P0       | ⬜     |
| 1.2b | Implement LP21 competence code search         | P0       | ⬜     |
| 1.2c | Add dialect toggle (CH-DE vs. High German)    | P0       | ⬜     |
| 1.2d | Move search to Hero with integrated dropdowns | P0       | ⬜     |
| 1.3a | Replace stock images with real previews       | P0       | ⬜     |
| 1.3b | Auto-generate PDF thumbnails on upload        | P0       | ⬜     |
| 1.3c | Implement blur preview system                 | P0       | ⬜     |

### Phase 2: Seller Acquisition & Legal Safety

| #    | Task                                       | Priority | Status |
| ---- | ------------------------------------------ | -------- | ------ |
| 2.1a | Create Seller Safety Wizard in upload flow | P1       | ⬜     |
| 2.1b | Add copyright confirmation checkboxes      | P1       | ⬜     |
| 2.1c | Create Copyright Guide for Teachers page   | P1       | ⬜     |
| 2.2a | Reframe "Become a Seller" messaging        | P1       | ⬜     |
| 2.2b | Highlight 70% commission with comparison   | P1       | ⬜     |
| 2.2c | Add earnings calculator                    | P1       | ⬜     |
| 2.3a | Update Pilot Program with tangible rewards | P1       | ⬜     |
| 2.3b | Implement credit/commission tracking       | P1       | ⬜     |

### Phase 3: User Experience Polish & Social Proof

| #    | Task                                         | Priority | Status |
| ---- | -------------------------------------------- | -------- | ------ |
| 3.1a | Create "Meet the Team" page with real photos | P2       | ⬜     |
| 3.1b | Write founder bios with credentials          | P2       | ⬜     |
| 3.2a | Define Verified Seller criteria              | P2       | ⬜     |
| 3.2b | Implement auto-verification system           | P2       | ⬜     |
| 3.2c | Display badges on profiles/cards             | P2       | ⬜     |
| 3.3a | Collect testimonials from pilot teachers     | P2       | ⬜     |
| 3.3b | Display testimonials on landing page         | P2       | ⬜     |

---

## Appendix: Quick Reference

### Priority Definitions

| Priority | Meaning                          | Timeline                    |
| -------- | -------------------------------- | --------------------------- |
| P0       | Critical - Blocks launch         | Before any marketing        |
| P1       | High - Blocks seller acquisition | Before recruitment campaign |
| P2       | Medium - Impacts conversion      | Before scaling              |
| P3       | Low - Nice to have               | Post-launch                 |

### User Story Template

```
As a [user type],
I want [capability/feature]
so that [benefit/outcome].
```

### Technical Patterns

- **API Routes:** `/api/[domain]/[action]`
- **Components:** `/components/[domain]/[Component].tsx`
- **Pages:** `/app/[locale]/[page]/page.tsx`
- **Database:** Prisma migrations in `/prisma/migrations/`

---

## Related Documents

- [Features Spec](./features.md) - Current feature implementation status
- [Design System](./design-system.md) - UI components and theming
- [LP21 Filter Sidebar](./lp21-filter-sidebar.md) - Curriculum filter implementation details
- [Stripe Connect Plan](./stripe-connect-implementation-plan.md) - Payment integration
