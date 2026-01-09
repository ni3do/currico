"use client";

import { useState } from "react";

// Mock data for demonstration
const mockResources = [
  {
    id: 1,
    title: "Bruchrechnen Übungsblätter",
    description: "Umfassende Übungen zur Bruchrechnung mit Lösungsschlüssel",
    subject: "Mathematik",
    cycle: "Zyklus 2",
    price: "CHF 12.00",
    quality: "Verified",
    type: "PDF",
  },
  {
    id: 2,
    title: "Leseverstehen: Kurzgeschichten",
    description: "10 spannende Kurzgeschichten mit Verständnisfragen",
    subject: "Deutsch",
    cycle: "Zyklus 3",
    price: "CHF 18.00",
    quality: "AI-Checked",
    type: "PDF",
  },
  {
    id: 3,
    title: "NMG: Experimente mit Wasser",
    description: "Praktische Experimente zum Thema Wasser und Aggregatzustände",
    subject: "NMG",
    cycle: "Zyklus 2",
    price: "CHF 15.00",
    quality: "Verified",
    type: "Bundle",
  },
  {
    id: 4,
    title: "Englisch Vokabeltraining",
    description: "Interaktive Übungen für Anfänger",
    subject: "Englisch",
    cycle: "Zyklus 2",
    price: "CHF 10.00",
    quality: "Verified",
    type: "PDF",
  },
  {
    id: 5,
    title: "Geometrie: Flächen und Körper",
    description: "Arbeitsblätter zu Flächen- und Volumenberechnungen",
    subject: "Mathematik",
    cycle: "Zyklus 3",
    price: "Gratis",
    quality: "AI-Checked",
    type: "PDF",
  },
  {
    id: 6,
    title: "Rechtschreibung: Doppelkonsonanten",
    description: "Übungen und Spiele zur Rechtschreibung",
    subject: "Deutsch",
    cycle: "Zyklus 2",
    price: "CHF 8.00",
    quality: "Verified",
    type: "Bundle",
  },
];

