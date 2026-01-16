"use client";

import { useState, useEffect, useRef } from "react";

// Types for curriculum data
interface Subject {
  id: string;
  code: string;
  name_de: string;
  name_fr: string | null;
}

interface Competency {
  id: string;
  code: string;
  description_de: string;
  description_fr: string | null;
  cycle: number;
  kompetenzbereich: string | null;
  handlungsaspekt: string | null;
}

interface Lehrmittel {
  id: string;
  name: string;
  publisher: string;
  subject: string;
  cantons: string[];
  cycles: number[];
}

interface CurriculumData {
  subjects: Subject[];
  competencies: Competency[];
  groupedCompetencies: Record<string, Competency[]>;
  lehrmittel: Lehrmittel[];
}

interface CurriculumSelectorProps {
  cycle: string;
  subject: string;
  canton: string;
  competencies: string[];
  lehrmittelIds: string[];
  onCycleChange: (cycle: string) => void;
  onSubjectChange: (subject: string) => void;
  onCantonChange: (canton: string) => void;
  onCompetenciesChange: (competencies: string[]) => void;
  onLehrmittelChange: (lehrmittelIds: string[]) => void;
}

const CYCLES = [
  { value: "1", label: "Zyklus 1", description: "Kindergarten - 2. Klasse" },
  { value: "2", label: "Zyklus 2", description: "3. - 6. Klasse" },
  { value: "3", label: "Zyklus 3", description: "7. - 9. Klasse" },
];

const CANTONS = [
  { value: "ZH", label: "Zürich" },
  { value: "BE", label: "Bern" },
  { value: "LU", label: "Luzern" },
  { value: "AG", label: "Aargau" },
  { value: "SG", label: "St. Gallen" },
  { value: "TG", label: "Thurgau" },
  { value: "GR", label: "Graubünden" },
  { value: "BS", label: "Basel-Stadt" },
  { value: "BL", label: "Basel-Landschaft" },
  { value: "SO", label: "Solothurn" },
  { value: "FR", label: "Freiburg" },
  { value: "VS", label: "Wallis" },
  { value: "all", label: "Alle Kantone" },
];

