/**
 * Swiss Quality Validation Utilities
 *
 * Switzerland uses "ss" instead of "ß" (Eszett).
 * These utilities help ensure content follows Swiss German conventions.
 */

export interface EszettCheckResult {
  hasEszett: boolean;
  count: number;
  positions: { index: number; context: string }[];
  suggestion: string;
}

/**
 * Check if text contains Eszett (ß) characters
 * Swiss German always uses "ss" instead of "ß"
 */
export function checkForEszett(text: string): EszettCheckResult {
  const eszettRegex = /ß/g;
  const matches: { index: number; context: string }[] = [];

  let match;
  while ((match = eszettRegex.exec(text)) !== null) {
    // Get surrounding context (10 chars before and after)
    const start = Math.max(0, match.index - 10);
    const end = Math.min(text.length, match.index + 11);
    const context = text.slice(start, end);
    matches.push({
      index: match.index,
      context: context.replace(/ß/g, "[ß]"),
    });
  }

  // Create suggestion by replacing ß with ss
  const suggestion = text.replace(/ß/g, "ss");

  return {
    hasEszett: matches.length > 0,
    count: matches.length,
    positions: matches,
    suggestion,
  };
}

/**
 * Replace all Eszett characters with "ss"
 */
export function replaceEszett(text: string): string {
  return text.replace(/ß/g, "ss");
}

/**
 * Common German words with ß and their Swiss equivalents
 */
export const ESZETT_REPLACEMENTS: Record<string, string> = {
  groß: "gross",
  größe: "grösse",
  größer: "grösser",
  größte: "grösste",
  straße: "strasse",
  fuß: "fuss",
  füße: "füsse",
  maß: "mass",
  maße: "masse",
  spaß: "spass",
  weiß: "weiss",
  heiß: "heiss",
  süß: "süss",
  außen: "aussen",
  außer: "ausser",
  draußen: "draussen",
  schließen: "schliessen",
  fließen: "fliessen",
  gießen: "giessen",
  genießen: "geniessen",
  schießen: "schiessen",
  stoßen: "stossen",
  müssen: "müssen", // Already correct (ss after short vowel)
  lassen: "lassen", // Already correct
  essen: "essen", // Already correct
  wissen: "wissen", // Already correct
};

/**
 * Validate text for Swiss quality standards
 */
export interface SwissQualityResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  eszettCheck: EszettCheckResult;
}

export function validateSwissQuality(text: string): SwissQualityResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const eszettCheck = checkForEszett(text);

  if (eszettCheck.hasEszett) {
    errors.push(
      `Text enthält ${eszettCheck.count} Eszett-Zeichen (ß). In der Schweiz wird "ss" verwendet.`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    eszettCheck,
  };
}
