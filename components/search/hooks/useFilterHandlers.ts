import { useState, useCallback } from "react";
import { getSuggestedFilters, type ParsedSearchQuery } from "@/lib/search-query-parser";
import type { CurriculumSearchResult, Fachbereich } from "@/lib/curriculum-types";
import type { LP21FilterState } from "@/lib/types/search";

interface UseFilterHandlersOptions {
  filters: LP21FilterState;
  onFiltersChange: (filters: LP21FilterState) => void;
  getFachbereicheByZyklus: (zyklus: number) => Fachbereich[];
  parsedQuery: ParsedSearchQuery | null;
  setParsedQuery: (v: ParsedSearchQuery | null) => void;
}

export function useFilterHandlers({
  filters,
  onFiltersChange,
  getFachbereicheByZyklus,
  parsedQuery,
  setParsedQuery,
}: UseFilterHandlersOptions) {
  // Accordion UI state
  const [expandedFachbereiche, setExpandedFachbereiche] = useState<Set<string>>(new Set());
  const [expandedKompetenzbereiche, setExpandedKompetenzbereiche] = useState<Set<string>>(
    new Set()
  );

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
  }, [parsedQuery, filters, onFiltersChange, setParsedQuery]);

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

  return {
    // Accordion state
    expandedFachbereiche,
    expandedKompetenzbereiche,
    // Computed
    hasActiveFilters,
    // Handlers
    handleToggleMaterials,
    handleToggleCreators,
    handleZyklusChange,
    handleFachbereichChange,
    handleKompetenzbereichChange,
    handleKompetenzChange,
    handleApplySmartSearch,
    handleSearchResultSelect,
    handleClearAll,
    toggleFachbereichExpansion,
    toggleKompetenzbereichExpansion,
    handleFormatToggle,
  };
}
