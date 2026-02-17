"use client";

import { Search, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSuggestedFilters, type ParsedSearchQuery } from "@/lib/search-query-parser";
import type { Fachbereich, Zyklus } from "@/lib/curriculum-types";
import type { useTranslations } from "next-intl";
import { Tooltip } from "./Tooltip";

interface SmartSearchSuggestionsProps {
  parsedQuery: ParsedSearchQuery | null;
  fachbereiche: Fachbereich[];
  zyklen: Zyklus[];
  onApply: () => void;
  onDismiss: () => void;
  t: ReturnType<typeof useTranslations>;
}

export function SmartSearchSuggestions({
  parsedQuery,
  fachbereiche,
  zyklen,
  onApply,
  onDismiss,
  t,
}: SmartSearchSuggestionsProps) {
  if (!parsedQuery || parsedQuery.detectedTerms.length === 0) {
    return null;
  }

  const suggestions = getSuggestedFilters(parsedQuery);
  const suggestedFachbereich = suggestions.fachbereich
    ? fachbereiche.find((fb) => fb.code === suggestions.fachbereich)
    : null;
  const suggestedZyklus = suggestions.zyklus
    ? zyklen.find((z) => z.id === suggestions.zyklus)
    : null;

  // Resolve kompetenzbereich name from code
  const kompetenzbereichName = suggestions.kompetenzbereich
    ? (() => {
        for (const fb of fachbereiche) {
          const kb = fb.kompetenzbereiche.find((k) => k.code === suggestions.kompetenzbereich);
          if (kb) return kb.name;
        }
        return suggestions.kompetenzbereich;
      })()
    : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        transition={{ duration: 0.2 }}
        className="mb-5 overflow-hidden"
      >
        <div className="bg-primary/5 border-primary/20 rounded-lg border p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="text-primary h-4 w-4" />
              <span className="text-primary text-xs font-semibold">
                {t("sidebar.smartSearchDetected")}
              </span>
            </div>
            <button
              onClick={onDismiss}
              className="text-text-muted hover:text-text rounded p-0.5 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Show detected items */}
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestedZyklus && (
              <span className="bg-primary/10 text-primary group relative inline-flex cursor-help items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium">
                <span className="text-primary/70">{t("sidebar.smartSearchLevel")}</span>
                {suggestedZyklus.shortName}
                <Tooltip text={suggestedZyklus.description} position="bottom" />
              </span>
            )}
            {suggestedFachbereich && (
              <span
                className="group relative inline-flex cursor-help items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                style={{
                  backgroundColor: `${suggestedFachbereich.color}15`,
                  color: suggestedFachbereich.color,
                }}
              >
                <span style={{ opacity: 0.7 }}>{t("sidebar.smartSearchSubject")}</span>
                {suggestedFachbereich.shortName}
                <Tooltip text={suggestedFachbereich.name} position="bottom" />
              </span>
            )}
            {suggestions.kompetenzbereich && (
              <span
                className="group relative inline-flex cursor-help items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                style={{
                  backgroundColor: suggestedFachbereich
                    ? `${suggestedFachbereich.color}15`
                    : "#1e66f515",
                  color: suggestedFachbereich?.color || "#1e66f5",
                }}
              >
                <span style={{ opacity: 0.7 }}>{t("sidebar.smartSearchArea")}</span>
                {suggestions.kompetenzbereich}
                <Tooltip text={kompetenzbereichName!} position="bottom" />
              </span>
            )}
          </div>

          {/* Apply button */}
          <motion.button
            onClick={onApply}
            className="bg-primary hover:bg-primary/90 text-text-on-accent flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            whileHover={{ scale: 1.015, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
            whileTap={{ scale: 0.98 }}
          >
            <ChevronRight className="h-4 w-4" />
            {t("sidebar.smartSearchApply")}
          </motion.button>

          {/* Remaining terms info */}
          {parsedQuery.remainingTerms.length > 0 && (
            <p className="text-text-muted mt-2 text-xs">
              {t("sidebar.smartSearchRemaining", { query: parsedQuery.remainingTerms.join(" ") })}
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
