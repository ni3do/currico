"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { getLoginUrl } from "@/lib/utils/login-redirect";
import { useSearchParams } from "next/navigation";
import { Search, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { MaterialGridSkeleton, ProfileGridSkeleton } from "@/components/ui/Skeleton";
import { EmptySearchState } from "@/components/ui/EmptySearchState";
import { LP21FilterSidebar } from "@/components/search/LP21FilterSidebar";
import { FilterChips } from "@/components/search/FilterChips";
import { PaginationControls } from "@/components/search/PaginationControls";
import { MobileFilterDrawer } from "@/components/search/MobileFilterDrawer";
import { ResultsControlBar } from "@/components/search/ResultsControlBar";
import { MaterialsGrid } from "@/components/search/MaterialsGrid";
import { ProfilesGrid } from "@/components/search/ProfilesGrid";
import { useCurriculum } from "@/lib/hooks/useCurriculum";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { useFollowing } from "@/lib/hooks/useFollowing";
import { useMaterialSearch } from "@/lib/hooks/useMaterialSearch";
import { useToast } from "@/components/ui/Toast";

export default function MaterialienPage() {
  const t = useTranslations("materialsPage");
  const tCommon = useTranslations("common");
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auth session for wishlist
  const { status: sessionStatus } = useSession();
  const isAuthenticated = sessionStatus === "authenticated";

  // Fetch curriculum data from API
  const { getFachbereichByCode } = useCurriculum();

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

  // All search state, fetch logic, URL sync, handlers, and computed values
  const {
    materials,
    profiles,
    pagination,
    profilePagination,
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
    activeFilterCount,
    isLoading,
    totalCount,
    countLabel,
    hasNoItems,
    handleFiltersChange,
    handleSortChange,
    handleProfileSortChange,
    handlePageChange,
    handleProfilePageChange,
    setMobileFiltersOpen,
    setViewMode,
    retryFetch,
    resetFilters,
  } = useMaterialSearch({ router, searchParams, toast, t, getFachbereichByCode });

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12 2xl:max-w-[1440px]">
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
              closeFilters: t("sidebar.closeFilters"),
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
                sortRecommended: t("results.sortRecommended"),
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

            {/* Fuzzy search banner */}
            {searchMatchMode === "fuzzy" && filters.searchQuery && !isLoading && !hasNoItems && (
              <div className="bg-info/10 text-info border-info/20 mb-4 rounded-lg border px-4 py-2.5 text-sm">
                {t("search.fuzzyResults", { query: filters.searchQuery })}
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
                  onClick={retryFetch}
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
                onResetFilters={() => handleFiltersChange(resetFilters())}
                onResetSearch={() => handleFiltersChange({ ...filters, searchQuery: "" })}
                onSuggestionClick={(query) =>
                  handleFiltersChange(resetFilters({ searchQuery: query }))
                }
              />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={filters.showMaterials ? "materials" : "profiles"}
                  className={
                    viewMode === "grid" || !filters.showMaterials
                      ? "grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 2xl:grid-cols-4"
                      : "flex flex-col gap-5"
                  }
                  style={{ opacity: isPending ? 0.7 : 1, transition: "opacity 150ms ease" }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  {filters.showMaterials ? (
                    <MaterialsGrid
                      materials={materials}
                      wishlistedIds={wishlistedIds}
                      onWishlistToggle={handleWishlistToggle}
                      viewMode={viewMode}
                      labels={{
                        wishlistAdd: t("card.wishlistAdd"),
                        wishlistRemove: t("card.wishlistRemove"),
                        anonymous: t("card.anonymous"),
                      }}
                    />
                  ) : (
                    <ProfilesGrid
                      profiles={profiles}
                      followingIds={followingIds}
                      onFollowToggle={handleFollowToggle}
                    />
                  )}
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
      </main>

      <Footer />
    </div>
  );
}
