/**
 * Heuristic check whether a display name looks like an auto-generated username
 * rather than a real human name.
 *
 * Examples that return true: "Jo1320", "user42", "abc12", "x9k3"
 * Examples that return false: "Maria S.", "Lehrerin Zürich", "Anna-Lena"
 */
export function looksLikeUsername(name: string): boolean {
  if (!name || name.trim().length === 0) return false;

  const trimmed = name.trim();

  // Contains 3+ digits → likely auto-generated
  const digitCount = (trimmed.match(/\d/g) || []).length;
  if (digitCount >= 3) return true;

  // No spaces AND has digits AND short (< 5 chars) → likely "ab12" style
  if (!trimmed.includes(" ") && /\d/.test(trimmed) && trimmed.length < 5) return true;

  // Matches letters followed by 2+ digits pattern → "user42", "Jo13"
  if (/^[a-zA-ZäöüÄÖÜ]+\d{2,}$/.test(trimmed)) return true;

  return false;
}
