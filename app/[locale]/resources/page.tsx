"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";

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
  const tCommon = useTranslations("common"); // Used for navigation.resources
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  const fetchResources = useCallback(async (currentSearch: string, currentSubject: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentSubject) params.set("subject", currentSubject);
      if (currentSearch) params.set("search", currentSearch);

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
    fetchResources("", selectedSubject);
  }, [selectedSubject, fetchResources]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources(searchQuery, selectedSubject);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <TopBar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-2">
            <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">{t("breadcrumb.home")}</Link>
            <span>/</span>
            <span className="text-[var(--color-text-secondary)]">{tCommon("navigation.resources")}</span>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">{t("header.title")}</h1>
          <p className="mt-2 text-[var(--color-text-muted)]">
            {t("header.description")}
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          {/* Main Search Controls */}
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t("search.placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-11"
                />
                <svg
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]"
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

            {/* Subject Selector */}
            <div className="sm:w-56">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="input appearance-none cursor-pointer"
              >
                <option value="">{t("search.subjectFilter.all")}</option>
                <option value="Mathematik">{t("search.subjectFilter.math")}</option>
                <option value="Deutsch">{t("search.subjectFilter.german")}</option>
                <option value="Englisch">{t("search.subjectFilter.english")}</option>
                <option value="Franzosisch">{t("search.subjectFilter.french")}</option>
                <option value="NMG">{t("search.subjectFilter.nmg")}</option>
                <option value="BG">{t("search.subjectFilter.arts")}</option>
                <option value="Musik">{t("search.subjectFilter.music")}</option>
                <option value="Sport">{t("search.subjectFilter.sports")}</option>
              </select>
            </div>

            {/* More Filters Button */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-medium text-sm transition-colors border ${
                showFilters
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                  : "bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
              }`}
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
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              <span>{t("search.filterButton")}</span>
            </button>
          </form>

          {/* Advanced Filters (Collapsible) */}
          {showFilters && (
            <div className="card p-6">
              <h3 className="mb-4 font-semibold text-[var(--color-text)]">{t("advancedFilters.title")}</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Cycle Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">
                    {t("advancedFilters.cycleFilter.label")}
                  </label>
                  <select className="input text-sm">
                    <option value="">{t("advancedFilters.cycleFilter.all")}</option>
                    <option value="1">{t("advancedFilters.cycleFilter.cycle1")}</option>
                    <option value="2">{t("advancedFilters.cycleFilter.cycle2")}</option>
                    <option value="3">{t("advancedFilters.cycleFilter.cycle3")}</option>
                  </select>
                </div>

                {/* Canton Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">
                    {t("advancedFilters.cantonFilter.label")}
                  </label>
                  <select className="input text-sm">
                    <option value="">{t("advancedFilters.cantonFilter.all")}</option>
                    <option value="ZH">Zurich</option>
                    <option value="BE">Bern</option>
                    <option value="LU">Luzern</option>
                    <option value="AG">Aargau</option>
                    <option value="SG">St. Gallen</option>
                  </select>
                </div>

                {/* Quality Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">
                    {t("advancedFilters.qualityFilter.label")}
                  </label>
                  <select className="input text-sm">
                    <option value="">{t("advancedFilters.qualityFilter.all")}</option>
                    <option value="verified">{t("advancedFilters.qualityFilter.verified")}</option>
                    <option value="ai-checked">{t("advancedFilters.qualityFilter.aiChecked")}</option>
                  </select>
                </div>

                {/* Price Type Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">
                    {t("advancedFilters.priceFilter.label")}
                  </label>
                  <select className="input text-sm">
                    <option value="">{t("advancedFilters.priceFilter.all")}</option>
                    <option value="free">{t("advancedFilters.priceFilter.free")}</option>
                    <option value="paid">{t("advancedFilters.priceFilter.paid")}</option>
                  </select>
                </div>

                {/* Resource Type Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">
                    {t("advancedFilters.typeFilter.label")}
                  </label>
                  <select className="input text-sm">
                    <option value="">{t("advancedFilters.typeFilter.all")}</option>
                    <option value="pdf">{t("advancedFilters.typeFilter.pdf")}</option>
                    <option value="word">{t("advancedFilters.typeFilter.word")}</option>
                    <option value="powerpoint">{t("advancedFilters.typeFilter.powerpoint")}</option>
                    <option value="bundle">{t("advancedFilters.typeFilter.bundle")}</option>
                  </select>
                </div>

                {/* Editable Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">
                    {t("advancedFilters.editableFilter.label")}
                  </label>
                  <select className="input text-sm">
                    <option value="">{t("advancedFilters.editableFilter.all")}</option>
                    <option value="yes">{t("advancedFilters.editableFilter.yes")}</option>
                    <option value="no">{t("advancedFilters.editableFilter.no")}</option>
                  </select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="mt-6 flex gap-3 pt-4 border-t border-[var(--color-border)]">
                <button className="btn-primary px-5 py-2.5 text-sm">
                  {t("advancedFilters.applyButton")}
                </button>
                <button className="btn-secondary px-5 py-2.5 text-sm">
                  {t("advancedFilters.resetButton")}
                </button>
              </div>
            </div>
          )}

          {/* Sort and Results Count */}
          <div className="flex items-center justify-between py-2">
            <p className="text-sm text-[var(--color-text-muted)]">
              <span className="font-medium text-[var(--color-text-secondary)]">{pagination.total}</span> {t("results.countLabel")}
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-[var(--color-text-muted)]">{t("results.sortLabel")}</label>
              <select className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]">
                <option value="newest">{t("results.sortOptions.newest")}</option>
                <option value="popular">{t("results.sortOptions.popular")}</option>
                <option value="rating">{t("results.sortOptions.rating")}</option>
                <option value="price-low">{t("results.sortOptions.priceLow")}</option>
                <option value="price-high">{t("results.sortOptions.priceHigh")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resource Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-[var(--color-text-muted)]">Loading...</div>
          </div>
        ) : resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-[var(--color-text-muted)] mb-4">No resources found</p>
            <p className="text-sm text-[var(--color-text-faint)]">Try different search terms or filters</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <article
                key={resource.id}
                className="card group overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Card Header */}
                <div className="p-6">
                  {/* Badges - Pill style with full radius */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="pill pill-neutral">
                        PDF
                      </span>
                      {resource.cycle && (
                        <span className="pill pill-neutral">
                          {resource.cycle}
                        </span>
                      )}
                    </div>
                    <span className="pill pill-success">
                      {t("card.verified")}
                    </span>
                  </div>

                  {/* Subject Tag - Pill style with primary accent */}
                  <span className="pill pill-primary mb-4">
                    {resource.subject}
                  </span>

                  {/* Title - Bold and larger */}
                  <h3 className="text-lg font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors mb-2">
                    {resource.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                    {resource.description}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Seller */}
                      <span className="text-sm text-[var(--color-text-muted)]">
                        {resource.seller.display_name || "Anonymous"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Price - Bold and accent colored */}
                      <span className={`text-lg font-bold ${resource.priceFormatted === "Gratis" ? "text-[var(--color-success)]" : "text-[var(--color-primary)]"}`}>
                        {resource.priceFormatted}
                      </span>
                      <Link
                        href={`/resources/${resource.id}`}
                        className="btn-primary px-4 py-2 text-sm"
                      >
                        {t("card.viewButton")}
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination - only show if more than one page */}
        {pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center gap-1">
              <button
                className="rounded-md px-3 py-2 text-[var(--color-text-muted)] font-medium text-sm hover:bg-[var(--color-surface)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={pagination.page === 1}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  className={`rounded-md px-4 py-2 font-medium text-sm min-w-[40px] transition-colors ${
                    pageNum === pagination.page
                      ? "bg-[var(--color-primary)] text-white"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                className="rounded-md px-3 py-2 text-[var(--color-text-secondary)] font-medium text-sm hover:bg-[var(--color-surface)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={pagination.page === pagination.totalPages}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
