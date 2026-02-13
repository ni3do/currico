"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { X, Search, Loader2 } from "lucide-react";
import { useCurriculum } from "@/lib/hooks/useCurriculum";
import {
  parseSearchQuery,
  getSuggestedFilters,
  type ParsedSearchQuery,
} from "@/lib/search-query-parser";
import type { CurriculumSearchResult } from "@/lib/curriculum-types";
import type { LP21FilterState } from "@/lib/types/search";
import {
  CollapsibleSection,
  SearchTypeTabs,
  ZyklusToggle,
  DialectToggle,
  FachbereichAccordion,
  FormatFilter,
  PriceFilter,
  CantonFilter,
  SmartSearchSuggestions,
} from "./filters";

// Re-export for backward compatibility
export type { LP21FilterState } from "@/lib/types/search";
export { CANTON_ABBREVS } from "./filters/CantonFilter";

/** Debounce delay (ms) before propagating search query to parent */
const SEARCH_DEBOUNCE_MS = 300;

interface LP21FilterSidebarProps {
  filters: LP21FilterState;
  onFiltersChange: (filters: LP21FilterState) => void;
  className?: string;
}

// ============ MAIN COMPONENT ============
export function LP21FilterSidebar({
  filters,
  onFiltersChange,
  className = "",
}: LP21FilterSidebarProps) {
  const t = useTranslations("materialsPage");

  // Fetch curriculum data from API
  const {
    fachbereiche,
    zyklen,
    loading: curriculumLoading,
    error: curriculumError,
    getFachbereicheByZyklus,
    searchByCode,
  } = useCurriculum();

  // Local state for UI
  const [expandedFachbereiche, setExpandedFachbereiche] = useState<Set<string>>(new Set());
  const [expandedKompetenzbereiche, setExpandedKompetenzbereiche] = useState<Set<string>>(
    new Set()
  );
  const [searchFocused, setSearchFocused] = useState(false);
  const [parsedQuery, setParsedQuery] = useState<ParsedSearchQuery | null>(null);

  // Local search input value for immediate UI feedback (debounced before propagating)
  const [localSearchQuery, setLocalSearchQuery] = useState(filters.searchQuery);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs for latest filters/onFiltersChange to avoid stale closures in debounced callbacks
  const filtersRef = useRef(filters);
  const onFiltersChangeRef = useRef(onFiltersChange);
  useEffect(() => {
    filtersRef.current = filters;
    onFiltersChangeRef.current = onFiltersChange;
  });

  // Sync local value when parent resets search (e.g. "clear search" button, suggestion click)
  // Uses the React-recommended "store previous prop in state" pattern to avoid useEffect
  const [prevSearchQuery, setPrevSearchQuery] = useState(filters.searchQuery);
  if (prevSearchQuery !== filters.searchQuery) {
    setPrevSearchQuery(filters.searchQuery);
    setLocalSearchQuery(filters.searchQuery);
  }

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  // Get available Fachbereiche based on selected Zyklus
  const availableFachbereiche = useMemo(() => {
    if (filters.zyklus === null) {
      return fachbereiche;
    }
    return getFachbereicheByZyklus(filters.zyklus);
  }, [filters.zyklus, fachbereiche, getFachbereicheByZyklus]);

  // Search results use local value for instant dropdown feedback
  const searchResults = useMemo(() => {
    if (!localSearchQuery || localSearchQuery.length < 2) {
      return [];
    }
    return searchByCode(localSearchQuery).slice(0, 10);
  }, [localSearchQuery, searchByCode]);

  // Check if any filters are active
  const hasActiveFilters =
    filters.zyklus !== null ||
    filters.fachbereich !== null ||
    filters.kompetenzbereich !== null ||
    filters.kompetenz !== null ||
    filters.searchQuery.length > 0 ||
    filters.dialect !== null ||
    filters.maxPrice !== null ||
    filters.formats.length > 0 ||
    filters.cantons.length > 0;

  // Handlers for exclusive tab selection (only one active at a time)
  const handleToggleMaterials = useCallback(() => {
    if (filters.showMaterials) return; // Already active, no-op
    onFiltersChange({
      ...filters,
      showMaterials: true,
      showCreators: false,
    });
  }, [filters, onFiltersChange]);

  const handleToggleCreators = useCallback(() => {
    if (filters.showCreators) return; // Already active, no-op
    onFiltersChange({
      ...filters,
      showCreators: true,
      showMaterials: false,
      // Clear material-specific filters when switching to profiles
      dialect: null,
      maxPrice: null,
      formats: [],
      cantons: [],
    });
  }, [filters, onFiltersChange]);

  // Handlers
  const handleZyklusChange = useCallback(
    (zyklusId: number | null) => {
      const newZyklus = filters.zyklus === zyklusId ? null : zyklusId;
      // Smart reset: keep fachbereich if it exists in the new Zyklus
      let keepFachbereich = false;
      let keepKompetenzbereich = false;
      let keepKompetenz = false;
      if (newZyklus !== null && filters.fachbereich) {
        const newFachbereiche = getFachbereicheByZyklus(newZyklus);
        const matchedFb = newFachbereiche.find((f) => f.code === filters.fachbereich);
        keepFachbereich = !!matchedFb;
        // Also validate kompetenzbereich still exists under this fachbereich
        if (keepFachbereich && matchedFb && filters.kompetenzbereich) {
          const matchedKb = matchedFb.kompetenzbereiche.find(
            (kb) => kb.code === filters.kompetenzbereich
          );
          keepKompetenzbereich = !!matchedKb;
          // Validate kompetenz exists in the matched kompetenzbereich's kompetenzen
          if (keepKompetenzbereich && matchedKb && filters.kompetenz) {
            keepKompetenz = matchedKb.kompetenzen.some((k) => k.code === filters.kompetenz);
          }
        }
      }
      onFiltersChange({
        ...filters,
        zyklus: newZyklus,
        fachbereich: keepFachbereich ? filters.fachbereich : null,
        kompetenzbereich: keepKompetenzbereich ? filters.kompetenzbereich : null,
        kompetenz: keepKompetenz ? filters.kompetenz : null,
      });
    },
    [filters, onFiltersChange, getFachbereicheByZyklus]
  );

  const handleFachbereichChange = useCallback(
    (code: string | null) => {
      onFiltersChange({
        ...filters,
        fachbereich: filters.fachbereich === code ? null : code,
        kompetenzbereich: null,
        kompetenz: null,
      });
      // Expand only this Fachbereich when selected (accordion behavior)
      if (code && filters.fachbereich !== code) {
        setExpandedFachbereiche(new Set([code]));
        setExpandedKompetenzbereiche(new Set());
      }
    },
    [filters, onFiltersChange]
  );

  const handleKompetenzbereichChange = useCallback(
    (code: string | null) => {
      onFiltersChange({
        ...filters,
        kompetenzbereich: filters.kompetenzbereich === code ? null : code,
        kompetenz: null,
      });
      // Expand the Kompetenzbereich when selected
      if (code && filters.kompetenzbereich !== code) {
        setExpandedKompetenzbereiche((prev) => new Set([...prev, code]));
      }
    },
    [filters, onFiltersChange]
  );

  const handleKompetenzChange = useCallback(
    (code: string | null) => {
      onFiltersChange({
        ...filters,
        kompetenz: filters.kompetenz === code ? null : code,
      });
    },
    [filters, onFiltersChange]
  );

  const handleSearchChange = useCallback((query: string) => {
    // Update local value immediately (no lag while typing)
    setLocalSearchQuery(query);

    // Parse the query for smart suggestions (instant, local only)
    if (query.length >= 2) {
      const parsed = parseSearchQuery(query);
      if (parsed.detectedTerms.length > 0) {
        setParsedQuery(parsed);
      } else {
        setParsedQuery(null);
      }
    } else {
      setParsedQuery(null);
    }

    // Debounce the API call (300ms)
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = setTimeout(() => {
      onFiltersChangeRef.current({
        ...filtersRef.current,
        searchQuery: query,
      });
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  // Apply smart search suggestions
  const handleApplySmartSearch = useCallback(() => {
    if (!parsedQuery) return;

    const suggestions = getSuggestedFilters(parsedQuery);
    const newFilters = { ...filters };

    if (suggestions.zyklus !== undefined) {
      newFilters.zyklus = suggestions.zyklus;
    }
    if (suggestions.fachbereich !== undefined) {
      newFilters.fachbereich = suggestions.fachbereich;
      // Expand the selected Fachbereich
      setExpandedFachbereiche(new Set([suggestions.fachbereich]));
    }
    if (suggestions.kompetenzbereich !== undefined) {
      newFilters.kompetenzbereich = suggestions.kompetenzbereich;
      // Expand the Kompetenzbereich
      setExpandedKompetenzbereiche(new Set([suggestions.kompetenzbereich]));
    }
    if (suggestions.kompetenz !== undefined) {
      newFilters.kompetenz = suggestions.kompetenz;
    }

    // Keep remaining terms as search query
    newFilters.searchQuery = parsedQuery.remainingTerms.join(" ");

    onFiltersChange(newFilters);
    setParsedQuery(null);
  }, [parsedQuery, filters, onFiltersChange]);

  const handleSearchResultSelect = useCallback(
    (result: CurriculumSearchResult) => {
      let newFilters: LP21FilterState = {
        ...filters,
        searchQuery: "",
      };

      // Determine the Zyklus from the Fachbereich
      const zyklusFromFb = result.fachbereich.cycles[0];

      switch (result.type) {
        case "fachbereich":
          newFilters = {
            ...newFilters,
            zyklus: filters.zyklus ?? zyklusFromFb,
            fachbereich: result.code,
            kompetenzbereich: null,
            kompetenz: null,
          };
          setExpandedFachbereiche(new Set([result.code]));
          setExpandedKompetenzbereiche(new Set());
          break;
        case "kompetenzbereich":
          newFilters = {
            ...newFilters,
            zyklus: filters.zyklus ?? zyklusFromFb,
            fachbereich: result.fachbereich.code,
            kompetenzbereich: result.code,
            kompetenz: null,
          };
          setExpandedFachbereiche(new Set([result.fachbereich.code]));
          setExpandedKompetenzbereiche(new Set([result.code]));
          break;
        case "kompetenz":
          newFilters = {
            ...newFilters,
            zyklus: filters.zyklus ?? zyklusFromFb,
            fachbereich: result.fachbereich.code,
            kompetenzbereich: result.kompetenzbereich?.code ?? null,
            kompetenz: result.code,
          };
          setExpandedFachbereiche(new Set([result.fachbereich.code]));
          if (result.kompetenzbereich) {
            setExpandedKompetenzbereiche(new Set([result.kompetenzbereich!.code]));
          } else {
            setExpandedKompetenzbereiche(new Set());
          }
          break;
      }

      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange]
  );

  const handleClearAll = useCallback(() => {
    onFiltersChange({
      showMaterials: filters.showMaterials,
      showCreators: filters.showCreators,
      zyklus: null,
      fachbereich: null,
      kompetenzbereich: null,
      kompetenz: null,
      searchQuery: "",
      dialect: null,
      maxPrice: null,
      formats: [],
      cantons: [],
    });
    setExpandedFachbereiche(new Set());
    setExpandedKompetenzbereiche(new Set());
  }, [onFiltersChange, filters.showMaterials, filters.showCreators]);

  const toggleFachbereichExpansion = useCallback((code: string) => {
    setExpandedFachbereiche((prev) => {
      // If already expanded, collapse it
      if (prev.has(code)) {
        return new Set();
      }
      // Otherwise, expand only this one (close all others)
      return new Set([code]);
    });
    // Also collapse any expanded Kompetenzbereiche when switching Fachbereich
    setExpandedKompetenzbereiche(new Set());
  }, []);

  const toggleKompetenzbereichExpansion = useCallback((code: string) => {
    setExpandedKompetenzbereiche((prev) => {
      // If already expanded, collapse it
      if (prev.has(code)) {
        return new Set();
      }
      // Otherwise, expand only this one (close all others)
      return new Set([code]);
    });
  }, []);

  const handleFormatToggle = useCallback(
    (formatId: string) => {
      const newFormats = filters.formats.includes(formatId)
        ? filters.formats.filter((f) => f !== formatId)
        : [...filters.formats, formatId];
      onFiltersChange({
        ...filters,
        formats: newFormats,
      });
    },
    [filters, onFiltersChange]
  );

  return (
    <aside className={`border-border bg-bg-secondary rounded-xl border shadow-sm ${className}`}>
      <div className="p-5">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-text text-lg font-semibold">{t("sidebar.title")}</h2>
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="text-text-muted hover:text-primary flex items-center gap-1 text-sm font-medium transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              {t("sidebar.reset")}
            </button>
          )}
        </div>

        {/* Search Type Tabs */}
        <SearchTypeTabs
          showMaterials={filters.showMaterials}
          showCreators={filters.showCreators}
          onToggleMaterials={handleToggleMaterials}
          onToggleCreators={handleToggleCreators}
          t={t}
        />

        <div className="divider my-5" />

        {/* Search Input */}
        <div className="relative mb-5">
          <div className="relative">
            <Search className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              value={localSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder={
                filters.showCreators
                  ? t("sidebar.searchPlaceholderProfiles")
                  : t("sidebar.searchPlaceholderDefault")
              }
              className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary focus:ring-primary/20 w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm focus:ring-2 focus:outline-none"
            />
          </div>

          {/* Search Results Dropdown */}
          {searchFocused && searchResults.length > 0 && (
            <div className="border-border bg-surface absolute top-full right-0 left-0 z-50 mt-1 rounded-lg border shadow-lg">
              <div className="max-h-64 overflow-y-auto p-2">
                {searchResults.map((result) => (
                  <button
                    key={result.code}
                    onClick={() => handleSearchResultSelect(result)}
                    className="hover:bg-surface-hover flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors"
                  >
                    <span
                      className="inline-flex h-5 w-5 items-center justify-center rounded text-xs font-bold text-white"
                      style={{ backgroundColor: result.fachbereich.color }}
                    >
                      {result.fachbereich.shortName.charAt(0)}
                    </span>
                    <span className="text-primary font-mono text-xs font-medium">
                      {result.code}
                    </span>
                    <span className="text-text-secondary flex-1 truncate">{result.name}</span>
                    <span className="text-text-muted text-xs">
                      {result.type === "fachbereich"
                        ? t("sidebar.searchResultSubject")
                        : result.type === "kompetenzbereich"
                          ? t("sidebar.searchResultArea")
                          : t("sidebar.searchResultCompetence")}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Smart Search Suggestions */}
        <SmartSearchSuggestions
          parsedQuery={parsedQuery}
          fachbereiche={fachbereiche}
          zyklen={zyklen}
          onApply={handleApplySmartSearch}
          onDismiss={() => setParsedQuery(null)}
          t={t}
        />

        {/* Zyklus Toggle */}
        <CollapsibleSection title={t("sidebar.zyklusLabel")}>
          <ZyklusToggle
            zyklen={zyklen}
            selectedZyklus={filters.zyklus}
            onZyklusChange={handleZyklusChange}
          />
        </CollapsibleSection>

        <div className="divider my-5" />

        {/* Fachbereiche Tree */}
        <CollapsibleSection title={t("sidebar.subjectLabel")}>
          <div className="space-y-2">
            {curriculumLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="text-primary h-6 w-6 animate-spin" />
              </div>
            ) : curriculumError ? (
              <div className="text-error py-4 text-center text-sm">{t("sidebar.loadingError")}</div>
            ) : (
              availableFachbereiche.map((fb, index) => (
                <FachbereichAccordion
                  key={fb.code}
                  fachbereich={fb}
                  isSelected={filters.fachbereich === fb.code}
                  isExpanded={expandedFachbereiche.has(fb.code)}
                  selectedKompetenzbereich={filters.kompetenzbereich}
                  selectedKompetenz={filters.kompetenz}
                  expandedKompetenzbereiche={expandedKompetenzbereiche}
                  onSelect={() => handleFachbereichChange(fb.code)}
                  onToggleExpand={() => toggleFachbereichExpansion(fb.code)}
                  onKompetenzbereichSelect={handleKompetenzbereichChange}
                  onKompetenzbereichToggle={toggleKompetenzbereichExpansion}
                  onKompetenzSelect={handleKompetenzChange}
                  index={index}
                />
              ))
            )}
          </div>
        </CollapsibleSection>

        {/* Show price/dialect/format/scope filters only when materials are shown */}
        {filters.showMaterials && (
          <>
            <div className="divider my-5" />

            {/* Price Filter */}
            <CollapsibleSection title={t("sidebar.priceSectionLabel")} defaultOpen={false}>
              <PriceFilter
                maxPrice={filters.maxPrice}
                onMaxPriceChange={(maxPrice) => onFiltersChange({ ...filters, maxPrice })}
                t={t}
              />
            </CollapsibleSection>

            <div className="divider my-5" />

            {/* Format Filter */}
            <CollapsibleSection title={t("sidebar.formatSectionLabel")} defaultOpen={false}>
              <FormatFilter
                selectedFormats={filters.formats}
                onFormatToggle={handleFormatToggle}
                t={t}
              />
            </CollapsibleSection>

            <div className="divider my-5" />

            {/* Dialect Toggle */}
            <CollapsibleSection title={t("sidebar.dialectLabel")} defaultOpen={false}>
              <DialectToggle
                selectedDialect={filters.dialect}
                onDialectChange={(dialect) => onFiltersChange({ ...filters, dialect })}
                t={t}
              />
            </CollapsibleSection>

            <div className="divider my-5" />

            {/* Canton Filter */}
            <CollapsibleSection title={t("sidebar.cantonSectionLabel")} defaultOpen={false}>
              <CantonFilter
                selectedCantons={filters.cantons}
                onCantonsChange={(cantons) => onFiltersChange({ ...filters, cantons })}
                t={t}
              />
            </CollapsibleSection>
          </>
        )}
      </div>
    </aside>
  );
}

export default LP21FilterSidebar;
