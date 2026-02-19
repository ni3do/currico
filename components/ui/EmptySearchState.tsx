"use client";

import { Search, Users, SlidersHorizontal, Lightbulb, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { LP21FilterState } from "@/lib/types/search";

interface EmptySearchStateProps {
  filters: LP21FilterState;
  onResetFilters: () => void;
  onResetSearch: () => void;
  onSuggestionClick?: (query: string) => void;
}

export function EmptySearchState({
  filters,
  onResetFilters,
  onResetSearch,
  onSuggestionClick,
}: EmptySearchStateProps) {
  const t = useTranslations("materialsPage");

  const hasSearch = !!filters.searchQuery;
  const hasFilters =
    filters.zyklus !== null ||
    filters.fachbereich !== null ||
    filters.kompetenzbereich !== null ||
    filters.kompetenz !== null ||
    filters.dialect !== null ||
    filters.maxPrice !== null ||
    filters.formats.length > 0 ||
    filters.cantons.length > 0;
  const hasAny = hasSearch || hasFilters;
  const isProfilesTab = !filters.showMaterials && filters.showCreators;

  return (
    <div className="border-border-subtle bg-bg-secondary flex flex-col items-center justify-center rounded-xl border px-8 py-16">
      {/* Icon */}
      <div className="bg-surface-hover mb-5 flex h-16 w-16 items-center justify-center rounded-full">
        {isProfilesTab ? (
          <Users className="text-text-muted h-8 w-8" />
        ) : (
          <Search className="text-text-muted h-8 w-8" />
        )}
      </div>

      {/* Title */}
      <p className="text-text mb-2 text-lg font-semibold">{t("empty.title")}</p>

      {/* Contextual message */}
      <p className="text-text-muted mb-6 max-w-md text-center text-sm leading-relaxed">
        {hasSearch && hasFilters
          ? t("empty.descriptionSearchAndFilters")
          : hasSearch
            ? t("empty.descriptionSearch", { query: filters.searchQuery })
            : hasFilters
              ? t("empty.descriptionFilters")
              : t("empty.description")}
      </p>

      {/* Action buttons */}
      {hasAny && (
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {hasSearch && (
            <button
              onClick={onResetSearch}
              className="border-border bg-bg text-text-secondary hover:border-primary hover:text-primary inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium shadow-sm transition-all hover:shadow-md"
            >
              <X className="h-4 w-4" />
              {t("empty.clearSearch")}
            </button>
          )}
          {hasFilters && (
            <button
              onClick={onResetFilters}
              className="border-border bg-bg text-text-secondary hover:border-primary hover:text-primary inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium shadow-sm transition-all hover:shadow-md"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {t("empty.clearFilters")}
            </button>
          )}
          {hasSearch && hasFilters && (
            <button
              onClick={() => {
                onResetSearch();
                onResetFilters();
              }}
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
            >
              {t("empty.clearAll")}
            </button>
          )}
        </div>
      )}

      {/* Suggestions */}
      {onSuggestionClick && (
        <div className="w-full max-w-sm">
          <div className="mb-3 flex items-center justify-center gap-2">
            <Lightbulb className="text-text-muted h-4 w-4" />
            <span className="text-text-muted text-xs font-medium">
              {t("empty.suggestionsTitle")}
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {(isProfilesTab
              ? [
                  t("empty.profileSuggestion1"),
                  t("empty.profileSuggestion2"),
                  t("empty.profileSuggestion3"),
                  t("empty.profileSuggestion4"),
                ]
              : hasFilters
                ? [
                    t("empty.filterSuggestion1"),
                    t("empty.filterSuggestion2"),
                    t("empty.suggestion1"),
                    t("empty.suggestion2"),
                  ]
                : [
                    t("empty.suggestion1"),
                    t("empty.suggestion2"),
                    t("empty.suggestion3"),
                    t("empty.suggestion4"),
                  ]
            ).map((suggestion, index) => (
              <button
                key={`suggestion-${index}`}
                onClick={() => onSuggestionClick(suggestion)}
                className="bg-surface border-border text-text-secondary hover:border-primary hover:text-primary rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:shadow-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
