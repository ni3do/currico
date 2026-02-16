/** Derive a display-ready primary subject from the subjects array. */
export function primarySubject(subjects: string[] | undefined | null, fallback = ""): string {
  return subjects?.[0] || fallback;
}

/** Derive a display-ready primary cycle from the cycles array. */
export function primaryCycle(cycles: string[] | undefined | null): string {
  return cycles?.[0] || "";
}
