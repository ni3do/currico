# Resource Catalog & Search

## Implementation Status

**Status: Partial**

- Catalog grid display: Implemented
- Card information display: Implemented
- Search bar with keywords: Implemented
- Subject selector: Implemented
- Advanced filters UI: Implemented but not wired to API
- Sorting options: UI only, not functional
- Mobile experience: Implemented

---

## Overview

Display a catalog of individual resources and bundles with clean advanced search capabilities.

## Catalog Display

Resources and bundles are displayed in a clean grid or list format.

### Card Information

Each card shows only core information:
- Title
- Short description
- Main subject
- Price
- Quality status
- Clear primary CTA (e.g., "View" or "Buy")

## Search Interface

### Default Controls (Always Visible)

1. Wide search bar (keywords)
2. Main subject selector

### Advanced Filters (Collapsible "More Filters" Section)

When opened, filters are presented in neatly grouped, well-spaced blocks:

- Cycle
- Canton
- Quality status
- Price type
- Resource type
- Editable (yes/no)
- License scope
- Lehrplan 21 competence codes

### Sorting Options

Displayed as a small, unobtrusive control:
- Newest
- Most Downloaded

## Mobile Experience

- "More Filters" appears as a bottom sheet or slide-out panel
- Search bar and subject selector remain prominently at the top
- Simple typography throughout
- Avoid visual clutter
