import { useState, useCallback, useRef, useEffect } from "react";
import { parseSearchQuery, type ParsedSearchQuery } from "@/lib/search-query-parser";
import type { LP21FilterState } from "@/lib/types/search";

/** Debounce delay (ms) before propagating search query to parent */
const SEARCH_DEBOUNCE_MS = 300;

interface UseSearchInputReturn {
  localSearchQuery: string;
  searchFocused: boolean;
  setSearchFocused: (v: boolean) => void;
  handleSearchChange: (query: string) => void;
  parsedQuery: ParsedSearchQuery | null;
  setParsedQuery: (v: ParsedSearchQuery | null) => void;
}

export function useSearchInput(
  filters: LP21FilterState,
  onFiltersChange: (filters: LP21FilterState) => void
): UseSearchInputReturn {
  // Local search input value for immediate UI feedback (debounced before propagating)
  const [localSearchQuery, setLocalSearchQuery] = useState(filters.searchQuery);
  const [searchFocused, setSearchFocused] = useState(false);
  const [parsedQuery, setParsedQuery] = useState<ParsedSearchQuery | null>(null);
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

  return {
    localSearchQuery,
    searchFocused,
    setSearchFocused,
    handleSearchChange,
    parsedQuery,
    setParsedQuery,
  };
}