export default function ResourcesPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  return (
    <div className="min-h-screen bg-[--background]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[--border] bg-[--surface]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <a href="/" className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[--primary] to-[--secondary]">
                  <span className="text-xl font-bold text-[--background]">EL</span>
                </div>
                <span className="text-xl font-bold text-[--text]">Easy Lehrer</span>
              </a>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a
                href="/resources"
                className="text-[--primary] font-medium transition-colors"
              >
                Ressourcen
              </a>
              <a
                href="#"
                className="text-[--text-muted] hover:text-[--text] transition-colors"
              >
                Für Schulen
              </a>
              <a
                href="#"
                className="text-[--text-muted] hover:text-[--text] transition-colors"
              >
                Über uns
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <a
                href="/login"
                className="hidden sm:block text-[--text-muted] hover:text-[--text] transition-colors"
              >
                Anmelden
              </a>
              <a
                href="/register"
                className="rounded-full bg-gradient-to-r from-[--primary] to-[--secondary] px-6 py-2.5 font-medium text-[--background] hover:opacity-90 transition-opacity shadow-lg shadow-[--primary]/20"
              >
                Registrieren
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[--text]">Ressourcen</h1>
          <p className="mt-2 text-[--text-muted]">
            Entdecken Sie qualitätsgeprüfte Unterrichtsmaterialien
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          {/* Main Search Controls */}
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Suche nach Titel, Thema, Stichwort..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-[--border] bg-[--surface] px-4 py-3 pl-11 text-[--text] placeholder:text-[--text-muted] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--primary]/20"
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
            <div className="sm:w-64">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full rounded-xl border border-[--border] bg-[--surface] px-4 py-3 text-[--text] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--primary]/20"
              >
                <option value="">Alle Fächer</option>
                <option value="Mathematik">Mathematik</option>
                <option value="Deutsch">Deutsch</option>
                <option value="Englisch">Englisch</option>
                <option value="Französisch">Französisch</option>
                <option value="NMG">NMG</option>
                <option value="BG">Bildnerisches Gestalten</option>
                <option value="Musik">Musik</option>
                <option value="Sport">Sport</option>
              </select>
            </div>

            {/* More Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 rounded-xl border border-[--border] bg-[--surface] px-6 py-3 text-[--text] hover:bg-[--surface1] transition-colors"
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
              <span className="hidden sm:inline">Mehr Filter</span>
            </button>
          </div>

          {/* Advanced Filters (Collapsible) */}
          {showFilters && (
            <div className="rounded-xl border border-[--border] bg-[--surface] p-6">
              <h3 className="mb-4 font-semibold text-[--text]">Erweiterte Filter</h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Cycle Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[--text]">
                    Zyklus
                  </label>
                  <select className="w-full rounded-lg border border-[--border] bg-[--background] px-3 py-2 text-[--text] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--primary]/20">
                    <option value="">Alle</option>
                    <option value="1">Zyklus 1</option>
                    <option value="2">Zyklus 2</option>
                    <option value="3">Zyklus 3</option>
                  </select>
                </div>

                {/* Canton Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[--text]">
                    Kanton
                  </label>
                  <select className="w-full rounded-lg border border-[--border] bg-[--background] px-3 py-2 text-[--text] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--primary]/20">
                    <option value="">Alle</option>
                    <option value="ZH">Zürich</option>
                    <option value="BE">Bern</option>
                    <option value="LU">Luzern</option>
                    <option value="AG">Aargau</option>
                    <option value="SG">St. Gallen</option>
                  </select>
                </div>

                {/* Quality Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[--text]">
                    Qualität
                  </label>
                  <select className="w-full rounded-lg border border-[--border] bg-[--background] px-3 py-2 text-[--text] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--primary]/20">
                    <option value="">Alle</option>
                    <option value="verified">Verifiziert</option>
                    <option value="ai-checked">KI-Geprüft</option>
                    <option value="pending">Ausstehend</option>
                  </select>
                </div>

                {/* Price Type Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[--text]">
                    Preistyp
                  </label>
                  <select className="w-full rounded-lg border border-[--border] bg-[--background] px-3 py-2 text-[--text] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--primary]/20">
                    <option value="">Alle</option>
                    <option value="free">Kostenlos</option>
                    <option value="paid">Kostenpflichtig</option>
                  </select>
                </div>

                {/* Resource Type Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[--text]">
                    Ressourcentyp
                  </label>
                  <select className="w-full rounded-lg border border-[--border] bg-[--background] px-3 py-2 text-[--text] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--primary]/20">
                    <option value="">Alle</option>
                    <option value="pdf">PDF</option>
                    <option value="word">Word</option>
                    <option value="powerpoint">PowerPoint</option>
                    <option value="bundle">Bundle</option>
                  </select>
                </div>

                {/* Editable Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[--text]">
                    Editierbar
                  </label>
                  <select className="w-full rounded-lg border border-[--border] bg-[--background] px-3 py-2 text-[--text] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--primary]/20">
                    <option value="">Alle</option>
                    <option value="yes">Ja</option>
                    <option value="no">Nein</option>
                  </select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="mt-6 flex gap-3">
                <button className="rounded-lg bg-gradient-to-r from-[--primary] to-[--secondary] px-6 py-2 font-medium text-[--background] hover:opacity-90 transition-opacity">
                  Filter anwenden
                </button>
                <button className="rounded-lg border border-[--border] px-6 py-2 font-medium text-[--text] hover:bg-[--surface1] transition-colors">
                  Zurücksetzen
                </button>
              </div>
            </div>
          )}

          {/* Sort and Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-[--text-muted]">
              {mockResources.length} Ressourcen gefunden
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-[--text-muted]">Sortieren:</label>
              <select className="rounded-lg border border-[--border] bg-[--surface] px-3 py-1.5 text-sm text-[--text] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--primary]/20">
                <option value="newest">Neueste</option>
                <option value="popular">Beliebteste</option>
                <option value="price-low">Preis: Niedrig → Hoch</option>
                <option value="price-high">Preis: Hoch → Niedrig</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resource Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockResources.map((resource) => (
            <a
              key={resource.id}
              href={`/resources/${resource.id}`}
              className="group rounded-2xl border border-[--border] bg-[--surface] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[--primary]/50 hover:shadow-2xl hover:shadow-[--primary]/10"
            >
              {/* Resource Type & Quality Badge */}
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-[--background] px-3 py-1 text-xs font-medium text-[--text]">
                  {resource.type}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    resource.quality === "Verified"
                      ? "bg-[--green]/20 text-[--green]"
                      : "bg-[--sapphire]/20 text-[--sapphire]"
                  }`}
                >
                  {resource.quality === "Verified" ? "✓ Verifiziert" : "KI-Geprüft"}
                </span>
              </div>

              {/* Title */}
              <h3 className="mb-2 text-lg font-semibold text-[--text] group-hover:text-[--primary] transition-colors">
                {resource.title}
              </h3>

              {/* Description */}
              <p className="mb-4 text-sm text-[--text-muted] line-clamp-2">
                {resource.description}
              </p>

              {/* Metadata */}
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[--background] px-3 py-1 text-xs text-[--text-muted]">
                  {resource.subject}
                </span>
                <span className="rounded-full bg-[--background] px-3 py-1 text-xs text-[--text-muted]">
                  {resource.cycle}
                </span>
              </div>

              {/* Price and CTA */}
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-[--primary]">
                  {resource.price}
                </span>
                <span className="rounded-full bg-gradient-to-r from-[--primary] to-[--secondary] px-4 py-2 text-sm font-medium text-[--background] group-hover:opacity-90 transition-opacity">
                  Ansehen
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-12 flex justify-center">
          <div className="flex gap-2">
            <button className="rounded-lg border border-[--border] bg-[--surface] px-4 py-2 text-[--text] hover:bg-[--surface1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Zurück
            </button>
            <button className="rounded-lg bg-gradient-to-r from-[--primary] to-[--secondary] px-4 py-2 font-medium text-[--background]">
              1
            </button>
            <button className="rounded-lg border border-[--border] bg-[--surface] px-4 py-2 text-[--text] hover:bg-[--surface1] transition-colors">
              2
            </button>
            <button className="rounded-lg border border-[--border] bg-[--surface] px-4 py-2 text-[--text] hover:bg-[--surface1] transition-colors">
              3
            </button>
            <button className="rounded-lg border border-[--border] bg-[--surface] px-4 py-2 text-[--text] hover:bg-[--surface1] transition-colors">
              Weiter
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-[--border] bg-[--surface]/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-[--text-muted]">
            <p>© 2026 Easy Lehrer. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
