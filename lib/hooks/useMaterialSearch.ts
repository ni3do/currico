"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import type { LP21FilterState } from "@/lib/types/search";
import { useSearchFetcher } from "./useSearchFetcher";

/** Debounce delay (ms) before fetching materials after filter changes */
const MATERIALS_DEBOUNCE_MS = 150;
/** Debounce delay (ms) before fetching profiles after filter changes */
const PROFILES_DEBOUNCE_MS = 300;

interface UseMaterialSearchOptions {
  router: { replace(href: string, options?: { scroll?: boolean }): void };
  searchParams: ReadonlyURLSearchParams;
  toast: (message: string, type?: "success" | "error" | "warning" | "info") => void;

  t: (key: string, values?: any) => string;
  getFachbereichByCode: (code: string) => { code: string } | undefined;
}

export function useMaterialSearch({
  router,
  searchParams,
  toast,
  t,
  getFachbereichByCode,
}: UseMaterialSearchOptions) {
  // --- Data fetching (delegated to useSearchFetcher) ---
  const {
    materials,
    profiles,
    pagination,
    profilePagination,
    loading,
    profilesLoading,
    fetchError,
    isPending,
    searchMatchMode,
    setLoading,
    setProfilesLoading,
    fetchMaterials,
    fetchProfiles,
  } = useSearchFetcher({ toast, t, getFachbereichByCode });

  // --- Local state ---
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sort") || "newest");
  const [profileSortBy, setProfileSortBy] = useState<string>(
    searchParams.get("profileSort") || "newest"
  );
  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(searchParams.get("page") || "1", 10)
  );
  const [profilePage, setProfilePage] = useState<number>(
    parseInt(searchParams.get("profilePage") || "1", 10)
  );

  // --- Initialize filters from URL ---
  const initialFilters = useMemo<LP21FilterState>(() => {
    const zyklus = searchParams.get("zyklus");
    const fachbereich = searchParams.get("fachbereich");
    const kompetenzbereich = searchParams.get("kompetenzbereich");
    const kompetenz = searchParams.get("kompetenz");

    const legacySearchType = searchParams.get("searchType");
    const showCreatorsParam = searchParams.get("showCreators");
    let showMaterials = true;
    let showCreators = false;
    if (legacySearchType === "profiles" || showCreatorsParam === "true") {
      showMaterials = false;
      showCreators = true;
    }

    return {
      showMaterials,
      showCreators,
      zyklus: zyklus ? parseInt(zyklus) : null,
      fachbereich: fachbereich || null,
      kompetenzbereich: kompetenzbereich || null,
      kompetenz: kompetenz || null,
      searchQuery: searchParams.get("search") || "",
      dialect: searchParams.get("dialect") || null,
      maxPrice: searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : null,
      formats: searchParams.get("formats")?.split(",").filter(Boolean) || [],
      cantons: searchParams.get("cantons")?.split(",").filter(Boolean) || [],
      tags: searchParams.get("tags")?.split(",").filter(Boolean) || [],
    };
  }, [searchParams]);

  const [filters, setFilters] = useState<LP21FilterState>(initialFilters);

  // Sync filters with URL when they change from URL (e.g., navigation)
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // --- URL helpers ---
  const buildUrlParams = useCallback(
    (currentFilters: LP21FilterState, currentSort: string, page: number = 1) => {
      const params = new URLSearchParams();
      if (currentFilters.showCreators) params.set("showCreators", "true");
      if (currentFilters.zyklus) params.set("zyklus", currentFilters.zyklus.toString());
      if (currentFilters.fachbereich) params.set("fachbereich", currentFilters.fachbereich);
      if (currentFilters.kompetenzbereich)
        params.set("kompetenzbereich", currentFilters.kompetenzbereich);
      if (currentFilters.kompetenz) params.set("kompetenz", currentFilters.kompetenz);
      if (currentFilters.searchQuery) params.set("search", currentFilters.searchQuery);
      if (currentFilters.dialect) params.set("dialect", currentFilters.dialect);
      if (currentFilters.maxPrice !== null)
        params.set("maxPrice", currentFilters.maxPrice.toString());
      if (currentFilters.formats.length > 0)
        params.set("formats", currentFilters.formats.join(","));
      if (currentFilters.cantons.length > 0)
        params.set("cantons", currentFilters.cantons.join(","));
      if (currentFilters.tags.length > 0) params.set("tags", currentFilters.tags.join(","));
      if (currentSort && currentSort !== "newest") params.set("sort", currentSort);
      if (page > 1) params.set("page", page.toString());
      if (currentFilters.showCreators && profileSortBy !== "newest")
        params.set("profileSort", profileSortBy);
      if (currentFilters.showCreators && profilePage > 1)
        params.set("profilePage", profilePage.toString());
      return params;
    },
    [profileSortBy, profilePage]
  );

  const navigateTo = useCallback(
    (params: URLSearchParams) => {
      const qs = params.toString();
      router.replace(qs ? `/materialien?${qs}` : "/materialien", { scroll: false });
    },
    [router]
  );

  // --- Handlers ---
  const handleFiltersChange = useCallback(
    (newFilters: LP21FilterState) => {
      // Set loading immediately when switching tabs to prevent "0 results" flash
      if (newFilters.showMaterials !== filters.showMaterials) {
        if (newFilters.showMaterials) setLoading(true);
        else setProfilesLoading(true);
      }
      setFilters(newFilters);
      setCurrentPage(1);
      setProfilePage(1);
      navigateTo(buildUrlParams(newFilters, sortBy, 1));
    },
    [sortBy, buildUrlParams, navigateTo, filters.showMaterials, setLoading, setProfilesLoading]
  );

  const handleSortChange = useCallback(
    (newSort: string) => {
      setSortBy(newSort);
      setCurrentPage(1);
      navigateTo(buildUrlParams(filters, newSort, 1));
    },
    [filters, buildUrlParams, navigateTo]
  );

  const handleProfileSortChange = useCallback(
    (newSort: string) => {
      setProfileSortBy(newSort);
      setProfilePage(1);
      const params = buildUrlParams(filters, sortBy, currentPage);
      if (newSort !== "newest") params.set("profileSort", newSort);
      else params.delete("profileSort");
      params.delete("profilePage");
      navigateTo(params);
    },
    [filters, sortBy, currentPage, buildUrlParams, navigateTo]
  );

  const handleProfilePageChange = useCallback(
    (newPage: number) => {
      setProfilePage(newPage);
      const params = buildUrlParams(filters, sortBy, currentPage);
      if (newPage > 1) params.set("profilePage", newPage.toString());
      else params.delete("profilePage");
      navigateTo(params);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [filters, sortBy, currentPage, buildUrlParams, navigateTo]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      navigateTo(buildUrlParams(filters, sortBy, newPage));
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [filters, sortBy, buildUrlParams, navigateTo]
  );

  // --- Effects ---

  // Fetch materials when showMaterials is true (debounced)
  useEffect(() => {
    if (filters.showMaterials) {
      setLoading(true);
      const debounce = setTimeout(() => {
        fetchMaterials(filters, sortBy, currentPage);
      }, MATERIALS_DEBOUNCE_MS);
      return () => clearTimeout(debounce);
    } else {
      setLoading(false);
    }
  }, [filters, sortBy, currentPage, fetchMaterials, setLoading]);

  // Fetch profiles when showCreators is true (debounced)
  useEffect(() => {
    if (filters.showCreators) {
      setProfilesLoading(true);
      const debounce = setTimeout(() => {
        fetchProfiles(filters, profileSortBy, profilePage);
      }, PROFILES_DEBOUNCE_MS);
      return () => clearTimeout(debounce);
    } else {
      setProfilesLoading(false);
    }
  }, [filters, profileSortBy, profilePage, fetchProfiles, setProfilesLoading]);

  // --- Computed values ---
  const activeFilterCount = [
    filters.zyklus,
    filters.fachbereich,
    filters.kompetenzbereich,
    filters.kompetenz,
    filters.searchQuery || null,
    filters.dialect,
    filters.maxPrice !== null ? filters.maxPrice : null,
    ...filters.formats,
    filters.cantons.length > 0 ? true : null,
    ...filters.tags,
  ].filter(Boolean).length;

  const isLoading = filters.showMaterials ? loading : profilesLoading;
  // Cache the last known total per tab to prevent "0" flash during tab switch transitions.
  // Even with startTransition, React may render intermediate states where pagination is stale.
  const rawTotal = filters.showMaterials ? pagination.total : profilePagination.total;
  const [cachedTotals, setCachedTotals] = useState({ materials: 0, profiles: 0 });
  useEffect(() => {
    if (!isLoading && rawTotal > 0) {
      setCachedTotals((prev) => {
        const key = filters.showMaterials ? "materials" : "profiles";
        if (prev[key] === rawTotal) return prev;
        return { ...prev, [key]: rawTotal };
      });
    }
  }, [isLoading, rawTotal, filters.showMaterials]);
  const cachedTotal = filters.showMaterials ? cachedTotals.materials : cachedTotals.profiles;
  const totalCount = isLoading ? cachedTotal || rawTotal : rawTotal;
  const countLabel = filters.showMaterials
    ? t("results.countLabel")
    : t("results.countLabelProfiles");
  const hasNoItems = filters.showMaterials ? materials.length === 0 : profiles.length === 0;

  const retryFetch = useCallback(() => {
    fetchMaterials(filters, sortBy, currentPage);
  }, [fetchMaterials, filters, sortBy, currentPage]);

  /** Build a clean filters object with all LP21/material filters cleared, keeping tabs + optional overrides */
  const resetFilters = useCallback(
    (overrides?: Partial<LP21FilterState>): LP21FilterState => ({
      showMaterials: filters.showMaterials,
      showCreators: filters.showCreators,
      zyklus: null,
      fachbereich: null,
      kompetenzbereich: null,
      kompetenz: null,
      searchQuery: filters.searchQuery,
      dialect: null,
      maxPrice: null,
      formats: [],
      cantons: [],
      tags: [],
      ...overrides,
    }),
    [filters.showMaterials, filters.showCreators, filters.searchQuery]
  );

  return {
    // Data
    materials,
    profiles,
    pagination,
    profilePagination,
    // State
    filters,
    fetchError,
    mobileFiltersOpen,
    viewMode,
    sortBy,
    profileSortBy,
    currentPage,
    profilePage,
    isPending,
    searchMatchMode,
    // Computed
    activeFilterCount,
    isLoading,
    totalCount,
    countLabel,
    hasNoItems,
    // Handlers
    handleFiltersChange,
    handleSortChange,
    handleProfileSortChange,
    handlePageChange,
    handleProfilePageChange,
    setMobileFiltersOpen,
    setViewMode,
    retryFetch,
    resetFilters,
  };
}
