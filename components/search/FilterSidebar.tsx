"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Subject {
  id: string;
  code: string;
  name_de: string;
  color?: string | null;
}

interface TransversalCompetency {
  id: string;
  code: string;
  category: string;
  name_de: string;
  color?: string | null;
}

interface BneTheme {
  id: string;
  code: string;
  name_de: string;
  color?: string | null;
}

interface FilterSidebarProps {
  subjects?: Subject[];
  transversals?: TransversalCompetency[];
  bneThemes?: BneTheme[];
  onFilterChange?: (filters: FilterState) => void;
  className?: string;
}

interface FilterState {
  subject: string;
  cycle: string;
  competency: string;
  transversal: string;
  bne: string;
  miIntegrated: boolean;
  search: string;
}

const CYCLES = [
  { value: "1", label: "Zyklus 1", description: "KG - 2. Klasse" },
  { value: "2", label: "Zyklus 2", description: "3. - 6. Klasse" },
  { value: "3", label: "Zyklus 3", description: "7. - 9. Klasse" },
];

/**
 * FilterSidebar - Comprehensive filter panel for resources catalog
 *
 * Features:
 * - Cycle selector (Zyklus 1/2/3)
 * - Subject multi-select with colors
 * - LP21 competency search
 * - Transversal competency checkboxes
 * - BNE theme checkboxes
 * - M&I integration toggle
 */
