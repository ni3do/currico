"use client";

import { useState, useEffect, useCallback, useMemo, useTransition, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { getLoginUrl } from "@/lib/utils/login-redirect";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, LayoutGrid, List, Search, X, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { MaterialCard } from "@/components/ui/MaterialCard";
import { MaterialGridSkeleton, ProfileGridSkeleton } from "@/components/ui/Skeleton";
import { EmptySearchState } from "@/components/ui/EmptySearchState";
import { ProfileCard } from "@/components/ui/ProfileCard";
import { LP21FilterSidebar, type LP21FilterState } from "@/components/search/LP21FilterSidebar";
import { FilterChips } from "@/components/search/FilterChips";
import { PaginationControls } from "@/components/search/PaginationControls";
import { FocusTrap } from "@/components/ui/FocusTrap";
import { useCurriculum } from "@/lib/hooks/useCurriculum";
import { useToast } from "@/components/ui/Toast";
import { getSubjectPillClass } from "@/lib/constants/subject-colors";

interface Material {
  id: string;
  title: string;
  description: string;
  price: number;
  priceFormatted: string;
  subject: string;
  cycle: string;
  subjects: string[];
  cycles: string[];
  previewUrl: string | null;
  createdAt: string;
  averageRating?: number;
  reviewCount?: number;
  seller: {
    id: string;
    display_name: string | null;
    is_verified_seller?: boolean;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Profile {
  id: string;
  name: string;
  image: string | null;
  bio: string | null;
  subjects: string[];
  cycles: string[];
  role: string;
  is_verified_seller?: boolean;
  resourceCount: number;
  followerCount: number;
}

/** Debounce delay (ms) before fetching materials after filter changes */
const MATERIALS_DEBOUNCE_MS = 150;
/** Debounce delay (ms) before fetching profiles after filter changes */
const PROFILES_DEBOUNCE_MS = 300;

export default function MaterialienPage() {
  const t = useTranslations("materialsPage");
  const tCommon = useTranslations("common");
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  // useTransition for non-blocking filter/tab changes (prevents flicker)
  const [isPending, startTransition] = useTransition();
  // Ref to abort in-flight requests when filters change
  const materialsAbortRef = useRef<AbortController | null>(null);
  const profilesAbortRef = useRef<AbortController | null>(null);
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
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [searchMatchMode, setSearchMatchMode] = useState<"exact" | "fuzzy" | "combined">("exact");

  // Auth session for wishlist
  const { status: sessionStatus } = useSession();
  const isAuthenticated = sessionStatus === "authenticated";

  // Fetch curriculum data from API
  const { fachbereiche, getFachbereichByCode } = useCurriculum();

  // Fetch user's wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await fetch("/api/user/wishlist");
        if (response.ok) {
          const data = await response.json();
          const ids = new Set<string>(data.items.map((item: { id: string }) => item.id));
          setWishlistedIds(ids);
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };
    fetchWishlist();
  }, [isAuthenticated]);

  // Handle wishlist toggle
  const handleWishlistToggle = useCallback(
    async (materialId: string, currentState: boolean): Promise<boolean> => {
      if (!isAuthenticated) {
        toast(t("toast.loginRequired"), "info");
        return false;
      }

      try {
        if (currentState) {
          // Remove from wishlist
          const response = await fetch(`/api/user/wishlist?resourceId=${materialId}`, {
            method: "DELETE",
          });
          if (response.ok) {
            setWishlistedIds((prev) => {
              const next = new Set(prev);
              next.delete(materialId);
              return next;
            });
            toast(t("toast.removedFromWishlist"), "success");
            return true;
          }
        } else {
          // Add to wishlist
          const response = await fetch("/api/user/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resourceId: materialId }),
          });
          if (response.ok) {
            setWishlistedIds((prev) => new Set(prev).add(materialId));
            toast(t("toast.addedToWishlist"), "success");
            return true;
          }
        }
      } catch (error) {
        console.error("Error toggling wishlist:", error);
        toast(t("toast.error"), "error");
      }
      return false;
    },
    [isAuthenticated, t, toast]
  );

  // State for followed profile IDs
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  // Fetch user's following list
  useEffect(() => {
    const fetchFollowing = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await fetch("/api/user/following");
        if (response.ok) {
          const data = await response.json();
          const ids = new Set<string>(data.sellers.map((item: { id: string }) => item.id));
          setFollowingIds(ids);
        }
      } catch (error) {
        console.error("Error fetching following:", error);
      }
    };
    fetchFollowing();
  }, [isAuthenticated]);

  // Handle follow toggle
  const handleFollowToggle = useCallback(
    async (profileId: string, currentState: boolean): Promise<boolean> => {
      if (!isAuthenticated) {
        router.push(getLoginUrl("/materialien"));
        return false;
      }

      try {
        if (currentState) {
          // Unfollow
          const response = await fetch(`/api/users/${profileId}/follow`, {
            method: "DELETE",
          });
          if (response.ok) {
            setFollowingIds((prev) => {
              const next = new Set(prev);
              next.delete(profileId);
              return next;
            });
            toast(t("toast.unfollowed"), "success");
            return true;
          }
        } else {
          // Follow
          const response = await fetch(`/api/users/${profileId}/follow`, {
            method: "POST",
          });
          if (response.ok) {
            setFollowingIds((prev) => new Set(prev).add(profileId));
            toast(t("toast.followed"), "success");
            return true;
          }
        }
      } catch (error) {
        console.error("Error toggling follow:", error);
        toast(t("toast.error"), "error");
      }
      return false;
    },
    [isAuthenticated, router, t, toast]
  );

  // Initialize filters from URL params
  const initialFilters = useMemo<LP21FilterState>(() => {
    const zyklus = searchParams.get("zyklus");
    const fachbereich = searchParams.get("fachbereich");
    const kompetenzbereich = searchParams.get("kompetenzbereich");
    const kompetenz = searchParams.get("kompetenz");

    // Default: materials tab active, profiles tab inactive
    // Backward compat: ?showCreators=true or ?searchType=profiles → profiles tab
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
    };
  }, [searchParams]);

  // LP21 filter state - initialize from URL
  const [filters, setFilters] = useState<LP21FilterState>(initialFilters);

  // Sync filters with URL when they change from URL (e.g., navigation)
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Build URL params helper
  const buildUrlParams = useCallback(
    (currentFilters: LP21FilterState, currentSort: string, page: number = 1) => {
      const params = new URLSearchParams();
      // Only write showCreators when profiles tab is active (materials is default)
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

  // Update URL when filters change from sidebar (reset to page 1)
  const handleFiltersChange = useCallback(
    (newFilters: LP21FilterState) => {
      setFilters(newFilters);
      setCurrentPage(1);
      setProfilePage(1);
      const params = buildUrlParams(newFilters, sortBy, 1);
      const newUrl = params.toString() ? `/materialien?${params.toString()}` : "/materialien";
      router.replace(newUrl, { scroll: false });
    },
    [router, sortBy, buildUrlParams]
  );

  // Handle sort change (reset to page 1)
  const handleSortChange = useCallback(
    (newSort: string) => {
      setSortBy(newSort);
      setCurrentPage(1);
      const params = buildUrlParams(filters, newSort, 1);
      const newUrl = params.toString() ? `/materialien?${params.toString()}` : "/materialien";
      router.replace(newUrl, { scroll: false });
    },
    [router, filters, buildUrlParams]
  );

  // Handle profile sort change
  const handleProfileSortChange = useCallback(
    (newSort: string) => {
      setProfileSortBy(newSort);
      setProfilePage(1);
      const params = buildUrlParams(filters, sortBy, currentPage);
      // Override profile-specific params
      if (newSort !== "newest") params.set("profileSort", newSort);
      else params.delete("profileSort");
      params.delete("profilePage");
      const newUrl = params.toString() ? `/materialien?${params.toString()}` : "/materialien";
      router.replace(newUrl, { scroll: false });
    },
    [router, filters, sortBy, currentPage, buildUrlParams]
  );

  // Handle profile page change
  const handleProfilePageChange = useCallback(
    (newPage: number) => {
      setProfilePage(newPage);
      const params = buildUrlParams(filters, sortBy, currentPage);
      if (newPage > 1) params.set("profilePage", newPage.toString());
      else params.delete("profilePage");
      const newUrl = params.toString() ? `/materialien?${params.toString()}` : "/materialien";
      router.replace(newUrl, { scroll: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router, filters, sortBy, currentPage, buildUrlParams]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      const params = buildUrlParams(filters, sortBy, newPage);
      const newUrl = params.toString() ? `/materialien?${params.toString()}` : "/materialien";
      router.replace(newUrl, { scroll: false });
      // Scroll to top of results
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router, filters, sortBy, buildUrlParams]
  );

  // Map Fachbereich code to subject code for API compatibility
  // Use a ref so fetchMaterials doesn't re-create when curriculum data loads
  const mapFachbereichToSubjectRef = useRef((code: string | null): string => code || "");
  useEffect(() => {
    mapFachbereichToSubjectRef.current = (code: string | null): string => {
      if (!code) return "";
      const fachbereich = getFachbereichByCode(code);
      return fachbereich?.code || code;
    };
  }, [getFachbereichByCode]);

  const fetchMaterials = useCallback(
    async (currentFilters: LP21FilterState, currentSort: string, page: number = 1) => {
      // Abort any previous in-flight request
      materialsAbortRef.current?.abort();
      const controller = new AbortController();
      materialsAbortRef.current = controller;

      setLoading(true);
      setFetchError(null);
      try {
        const params = new URLSearchParams();

        // Pagination
        params.set("page", page.toString());

        // Map LP21 filters to API parameters
        if (currentFilters.fachbereich) {
          params.set("subject", mapFachbereichToSubjectRef.current(currentFilters.fachbereich));
        }
        if (currentFilters.zyklus) {
          params.set("cycle", currentFilters.zyklus.toString());
        }
        if (currentFilters.searchQuery) {
          params.set("search", currentFilters.searchQuery);
        }
        // Use the most specific competency level available
        if (currentFilters.kompetenz) {
          params.set("competency", currentFilters.kompetenz);
        } else if (currentFilters.kompetenzbereich) {
          params.set("competency", currentFilters.kompetenzbereich);
        }

        // Dialect filter
        if (currentFilters.dialect) {
          params.set("dialect", currentFilters.dialect);
        }

        // Price filter
        if (currentFilters.maxPrice !== null) {
          params.set("maxPrice", currentFilters.maxPrice.toString());
        }

        // Format filter
        if (currentFilters.formats.length > 0) {
          params.set("formats", currentFilters.formats.join(","));
        }

        // Canton filter
        if (currentFilters.cantons.length > 0) {
          params.set("cantons", currentFilters.cantons.join(","));
        }

        // Sort parameter
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
          return;
        }

        const data = await response.json();
        startTransition(() => {
          setMaterials(data.materials);
          setPagination(data.pagination);
          if (data.searchMeta?.matchMode) {
            setSearchMatchMode(data.searchMeta.matchMode);
          } else {
            setSearchMatchMode("exact");
          }
        });
      } catch (error: unknown) {
        // Ignore aborted requests (user changed filters quickly)
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Error fetching materials:", error);
        setFetchError("network");
        toast(t("empty.fetchError"), "error");
      } finally {
        setLoading(false);
      }
    },
    [toast, t]
  );

  // Abort in-flight requests on unmount
  useEffect(() => {
    return () => {
      materialsAbortRef.current?.abort();
      profilesAbortRef.current?.abort();
    };
  }, []);

  // Clear fetch error when filters change (so stale errors don't persist across tab switches)
  useEffect(() => {
    setFetchError(null);
  }, [filters]);

  // Fetch materials when showMaterials is true (debounced to prevent flicker on rapid filter changes)
  useEffect(() => {
    if (filters.showMaterials) {
      const debounce = setTimeout(() => {
        fetchMaterials(filters, sortBy, currentPage);
      }, MATERIALS_DEBOUNCE_MS);
      return () => clearTimeout(debounce);
    } else {
      setMaterials([]);
      setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 });
      setLoading(false);
    }
  }, [filters, sortBy, currentPage, fetchMaterials]);

  // Fetch profiles with optional filters
  const fetchProfiles = useCallback(
    async (currentFilters: LP21FilterState, sort: string = "newest", page: number = 1) => {
      // Abort any previous in-flight profile request
      profilesAbortRef.current?.abort();
      const controller = new AbortController();
      profilesAbortRef.current = controller;

      setProfilesLoading(true);
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
          });
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Error fetching profiles:", error);
      } finally {
        setProfilesLoading(false);
      }
    },
    []
  );

  // Fetch profiles when showCreators is true
  useEffect(() => {
    if (filters.showCreators) {
      const debounce = setTimeout(() => {
        fetchProfiles(filters, profileSortBy, profilePage);
      }, PROFILES_DEBOUNCE_MS);
      return () => clearTimeout(debounce);
    } else {
      setProfiles([]);
      setProfilePagination({ page: 1, limit: 12, total: 0, totalPages: 0 });
      setProfilesLoading(false);
    }
  }, [filters, profileSortBy, profilePage, fetchProfiles]);

  // Count active filters for the badge
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
  ].filter(Boolean).length;

  // Loading state for active tab
  const isLoading = filters.showMaterials ? loading : profilesLoading;

  // Count for active tab
  const totalCount = filters.showMaterials ? pagination.total : profilePagination.total;

  // Count label for active tab
  const countLabel = filters.showMaterials
    ? t("results.countLabel")
    : t("results.countLabelProfiles");

  // Items empty check for active tab
  const hasNoItems = filters.showMaterials ? materials.length === 0 : profiles.length === 0;

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <Breadcrumb items={[{ label: tCommon("navigation.materials") }]} />
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-text text-2xl font-bold sm:text-3xl">{t("header.title")}</h1>
              <p className="text-text-muted mt-1.5 text-sm sm:text-base">
                {t("header.description")}
              </p>
            </div>
            {filters.showMaterials && (
              <Link
                href="/hochladen"
                className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors sm:px-4"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">{t("header.uploadButton")}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Main Layout: Sidebar + Content */}
        {
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="border-border bg-bg-secondary text-text-secondary hover:border-primary hover:text-primary flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3.5 text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]"
              >
                <SlidersHorizontal className="h-5 w-5" />
                <span>{t("sidebar.title")}</span>
                {activeFilterCount > 0 && (
                  <span className="bg-primary flex h-5 w-5 items-center justify-center rounded-full text-xs text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Mobile Filter Drawer (Bottom Sheet) */}
              <AnimatePresence>
                {mobileFiltersOpen && (
                  <>
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
                      onClick={() => setMobileFiltersOpen(false)}
                    />
                    {/* Drawer */}
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="bg-bg fixed inset-x-0 bottom-0 z-[101] max-h-[85vh] overflow-y-auto rounded-t-2xl shadow-2xl"
                    >
                      <FocusTrap
                        active={mobileFiltersOpen}
                        onEscape={() => setMobileFiltersOpen(false)}
                      >
                        {/* Drawer handle */}
                        <div className="bg-bg border-border sticky top-0 z-10 flex items-center justify-between border-b px-5 pt-3 pb-4">
                          <div className="bg-border mx-auto mb-3 h-1 w-10 rounded-full" />
                        </div>
                        <div className="bg-bg sticky top-0 z-10 flex items-center justify-between px-5 pb-3">
                          <h2 className="text-text text-lg font-semibold">{t("sidebar.title")}</h2>
                          <button
                            onClick={() => setMobileFiltersOpen(false)}
                            className="text-text-muted hover:text-text hover:bg-surface flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="px-1 pb-8">
                          <LP21FilterSidebar
                            filters={filters}
                            onFiltersChange={handleFiltersChange}
                          />
                        </div>
                        {/* Apply button */}
                        <div className="bg-bg border-border sticky bottom-0 border-t px-5 py-4">
                          <button
                            onClick={() => setMobileFiltersOpen(false)}
                            className="bg-primary text-text-on-accent hover:bg-primary-hover w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors"
                          >
                            {t("results.showResults", { count: totalCount })}
                          </button>
                        </div>
                      </FocusTrap>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden w-72 flex-shrink-0 lg:block">
              <LP21FilterSidebar filters={filters} onFiltersChange={handleFiltersChange} />
            </div>

            {/* Main Content Area */}
            <div className="min-w-0 flex-1" id="search-results-panel" role="tabpanel">
              {/* Top Control Bar: Results + Sort */}
              <div className="bg-bg-secondary mb-4 flex flex-col gap-4 rounded-lg p-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Results Count */}
                <div className="h-5">
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="skeleton"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="bg-surface h-5 w-40 animate-pulse rounded"
                      />
                    ) : (
                      <motion.p
                        key={`count-${totalCount}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="text-text-muted text-sm tabular-nums"
                      >
                        <span className="text-text font-semibold">{totalCount}</span> {countLabel}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* View Toggle + Sort Dropdown */}
                <div className="flex items-center gap-3">
                  {/* Grid/List Toggle — materials only */}
                  {filters.showMaterials && (
                    <div className="bg-surface flex rounded-lg p-0.5">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`rounded-md p-2 transition-all duration-200 ${
                          viewMode === "grid"
                            ? "bg-primary text-text-on-accent shadow-sm"
                            : "text-text-faint hover:text-text-muted active:scale-90"
                        }`}
                        aria-label={t("results.gridView")}
                        title={t("results.gridView")}
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`rounded-md p-2 transition-all duration-200 ${
                          viewMode === "list"
                            ? "bg-primary text-text-on-accent shadow-sm"
                            : "text-text-faint hover:text-text-muted active:scale-90"
                        }`}
                        aria-label={t("results.listView")}
                        title={t("results.listView")}
                      >
                        <List className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <label className="text-text-muted hidden text-sm whitespace-nowrap sm:inline">
                      {t("results.sortLabel")}
                    </label>
                    {filters.showMaterials ? (
                      <select
                        value={sortBy}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="border-border bg-bg text-text-secondary focus:border-primary focus:ring-focus-ring rounded-full border px-3 py-2.5 text-sm focus:ring-2 focus:outline-none"
                      >
                        {filters.searchQuery && (
                          <option value="relevance">{t("results.sortOptions.relevance")}</option>
                        )}
                        <option value="newest">{t("results.sortOptions.newest")}</option>
                        <option value="price-low">{t("results.sortOptions.priceLow")}</option>
                        <option value="price-high">{t("results.sortOptions.priceHigh")}</option>
                      </select>
                    ) : (
                      <select
                        value={profileSortBy}
                        onChange={(e) => handleProfileSortChange(e.target.value)}
                        className="border-border bg-bg text-text-secondary focus:border-primary focus:ring-focus-ring rounded-full border px-3 py-2.5 text-sm focus:ring-2 focus:outline-none"
                      >
                        <option value="newest">{t("results.profileSortOptions.newest")}</option>
                        <option value="mostMaterials">
                          {t("results.profileSortOptions.mostMaterials")}
                        </option>
                        <option value="mostFollowers">
                          {t("results.profileSortOptions.mostFollowers")}
                        </option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Filter Chips - dismissable */}
              <FilterChips
                filters={filters}
                onFiltersChange={handleFiltersChange}
                activeFilterCount={activeFilterCount}
                getFachbereichByCode={getFachbereichByCode}
                t={t}
              />

              {/* Fuzzy search indicator banner */}
              {!isLoading &&
                filters.searchQuery &&
                (searchMatchMode === "fuzzy" || searchMatchMode === "combined") &&
                materials.length > 0 && (
                  <div className="bg-warning/10 border-warning/30 text-warning-foreground mb-4 rounded-lg border px-4 py-2.5 text-sm">
                    {t("search.fuzzyResults")}
                  </div>
                )}

              {/* Error State */}
              {fetchError ? (
                <div className="border-error/20 bg-error/5 flex flex-col items-center justify-center rounded-xl border px-8 py-16">
                  <div className="bg-error/10 mb-5 flex h-16 w-16 items-center justify-center rounded-full">
                    <Search className="text-error h-8 w-8" />
                  </div>
                  <p className="text-text mb-2 text-lg font-semibold">{t("empty.fetchError")}</p>
                  <button
                    onClick={() => fetchMaterials(filters, sortBy, currentPage)}
                    className="bg-primary text-text-on-accent hover:bg-primary-hover mt-4 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors"
                  >
                    {t("empty.fetchErrorRetry")}
                  </button>
                </div>
              ) : /* Unified Grid */
              isLoading ? (
                filters.showCreators ? (
                  <ProfileGridSkeleton count={6} />
                ) : (
                  <MaterialGridSkeleton count={6} />
                )
              ) : hasNoItems ? (
                <EmptySearchState
                  filters={filters}
                  onResetFilters={() =>
                    handleFiltersChange({
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
                    })
                  }
                  onResetSearch={() => handleFiltersChange({ ...filters, searchQuery: "" })}
                  onSuggestionClick={(query) =>
                    handleFiltersChange({
                      showMaterials: filters.showMaterials,
                      showCreators: filters.showCreators,
                      zyklus: null,
                      fachbereich: null,
                      kompetenzbereich: null,
                      kompetenz: null,
                      searchQuery: query,
                      dialect: null,

                      maxPrice: null,
                      formats: [],

                      cantons: [],
                    })
                  }
                />
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={filters.showMaterials ? "materials" : "profiles"}
                    className={
                      viewMode === "grid" || !filters.showMaterials
                        ? "grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3"
                        : "flex flex-col gap-5"
                    }
                    style={{ opacity: isPending ? 0.7 : 1, transition: "opacity 150ms ease" }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {filters.showMaterials
                      ? materials.map((material, index) => (
                          <motion.div
                            key={`material-${material.id}`}
                            initial={{ opacity: 0, y: 16, scale: 0.98 }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              scale: 1,
                              transition: {
                                duration: 0.4,
                                delay: index * 0.05 + 0.02,
                                ease: [0.22, 1, 0.36, 1],
                              },
                            }}
                          >
                            <MaterialCard
                              id={material.id}
                              title={material.title}
                              description={material.description}
                              subject={material.subject}
                              cycle={material.cycle}
                              priceFormatted={material.priceFormatted}
                              previewUrl={material.previewUrl}
                              seller={{
                                displayName: material.seller.display_name,
                                isVerifiedSeller: material.seller.is_verified_seller,
                              }}
                              subjectPillClass={getSubjectPillClass(material.subject)}
                              showWishlist={true}
                              isWishlisted={wishlistedIds.has(material.id)}
                              onWishlistToggle={handleWishlistToggle}
                              variant={viewMode === "list" ? "compact" : "default"}
                              averageRating={material.averageRating}
                              reviewCount={material.reviewCount}
                              wishlistAddLabel={t("card.wishlistAdd")}
                              wishlistRemoveLabel={t("card.wishlistRemove")}
                              anonymousLabel={t("card.anonymous")}
                            />
                          </motion.div>
                        ))
                      : profiles.map((profile, index) => (
                          <motion.div
                            key={`profile-${profile.id}`}
                            initial={{ opacity: 0, y: 16, scale: 0.98 }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              scale: 1,
                              transition: {
                                duration: 0.4,
                                delay: index * 0.05 + 0.02,
                                ease: [0.22, 1, 0.36, 1],
                              },
                            }}
                            className="h-full"
                          >
                            <ProfileCard
                              id={profile.id}
                              name={profile.name}
                              image={profile.image}
                              bio={profile.bio}
                              subjects={profile.subjects}
                              resourceCount={profile.resourceCount}
                              followerCount={profile.followerCount}
                              isVerified={profile.is_verified_seller === true}
                              getSubjectPillClass={getSubjectPillClass}
                              showFollowButton={true}
                              isFollowing={followingIds.has(profile.id)}
                              onFollowToggle={handleFollowToggle}
                            />
                          </motion.div>
                        ))}
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Pagination — works for both tabs */}
              <PaginationControls
                currentPage={filters.showMaterials ? currentPage : profilePage}
                totalPages={(filters.showMaterials ? pagination : profilePagination).totalPages}
                onPageChange={filters.showMaterials ? handlePageChange : handleProfilePageChange}
                labels={{
                  nav: t("pagination.nav"),
                  previous: t("pagination.previous"),
                  next: t("pagination.next"),
                }}
              />
            </div>
          </div>
        }
      </main>

      <Footer />
    </div>
  );
}
