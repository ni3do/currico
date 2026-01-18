"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { ResourceCard } from "@/components/ui/ResourceCard";
import { FilterSidebar } from "@/components/ui/FilterSidebar";

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

export default function ResourcesPage() {
  const t = useTranslations("resourcesPage");
  const tCommon = useTranslations("common");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedCycle, setSelectedCycle] = useState("");
  const [selectedPriceType, setSelectedPriceType] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const fetchResources = useCallback(
    async (
      currentSearch: string,
      currentSubject: string,
      currentCycle: string,
      currentPriceType: string
    ) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (currentSubject) params.set("subject", currentSubject);
        if (currentSearch) params.set("search", currentSearch);
        if (currentCycle) params.set("cycle", currentCycle);
        if (currentPriceType) params.set("priceType", currentPriceType);

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
    []
  );

  useEffect(() => {
    fetchResources(searchQuery, selectedSubject, selectedCycle, selectedPriceType);
  }, [selectedSubject, selectedCycle, selectedPriceType, fetchResources, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources(searchQuery, selectedSubject, selectedCycle, selectedPriceType);
  };

  const handleResetFilters = () => {
    setSelectedSubject("");
    setSelectedCycle("");
    setSelectedPriceType("");
  };

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
    <div className="flex min-h-screen flex-col bg-bg">
      <TopBar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-sm text-text-muted">
            <Link href="/" className="transition-colors hover:text-primary">
              {t("breadcrumb.home")}
            </Link>
            <span>/</span>
            <span className="text-text-secondary">
              {tCommon("navigation.resources")}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-text">{t("header.title")}</h1>
          <p className="mt-1 text-text-muted">{t("header.description")}</p>
        </div>

        {/* Main Layout: Sidebar + Content */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-bg-secondary px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              <span>{t("sidebar.title")}</span>
              <svg
                className={`h-4 w-4 transition-transform ${mobileFiltersOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Mobile Filters Panel */}
            {mobileFiltersOpen && (
              <div className="mt-4">
                <FilterSidebar
                  selectedSubject={selectedSubject}
                  onSubjectChange={setSelectedSubject}
                  selectedCycle={selectedCycle}
                  onCycleChange={setSelectedCycle}
                  selectedPriceType={selectedPriceType}
                  onPriceTypeChange={setSelectedPriceType}
                  onReset={handleResetFilters}
                />
              </div>
            )}
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden w-64 flex-shrink-0 lg:block">
            <FilterSidebar
              selectedSubject={selectedSubject}
              onSubjectChange={setSelectedSubject}
              selectedCycle={selectedCycle}
              onCycleChange={setSelectedCycle}
              selectedPriceType={selectedPriceType}
              onPriceTypeChange={setSelectedPriceType}
              onReset={handleResetFilters}
            />
          </div>

          {/* Main Content Area */}
          <div className="min-w-0 flex-1">
            {/* Top Control Bar: Search + Sort */}
            <div className="mb-6 rounded-lg bg-bg-secondary p-4">
              <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
                {/* Search Input */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t("search.placeholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-border bg-bg py-3 pr-4 pl-11 text-text placeholder:text-text-faint focus:border-primary focus:ring-2 focus:ring-focus-ring focus:outline-none"
                    />
                    <svg
                      className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-text-muted"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <label className="whitespace-nowrap text-sm text-text-muted">
                    {t("results.sortLabel")}
                  </label>
                  <select className="rounded-lg border border-border bg-bg px-3 py-3 text-sm text-text-secondary focus:border-primary focus:ring-2 focus:ring-focus-ring focus:outline-none">
                    <option value="newest">{t("results.sortOptions.newest")}</option>
                    <option value="popular">{t("results.sortOptions.popular")}</option>
                    <option value="rating">{t("results.sortOptions.rating")}</option>
                    <option value="price-low">{t("results.sortOptions.priceLow")}</option>
                    <option value="price-high">{t("results.sortOptions.priceHigh")}</option>
                  </select>
                </div>
              </form>

              {/* Results Count */}
              <div className="mt-3 border-t border-border-subtle pt-3">
                <p className="text-sm text-text-muted">
                  <span className="font-semibold text-text">{pagination.total}</span>{" "}
                  {t("results.countLabel")}
                </p>
              </div>
            </div>

            {/* Resource Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center gap-3 text-text-muted">
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
              <div className="flex flex-col items-center justify-center rounded-lg border border-border-subtle bg-bg-secondary py-16">
                <svg
                  className="mb-4 h-12 w-12 text-text-faint"
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
                <p className="mb-2 text-lg font-medium text-text">{t("empty.title")}</p>
                <p className="text-sm text-text-muted">{t("empty.description")}</p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
                    className="rounded-md px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={pagination.page === 1}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
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
                  ))}
                  <button
                    className="rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={pagination.page === pagination.totalPages}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </main>

      <Footer />
    </div>
  );
}
