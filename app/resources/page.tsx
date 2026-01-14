"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { content } from "@/lib/content";
import TopBar from "@/components/ui/TopBar";

const { common, resourcesPage } = content;

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
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, [selectedSubject]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSubject) params.set("subject", selectedSubject);
      if (searchQuery) params.set("search", searchQuery);

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
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources();
  };

  return (
    <div className="min-h-screen bg-[--background-alt]">
      <TopBar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-[--text-muted] mb-2">
            <Link href="/" className="hover:text-[--primary] transition-colors">Startseite</Link>
            <span>/</span>
            <span className="text-[--text-secondary]">Ressourcen</span>
          </div>
          <h1 className="text-2xl font-semibold text-[--gray-800]">Unterrichtsmaterialien</h1>
          <p className="mt-2 text-[--text-muted]">
            Durchsuchen Sie qualitatsgeprufte Materialien fur Ihren Unterricht
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
                  placeholder="Suche nach Titel, Thema, Stichwort..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-[--radius-md] border border-[--border] bg-white px-4 py-3 pl-11 text-[--text] placeholder:text-[--text-light] focus:outline-none focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary]"
                />
                <svg
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[--text-muted]"
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
                className="w-full rounded-[--radius-md] border border-[--border] bg-white px-4 py-3 text-[--text] focus:outline-none focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] appearance-none cursor-pointer"
              >
                <option value="">Alle Facher</option>
                <option value="Mathematik">Mathematik</option>
                <option value="Deutsch">Deutsch</option>
                <option value="Englisch">Englisch</option>
                <option value="Franzosisch">Franzosisch</option>
                <option value="NMG">NMG</option>
                <option value="BG">Bildnerisches Gestalten</option>
                <option value="Musik">Musik</option>
                <option value="Sport">Sport</option>
              </select>
            </div>

            {/* More Filters Button */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 rounded-[--radius-md] px-5 py-3 font-medium text-sm transition-colors border ${
                showFilters
                  ? "bg-[--primary] text-white border-[--primary]"
                  : "bg-white text-[--text-secondary] border-[--border] hover:border-[--primary]"
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
              <span>Filter</span>
            </button>
          </form>

          {/* Advanced Filters (Collapsible) */}
          {showFilters && (
            <div className="rounded-[--radius-lg] bg-white p-6 border border-[--border]">
              <h3 className="mb-4 font-semibold text-[--gray-800]">Erweiterte Filter</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Cycle Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[--gray-700]">
                    Zyklus
                  </label>
                  <select className="w-full rounded-[--radius-md] border border-[--border] bg-white px-4 py-2.5 text-[--text] text-sm focus:outline-none focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary]">
                    <option value="">Alle Zyklen</option>
                    <option value="1">Zyklus 1</option>
                    <option value="2">Zyklus 2</option>
                    <option value="3">Zyklus 3</option>
                  </select>
                </div>

                {/* Canton Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[--gray-700]">
                    Kanton
                  </label>
                  <select className="w-full rounded-[--radius-md] border border-[--border] bg-white px-4 py-2.5 text-[--text] text-sm focus:outline-none focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary]">
                    <option value="">Alle Kantone</option>
                    <option value="ZH">Zurich</option>
                    <option value="BE">Bern</option>
                    <option value="LU">Luzern</option>
                    <option value="AG">Aargau</option>
                    <option value="SG">St. Gallen</option>
                  </select>
                </div>

                {/* Quality Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[--gray-700]">
                    Qualitat
                  </label>
                  <select className="w-full rounded-[--radius-md] border border-[--border] bg-white px-4 py-2.5 text-[--text] text-sm focus:outline-none focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary]">
                    <option value="">Alle</option>
                    <option value="verified">Verifiziert</option>
                    <option value="ai-checked">KI-Gepruft</option>
                  </select>
                </div>

                {/* Price Type Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[--gray-700]">
                    Preistyp
                  </label>
                  <select className="w-full rounded-[--radius-md] border border-[--border] bg-white px-4 py-2.5 text-[--text] text-sm focus:outline-none focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary]">
                    <option value="">Alle</option>
                    <option value="free">Kostenlos</option>
                    <option value="paid">Kostenpflichtig</option>
                  </select>
                </div>

                {/* Resource Type Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[--gray-700]">
                    Ressourcentyp
                  </label>
                  <select className="w-full rounded-[--radius-md] border border-[--border] bg-white px-4 py-2.5 text-[--text] text-sm focus:outline-none focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary]">
                    <option value="">Alle</option>
                    <option value="pdf">PDF</option>
                    <option value="word">Word</option>
                    <option value="powerpoint">PowerPoint</option>
                    <option value="bundle">Bundle</option>
                  </select>
                </div>

                {/* Editable Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[--gray-700]">
                    Editierbar
                  </label>
                  <select className="w-full rounded-[--radius-md] border border-[--border] bg-white px-4 py-2.5 text-[--text] text-sm focus:outline-none focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary]">
                    <option value="">Alle</option>
                    <option value="yes">Ja</option>
                    <option value="no">Nein</option>
                  </select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="mt-6 flex gap-3 pt-4 border-t border-[--border]">
                <button className="rounded-[--radius-md] bg-[--primary] px-5 py-2.5 font-semibold text-white text-sm hover:bg-[--primary-hover] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,82,204,0.25)]">
                  Filter anwenden
                </button>
                <button className="rounded-[--radius-md] bg-[--gray-100] px-5 py-2.5 font-semibold text-[--text-heading] text-sm hover:bg-[--gray-200] transition-all">
                  Zurucksetzen
                </button>
              </div>
            </div>
          )}

          {/* Sort and Results Count */}
          <div className="flex items-center justify-between py-2">
            <p className="text-sm text-[--text-muted]">
              <span className="font-medium text-[--text-secondary]">{pagination.total}</span> Ressourcen gefunden
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-[--text-muted]">Sortieren:</label>
              <select className="rounded-[--radius-sm] border border-[--border] bg-white px-3 py-1.5 text-sm text-[--text-secondary] focus:outline-none focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary]">
                <option value="newest">Neueste</option>
                <option value="popular">Beliebteste</option>
                <option value="rating">Beste Bewertung</option>
                <option value="price-low">Preis aufsteigend</option>
                <option value="price-high">Preis absteigend</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resource Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-[--text-muted]">Laden...</div>
          </div>
        ) : resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-[--text-muted] mb-4">Keine Ressourcen gefunden</p>
            <p className="text-sm text-[--text-light]">Versuchen Sie andere Suchbegriffe oder Filter</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <article
                key={resource.id}
                className="group bg-white rounded-[--radius-lg] overflow-hidden transition-all duration-200 hover:-translate-y-1"
                style={{
                  boxShadow: 'var(--shadow-card)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                }}
              >
                {/* Card Header */}
                <div className="p-6">
                  {/* Badges - Pill style with full radius */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-[--gray-100] text-[--text-muted] text-xs font-medium rounded-full">
                        PDF
                      </span>
                      {resource.cycle && (
                        <span className="px-3 py-1 bg-[--gray-100] text-[--text-muted] text-xs font-medium rounded-full">
                          {resource.cycle}
                        </span>
                      )}
                    </div>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-[--success-light] text-[--success]">
                      Verifiziert
                    </span>
                  </div>

                  {/* Subject Tag - Pill style with primary accent */}
                  <span className="inline-block px-3 py-1 bg-[--primary-light] text-[--primary] text-xs font-semibold rounded-full mb-4">
                    {resource.subject}
                  </span>

                  {/* Title - Bold and larger */}
                  <h3 className="text-lg font-bold text-[--text-heading] group-hover:text-[--primary] transition-colors mb-2">
                    {resource.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[--text-muted] line-clamp-2 leading-relaxed">
                    {resource.description}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 border-t border-[--gray-100] bg-[--gray-50]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Seller */}
                      <span className="text-sm text-[--text-muted]">
                        {resource.seller.display_name || "Anonym"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Price - Bold and accent colored */}
                      <span className={`text-lg font-bold ${resource.priceFormatted === "Gratis" ? "text-[--success]" : "text-[--primary]"}`}>
                        {resource.priceFormatted}
                      </span>
                      <a
                        href={`/resources/${resource.id}`}
                        className="rounded-[--radius-md] bg-[--primary] px-4 py-2 text-sm font-semibold text-white hover:bg-[--primary-hover] transition-all hover:shadow-[var(--shadow-sm)]"
                      >
                        Ansehen
                      </a>
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
                className="rounded-[--radius-sm] px-3 py-2 text-[--text-muted] font-medium text-sm hover:bg-[--gray-100] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={pagination.page === 1}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  className={`rounded-[--radius-sm] px-4 py-2 font-medium text-sm min-w-[40px] transition-colors ${
                    pageNum === pagination.page
                      ? "bg-[--primary] text-white"
                      : "text-[--text-secondary] hover:bg-[--gray-100]"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                className="rounded-[--radius-sm] px-3 py-2 text-[--text-secondary] font-medium text-sm hover:bg-[--gray-100] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Footer - Grounded with slate background */}
      <footer className="mt-16 bg-[--sidebar-bg] border-t border-[--border]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-[--primary] rounded-[--radius-sm]">
                  <span className="text-white font-bold text-sm">EL</span>
                </div>
                <span className="text-lg font-semibold text-[--text-heading]">EasyLehrer</span>
              </div>
              <p className="text-sm text-[--text-muted] leading-relaxed">
                Die offizielle Plattform fur Unterrichtsmaterial von Schweizer Lehrpersonen.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold text-[--text-heading] text-sm uppercase tracking-wider">Plattform</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/resources" className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors">Ressourcen</Link></li>
                <li><a href="#" className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors">Fur Schulen</a></li>
                <li><a href="#" className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors">Preise</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-[--text-heading] text-sm uppercase tracking-wider">Information</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors">Uber uns</a></li>
                <li><a href="#" className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors">Kontakt</a></li>
                <li><a href="#" className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors">Hilfe</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-[--text-heading] text-sm uppercase tracking-wider">Rechtliches</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors">Datenschutz</a></li>
                <li><a href="#" className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors">AGB</a></li>
                <li><a href="#" className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors">Impressum</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[--gray-200] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[--text-muted]">
              2026 EasyLehrer. Alle Rechte vorbehalten.
            </p>
            <p className="text-sm text-[--text-light]">
              Eine Initiative fur Schweizer Bildung
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
