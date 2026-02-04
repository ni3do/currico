/**
 * PostgreSQL Full-Text Search Utilities
 *
 * Provides helper functions for building and executing full-text search queries
 * with proper German language support and ranking.
 */

import { PrismaClient } from "@prisma/client";

/**
 * Configuration for search queries
 */
export interface SearchConfig {
  /** The search query string */
  query: string;
  /** Language for text processing (default: 'german') */
  language?: "german" | "english" | "simple";
  /** Minimum rank score to include in results (0-1) */
  minRank?: number;
}

/**
 * Result from a full-text search query
 */
export interface SearchResult {
  id: string;
  rank: number;
}

/**
 * Sanitize a search query for use with PostgreSQL tsquery
 *
 * - Removes special characters that could break the query
 * - Trims whitespace
 * - Returns null if query is empty or too short
 *
 * @param query - Raw search query from user input
 * @returns Sanitized query string or null
 */
export function sanitizeSearchQuery(query: string): string | null {
  if (!query || typeof query !== "string") {
    return null;
  }

  // Trim and normalize whitespace
  let sanitized = query.trim().replace(/\s+/g, " ");

  // Remove characters that could break tsquery
  // Keep: alphanumeric, spaces, umlauts, and basic punctuation
  sanitized = sanitized.replace(/[^\w\s\u00C0-\u017F.-]/g, "");

  // Minimum 2 characters for search
  if (sanitized.length < 2) {
    return null;
  }

  return sanitized;
}

/**
 * Build a raw SQL query for full-text search with ranking
 *
 * Uses plainto_tsquery for simple search (handles phrases naturally)
 * and ts_rank for relevance scoring.
 *
 * @param searchTerm - The sanitized search term
 * @param language - The text search language configuration
 * @returns Object with the SQL condition and order by clause
 */
export function buildFullTextSearchQuery(
  searchTerm: string,
  language: string = "german"
): {
  whereClause: string;
  orderByClause: string;
  params: { search: string; language: string };
} {
  return {
    whereClause: `search_vector @@ plainto_tsquery('${language}', $1)`,
    orderByClause: `ts_rank(search_vector, plainto_tsquery('${language}', $1)) DESC`,
    params: { search: searchTerm, language },
  };
}

/**
 * Execute a full-text search query on resources
 *
 * @param prisma - Prisma client instance
 * @param config - Search configuration
 * @returns Array of resource IDs with their rank scores
 */
export async function executeFullTextSearch(
  prisma: PrismaClient,
  config: SearchConfig
): Promise<SearchResult[]> {
  const sanitizedQuery = sanitizeSearchQuery(config.query);
  if (!sanitizedQuery) {
    return [];
  }

  const language = config.language || "german";

  // Execute raw query for full-text search with ranking
  const results = await prisma.$queryRaw<{ id: string; rank: number }[]>`
    SELECT id, ts_rank(search_vector, plainto_tsquery(${language}::regconfig, ${sanitizedQuery})) as rank
    FROM resources
    WHERE search_vector @@ plainto_tsquery(${language}::regconfig, ${sanitizedQuery})
      AND is_published = true
      AND is_public = true
    ORDER BY rank DESC
  `;

  // Filter by minimum rank if specified
  if (config.minRank && config.minRank > 0) {
    return results.filter((r) => r.rank >= config.minRank!);
  }

  return results;
}

/**
 * Build a Prisma-compatible filter for full-text search
 *
 * This creates an ID filter based on full-text search results,
 * which can be combined with other Prisma where conditions.
 *
 * @param searchResults - Results from executeFullTextSearch
 * @returns Prisma where condition for filtering by matched IDs
 */
export function buildPrismaIdFilter(
  searchResults: SearchResult[]
): { id: { in: string[] } } | null {
  if (searchResults.length === 0) {
    return null;
  }

  return {
    id: { in: searchResults.map((r) => r.id) },
  };
}

/**
 * Sort resources by full-text search rank
 *
 * @param resources - Array of resources with IDs
 * @param searchResults - Search results with rank scores
 * @returns Resources sorted by rank (highest first)
 */
export function sortBySearchRank<T extends { id: string }>(
  resources: T[],
  searchResults: SearchResult[]
): T[] {
  const rankMap = new Map(searchResults.map((r) => [r.id, r.rank]));

  return [...resources].sort((a, b) => {
    const rankA = rankMap.get(a.id) ?? 0;
    const rankB = rankMap.get(b.id) ?? 0;
    return rankB - rankA;
  });
}

/**
 * Check if a search query appears to be an LP21 competency code
 *
 * LP21 codes follow patterns like: MA.1.A.1, D.2.B, NMG.3.4
 *
 * @param query - The search query
 * @returns true if the query looks like an LP21 code
 */
export function isLP21Code(query: string): boolean {
  if (!query) return false;

  // Pattern: 1-3 uppercase letters, followed by dot and number(s), optionally more
  const lp21Pattern = /^[A-Z]{1,3}\.\d/i;
  return lp21Pattern.test(query.trim());
}
