# LP21 Filter Sidebar - Design Specification

## Overview

A modern, hierarchical sidebar filter designed specifically for the Swiss Lehrplan 21 (Curriculum 21) competence structure. This component enables teachers to intuitively filter resources using the LP21 hierarchy.

## Visual Layout

```
┌─────────────────────────────────────┐
│  Filter                   [Reset X] │  ← Header with clear all
├─────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐           │  ← Active filter chips
│  │ Z1  │ │ MA  │ │MA.1 │           │
│  └──X──┘ └──X──┘ └──X──┘           │
├─────────────────────────────────────┤
│  🔍 Suche: Stichwort oder Code...   │  ← Enhanced search
│  ┌─────────────────────────────────┐│
│  │ MA.1.A  Verstehen und Darst... ││  ← Dropdown results
│  │ MA.1.B  Zahlen schätzen...     ││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│  Zyklus                             │
│  ┌─────────┬─────────┬─────────┐   │  ← Zyklus toggle (prominent)
│  │   Z1    │   Z2    │   Z3    │   │
│  │  KG-2   │  3-6    │  7-9    │   │
│  └─────────┴─────────┴─────────┘   │
├─────────────────────────────────────┤
│  Fachbereich                        │
│                                     │
│  ┌─────────────────────────────────┐│
│  │█│ ▶ 📖 Deutsch                 ││  ← Color strip + icon
│  │█│   D · Z1,2,3                 ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │█│ ▼ 🔢 Mathematik        ✓     ││  ← Selected + expanded
│  │█│   MA · Z1,2,3                ││
│  ├─────────────────────────────────┤│
│  │  ▶ MA.1 Zahl und Variable      ││  ← Kompetenzbereich
│  │  ▼ MA.2 Form und Raum    ✓     ││  ← Selected + expanded
│  │    ├─ MA.2.A Figuren erforschen││  ← Kompetenz
│  │    ├─ MA.2.B Beziehungen    ✓  ││
│  │    └─ MA.2.C Konstruktionen    ││
│  │  ▶ MA.3 Grössen, Funktionen... ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │█│ ▶ 🌿 NMG                     ││
│  │█│   NMG · Z1,2                 ││
│  └─────────────────────────────────┘│
│                                     │
│  ... more Fachbereiche              │
│                                     │
└─────────────────────────────────────┘
```

## Component Hierarchy

### 1. Header Section

- Title: "Filter"
- Clear All button (visible when filters active)
- Shows active filter count

### 2. Active Filter Chips

- Displayed when any filter is selected
- Each chip shows filter value with X to remove
- Color-coded by Fachbereich color
- Types: Zyklus, Fachbereich, Kompetenzbereich, Kompetenz

### 3. Enhanced Search Input

- Placeholder: "Suche: Stichwort oder Code (z.B. MA.1.A)"
- Supports both keyword search and LP21 competence codes
- Dropdown shows matching results with:
  - Color badge
  - Code (monospace)
  - Name
  - Type indicator (Fach/Bereich/Kompetenz)

### 4. Zyklus Toggle (Prominent)

- Three toggle buttons: Z1, Z2, Z3
- Each shows grade range (KG-2, 3-6, 7-9)
- Tooltip on hover shows full description
- Selecting a Zyklus filters available Fachbereiche

### 5. Fachbereich Accordions

- Collapsible sections for each subject area
- Visual elements:
  - **Color strip** (4px left border in LP21 color)
  - **Icon** (subject-specific)
  - **Name** (full name)
  - **Code** (e.g., "MA")
  - **Cycles** (e.g., "Z1,2,3")
- Selected state: ring border + light background tint

### 6. Kompetenzbereich Items (Level 2)

- Nested inside expanded Fachbereich
- Shows code + name
- Expandable to show Kompetenzen
- Selected state: primary color highlight

### 7. Kompetenz Items (Level 3)