export function CurriculumSelector({
  cycle,
  subject,
  canton,
  competencies,
  lehrmittelIds,
  onCycleChange,
  onSubjectChange,
  onCantonChange,
  onCompetenciesChange,
  onLehrmittelChange,
}: CurriculumSelectorProps) {
  const [curriculumData, setCurriculumData] = useState<CurriculumData | null>(null);
  const [loading, setLoading] = useState(false);
  const [competencySearch, setCompetencySearch] = useState("");
  const [showCompetencyDropdown, setShowCompetencyDropdown] = useState(false);
  const [showLehrmittelDropdown, setShowLehrmittelDropdown] = useState(false);
  const competencyRef = useRef<HTMLDivElement>(null);
  const lehrmittelRef = useRef<HTMLDivElement>(null);

  // Fetch curriculum data when cycle, subject, or canton changes
  useEffect(() => {
    async function fetchCurriculum() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("curriculum", "LP21");
        if (subject) params.set("subject", subject);
        if (cycle) params.set("cycle", cycle);
        if (canton) params.set("canton", canton);

        const response = await fetch(`/api/curriculum?${params}`);
        if (response.ok) {
          const data = await response.json();
          setCurriculumData(data);
        }
      } catch (error) {
        console.error("Failed to fetch curriculum:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCurriculum();
  }, [cycle, subject, canton]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (competencyRef.current && !competencyRef.current.contains(event.target as Node)) {
        setShowCompetencyDropdown(false);
      }
      if (lehrmittelRef.current && !lehrmittelRef.current.contains(event.target as Node)) {
        setShowLehrmittelDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter competencies by search
  const filteredCompetencies = curriculumData?.competencies.filter(
    (c) =>
      c.code.toLowerCase().includes(competencySearch.toLowerCase()) ||
      c.description_de.toLowerCase().includes(competencySearch.toLowerCase())
  ) || [];

  // Group filtered competencies
  const groupedFiltered = filteredCompetencies.reduce(
    (acc, comp) => {
      const key = comp.kompetenzbereich || "Andere";
      if (!acc[key]) acc[key] = [];
      acc[key].push(comp);
      return acc;
    },
    {} as Record<string, Competency[]>
  );

  const toggleCompetency = (code: string) => {
    if (competencies.includes(code)) {
      onCompetenciesChange(competencies.filter((c) => c !== code));
    } else {
      onCompetenciesChange([...competencies, code]);
    }
  };

  const toggleLehrmittel = (id: string) => {
    if (lehrmittelIds.includes(id)) {
      onLehrmittelChange(lehrmittelIds.filter((l) => l !== id));
    } else {
      onLehrmittelChange([...lehrmittelIds, id]);
    }
  };

  const selectedCompetencyDetails = curriculumData?.competencies.filter((c) =>
    competencies.includes(c.code)
  ) || [];

  const selectedLehrmittelDetails = curriculumData?.lehrmittel.filter((l) =>
    lehrmittelIds.includes(l.id)
  ) || [];

  return (
    <div className="space-y-6">
      {/* Cycle Selection */}
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
          Zyklus <span className="text-[var(--color-error)]">*</span>
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          {CYCLES.map((c) => (
            <label
              key={c.value}
              className={`flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-all ${
                cycle === c.value
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                  : "border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-primary)]/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="cycle"
                  value={c.value}
                  checked={cycle === c.value}
                  onChange={(e) => onCycleChange(e.target.value)}
                  className="h-4 w-4 text-[var(--color-primary)]"
                />
                <span className="font-medium text-[var(--color-text)]">{c.label}</span>
              </div>
              <span className="mt-1 text-xs text-[var(--color-text-muted)]">{c.description}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Subject and Canton Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Subject Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
            Fach <span className="text-[var(--color-error)]">*</span>
          </label>
          <select
            value={subject}
            onChange={(e) => {
              onSubjectChange(e.target.value);
              onCompetenciesChange([]); // Reset competencies when subject changes
              onLehrmittelChange([]); // Reset lehrmittel when subject changes
            }}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          >
            <option value="">Fach wählen...</option>
            {curriculumData?.subjects.map((s) => (
              <option key={s.id} value={s.code}>
                {s.name_de}
              </option>
            ))}
          </select>
        </div>

        {/* Canton Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
            Kanton
          </label>
          <select
            value={canton}
            onChange={(e) => onCantonChange(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          >
            <option value="">Optional: Kanton wählen...</option>
            {CANTONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Competencies Multi-Select */}
      {subject && (
        <div ref={competencyRef} className="relative">
          <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
            Lehrplan 21 Kompetenzen
          </label>

          {/* Selected competencies display */}
          <div
            onClick={() => setShowCompetencyDropdown(!showCompetencyDropdown)}
            className="min-h-[48px] w-full cursor-pointer rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 focus-within:border-[var(--color-primary)]"
          >
            {selectedCompetencyDetails.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedCompetencyDetails.map((comp) => (
                  <span
                    key={comp.code}
                    className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-primary)]/20 px-2 py-1 text-sm font-medium text-[var(--color-primary)]"
                  >
                    {comp.code}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompetency(comp.code);
                      }}
                      className="ml-1 hover:text-[var(--color-error)]"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[var(--color-text-muted)]">
                {loading ? "Lade Kompetenzen..." : "Kompetenzen auswählen..."}
              </span>
            )}
          </div>

          {/* Dropdown */}
          {showCompetencyDropdown && (
            <div className="absolute z-50 mt-2 max-h-80 w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
              {/* Search */}
              <div className="sticky top-0 border-b border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                <input
                  type="text"
                  value={competencySearch}
                  onChange={(e) => setCompetencySearch(e.target.value)}
                  placeholder="Suchen (z.B. MA.1.A oder Addition)..."
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Grouped competencies */}
              <div className="max-h-60 overflow-y-auto p-2">
                {Object.keys(groupedFiltered).length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-[var(--color-text-muted)]">
                    {loading ? "Lade..." : "Keine Kompetenzen gefunden"}
                  </div>
                ) : (
                  Object.entries(groupedFiltered).map(([group, comps]) => (
                    <div key={group} className="mb-3">
                      <div className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                        {group}
                      </div>
                      {comps.map((comp) => (
                        <button
                          key={comp.code}
                          type="button"
                          onClick={() => toggleCompetency(comp.code)}
                          className={`flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                            competencies.includes(comp.code)
                              ? "bg-[var(--color-primary)]/20"
                              : "hover:bg-[var(--color-surface-elevated)]"
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${
                              competencies.includes(comp.code)
                                ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                                : "border-[var(--color-border)]"
                            }`}
                          >
                            {competencies.includes(comp.code) && (
                              <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-semibold text-[var(--color-primary)]">
                                {comp.code}
                              </span>
                              <span className="rounded bg-[var(--color-surface-elevated)] px-1.5 py-0.5 text-xs text-[var(--color-text-muted)]">
                                Zyklus {comp.cycle}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-[var(--color-text-muted)] line-clamp-2">
                              {comp.description_de}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Wählen Sie die Kompetenzen aus dem Lehrplan 21, die zu Ihrer Ressource passen
          </p>
        </div>
      )}

      {/* Lehrmittel Multi-Select */}
      {subject && curriculumData?.lehrmittel && curriculumData.lehrmittel.length > 0 && (
        <div ref={lehrmittelRef} className="relative">
          <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
            Passend zu Lehrmittel
          </label>

          {/* Selected lehrmittel display */}
          <div
            onClick={() => setShowLehrmittelDropdown(!showLehrmittelDropdown)}
            className="min-h-[48px] w-full cursor-pointer rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 focus-within:border-[var(--color-primary)]"
          >
            {selectedLehrmittelDetails.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedLehrmittelDetails.map((lm) => (
                  <span
                    key={lm.id}
                    className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-success)]/20 px-2 py-1 text-sm font-medium text-[var(--color-success)]"
                  >
                    {lm.name}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLehrmittel(lm.id);
                      }}
                      className="ml-1 hover:text-[var(--color-error)]"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[var(--color-text-muted)]">
                Optional: Lehrmittel auswählen...
              </span>
            )}
          </div>

          {/* Dropdown */}
          {showLehrmittelDropdown && (
            <div className="absolute z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-xl">
              {curriculumData.lehrmittel.map((lm) => (
                <button
                  key={lm.id}
                  type="button"
                  onClick={() => toggleLehrmittel(lm.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                    lehrmittelIds.includes(lm.id)
                      ? "bg-[var(--color-success)]/20"
                      : "hover:bg-[var(--color-surface-elevated)]"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${
                      lehrmittelIds.includes(lm.id)
                        ? "border-[var(--color-success)] bg-[var(--color-success)]"
                        : "border-[var(--color-border)]"
                    }`}
                  >
                    {lehrmittelIds.includes(lm.id) && (
                      <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-[var(--color-text)]">{lm.name}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      {lm.publisher} • Zyklus {lm.cycles.join(", ")}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Wählen Sie Lehrmittel, zu denen Ihre Ressource passt (hilft Lehrpersonen bei der Suche)
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="rounded-xl border border-[var(--color-info)]/30 bg-[var(--color-info)]/10 p-4">
        <div className="flex gap-3">
          <svg
            className="h-5 w-5 flex-shrink-0 text-[var(--color-info)]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-[var(--color-text)]">
            <strong>Tipp:</strong> Je genauer Sie Ihre Ressource dem Lehrplan 21 zuordnen, desto
            besser finden Lehrpersonen Ihre Materialien. Wählen Sie alle relevanten Kompetenzen aus.
          </div>
        </div>
      </div>
    </div>
  );
}