export function FilterSidebar({
  subjects = [],
  transversals = [],
  bneThemes = [],
  onFilterChange,
  className = "",
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [filters, setFilters] = useState<FilterState>({
    subject: searchParams.get("subject") || "",
    cycle: searchParams.get("cycle") || "",
    competency: searchParams.get("competency") || "",
    transversal: searchParams.get("transversal") || "",
    bne: searchParams.get("bne") || "",
    miIntegrated: searchParams.get("mi_integrated") === "true",
    search: searchParams.get("search") || "",
  });

  const [expandedSections, setExpandedSections] = useState({
    cycle: true,
    subject: true,
    competency: false,
    transversal: false,
    bne: false,
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.subject) params.set("subject", filters.subject);
    if (filters.cycle) params.set("cycle", filters.cycle);
    if (filters.competency) params.set("competency", filters.competency);
    if (filters.transversal) params.set("transversal", filters.transversal);
    if (filters.bne) params.set("bne", filters.bne);
    if (filters.miIntegrated) params.set("mi_integrated", "true");
    if (filters.search) params.set("search", filters.search);

    const newUrl = `/resources${params.toString() ? `?${params.toString()}` : ""}`;

    // Only update if URL actually changed
    if (window.location.pathname + window.location.search !== newUrl) {
      router.push(newUrl, { scroll: false });
    }

    onFilterChange?.(filters);
  }, [filters, router, onFilterChange]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      subject: "",
      cycle: "",
      competency: "",
      transversal: "",
      bne: "",
      miIntegrated: false,
      search: "",
    });
  };

  const hasActiveFilters =
    filters.subject ||
    filters.cycle ||
    filters.competency ||
    filters.transversal ||
    filters.bne ||
    filters.miIntegrated;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Group transversals by category
  const groupedTransversals = transversals.reduce(
    (acc, t) => {
      const cat = t.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(t);
      return acc;
    },
    {} as Record<string, TransversalCompetency[]>
  );

  const categoryLabels: Record<string, string> = {
    personale: "Personale Kompetenzen",
    soziale: "Soziale Kompetenzen",
    methodische: "Methodische Kompetenzen",
  };

  return (
    <aside className={`space-y-4 ${className}`}>
      {/* Header with Clear All */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[var(--color-text)]">Filter</h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-[var(--color-primary)] hover:underline"
          >
            Alle zurücksetzen
          </button>
        )}
      </div>

      {/* Cycle Filter */}
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <button
          onClick={() => toggleSection("cycle")}
          className="flex w-full items-center justify-between px-4 py-3 text-left font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]"
        >
          <span>Zyklus</span>
          <svg
            className={`h-5 w-5 transition-transform ${expandedSections.cycle ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.cycle && (
          <div className="border-t border-[var(--color-border)] p-3">
            <div className="space-y-2">
              {CYCLES.map((c) => (
                <label
                  key={c.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                    filters.cycle === c.value
                      ? "bg-[var(--color-primary)]/10"
                      : "hover:bg-[var(--color-surface-elevated)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="cycle"
                    value={c.value}
                    checked={filters.cycle === c.value}
                    onChange={(e) => updateFilter("cycle", e.target.value)}
                    className="h-4 w-4 text-[var(--color-primary)]"
                  />
                  <div>
                    <span className="font-medium text-[var(--color-text)]">{c.label}</span>
                    <span className="ml-2 text-xs text-[var(--color-text-muted)]">
                      {c.description}
                    </span>
                  </div>
                </label>
              ))}
              {filters.cycle && (
                <button
                  onClick={() => updateFilter("cycle", "")}
                  className="w-full text-center text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                >
                  Auswahl aufheben
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Subject Filter */}
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <button
          onClick={() => toggleSection("subject")}
          className="flex w-full items-center justify-between px-4 py-3 text-left font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]"
        >
          <span>Fachbereich</span>
          <svg
            className={`h-5 w-5 transition-transform ${expandedSections.subject ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.subject && (
          <div className="border-t border-[var(--color-border)] p-3">
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => updateFilter("subject", filters.subject === s.code ? "" : s.code)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                    filters.subject === s.code
                      ? "ring-2 ring-offset-2 ring-offset-[var(--color-surface)]"
                      : "opacity-80 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor: `${s.color || "#6b7280"}20`,
                    color: s.color || "#6b7280",
                    borderColor: s.color || "#6b7280",
                    ...(filters.subject === s.code && {
                      ringColor: s.color || "#6b7280",
                    }),
                  }}
                >
                  {s.code}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Competency Search */}
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <button
          onClick={() => toggleSection("competency")}
          className="flex w-full items-center justify-between px-4 py-3 text-left font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]"
        >
          <span>LP21 Kompetenz</span>
          <svg
            className={`h-5 w-5 transition-transform ${expandedSections.competency ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.competency && (
          <div className="border-t border-[var(--color-border)] p-3">
            <input
              type="text"
              value={filters.competency}
              onChange={(e) => updateFilter("competency", e.target.value)}
              placeholder="z.B. MA.1.A oder D.2.B"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none"
            />
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              Geben Sie einen LP21-Kompetenzcode ein (z.B. MA.1.A.1)
            </p>
          </div>
        )}
      </div>

      {/* Transversal Competencies */}
      {transversals.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <button
            onClick={() => toggleSection("transversal")}
            className="flex w-full items-center justify-between px-4 py-3 text-left font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]"
          >
            <span>Überfachliche Kompetenzen</span>
            <svg
              className={`h-5 w-5 transition-transform ${expandedSections.transversal ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {expandedSections.transversal && (
            <div className="space-y-3 border-t border-[var(--color-border)] p-3">
              {Object.entries(groupedTransversals).map(([category, items]) => (
                <div key={category}>
                  <div className="mb-1 text-xs font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
                    {categoryLabels[category] || category}
                  </div>
                  <div className="space-y-1">
                    {items.map((t) => (
                      <label
                        key={t.id}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
                          filters.transversal === t.code
                            ? "bg-[var(--color-primary)]/10"
                            : "hover:bg-[var(--color-surface-elevated)]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="transversal"
                          value={t.code}
                          checked={filters.transversal === t.code}
                          onChange={(e) => updateFilter("transversal", e.target.value)}
                          className="h-4 w-4"
                          style={{ accentColor: t.color || undefined }}
                        />
                        <span
                          className="font-mono text-xs font-semibold"
                          style={{ color: t.color || undefined }}
                        >
                          {t.code}
                        </span>
                        <span className="text-sm text-[var(--color-text)]">{t.name_de}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {filters.transversal && (
                <button
                  onClick={() => updateFilter("transversal", "")}
                  className="w-full text-center text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                >
                  Auswahl aufheben
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* BNE Themes */}
      {bneThemes.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <button
            onClick={() => toggleSection("bne")}
            className="flex w-full items-center justify-between px-4 py-3 text-left font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]"
          >
            <span>BNE Themen</span>
            <svg
              className={`h-5 w-5 transition-transform ${expandedSections.bne ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {expandedSections.bne && (
            <div className="space-y-1 border-t border-[var(--color-border)] p-3">
              {bneThemes.map((b) => (
                <label
                  key={b.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
                    filters.bne === b.code
                      ? "bg-[var(--color-primary)]/10"
                      : "hover:bg-[var(--color-surface-elevated)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="bne"
                    value={b.code}
                    checked={filters.bne === b.code}
                    onChange={(e) => updateFilter("bne", e.target.value)}
                    className="h-4 w-4"
                    style={{ accentColor: b.color || undefined }}
                  />
                  <span
                    className="font-mono text-xs font-semibold"
                    style={{ color: b.color || undefined }}
                  >
                    {b.code}
                  </span>
                  <span className="line-clamp-1 text-sm text-[var(--color-text)]">{b.name_de}</span>
                </label>
              ))}
              {filters.bne && (
                <button
                  onClick={() => updateFilter("bne", "")}
                  className="w-full text-center text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                >
                  Auswahl aufheben
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* M&I Integration Toggle */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <label className="flex cursor-pointer items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-[#6366f1]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="font-medium text-[var(--color-text)]">Medien & Informatik</span>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={filters.miIntegrated}
              onChange={(e) => updateFilter("miIntegrated", e.target.checked)}
              className="peer sr-only"
            />
            <div className="h-6 w-11 rounded-full bg-[var(--color-border)] transition-colors peer-checked:bg-[#6366f1]" />
            <div className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-[var(--color-bg)] transition-transform peer-checked:translate-x-5" />
          </div>
        </label>
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          Nur Materialien mit M&I Integration anzeigen
        </p>
      </div>
    </aside>
  );
}
