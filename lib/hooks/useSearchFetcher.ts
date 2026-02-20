"use client";

import { useState, useEffect, useCallback, useRef, useTransition } from "react";
import type {
  LP21FilterState,
  MaterialListItem,
  Pagination,
  ProfileListItem,
} from "@/lib/types/search";

export type SearchMatchMode = "exact" | "fuzzy" | "combined" | null;

interface UseSearchFetcherOptions {
  toast: (message: string, type?: "success" | "error" | "warning" | "info") => void;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
  getFachbereichByCode: (code: string) => { code: string } | undefined;
}

export interface SearchFetcherResult {
  materials: MaterialListItem[];
  profiles: ProfileListItem[];
  pagination: Pagination;
  profilePagination: Pagination;
  loading: boolean;
  profilesLoading: boolean;
  fetchError: string | null;
  isPending: boolean;
  searchMatchMode: SearchMatchMode;
  setLoading: (v: boolean) => void;
  setProfilesLoading: (v: boolean) => void;
  fetchMaterials: (filters: LP21FilterState, sort: string, page?: number) => Promise<void>;
  fetchProfiles: (filters: LP21FilterState, sort?: string, page?: number) => Promise<void>;
}

export function useSearchFetcher({
  toast,
  t,
  getFachbereichByCode,
}: UseSearchFetcherOptions): SearchFetcherResult {
  const [materials, setMaterials] = useState<MaterialListItem[]>([]);
  const [profiles, setProfiles] = useState<ProfileListItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [profilePagination, setProfilePagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [searchMatchMode, setSearchMatchMode] = useState<SearchMatchMode>(null);

  const materialsAbortRef = useRef<AbortController | null>(null);
  const profilesAbortRef = useRef<AbortController | null>(null);

  // Abort in-flight requests on unmount
  useEffect(() => {
    return () => {
      materialsAbortRef.current?.abort();
      profilesAbortRef.current?.abort();
    };
  }, []);

  // --- Fachbereich mapping ref ---
  const mapFachbereichToSubjectRef = useRef((code: string | null): string => code || "");
  useEffect(() => {
    mapFachbereichToSubjectRef.current = (code: string | null): string => {
      if (!code) return "";
      const fachbereich = getFachbereichByCode(code);
      return fachbereich?.code || code;
    };
  }, [getFachbereichByCode]);

  // --- Fetch materials ---
  const fetchMaterials = useCallback(
    async (currentFilters: LP21FilterState, currentSort: string, page: number = 1) => {
      materialsAbortRef.current?.abort();
      const controller = new AbortController();
      materialsAbortRef.current = controller;

      setLoading(true);
      setFetchError(null);
      try {
        const params = new URLSearchParams();
        params.set("page", page.toString());

        if (currentFilters.fachbereich) {
          params.set("subject", mapFachbereichToSubjectRef.current(currentFilters.fachbereich));
        }
        if (currentFilters.zyklus) {
          params.set("cycle", currentFilters.zyklus.toString());
        }
        if (currentFilters.searchQuery) {
          params.set("search", currentFilters.searchQuery);
        }
        if (currentFilters.kompetenz) {
          params.set("competency", currentFilters.kompetenz);
        } else if (currentFilters.kompetenzbereich) {
          params.set("competency", currentFilters.kompetenzbereich);
        }
        if (currentFilters.dialect) {
          params.set("dialect", currentFilters.dialect);
        }
        if (currentFilters.maxPrice !== null) {
          params.set("maxPrice", currentFilters.maxPrice.toString());
        }
        if (currentFilters.formats.length > 0) {
          params.set("formats", currentFilters.formats.join(","));
        }
        if (currentFilters.cantons.length > 0) {
          params.set("cantons", currentFilters.cantons.join(","));
        }
        if (currentFilters.tags.length > 0) {
          params.set("tags", currentFilters.tags.join(","));
        }
        if (currentFilters.verifiedOnly) {
          params.set("verifiedOnly", "true");
        }
        if (currentSort) {
          params.set("sort", currentSort);
        }

        const response = await fetch(`/api/materials?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 429) {
            setFetchError("rateLimit");
            toast(t("toast.error"), "error");
          } else {
            setFetchError("server");
            toast(t("empty.fetchError"), "error");
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        // setLoading(false) MUST be inside startTransition so it's atomic with data updates.
        // Otherwise React renders loading=false before pagination updates, causing a "0 results" flash.
        startTransition(() => {
          setMaterials(data.materials);
          setPagination(data.pagination);
          setSearchMatchMode(data.searchMeta?.matchMode ?? null);
          setLoading(false);
        });
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Error fetching materials:", error);
        setFetchError("network");
        toast(t("empty.fetchError"), "error");
        setLoading(false);
      }
    },
    [toast, t]
  );

  // --- Fetch profiles ---
  const fetchProfiles = useCallback(
    async (currentFilters: LP21FilterState, sort: string = "newest", page: number = 1) => {
      profilesAbortRef.current?.abort();
      const controller = new AbortController();
      profilesAbortRef.current = controller;

      setProfilesLoading(true);
      setFetchError(null);
      try {
        const params = new URLSearchParams();
        if (currentFilters.searchQuery) params.set("q", currentFilters.searchQuery);
        if (currentFilters.fachbereich) params.set("subjects", currentFilters.fachbereich);
        if (currentFilters.zyklus) params.set("cycles", currentFilters.zyklus.toString());
        if (sort && sort !== "newest") params.set("sort", sort);
        if (page > 1) params.set("page", page.toString());
        params.set("limit", "12");

        const response = await fetch(`/api/users/search?${params.toString()}`, {
          signal: controller.signal,
        });
        if (response.ok) {
          const data = await response.json();
          startTransition(() => {
            setProfiles(data.profiles);
            setProfilePagination(data.pagination);
            setProfilesLoading(false);
          });
        } else {
          setProfilesLoading(false);
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Error fetching profiles:", error);
        setProfilesLoading(false);
      }
    },
    []
  );

  return {
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
  };
}
