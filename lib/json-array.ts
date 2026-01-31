import { Prisma } from "@prisma/client";

/**
 * PostgreSQL JSONB array query helpers
 *
 * These helpers generate raw SQL conditions for querying JSON array columns
 * in PostgreSQL using native JSONB operators.
 */

/**
 * Check if a JSON array column contains a specific value (equivalent to .has())
 *
 * @param column - The column name (e.g., "subjects")
 * @param value - The value to check for
 * @param table - Optional table alias (defaults to the model's table)
 * @returns Prisma raw SQL fragment for use in where clauses
 *
 * @example
 * // PostgreSQL: subjects::jsonb @> '"Mathematik"'::jsonb
 * jsonArrayContains("subjects", "Mathematik")
 */
export function jsonArrayContains(
  column: string,
  value: string | number,
  table?: string
): Prisma.Sql {
  const columnRef = table ? `${table}.${column}` : column;
  // Use @> operator: checks if left contains right
  return Prisma.sql`${Prisma.raw(columnRef)}::jsonb @> ${JSON.stringify(value)}::jsonb`;
}

/**
 * Check if a JSON array column contains any of the specified values (equivalent to .hasSome())
 *
 * @param column - The column name (e.g., "subjects")
 * @param values - Array of values to check for
 * @param table - Optional table alias
 * @returns Prisma raw SQL fragment for use in where clauses
 *
 * @example
 * // PostgreSQL: subjects::jsonb ?| ARRAY['Mathematik', 'Deutsch']
 * jsonArrayHasSome("subjects", ["Mathematik", "Deutsch"])
 */
export function jsonArrayHasSome(
  column: string,
  values: (string | number)[],
  table?: string
): Prisma.Sql {
  if (values.length === 0) {
    // Return a condition that's always false if no values provided
    return Prisma.sql`FALSE`;
  }

  const columnRef = table ? `${table}.${column}` : column;

  // Use ?| operator: checks if any of the array elements exist as top-level keys
  // For JSONB arrays, we need to convert to text[] for ?| to work properly
  const stringValues = values.map(String);
  return Prisma.sql`${Prisma.raw(columnRef)}::jsonb ?| ${stringValues}::text[]`;
}

/**
 * Check if a JSON array column contains all of the specified values (equivalent to .hasEvery())
 *
 * @param column - The column name (e.g., "subjects")
 * @param values - Array of values that must all be present
 * @param table - Optional table alias
 * @returns Prisma raw SQL fragment for use in where clauses
 */
export function jsonArrayHasEvery(
  column: string,
  values: (string | number)[],
  table?: string
): Prisma.Sql {
  if (values.length === 0) {
    // Return a condition that's always true if no values provided
    return Prisma.sql`TRUE`;
  }

  const columnRef = table ? `${table}.${column}` : column;

  // Use @> operator with a JSON array: checks if left contains right
  return Prisma.sql`${Prisma.raw(columnRef)}::jsonb @> ${JSON.stringify(values)}::jsonb`;
}

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
