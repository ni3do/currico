/**
 * Shared subject color utilities
 * Consolidates duplicate color/pill class mappings from:
 * - MaterialCard.tsx
 * - DashboardMaterialCard.tsx
 * - ProfileCard.tsx
 */

/**
 * Maps pill CSS classes to text color classes for eyebrow tags
 */
export function getSubjectTextColor(pillClass?: string): string {
  const colorMap: Record<string, string> = {
    "pill-deutsch": "text-subject-deutsch",
    "pill-mathe": "text-subject-mathe",
    "pill-nmg": "text-subject-nmg",
    "pill-gestalten": "text-subject-gestalten",
    "pill-musik": "text-subject-musik",
    "pill-sport": "text-subject-sport",
    "pill-fremdsprachen": "text-subject-fremdsprachen",
    "pill-franzoesisch": "text-subject-franzoesisch",
    "pill-englisch": "text-subject-englisch",
    "pill-medien": "text-subject-medien",
  };
  return colorMap[pillClass ?? ""] || "text-text-muted";
}

/**
 * Maps subject names to text color classes (for components receiving subject name directly)
 */
export function getSubjectTextColorByName(subject: string): string {
  const colorMap: Record<string, string> = {
    Deutsch: "text-subject-deutsch",
    Mathematik: "text-subject-mathe",
    NMG: "text-subject-nmg",
    BG: "text-subject-gestalten",
    Musik: "text-subject-musik",
    Sport: "text-subject-sport",
    Englisch: "text-subject-fremdsprachen",
    Französisch: "text-subject-fremdsprachen",
    "Medien und Informatik": "text-subject-medien",
  };
  return colorMap[subject] || "text-text-muted";
}

/**
 * Maps subject names to pill CSS classes
 * This is the single source of truth — do NOT duplicate in page files.
 */
export function getSubjectPillClass(subject: string): string {
  const subjectMap: Record<string, string> = {
    // Core subjects
    Deutsch: "pill-deutsch",
    D: "pill-deutsch",
    Mathematik: "pill-mathe",
    MA: "pill-mathe",
    "Natur, Mensch, Gesellschaft": "pill-nmg",
    NMG: "pill-nmg",
    "Bildnerisches Gestalten": "pill-gestalten",
    BG: "pill-gestalten",
    "Textiles und Technisches Gestalten": "pill-ttg",
    TTG: "pill-ttg",
    Musik: "pill-musik",
    MU: "pill-musik",
    "Bewegung und Sport": "pill-sport",
    BS: "pill-sport",
    Sport: "pill-sport",
    // Languages
    Französisch: "pill-franzoesisch",
    Franzosisch: "pill-franzoesisch",
    French: "pill-franzoesisch",
    FR: "pill-franzoesisch",
    Englisch: "pill-englisch",
    English: "pill-englisch",
    EN: "pill-englisch",
    Fremdsprachen: "pill-fremdsprachen",
    FS: "pill-fremdsprachen",
    // Media
    "Medien und Informatik": "pill-medien",
    MI: "pill-medien",
    // Zyklus 3 specific
    "Natur und Technik": "pill-nt",
    NT: "pill-nt",
    "Wirtschaft, Arbeit, Haushalt": "pill-wah",
    WAH: "pill-wah",
    "Räume, Zeiten, Gesellschaften": "pill-rzg",
    RZG: "pill-rzg",
    "Ethik, Religionen, Gemeinschaft": "pill-erg",
    ERG: "pill-erg",
    "Berufliche Orientierung": "pill-bo",
    BO: "pill-bo",
    Projektunterricht: "pill-pu",
    PU: "pill-pu",
  };
  return subjectMap[subject] || "pill-primary";
}
