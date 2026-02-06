"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, Users, LayoutGrid, List, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { MaterialCard } from "@/components/ui/MaterialCard";
import { MaterialGridSkeleton } from "@/components/ui/Skeleton";
import { ProfileCard } from "@/components/ui/ProfileCard";
import { LP21FilterSidebar, type LP21FilterState } from "@/components/search/LP21FilterSidebar";
import { useCurriculum } from "@/lib/hooks/useCurriculum";
import { useToast } from "@/components/ui/Toast";

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
  seller: {
    id: string;
    display_name: string | null;
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
  resourceCount: number;
  followerCount: number;
}

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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sort") || "newest");
  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(searchParams.get("page") || "1", 10)
  );
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());

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
        router.push("/login");
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
    [isAuthenticated, router]
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
        router.push("/login");
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
    [isAuthenticated, router]
  );

  // Initialize filters from URL params
  const initialFilters = useMemo<LP21FilterState>(() => {
    const zyklus = searchParams.get("zyklus");
    const fachbereich = searchParams.get("fachbereich");
    const kompetenzbereich = searchParams.get("kompetenzbereich");
    const kompetenz = searchParams.get("kompetenz");

    // Backward compat: old ?searchType=profiles → showMaterials: false, showCreators: true
    const legacySearchType = searchParams.get("searchType");
    let showMaterials = searchParams.get("showMaterials") !== "false";
    let showCreators = searchParams.get("showCreators") !== "false";
    if (legacySearchType === "profiles") {
      showMaterials = false;
      showCreators = true;
    }
    // Ensure at least one is true
    if (!showMaterials && !showCreators) {
      showMaterials = true;
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
      priceType: searchParams.get("priceType") || null,
      maxPrice: searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : null,
      formats: searchParams.get("formats")?.split(",").filter(Boolean) || [],
      materialScope: searchParams.get("materialScope") || null,
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
      // Only add params when not default (both true)
      if (!currentFilters.showMaterials) params.set("showMaterials", "false");
      if (!currentFilters.showCreators) params.set("showCreators", "false");
      if (currentFilters.zyklus) params.set("zyklus", currentFilters.zyklus.toString());
      if (currentFilters.fachbereich) params.set("fachbereich", currentFilters.fachbereich);
      if (currentFilters.kompetenzbereich)
        params.set("kompetenzbereich", currentFilters.kompetenzbereich);
      if (currentFilters.kompetenz) params.set("kompetenz", currentFilters.kompetenz);
      if (currentFilters.searchQuery) params.set("search", currentFilters.searchQuery);
      if (currentFilters.priceType) params.set("priceType", currentFilters.priceType);
      if (currentFilters.maxPrice !== null)
        params.set("maxPrice", currentFilters.maxPrice.toString());
      if (currentFilters.formats.length > 0)
        params.set("formats", currentFilters.formats.join(","));
      if (currentFilters.materialScope) params.set("materialScope", currentFilters.materialScope);
      if (currentSort && currentSort !== "newest") params.set("sort", currentSort);
      if (page > 1) params.set("page", page.toString());
      return params;
    },
    []
  );

  // Update URL when filters change from sidebar (reset to page 1)
  const handleFiltersChange = useCallback(
    (newFilters: LP21FilterState) => {
      setFilters(newFilters);
      setCurrentPage(1);
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
  const mapFachbereichToSubject = useCallback(
    (code: string | null): string => {
      if (!code) return "";
      const fachbereich = getFachbereichByCode(code);
      return fachbereich?.code || code;
    },
    [getFachbereichByCode]
  );

  const fetchMaterials = useCallback(
    async (currentFilters: LP21FilterState, currentSort: string, page: number = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        // Pagination
        params.set("page", page.toString());

        // Map LP21 filters to API parameters
        if (currentFilters.fachbereich) {
          params.set("subject", mapFachbereichToSubject(currentFilters.fachbereich));
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

        // Price filter
        if (currentFilters.maxPrice !== null) {
          params.set("maxPrice", currentFilters.maxPrice.toString());
        }

        // Format filter
        if (currentFilters.formats.length > 0) {
          params.set("formats", currentFilters.formats.join(","));
        }

        // Material scope filter (single vs bundle)
        if (currentFilters.materialScope) {
          params.set("materialScope", currentFilters.materialScope);
        }

        // Sort parameter
        if (currentSort) {
          params.set("sort", currentSort);
        }

        const response = await fetch(`/api/materials?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setMaterials(data.materials);
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error("Error fetching materials:", error);
      } finally {
        setLoading(false);
      }
    },
    [mapFachbereichToSubject]
  );

  // Fetch materials when showMaterials is true
  useEffect(() => {
    if (filters.showMaterials) {
      fetchMaterials(filters, sortBy, currentPage);
    } else {
      setMaterials([]);
      setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 });
      setLoading(false);
    }
  }, [filters, sortBy, currentPage, fetchMaterials]);

  // Fetch profiles with optional filters
  const fetchProfiles = useCallback(async (currentFilters: LP21FilterState) => {
    setProfilesLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilters.searchQuery) params.set("q", currentFilters.searchQuery);
      if (currentFilters.fachbereich) params.set("subject", currentFilters.fachbereich);
      if (currentFilters.zyklus) params.set("cycle", currentFilters.zyklus.toString());
      params.set("limit", "12");

      const response = await fetch(`/api/users/search?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles);
        setProfilePagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setProfilesLoading(false);
    }
  }, []);

  // Fetch profiles when showCreators is true
  useEffect(() => {
    if (filters.showCreators) {
      const debounce = setTimeout(() => {
        fetchProfiles(filters);
      }, 300);
      return () => clearTimeout(debounce);
    } else {
      setProfiles([]);
      setProfilePagination({ page: 1, limit: 12, total: 0, totalPages: 0 });
      setProfilesLoading(false);
    }
  }, [filters, fetchProfiles]);

  // Get subject pill class based on subject name or code
  const getSubjectPillClass = (subject: string): string => {
    const subjectMap: Record<string, string> = {
      // By name
      Deutsch: "pill-deutsch",
      Mathematik: "pill-mathe",
      "Natur, Mensch, Gesellschaft": "pill-nmg",
      NMG: "pill-nmg",
      "Bildnerisches Gestalten": "pill-gestalten",
      BG: "pill-gestalten",
      "Textiles und Technisches Gestalten": "pill-ttg",
      TTG: "pill-ttg",
      Musik: "pill-musik",
      MU: "pill-musik",
      "Bewegung und Sport": "pill-sport",
      BS: "pill-sport",
      Französisch: "pill-franzoesisch",
      FR: "pill-franzoesisch",
      French: "pill-franzoesisch",
      Englisch: "pill-englisch",
      EN: "pill-englisch",
      English: "pill-englisch",
      // Legacy - Fremdsprachen
      Fremdsprachen: "pill-fremdsprachen",
      FS: "pill-fremdsprachen",
      "Medien und Informatik": "pill-medien",
      MI: "pill-medien",
      // Zyklus 3 specific
      "Natur und Technik": "pill-nt",
      NT: "pill-nt",
      "Wirtschaft, Arbeit, Haushalt": "pill-wah",
      WAH: "pill-wah",
      "Räume, Zeiten, Gesellschaften": "pill-rzg",
      RZG: "pill-rzg",
      "Ethik, Religionen, Gemeinschaft": "pill-erg",
      ERG: "pill-erg",
      "Berufliche Orientierung": "pill-bo",
      BO: "pill-bo",
      Projektunterricht: "pill-pu",
      PU: "pill-pu",
      // By code
      D: "pill-deutsch",
      MA: "pill-mathe",
    };
    return subjectMap[subject] || "pill-primary";
  };

  // Merged grid items for unified view
  type GridItem = { type: "material"; data: Material } | { type: "profile"; data: Profile };

  const mergedItems = useMemo<GridItem[]>(() => {
    const materialItems: GridItem[] = filters.showMaterials
      ? materials.map((r) => ({ type: "material" as const, data: r }))
      : [];
    const profileItems: GridItem[] = filters.showCreators
      ? profiles.map((p) => ({ type: "profile" as const, data: p }))
      : [];

    // When both are shown, intersperse profiles every 6th position
    if (filters.showMaterials && filters.showCreators) {
      const merged: GridItem[] = [];
      let rIdx = 0;
      let pIdx = 0;
      let position = 0;

      while (rIdx < materialItems.length || pIdx < profileItems.length) {
        // Insert a profile every 6th position (positions 5, 11, 17, ...)
        if (position > 0 && position % 6 === 5 && pIdx < profileItems.length) {
          merged.push(profileItems[pIdx++]);
        } else if (rIdx < materialItems.length) {
          merged.push(materialItems[rIdx++]);
        } else if (pIdx < profileItems.length) {
          merged.push(profileItems[pIdx++]);
        }
        position++;
      }
      return merged;
    }

    // When only one type is shown
    return [...materialItems, ...profileItems];
  }, [materials, profiles, filters.showMaterials, filters.showCreators]);

  // Count active filters for the badge
  const activeFilterCount = [
    filters.zyklus,
    filters.fachbereich,
    filters.kompetenzbereich,
    filters.kompetenz,
    filters.searchQuery || null,
    filters.priceType,
    filters.maxPrice !== null ? filters.maxPrice : null,
    ...filters.formats,
    filters.materialScope,
  ].filter(Boolean).length;

  // Combined loading state
  const isLoading = (filters.showMaterials && loading) || (filters.showCreators && profilesLoading);

  // Combined count
  const totalCount =
    (filters.showMaterials ? pagination.total : 0) +
    (filters.showCreators ? profilePagination.total : 0);

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <Breadcrumb items={[{ label: tCommon("navigation.materials") }]} />
          <h1 className="text-text text-2xl font-bold">{t("header.title")}</h1>
          <p className="text-text-muted mt-1">{t("header.description")}</p>
        </div>

        {/* Main Layout: Sidebar + Content */}
        {
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="border-border bg-bg-secondary text-text-secondary hover:border-primary hover:text-primary flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors"
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
                          {totalCount} {t("results.countLabel")} anzeigen
                        </button>
                      </div>
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
            <div className="min-w-0 flex-1">
              {/* Top Control Bar: Results + Sort */}
              <div className="bg-bg-secondary mb-4 flex flex-col gap-4 rounded-lg p-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Results Count */}
                <div>
                  <p className="text-text-muted text-sm">
                    <span className="text-text font-semibold">{totalCount}</span>{" "}
                    {t("results.countLabel")}
                  </p>
                </div>

                {/* View Toggle + Sort Dropdown */}
                {filters.showMaterials && (
                  <div className="flex items-center gap-3">
                    {/* Grid/List Toggle */}
                    <div className="border-border flex rounded-lg border">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`rounded-l-lg p-2 transition-colors ${
                          viewMode === "grid"
                            ? "bg-primary text-text-on-accent"
                            : "text-text-muted hover:text-text hover:bg-surface"
                        }`}
                        aria-label={t("results.gridView")}
                        title={t("results.gridView")}
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`rounded-r-lg p-2 transition-colors ${
                          viewMode === "list"
                            ? "bg-primary text-text-on-accent"
                            : "text-text-muted hover:text-text hover:bg-surface"
                        }`}
                        aria-label={t("results.listView")}
                        title={t("results.listView")}
                      >
                        <List className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-2">
                      <label className="text-text-muted hidden text-sm whitespace-nowrap sm:inline">
                        {t("results.sortLabel")}
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="border-border bg-bg text-text-secondary focus:border-primary focus:ring-focus-ring rounded-lg border px-3 py-2.5 text-sm focus:ring-2 focus:outline-none"
                      >
                        <option value="newest">{t("results.sortOptions.newest")}</option>
                        <option value="price-low">{t("results.sortOptions.priceLow")}</option>
                        <option value="price-high">{t("results.sortOptions.priceHigh")}</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Active Filter Chips - dismissable */}
              {activeFilterCount > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {filters.searchQuery && (
                    <span className="bg-primary/10 text-primary border-primary/20 inline-flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-3 text-xs font-semibold">
                      &quot;{filters.searchQuery}&quot;
                      <button
                        onClick={() => handleFiltersChange({ ...filters, searchQuery: "" })}
                        className="hover:bg-primary/20 flex h-5 w-5 items-center justify-center rounded-full transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.zyklus && (
                    <span className="bg-primary/10 text-primary border-primary/20 inline-flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-3 text-xs font-semibold">
                      Zyklus {filters.zyklus}
                      <button
                        onClick={() =>
                          handleFiltersChange({
                            ...filters,
                            zyklus: null,
                            fachbereich: null,
                            kompetenzbereich: null,
                            kompetenz: null,
                          })
                        }
                        className="hover:bg-primary/20 flex h-5 w-5 items-center justify-center rounded-full transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.fachbereich && (
                    <span className="bg-accent/10 text-accent border-accent/20 inline-flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-3 text-xs font-semibold">
                      {getFachbereichByCode(filters.fachbereich)?.shortName || filters.fachbereich}
                      <button
                        onClick={() =>
                          handleFiltersChange({
                            ...filters,
                            fachbereich: null,
                            kompetenzbereich: null,
                            kompetenz: null,
                          })
                        }
                        className="hover:bg-accent/20 flex h-5 w-5 items-center justify-center rounded-full transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.kompetenzbereich && (
                    <span className="bg-accent/10 text-accent border-accent/20 inline-flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-3 text-xs font-semibold">
                      {filters.kompetenzbereich}
                      <button
                        onClick={() =>
                          handleFiltersChange({
                            ...filters,
                            kompetenzbereich: null,
                            kompetenz: null,
                          })
                        }
                        className="hover:bg-accent/20 flex h-5 w-5 items-center justify-center rounded-full transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.kompetenz && (
                    <span className="bg-accent/10 text-accent border-accent/20 inline-flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-3 text-xs font-semibold">
                      {filters.kompetenz}
                      <button
                        onClick={() => handleFiltersChange({ ...filters, kompetenz: null })}
                        className="hover:bg-accent/20 flex h-5 w-5 items-center justify-center rounded-full transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {(filters.priceType || filters.maxPrice !== null) && (
                    <span className="bg-surface text-text-secondary border-border inline-flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-3 text-xs font-semibold">
                      {filters.priceType === "free"
                        ? "Kostenlos"
                        : filters.maxPrice !== null
                          ? `< CHF ${filters.maxPrice}`
                          : ""}
                      <button
                        onClick={() =>
                          handleFiltersChange({ ...filters, priceType: null, maxPrice: null })
                        }
                        className="hover:bg-surface-hover flex h-5 w-5 items-center justify-center rounded-full transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.formats.map((fmt) => (
                    <span
                      key={fmt}
                      className="bg-surface text-text-secondary border-border inline-flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-3 text-xs font-semibold"
                    >
                      {fmt.toUpperCase()}
                      <button
                        onClick={() =>
                          handleFiltersChange({
                            ...filters,
                            formats: filters.formats.filter((f) => f !== fmt),
                          })
                        }
                        className="hover:bg-surface-hover flex h-5 w-5 items-center justify-center rounded-full transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {filters.materialScope && (
                    <span className="bg-surface text-text-secondary border-border inline-flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-3 text-xs font-semibold">
                      {filters.materialScope === "single" ? "Einzelmaterial" : "Bundle"}
                      <button
                        onClick={() => handleFiltersChange({ ...filters, materialScope: null })}
                        className="hover:bg-surface-hover flex h-5 w-5 items-center justify-center rounded-full transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {activeFilterCount > 1 && (
                    <button
                      onClick={() =>
                        handleFiltersChange({
                          showMaterials: filters.showMaterials,
                          showCreators: filters.showCreators,
                          zyklus: null,
                          fachbereich: null,
                          kompetenzbereich: null,
                          kompetenz: null,
                          searchQuery: "",
                          priceType: null,
                          maxPrice: null,
                          formats: [],
                          materialScope: null,
                        })
                      }
                      className="text-text-muted hover:text-error text-xs font-medium transition-colors"
                    >
                      Alle entfernen
                    </button>
                  )}
                </div>
              )}

              {/* Unified Grid */}
              {isLoading ? (
                <MaterialGridSkeleton count={6} />
              ) : mergedItems.length === 0 ? (
                <div className="border-border-subtle bg-bg-secondary flex flex-col items-center justify-center rounded-lg border px-8 py-16">
                  <div className="bg-surface-hover mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    {!filters.showMaterials && filters.showCreators ? (
                      <Users className="text-text-muted h-8 w-8" />
                    ) : (
                      <Search className="text-text-muted h-8 w-8" />
                    )}
                  </div>
                  <p className="text-text mb-2 text-lg font-medium">{t("empty.title")}</p>
                  <p className="text-text-muted mb-6 max-w-sm text-center text-sm">
                    {t("empty.description")}
                  </p>
                  {(filters.zyklus ||
                    filters.fachbereich ||
                    filters.kompetenzbereich ||
                    filters.kompetenz ||
                    filters.searchQuery ||
                    filters.priceType ||
                    filters.maxPrice !== null ||
                    filters.formats.length > 0 ||
                    filters.materialScope) && (
                    <button
                      onClick={() =>
                        handleFiltersChange({
                          showMaterials: filters.showMaterials,
                          showCreators: filters.showCreators,
                          zyklus: null,
                          fachbereich: null,
                          kompetenzbereich: null,
                          kompetenz: null,
                          searchQuery: "",
                          priceType: null,
                          maxPrice: null,
                          formats: [],
                          materialScope: null,
                        })
                      }
                      className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Alle Filter zurücksetzen
                    </button>
                  )}
                </div>
              ) : (
                <motion.div
                  className={
                    viewMode === "grid"
                      ? "grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3"
                      : "flex flex-col gap-4"
                  }
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.02,
                      },
                    },
                  }}
                >
                  {mergedItems.map((item) =>
                    item.type === "material" ? (
                      <motion.div
                        key={`material-${item.data.id}`}
                        variants={{
                          hidden: { opacity: 0, y: 16, scale: 0.98 },
                          visible: {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                          },
                        }}
                      >
                        <MaterialCard
                          id={item.data.id}
                          title={item.data.title}
                          description={item.data.description}
                          subject={item.data.subject}
                          cycle={item.data.cycle}
                          priceFormatted={item.data.priceFormatted}
                          previewUrl={item.data.previewUrl}
                          seller={{ displayName: item.data.seller.display_name }}
                          subjectPillClass={getSubjectPillClass(item.data.subject)}
                          showWishlist={true}
                          isWishlisted={wishlistedIds.has(item.data.id)}
                          onWishlistToggle={handleWishlistToggle}
                          variant={viewMode === "list" ? "compact" : "default"}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key={`profile-${item.data.id}`}
                        variants={{
                          hidden: { opacity: 0, y: 16, scale: 0.98 },
                          visible: {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                          },
                        }}
                        className="h-full"
                      >
                        <ProfileCard
                          id={item.data.id}
                          name={item.data.name}
                          image={item.data.image}
                          bio={item.data.bio}
                          subjects={item.data.subjects}
                          resourceCount={item.data.resourceCount}
                          followerCount={item.data.followerCount}
                          isVerified={item.data.role === "SELLER"}
                          getSubjectPillClass={getSubjectPillClass}
                          showFollowButton={true}
                          isFollowing={followingIds.has(item.data.id)}
                          onFollowToggle={handleFollowToggle}
                        />
                      </motion.div>
                    )
                  )}
                </motion.div>
              )}

              {/* Pagination - only for resources */}
              {filters.showMaterials && pagination.totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <nav className="flex items-center gap-1">
                    {/* Previous button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="text-text-muted hover:bg-surface rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={currentPage === 1}
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    {/* Page numbers with ellipsis for large page counts */}
                    {(() => {
                      const pages: (number | string)[] = [];
                      const totalPages = pagination.totalPages;
                      const current = currentPage;

                      if (totalPages <= 7) {
                        // Show all pages
                        for (let i = 1; i <= totalPages; i++) pages.push(i);
                      } else {
                        // Always show first page
                        pages.push(1);

                        if (current > 3) {
                          pages.push("...");
                        }

                        // Show pages around current
                        const start = Math.max(2, current - 1);
                        const end = Math.min(totalPages - 1, current + 1);
                        for (let i = start; i <= end; i++) pages.push(i);

                        if (current < totalPages - 2) {
                          pages.push("...");
                        }

                        // Always show last page
                        pages.push(totalPages);
                      }

                      return pages.map((pageNum, idx) =>
                        pageNum === "..." ? (
                          <span
                            key={`ellipsis-${idx}`}
                            className="text-text-muted px-2 py-2 text-sm"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum as number)}
                            className={`min-w-[40px] rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                              pageNum === currentPage
                                ? "bg-primary text-text-on-accent shadow-sm"
                                : "text-text-secondary hover:bg-surface hover:scale-105 active:scale-95"
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      );
                    })()}

                    {/* Next button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="text-text-secondary hover:bg-surface rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={currentPage === pagination.totalPages}
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        }
      </main>

      <Footer />
    </div>
  );
}
