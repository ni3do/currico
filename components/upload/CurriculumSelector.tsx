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
  onSubjectChange: (subject: string, subjectCode?: string) => void;
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
  { value: "AG", label: "Aargau" },
  { value: "BL", label: "Basel-Landschaft" },
  { value: "BS", label: "Basel-Stadt" },
  { value: "BE", label: "Bern" },
  { value: "FR", label: "Freiburg" },
  { value: "GR", label: "Graubünden" },
  { value: "LU", label: "Luzern" },
  { value: "SO", label: "Solothurn" },
  { value: "SG", label: "St. Gallen" },
  { value: "TG", label: "Thurgau" },
  { value: "VS", label: "Wallis" },
  { value: "ZH", label: "Zürich" },
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
  // Track subject code separately for API calls (subject prop contains the display name)
  const [subjectCode, setSubjectCode] = useState("");
  const competencyRef = useRef<HTMLDivElement>(null);
  const lehrmittelRef = useRef<HTMLDivElement>(null);

  // Fetch curriculum data when cycle, subjectCode, or canton changes
  useEffect(() => {
    async function fetchCurriculum() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("curriculum", "LP21");
        if (subjectCode) params.set("subject", subjectCode);
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
  }, [cycle, subjectCode, canton]);

  // Sync subjectCode when curriculum data loads and subject name is set
  useEffect(() => {
    if (curriculumData && subject && !subjectCode) {
      const matchingSubject = curriculumData.subjects.find((s) => s.name_de === subject);
      if (matchingSubject) {
        setSubjectCode(matchingSubject.code);
      }
    }
  }, [curriculumData, subject, subjectCode]);

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
  const filteredCompetencies =
    curriculumData?.competencies.filter(
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

  const selectedCompetencyDetails =
    curriculumData?.competencies.filter((c) => competencies.includes(c.code)) || [];

  const selectedLehrmittelDetails =
    curriculumData?.lehrmittel.filter((l) => lehrmittelIds.includes(l.id)) || [];

  return (
    <div className="space-y-6">
      {/* Cycle Selection */}
      <div>
        <label className="text-text mb-2 block text-sm font-medium">
          Zyklus <span className="text-error">*</span>
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          {CYCLES.map((c) => (
            <label
              key={c.value}
              className={`flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-all ${
                cycle === c.value
                  ? "border-primary bg-primary/10"
                  : "border-border bg-bg hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="cycle"
                  value={c.value}
                  checked={cycle === c.value}
                  onChange={(e) => onCycleChange(e.target.value)}
                  className="text-primary h-4 w-4"
                />
                <span className="text-text font-medium">{c.label}</span>
              </div>
              <span className="text-text-muted mt-1 text-xs">{c.description}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Subject and Canton Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Subject Selection */}
        <div>
          <label className="text-text mb-2 block text-sm font-medium">
            Fach <span className="text-error">*</span>
          </label>
          <select
            value={subject}
            onChange={(e) => {
              const selectedName = e.target.value;
              const selectedSubject = curriculumData?.subjects.find(
                (s) => s.name_de === selectedName
              );
              const code = selectedSubject?.code || "";
              setSubjectCode(code);
              onSubjectChange(selectedName, code);
              onCompetenciesChange([]); // Reset competencies when subject changes
              onLehrmittelChange([]); // Reset lehrmittel when subject changes
            }}
            className="border-border bg-bg text-text focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
          >
            <option value="">Fach wählen...</option>
            {curriculumData?.subjects.map((s) => (
              <option key={s.id} value={s.name_de}>
                {s.name_de}
              </option>
            ))}
          </select>
        </div>

        {/* Canton Selection */}
        <div>
          <label className="text-text mb-2 block text-sm font-medium">Kanton</label>
          <select
            value={canton}
            onChange={(e) => onCantonChange(e.target.value)}
            className="border-border bg-bg text-text focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
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
          <label className="text-text mb-2 block text-sm font-medium">
            Lehrplan 21 Kompetenzen
          </label>

          {/* Selected competencies display */}
          <div
            onClick={() => setShowCompetencyDropdown(!showCompetencyDropdown)}
            className="border-border bg-bg focus-within:border-primary min-h-[48px] w-full cursor-pointer rounded-xl border px-4 py-3"
          >
            {selectedCompetencyDetails.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedCompetencyDetails.map((comp) => (
                  <span
                    key={comp.code}
                    className="bg-primary/20 text-primary inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium"
                  >
                    {comp.code}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompetency(comp.code);
                      }}
                      className="hover:text-error ml-1"
                    >
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-text-muted">
                {loading ? "Lade Kompetenzen..." : "Kompetenzen auswählen..."}
              </span>
            )}
          </div>

          {/* Dropdown */}
          {showCompetencyDropdown && (
            <div className="border-border bg-surface absolute z-50 mt-2 max-h-80 w-full overflow-hidden rounded-xl border shadow-xl">
              {/* Search */}
              <div className="border-border bg-surface sticky top-0 border-b p-3">
                <input
                  type="text"
                  value={competencySearch}
                  onChange={(e) => setCompetencySearch(e.target.value)}
                  placeholder="Suchen (z.B. MA.1.A oder Addition)..."
                  className="border-border bg-bg text-text focus:border-primary w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Grouped competencies */}
              <div className="max-h-60 overflow-y-auto p-2">
                {Object.keys(groupedFiltered).length === 0 ? (
                  <div className="text-text-muted px-3 py-4 text-center text-sm">
                    {loading ? "Lade..." : "Keine Kompetenzen gefunden"}
                  </div>
                ) : (
                  Object.entries(groupedFiltered).map(([group, comps]) => (
                    <div key={group} className="mb-3">
                      <div className="text-text-muted mb-1 px-2 text-xs font-semibold tracking-wide uppercase">
                        {group}
                      </div>
                      {comps.map((comp) => (
                        <button
                          key={comp.code}
                          type="button"
                          onClick={() => toggleCompetency(comp.code)}
                          className={`flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                            competencies.includes(comp.code)
                              ? "bg-primary/20"
                              : "hover:bg-surface-elevated"
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${
                              competencies.includes(comp.code)
                                ? "border-primary bg-primary"
                                : "border-border"
                            }`}
                          >
                            {competencies.includes(comp.code) && (
                              <svg
                                className="text-text-on-accent h-3 w-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-primary font-mono text-sm font-semibold">
                                {comp.code}
                              </span>
                              <span className="bg-surface-elevated text-text-muted rounded px-1.5 py-0.5 text-xs">
                                Zyklus {comp.cycle}
                              </span>
                            </div>
                            <p className="text-text-muted mt-0.5 line-clamp-2 text-xs">
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

          <p className="text-text-muted mt-1 text-xs">
            Wählen Sie die Kompetenzen aus dem Lehrplan 21, die zu Ihrem Material passen
          </p>
        </div>
      )}

      {/* Lehrmittel Multi-Select */}
      {subject && curriculumData?.lehrmittel && curriculumData.lehrmittel.length > 0 && (
        <div ref={lehrmittelRef} className="relative">
          <label className="text-text mb-2 block text-sm font-medium">Passend zu Lehrmittel</label>

          {/* Selected lehrmittel display */}
          <div
            onClick={() => setShowLehrmittelDropdown(!showLehrmittelDropdown)}
            className="border-border bg-bg focus-within:border-primary min-h-[48px] w-full cursor-pointer rounded-xl border px-4 py-3"
          >
            {selectedLehrmittelDetails.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedLehrmittelDetails.map((lm) => (
                  <span
                    key={lm.id}
                    className="bg-success/20 text-success inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium"
                  >
                    {lm.name}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLehrmittel(lm.id);
                      }}
                      className="hover:text-error ml-1"
                    >
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-text-muted">Optional: Lehrmittel auswählen...</span>
            )}
          </div>

          {/* Dropdown */}
          {showLehrmittelDropdown && (
            <div className="border-border bg-surface absolute z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border p-2 shadow-xl">
              {curriculumData.lehrmittel.map((lm) => (
                <button
                  key={lm.id}
                  type="button"
                  onClick={() => toggleLehrmittel(lm.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                    lehrmittelIds.includes(lm.id) ? "bg-success/20" : "hover:bg-surface-elevated"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${
                      lehrmittelIds.includes(lm.id) ? "border-success bg-success" : "border-border"
                    }`}
                  >
                    {lehrmittelIds.includes(lm.id) && (
                      <svg
                        className="text-text-on-accent h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                  <div className="flex-1">
                    <div className="text-text font-medium">{lm.name}</div>
                    <div className="text-text-muted text-xs">
                      {lm.publisher} • Zyklus {lm.cycles.join(", ")}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <p className="text-text-muted mt-1 text-xs">
            Wählen Sie Lehrmittel, zu denen Ihr Material passt (hilft Lehrpersonen bei der Suche)
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="border-info/30 bg-info/10 rounded-xl border p-4">
        <div className="flex gap-3">
          <svg className="text-info h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-text text-sm">
            <strong>Tipp:</strong> Je genauer Sie Ihr Material dem Lehrplan 21 zuordnen, desto
            besser finden Lehrpersonen Ihre Materialien. Wählen Sie alle relevanten Kompetenzen aus.
          </div>
        </div>
      </div>
    </div>
  );
}
