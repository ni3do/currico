"use client";

import { useState, useEffect, useCallback, useMemo, useTransition, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Search, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { MaterialCard } from "@/components/ui/MaterialCard";
import { MaterialGridSkeleton, ProfileGridSkeleton } from "@/components/ui/Skeleton";
import { EmptySearchState } from "@/components/ui/EmptySearchState";
import { ProfileCard } from "@/components/ui/ProfileCard";
import { LP21FilterSidebar } from "@/components/search/LP21FilterSidebar";
import { FilterChips } from "@/components/search/FilterChips";
import { PaginationControls } from "@/components/search/PaginationControls";
import { MobileFilterDrawer } from "@/components/search/MobileFilterDrawer";
import { ResultsControlBar } from "@/components/search/ResultsControlBar";
import { useCurriculum } from "@/lib/hooks/useCurriculum";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { useFollowing } from "@/lib/hooks/useFollowing";
import { useToast } from "@/components/ui/Toast";
import { getSubjectPillClass } from "@/lib/constants/subject-colors";
import type {
  LP21FilterState,
  MaterialListItem,
  Pagination,
  ProfileListItem,
} from "@/lib/types/search";

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

  // Auth session for wishlist
  const { status: sessionStatus } = useSession();
  const isAuthenticated = sessionStatus === "authenticated";

  // Fetch curriculum data from API
  const { fachbereiche, getFachbereichByCode } = useCurriculum();

  // Wishlist hook
  const { wishlistedIds, handleWishlistToggle } = useWishlist({
    isAuthenticated,
    toast,
    t,
  });

  // Following hook
  const { followingIds, handleFollowToggle } = useFollowing({
    isAuthenticated,
    toast,
    t,
    onUnauthenticated: () => router.push("/anmelden"),
  });

  // Initialize filters from URL params
  const initialFilters = useMemo<LP21FilterState>(() => {
    const zyklus = searchParams.get("zyklus");
    const fachbereich = searchParams.get("fachbereich");
    const kompetenzbereich = searchParams.get("kompetenzbereich");
    const kompetenz = searchParams.get("kompetenz");

    // Default: materials tab active, profiles tab inactive
    // Backward compat: ?showCreators=true or ?searchType=profiles -> profiles tab
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
            {/* Mobile Filter Toggle + Drawer */}
            <MobileFilterDrawer
              isOpen={mobileFiltersOpen}
              onOpen={() => setMobileFiltersOpen(true)}
              onClose={() => setMobileFiltersOpen(false)}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              activeFilterCount={activeFilterCount}
              totalCount={totalCount}
              labels={{
                filterTitle: t("sidebar.title"),
                showResults: t("results.showResults", { count: totalCount }),
              }}
            />

            {/* Desktop Sidebar */}
            <div className="hidden w-72 flex-shrink-0 lg:block">
              <LP21FilterSidebar filters={filters} onFiltersChange={handleFiltersChange} />
            </div>

            {/* Main Content Area */}
            <div className="min-w-0 flex-1" id="search-results-panel" role="tabpanel">
              {/* Top Control Bar: Results + Sort */}
              <ResultsControlBar
                isLoading={isLoading}
                totalCount={totalCount}
                countLabel={countLabel}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                showMaterials={filters.showMaterials}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                profileSortBy={profileSortBy}
                onProfileSortChange={handleProfileSortChange}
                labels={{
                  sortLabel: t("results.sortLabel"),
                  gridView: t("results.gridView"),
                  listView: t("results.listView"),
                  sortNewest: t("results.sortOptions.newest"),
                  sortPriceLow: t("results.sortOptions.priceLow"),
                  sortPriceHigh: t("results.sortOptions.priceHigh"),
                  profileSortNewest: t("results.profileSortOptions.newest"),
                  profileSortMostMaterials: t("results.profileSortOptions.mostMaterials"),
                  profileSortMostFollowers: t("results.profileSortOptions.mostFollowers"),
                }}
              />

              {/* Active Filter Chips - dismissable */}
              <FilterChips
                filters={filters}
                onFiltersChange={handleFiltersChange}
                activeFilterCount={activeFilterCount}
                getFachbereichByCode={getFachbereichByCode}
                t={t}
              />

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

              {/* Pagination -- works for both tabs */}
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
