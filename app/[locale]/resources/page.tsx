"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, ChevronDown, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { ResourceCard } from "@/components/ui/ResourceCard";
import { ProfileCard } from "@/components/ui/ProfileCard";
import {
  LP21FilterSidebar,
  type LP21FilterState,
  type SearchType,
} from "@/components/search/LP21FilterSidebar";
import { useCurriculum } from "@/lib/hooks/useCurriculum";

interface Resource {
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

export default function ResourcesPage() {
  const t = useTranslations("resourcesPage");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resources, setResources] = useState<Resource[]>([]);
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
    async (resourceId: string, currentState: boolean): Promise<boolean> => {
      if (!isAuthenticated) {
        router.push("/login");
        return false;
      }

      try {
        if (currentState) {
          // Remove from wishlist
          const response = await fetch(`/api/user/wishlist?resourceId=${resourceId}`, {
            method: "DELETE",
          });
          if (response.ok) {
            setWishlistedIds((prev) => {
              const next = new Set(prev);
              next.delete(resourceId);
              return next;
            });
            return true;
          }
        } else {
          // Add to wishlist
          const response = await fetch("/api/user/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resourceId }),
          });
          if (response.ok) {
            setWishlistedIds((prev) => new Set(prev).add(resourceId));
            return true;
          }
        }
      } catch (error) {
        console.error("Error toggling wishlist:", error);
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
            return true;
          }
        } else {
          // Follow
          const response = await fetch(`/api/users/${profileId}/follow`, {
            method: "POST",
          });
          if (response.ok) {
            setFollowingIds((prev) => new Set(prev).add(profileId));
            return true;
          }
        }
      } catch (error) {
        console.error("Error toggling follow:", error);
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
    const searchType = searchParams.get("searchType") as SearchType | null;

    return {
      searchType: searchType === "profiles" ? "profiles" : "resources",
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
      if (currentFilters.searchType === "profiles") params.set("searchType", "profiles");
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
      const newUrl = params.toString() ? `/resources?${params.toString()}` : "/resources";
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
      const newUrl = params.toString() ? `/resources?${params.toString()}` : "/resources";
      router.replace(newUrl, { scroll: false });
    },
    [router, filters, buildUrlParams]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      const params = buildUrlParams(filters, sortBy, newPage);
      const newUrl = params.toString() ? `/resources?${params.toString()}` : "/resources";
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

  const fetchResources = useCallback(
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

        const response = await fetch(`/api/resources?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setResources(data.resources);
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setLoading(false);
      }
    },
    [mapFachbereichToSubject]
  );

  useEffect(() => {
    fetchResources(filters, sortBy, currentPage);
  }, [filters, sortBy, currentPage, fetchResources]);

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

  // Fetch profiles when search type changes or filters change
  useEffect(() => {
    if (filters.searchType === "profiles") {
      const debounce = setTimeout(() => {
        fetchProfiles(filters);
      }, 300);
      return () => clearTimeout(debounce);
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

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <div className="text-text-muted mb-2 flex items-center gap-2 text-sm">
            <Link href="/" className="hover:text-primary transition-colors">
              {t("breadcrumb.home")}
            </Link>
            <span>/</span>
            <span className="text-text-secondary">{tCommon("navigation.resources")}</span>
          </div>
          <h1 className="text-text text-2xl font-bold">{t("header.title")}</h1>
          <p className="text-text-muted mt-1">{t("header.description")}</p>
        </div>

        {/* Main Layout: Sidebar + Content */}
        {
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="border-border bg-bg-secondary text-text-secondary hover:border-primary hover:text-primary flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors"
              >
                <SlidersHorizontal className="h-5 w-5" />
                <span>{t("sidebar.title")}</span>
                {(filters.zyklus ||
                  filters.fachbereich ||
                  filters.kompetenzbereich ||
                  filters.kompetenz) && (
                  <span className="bg-primary flex h-5 w-5 items-center justify-center rounded-full text-xs text-white">
                    {
                      [
                        filters.zyklus,
                        filters.fachbereich,
                        filters.kompetenzbereich,
                        filters.kompetenz,
                      ].filter(Boolean).length
                    }
                  </span>
                )}
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${mobileFiltersOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Mobile Filters Panel */}
              <AnimatePresence>
                {mobileFiltersOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-4 overflow-hidden"
                  >
                    <LP21FilterSidebar filters={filters} onFiltersChange={handleFiltersChange} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden w-72 flex-shrink-0 lg:block">
              <LP21FilterSidebar filters={filters} onFiltersChange={handleFiltersChange} />
            </div>

            {/* Main Content Area */}
            <div className="min-w-0 flex-1">
              {/* Resources View */}
              {filters.searchType === "resources" && (
                <>
                  {/* Top Control Bar: Results + Sort */}
                  <div className="bg-bg-secondary mb-6 flex flex-col gap-4 rounded-lg p-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Results Count + Active Filters Summary */}
                    <div>
                      <p className="text-text-muted text-sm">
                        <span className="text-text font-semibold">{pagination.total}</span>{" "}
                        {t("results.countLabel")}
                      </p>
                      {(filters.zyklus ||
                        filters.fachbereich ||
                        filters.kompetenzbereich ||
                        filters.kompetenz ||
                        filters.searchQuery) && (
                        <p className="text-text-muted mt-1 text-xs">
                          {[
                            filters.zyklus && `Zyklus ${filters.zyklus}`,
                            filters.fachbereich &&
                              getFachbereichByCode(filters.fachbereich)?.shortName,
                            filters.kompetenzbereich,
                            filters.kompetenz,
                            filters.searchQuery && `"${filters.searchQuery}"`,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-2">
                      <label className="text-text-muted text-sm whitespace-nowrap">
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

                  {/* Resource Grid */}
                  {loading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="text-text-muted flex items-center gap-3">
                        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>{t("loading")}</span>
                      </div>
                    </div>
                  ) : resources.length === 0 ? (
                    <div className="border-border-subtle bg-bg-secondary flex flex-col items-center justify-center rounded-lg border py-16">
                      <svg
                        className="text-text-faint mb-4 h-12 w-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-text mb-2 text-lg font-medium">{t("empty.title")}</p>
                      <p className="text-text-muted text-sm">{t("empty.description")}</p>
                    </div>
                  ) : (
                    <motion.div
                      className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3"
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
                      {resources.map((resource) => (
                        <motion.div
                          key={resource.id}
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
                          <ResourceCard
                            id={resource.id}
                            title={resource.title}
                            description={resource.description}
                            subject={resource.subject}
                            cycle={resource.cycle}
                            priceFormatted={resource.priceFormatted}
                            previewUrl={resource.previewUrl}
                            seller={{ displayName: resource.seller.display_name }}
                            subjectPillClass={getSubjectPillClass(resource.subject)}
                            showWishlist={true}
                            isWishlisted={wishlistedIds.has(resource.id)}
                            onWishlistToggle={handleWishlistToggle}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </>
              )}

              {/* Profiles View */}
              {filters.searchType === "profiles" && (
                <>
                  {/* Top Control Bar: Results Count */}
                  <div className="bg-bg-secondary mb-6 rounded-lg p-4">
                    <p className="text-text-muted text-sm">
                      <span className="text-text font-semibold">{profilePagination.total}</span>{" "}
                      Profile gefunden
                    </p>
                    {(filters.zyklus || filters.fachbereich || filters.searchQuery) && (
                      <p className="text-text-muted mt-1 text-xs">
                        {[
                          filters.zyklus && `Zyklus ${filters.zyklus}`,
                          filters.fachbereich &&
                            getFachbereichByCode(filters.fachbereich)?.shortName,
                          filters.searchQuery && `"${filters.searchQuery}"`,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>

                  {/* Profile Grid */}
                  {profilesLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="text-text-muted flex items-center gap-3">
                        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        <span>Profile werden geladen...</span>
                      </div>
                    </div>
                  ) : profiles.length === 0 ? (
                    <div className="border-border-subtle bg-bg-secondary flex flex-col items-center justify-center rounded-lg border py-16">
                      <Users className="text-text-faint mb-4 h-12 w-12" />
                      <p className="text-text mb-2 text-lg font-medium">Keine Profile gefunden</p>
                      <p className="text-text-muted text-sm">
                        {filters.searchQuery
                          ? "Versuchen Sie es mit anderen Suchbegriffen"
                          : "Geben Sie einen Suchbegriff ein, um Profile zu finden"}
                      </p>
                    </div>
                  ) : (
                    <motion.div
                      className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.06,
                            delayChildren: 0.02,
                          },
                        },
                      }}
                    >
                      {profiles.map((profile) => (
                        <motion.div
                          key={profile.id}
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
                          <ProfileCard
                            id={profile.id}
                            name={profile.name}
                            image={profile.image}
                            bio={profile.bio}
                            subjects={profile.subjects}
                            resourceCount={profile.resourceCount}
                            followerCount={profile.followerCount}
                            isVerified={profile.role === "SELLER"}
                            getSubjectPillClass={getSubjectPillClass}
                            showFollowButton={true}
                            isFollowing={followingIds.has(profile.id)}
                            onFollowToggle={handleFollowToggle}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </>
              )}

              {/* Pagination - only for resources */}
              {filters.searchType === "resources" && pagination.totalPages > 1 && (
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
