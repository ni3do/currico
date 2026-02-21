/**
 * Helper to safely cast a Json field to a string array for TypeScript
 * Use this when reading data from the database
 *
 * @param jsonValue - The JSON value from Prisma (could be null, undefined, or any JSON)
 * @returns A string array (empty if null/undefined)
 */
export function toStringArray(jsonValue: unknown): string[] {
  if (!jsonValue) return [];
  if (Array.isArray(jsonValue)) return jsonValue.map(String);
  return [];
}

/**
 * Helper to safely cast a Json field to a number array for TypeScript
 * Use this when reading data from the database
 *
 * @param jsonValue - The JSON value from Prisma
 * @returns A number array (empty if null/undefined)
 */
export function toNumberArray(jsonValue: unknown): number[] {
  if (!jsonValue) return [];
  if (Array.isArray(jsonValue)) return jsonValue.map(Number).filter((n) => !isNaN(n));
  return [];
}