- Nested inside expanded Kompetenzbereich
- Connected by vertical border line
- Shows code + name
- Smallest text size
- Selected state: primary color highlight

## Color Scheme (LP21 Standard)

| Fachbereich          | Color    | Hex     |
| -------------------- | -------- | ------- |
| Deutsch              | Red      | #d20f39 |
| Mathematik           | Blue     | #1e66f5 |
| NMG (all variants)   | Green    | #40a02b |
| Fremdsprachen        | Sapphire | #209fb5 |
| BG, TTG              | Pink     | #ea76cb |
| Musik                | Mauve    | #8839ef |
| Sport                | Peach    | #fe640b |
| Medien & Informatik  | Sky      | #04a5e5 |
| Berufl. Orientierung | Gray     | #7c7f93 |

## Interaction States

### Fachbereich Card

- **Default**: Border, white background
- **Hover**: Subtle border change
- **Selected**: Ring with subject color, tinted background
- **Expanded**: Shows Kompetenzbereiche below

### Kompetenzbereich/Kompetenz

- **Default**: Text muted
- **Hover**: Background highlight
- **Selected**: Primary color text + background tint

### Zyklus Toggle

- **Default**: Border, light background
- **Hover**: Border primary/50
- **Selected**: Primary border + background + text

## Responsive Behavior

### Desktop (>1024px)

- Fixed width: 256px (w-64)
- Sticky positioning: `top-24`
- Max height: `calc(100vh - 8rem)`
- Overflow: scroll with hidden scrollbar

### Mobile (<1024px)

- Full width panel
- Toggle button to show/hide
- Appears as slide-in panel or accordion

## Accessibility

- All interactive elements keyboard accessible
- Focus states visible
- Color contrast meets WCAG AA
- Tooltips for abbreviated text
- Aria labels on interactive elements

## Data Structure

See `/lib/data/lehrplan21.ts` for the complete data structure.

### Key Types

```typescript
interface Fachbereich {
  code: string; // "MA"
  name: string; // "Mathematik"
  shortName: string; // "MA"
  color: string; // "#1e66f5"
  colorClass: string; // "subject-mathe"
  icon: string; // "calculator"
  cycles: number[]; // [1, 2, 3]
  kompetenzbereiche: Kompetenzbereich[];
}

interface Kompetenzbereich {
  code: string; // "MA.1"
  name: string; // "Zahl und Variable"
  kompetenzen: Kompetenz[];
}

interface Kompetenz {
  code: string; // "MA.1.A"
  name: string; // "Verstehen und Darstellen von Zahlen"
}
```

## Filter State

```typescript
interface LP21FilterState {
  zyklus: number | null; // 1, 2, or 3
  fachbereich: string | null; // "MA", "D", etc.
  kompetenzbereich: string | null; // "MA.1", "D.2", etc.
  kompetenz: string | null; // "MA.1.A", "D.2.B", etc.
  searchQuery: string; // User search input
}
```

## Usage

```tsx
import { LP21FilterSidebar, LP21FilterState } from "@/components/search/LP21FilterSidebar";

function ResourcesPage() {
  const [filters, setFilters] = useState<LP21FilterState>({
    zyklus: null,
    fachbereich: null,
    kompetenzbereich: null,
    kompetenz: null,
    searchQuery: "",
  });

  return (
    <div className="flex gap-6">
      <LP21FilterSidebar
        filters={filters}
        onFiltersChange={setFilters}
        className="w-64 flex-shrink-0"
      />
      <main className="flex-1">{/* Resource grid */}</main>
    </div>
  );
}
```

## Files

| File                                      | Purpose                         |
| ----------------------------------------- | ------------------------------- |
| `lib/data/lehrplan21.ts`                  | LP21 data structure and helpers |
| `components/search/LP21FilterSidebar.tsx` | Main filter sidebar component   |
| `spec/lp21-filter-sidebar.md`             | This specification              |
