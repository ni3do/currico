/**
 * Shared subject color utilities
 * Consolidates duplicate color/pill class mappings from:
 * - ResourceCard.tsx
 * - DashboardResourceCard.tsx
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
 */
export function getSubjectPillClass(subject: string): string {
  const subjectMap: Record<string, string> = {
    Deutsch: "pill-deutsch",
    Mathematik: "pill-mathe",
    NMG: "pill-nmg",
    BG: "pill-gestalten",
    Musik: "pill-musik",
    Sport: "pill-sport",
    Französisch: "pill-franzoesisch",
    Franzosisch: "pill-franzoesisch",
    French: "pill-franzoesisch",
    FR: "pill-franzoesisch",
    Englisch: "pill-englisch",
    English: "pill-englisch",
    EN: "pill-englisch",
  };
  return subjectMap[subject] || "pill-primary";
}
