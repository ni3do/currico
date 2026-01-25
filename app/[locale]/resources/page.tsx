"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { SlidersHorizontal, ChevronDown, FileText, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { ResourceCard } from "@/components/ui/ResourceCard";
import { LP21FilterSidebar, type LP21FilterState } from "@/components/search/LP21FilterSidebar";
import { FACHBEREICHE } from "@/lib/data/lehrplan21";

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
  const [activeTab, setActiveTab] = useState<"resources" | "profiles">("resources");
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
  const [profileSearchQuery, setProfileSearchQuery] = useState("");

  // LP21 filter state
  const [filters, setFilters] = useState<LP21FilterState>({
    zyklus: null,
    fachbereich: null,
    kompetenzbereich: null,
    kompetenz: null,
    searchQuery: "",
    priceType: null,
    maxPrice: null,
    formats: [],
    materialScope: null,
  });

  // Map Fachbereich code to subject name for API compatibility
  const mapFachbereichToSubject = (code: string | null): string => {
    if (!code) return "";
    const fachbereich = FACHBEREICHE.find((f) => f.code === code);
    return fachbereich?.name || code;
  };

  const fetchResources = useCallback(async (currentFilters: LP21FilterState) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

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
  }, []);

  useEffect(() => {
    fetchResources(filters);
  }, [filters, fetchResources]);

  // Fetch profiles
  const fetchProfiles = useCallback(async (query: string) => {
    setProfilesLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
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

  // Fetch profiles when tab changes or search query changes
  useEffect(() => {
    if (activeTab === "profiles") {
      const debounce = setTimeout(() => {
        fetchProfiles(profileSearchQuery);
      }, 300);
      return () => clearTimeout(debounce);
    }
  }, [activeTab, profileSearchQuery, fetchProfiles]);

  // Get subject pill class based on subject name
  const getSubjectPillClass = (subject: string): string => {
    const subjectMap: Record<string, string> = {
      Deutsch: "pill-deutsch",
      Mathematik: "pill-mathe",
      NMG: "pill-nmg",
      BG: "pill-gestalten",
      Musik: "pill-musik",
      Sport: "pill-sport",
      Englisch: "pill-fremdsprachen",
      Franzosisch: "pill-fremdsprachen",
      French: "pill-fremdsprachen",
      English: "pill-fremdsprachen",
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

        {/* Tabs: Resources / Profiles */}
        <div className="border-border mb-6 flex gap-4 border-b">
          <button
            onClick={() => setActiveTab("resources")}
            className={`flex items-center gap-2 pb-4 text-sm font-medium transition-colors ${
              activeTab === "resources"
                ? "border-primary text-primary border-b-2"
                : "text-text-muted hover:text-text"
            }`}
          >
            <FileText className="h-4 w-4" />
            Ressourcen
          </button>
          <button
            onClick={() => setActiveTab("profiles")}
            className={`flex items-center gap-2 pb-4 text-sm font-medium transition-colors ${
              activeTab === "profiles"
                ? "border-primary text-primary border-b-2"
                : "text-text-muted hover:text-text"
            }`}
          >
            <Users className="h-4 w-4" />
            Profile
          </button>
        </div>

        {/* Profiles Tab Content */}
        {activeTab === "profiles" && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="bg-bg-secondary rounded-lg p-4">
              <input
                type="text"
                value={profileSearchQuery}
                onChange={(e) => setProfileSearchQuery(e.target.value)}
                placeholder="Nach Lehrpersonen suchen..."
                className="border-border bg-bg text-text placeholder:text-text-muted focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 focus:ring-2 focus:outline-none"
              />
            </div>

            {/* Results */}
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
                  {profileSearchQuery
                    ? "Versuchen Sie es mit anderen Suchbegriffen"
                    : "Geben Sie einen Suchbegriff ein, um Profile zu finden"}
                </p>
              </div>
            ) : (
              <>
                <p className="text-text-muted text-sm">
                  <span className="text-text font-semibold">{profilePagination.total}</span> Profile
                  gefunden
                </p>
                <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                  {profiles.map((profile) => (
                    <Link
                      key={profile.id}
                      href={`/profile/${profile.id}`}
                      className="card group overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="p-5">
                        <div className="mb-4 flex items-center gap-4">
                          {profile.image ? (
                            <Image
                              src={profile.image}
                              alt={profile.name}
                              width={56}
                              height={56}
                              className="border-border rounded-full border-2 object-cover"
                            />
                          ) : (
                            <div className="from-primary to-success flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br text-xl font-bold text-white">
                              {profile.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h3 className="text-text group-hover:text-primary truncate font-semibold">
                              {profile.name}
                            </h3>
                            {profile.role === "SELLER" && (
                              <span className="text-success inline-flex items-center gap-1 text-xs">
                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Verkäufer
                              </span>
                            )}
                          </div>
                        </div>

                        {profile.bio && (
                          <p className="text-text-muted mb-3 line-clamp-2 text-sm">{profile.bio}</p>
                        )}

                        {profile.subjects.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-1">
                            {profile.subjects.slice(0, 3).map((subject) => (
                              <span
                                key={subject}
                                className={`pill text-xs ${getSubjectPillClass(subject)}`}
                              >
                                {subject}
                              </span>
                            ))}
                            {profile.subjects.length > 3 && (
                              <span className="text-text-muted text-xs">
                                +{profile.subjects.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="border-border text-text-muted flex items-center gap-4 border-t pt-3 text-sm">
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {profile.resourceCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {profile.followerCount}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Resources Tab: Main Layout: Sidebar + Content */}
        {activeTab === "resources" && (
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
                  className={`h-4 w-4 transition-transform ${mobileFiltersOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Mobile Filters Panel */}
              <AnimatePresence>
                {mobileFiltersOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 overflow-hidden"
                  >
                    <LP21FilterSidebar filters={filters} onFiltersChange={setFilters} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden w-72 flex-shrink-0 lg:block">
              <LP21FilterSidebar filters={filters} onFiltersChange={setFilters} />
            </div>

            {/* Main Content Area */}
            <div className="min-w-0 flex-1">
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
                          FACHBEREICHE.find((f) => f.code === filters.fachbereich)?.shortName,
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
                  <select className="border-border bg-bg text-text-secondary focus:border-primary focus:ring-focus-ring rounded-lg border px-3 py-2.5 text-sm focus:ring-2 focus:outline-none">
                    <option value="newest">{t("results.sortOptions.newest")}</option>
                    <option value="popular">{t("results.sortOptions.popular")}</option>
                    <option value="rating">{t("results.sortOptions.rating")}</option>
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
                <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
                  {resources.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      id={resource.id}
                      title={resource.title}
                      description={resource.description}
                      subject={resource.subject}
                      cycle={resource.cycle}
                      priceFormatted={resource.priceFormatted}
                      previewUrl={resource.previewUrl}
                      seller={{ displayName: resource.seller.display_name }}
                      subjectPillClass={getSubjectPillClass(resource.subject)}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <nav className="flex items-center gap-1">
                    <button
                      className="text-text-muted hover:bg-surface rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={pagination.page === 1}
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
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <button
                          key={pageNum}
                          className={`min-w-[40px] rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                            pageNum === pagination.page
                              ? "bg-primary text-text-on-accent"
                              : "text-text-secondary hover:bg-surface"
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    )}
                    <button
                      className="text-text-secondary hover:bg-surface rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={pagination.page === pagination.totalPages}
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
        )}
      </main>

      <Footer />
    </div>
  );
}
