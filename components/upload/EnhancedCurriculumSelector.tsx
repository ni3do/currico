"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { FACHBEREICHE, getFachbereicheByZyklus, getFachbereichByCode } from "@/lib/data/lehrplan21";
import type { Fachbereich, Kompetenzbereich, Kompetenz } from "@/lib/curriculum-types";
import { FormField } from "./FormField";
import { InfoTooltip, FIELD_TOOLTIPS } from "./InfoTooltip";
import {
  BookOpen,
  Globe,
  Calculator,
  Leaf,
  Palette,
  Music,
  Dumbbell,
  Monitor,
  Beaker,
  Briefcase,
  Map,
  Users,
  Compass,
  FolderKanban,
  ChevronDown,
  ChevronRight,
  Check,
  Search,
  X,
  AlertCircle,
} from "lucide-react";

// Map icon names to Lucide components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "book-open": BookOpen,
  globe: Globe,
  calculator: Calculator,
  leaf: Leaf,
  palette: Palette,
  music: Music,
  dumbbell: Dumbbell,
  monitor: Monitor,
  beaker: Beaker,
  briefcase: Briefcase,
  map: Map,
  users: Users,
  compass: Compass,
  "folder-kanban": FolderKanban,
};

interface EnhancedCurriculumSelectorProps {
  cycle: string;
  subject: string;
  subjectCode: string;
  canton: string;
  competencies: string[];
  onCycleChange: (cycle: string) => void;
  onSubjectChange: (subject: string, subjectCode: string) => void;
  onCantonChange: (canton: string) => void;
  onCompetenciesChange: (competencies: string[]) => void;
  // Validation
  touchedCycle?: boolean;
  touchedSubject?: boolean;
  cycleError?: string;
  subjectError?: string;
  onCycleBlur?: () => void;
  onSubjectBlur?: () => void;
}

const CYCLES = [
  { value: "1", label: "Zyklus 1", description: "Kindergarten – 2. Klasse", grades: "KG–2" },
  { value: "2", label: "Zyklus 2", description: "3. – 6. Klasse", grades: "3–6" },
  { value: "3", label: "Zyklus 3", description: "7. – 9. Klasse", grades: "7–9" },
];

const CANTONS = [
  { value: "", label: "Kein Kanton (alle)" },
  { value: "ZH", label: "Zürich" },
  { value: "BE", label: "Bern" },
  { value: "LU", label: "Luzern" },
  { value: "AG", label: "Aargau" },
  { value: "SG", label: "St. Gallen" },
  { value: "BL", label: "Basel-Landschaft" },
  { value: "BS", label: "Basel-Stadt" },
  { value: "GR", label: "Graubünden" },
  { value: "TG", label: "Thurgau" },
  { value: "SO", label: "Solothurn" },
  { value: "FR", label: "Freiburg" },
  { value: "VS", label: "Wallis" },
];

export function EnhancedCurriculumSelector({
  cycle,
  subject,
  subjectCode,
  canton,
  competencies,
  onCycleChange,
  onSubjectChange,
  onCantonChange,
  onCompetenciesChange,
  touchedCycle,
  touchedSubject,
  cycleError,
  subjectError,
  onCycleBlur,
  onSubjectBlur,
}: EnhancedCurriculumSelectorProps) {
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showCompetencyPanel, setShowCompetencyPanel] = useState(false);
  const [competencySearch, setCompetencySearch] = useState("");
  const [expandedBereiche, setExpandedBereiche] = useState<string[]>([]);

  const subjectRef = useRef<HTMLDivElement>(null);
  const competencyRef = useRef<HTMLDivElement>(null);

  // Get available subjects for selected cycle
  const availableSubjects = useMemo(() => {
    if (!cycle) return FACHBEREICHE;
    return getFachbereicheByZyklus(parseInt(cycle));
  }, [cycle]);

  // Get selected subject details
  const selectedFachbereich = useMemo(() => {
    if (!subjectCode) return null;
    return getFachbereichByCode(subjectCode);
  }, [subjectCode]);

  // Filter competencies by search
  const filteredKompetenzbereiche = useMemo(() => {
    if (!selectedFachbereich) return [];

    const searchLower = competencySearch.toLowerCase();
    if (!searchLower) return selectedFachbereich.kompetenzbereiche;

    return selectedFachbereich.kompetenzbereiche
      .map((kb) => ({
        ...kb,
        kompetenzen: kb.kompetenzen.filter(
          (k) =>
            k.code.toLowerCase().includes(searchLower) ||
            k.name.toLowerCase().includes(searchLower) ||
            k.handlungsaspekte?.some((h) => h.toLowerCase().includes(searchLower))
        ),
      }))
      .filter((kb) => kb.kompetenzen.length > 0);
  }, [selectedFachbereich, competencySearch]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (subjectRef.current && !subjectRef.current.contains(event.target as Node)) {
        setShowSubjectDropdown(false);
      }
      if (competencyRef.current && !competencyRef.current.contains(event.target as Node)) {
        setShowCompetencyPanel(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle competency selection
  const toggleCompetency = (code: string) => {
    if (competencies.includes(code)) {
      onCompetenciesChange(competencies.filter((c) => c !== code));
    } else {
      onCompetenciesChange([...competencies, code]);
    }
  };

  // Toggle all competencies in a Kompetenzbereich
  const toggleKompetenzbereich = (kb: Kompetenzbereich) => {
    const kbCodes = kb.kompetenzen.map((k) => k.code);
    const allSelected = kbCodes.every((code) => competencies.includes(code));

    if (allSelected) {
      onCompetenciesChange(competencies.filter((c) => !kbCodes.includes(c)));
    } else {
      const newCompetencies = [...competencies];
      kbCodes.forEach((code) => {
        if (!newCompetencies.includes(code)) {
          newCompetencies.push(code);
        }
      });
      onCompetenciesChange(newCompetencies);
    }
  };

  // Toggle expanded state
  const toggleExpanded = (code: string) => {
    setExpandedBereiche((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Get icon component for a subject
  const getSubjectIcon = (iconName: string) => {
    return ICON_MAP[iconName] || BookOpen;
  };

  // Handle subject selection
  const handleSelectSubject = (fachbereich: Fachbereich) => {
    onSubjectChange(fachbereich.name, fachbereich.code);
    onCompetenciesChange([]); // Reset competencies when subject changes
    setShowSubjectDropdown(false);
    setExpandedBereiche([]); // Reset expanded states
  };

  return (
    <div className="space-y-6">
      {/* Cycle Selection */}
      <div>
        <div className="mb-3 flex items-center gap-1.5">
          <label className="text-text text-sm font-medium">
            Zyklus <span className="text-error">*</span>
          </label>
          <InfoTooltip content={FIELD_TOOLTIPS.cycle.content} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {CYCLES.map((c) => (
            <label
              key={c.value}
              className={`relative flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-all ${
                cycle === c.value
                  ? "border-primary bg-primary/10 ring-primary/20 ring-2"
                  : touchedCycle && cycleError
                    ? "border-error/50 bg-error/5 hover:border-error"
                    : "border-border bg-bg hover:border-primary/50"
              } `}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="cycle"
                  value={c.value}
                  checked={cycle === c.value}
                  onChange={(e) => {
                    onCycleChange(e.target.value);
                    // Reset subject when cycle changes
                    if (subjectCode) {
                      const newSubjects = getFachbereicheByZyklus(parseInt(e.target.value));
                      const currentSubjectAvailable = newSubjects.some(
                        (s) => s.code === subjectCode
                      );
                      if (!currentSubjectAvailable) {
                        onSubjectChange("", "");
                        onCompetenciesChange([]);
                      }
                    }
                  }}
                  onBlur={onCycleBlur}
                  className="text-primary focus:ring-primary/20 h-4 w-4"
                />
                <span className="text-text font-medium">{c.label}</span>
                <span className="bg-surface-elevated text-text-muted ml-auto rounded-full px-2 py-0.5 text-xs">
                  {c.grades}
                </span>
              </div>
              <span className="text-text-muted mt-1.5 text-xs">{c.description}</span>
            </label>
          ))}
        </div>
        {touchedCycle && cycleError && (
          <div className="text-error mt-2 flex items-center gap-1.5 text-sm">
            <AlertCircle className="h-4 w-4" />
            {cycleError}
          </div>
        )}
      </div>

      {/* Subject Selection */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div ref={subjectRef} className="relative">
          <div className="mb-2 flex items-center gap-1.5">
            <label className="text-text text-sm font-medium">
              Fach <span className="text-error">*</span>
            </label>
            <InfoTooltip content={FIELD_TOOLTIPS.subject.content} />
          </div>

          <button
            type="button"
            onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
            onBlur={onSubjectBlur}
            className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
              showSubjectDropdown
                ? "border-primary ring-primary/20 ring-2"
                : touchedSubject && subjectError
                  ? "border-error bg-error/5"
                  : "border-border bg-bg hover:border-primary/50"
            } `}
          >
            {selectedFachbereich ? (
              <>
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${selectedFachbereich.color}20` }}
                >
                  {(() => {
                    const Icon = getSubjectIcon(selectedFachbereich.icon);
                    return (
                      <span style={{ color: selectedFachbereich.color }}>
                        <Icon className="h-4 w-4" />
                      </span>
                    );
                  })()}
                </div>
                <span className="text-text font-medium">{selectedFachbereich.name}</span>
                <span className="text-text-muted ml-auto text-xs">
                  {selectedFachbereich.shortName}
                </span>
              </>
            ) : (
              <span className="text-text-muted">Fach wählen...</span>
            )}
            <ChevronDown
              className={`text-text-muted ml-auto h-5 w-5 transition-transform ${showSubjectDropdown ? "rotate-180" : ""}`}
            />
          </button>

          {/* Subject Dropdown */}
          {showSubjectDropdown && (
            <div className="border-border bg-surface absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border shadow-xl">
              {!cycle && (
                <div className="text-text-muted px-4 py-3 text-sm">
                  Bitte wählen Sie zuerst einen Zyklus
                </div>
              )}
              {cycle && availableSubjects.length === 0 && (
                <div className="text-text-muted px-4 py-3 text-sm">
                  Keine Fächer für diesen Zyklus verfügbar
                </div>
              )}
              {availableSubjects.map((fachbereich) => {
                const Icon = getSubjectIcon(fachbereich.icon);
                const isSelected = subjectCode === fachbereich.code;

                return (
                  <button
                    key={fachbereich.code}
                    type="button"
                    onClick={() => handleSelectSubject(fachbereich)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${isSelected ? "bg-primary/10" : "hover:bg-surface-elevated"} `}
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${fachbereich.color}20` }}
                    >
                      <span style={{ color: fachbereich.color }}>
                        <Icon className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-text font-medium">{fachbereich.name}</div>
                      <div className="text-text-muted text-xs">
                        {fachbereich.kompetenzbereiche.length} Kompetenzbereiche
                      </div>
                    </div>
                    <span className="text-text-muted text-xs">{fachbereich.shortName}</span>
                    {isSelected && <Check className="text-primary h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          )}

          {touchedSubject && subjectError && (
            <div className="text-error mt-2 flex items-center gap-1.5 text-sm">
              <AlertCircle className="h-4 w-4" />
              {subjectError}
            </div>
          )}
        </div>

        {/* Canton Selection */}
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <label className="text-text text-sm font-medium">Kanton</label>
            <InfoTooltip content={FIELD_TOOLTIPS.canton.content} />
          </div>
          <select
            value={canton}
            onChange={(e) => onCantonChange(e.target.value)}
            className="border-border bg-bg text-text focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none"
          >
            {CANTONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <p className="text-text-muted mt-1 text-xs">
            Optional: Für kantonsspezifische Lehrmittel
          </p>
        </div>
      </div>

      {/* Competency Selection */}
      {selectedFachbereich && (
        <div ref={competencyRef}>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <label className="text-text text-sm font-medium">Lehrplan 21 Kompetenzen</label>
              <InfoTooltip
                content={FIELD_TOOLTIPS.competencies.content}
                example={FIELD_TOOLTIPS.competencies.example}
              />
            </div>
            {competencies.length > 0 && (
              <span className="bg-primary/10 text-primary rounded-full px-2.5 py-1 text-xs font-medium">
                {competencies.length} ausgewählt
              </span>
            )}
          </div>

          {/* Selected Competencies Display */}
          {competencies.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {competencies.map((code) => (
                <span
                  key={code}
                  className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium"
                >
                  {code}
                  <button
                    type="button"
                    onClick={() => toggleCompetency(code)}
                    className="hover:text-error transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={() => onCompetenciesChange([])}
                className="text-text-muted hover:text-error text-xs transition-colors"
              >
                Alle entfernen
              </button>
            </div>
          )}

          {/* Competency Panel Toggle */}
          <button
            type="button"
            onClick={() => setShowCompetencyPanel(!showCompetencyPanel)}
            className="border-border bg-bg hover:border-primary/50 flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors"
          >
            <span className="text-text-muted">
              {competencies.length === 0
                ? "Kompetenzen auswählen..."
                : `${competencies.length} Kompetenz${competencies.length !== 1 ? "en" : ""} ausgewählt`}
            </span>
            <ChevronDown
              className={`text-text-muted h-5 w-5 transition-transform ${showCompetencyPanel ? "rotate-180" : ""}`}
            />
          </button>

          {/* Competency Panel */}
          {showCompetencyPanel && (
            <div className="border-border bg-surface mt-2 rounded-xl border shadow-lg">
              {/* Search */}
              <div className="border-border border-b p-3">
                <div className="relative">
                  <Search className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <input
                    type="text"
                    value={competencySearch}
                    onChange={(e) => setCompetencySearch(e.target.value)}
                    placeholder="Suchen (z.B. MA.1.A oder Addition)..."
                    className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary w-full rounded-lg border py-2 pr-4 pl-10 text-sm focus:outline-none"
                  />
                  {competencySearch && (
                    <button
                      type="button"
                      onClick={() => setCompetencySearch("")}
                      className="text-text-muted hover:text-text absolute top-1/2 right-3 -translate-y-1/2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Hierarchy */}
              <div className="max-h-96 overflow-y-auto p-2">
                {filteredKompetenzbereiche.length === 0 ? (
                  <div className="text-text-muted py-8 text-center text-sm">
                    Keine Kompetenzen gefunden
                  </div>
                ) : (
                  filteredKompetenzbereiche.map((kb) => {
                    const isExpanded = expandedBereiche.includes(kb.code);
                    const kbCodes = kb.kompetenzen.map((k) => k.code);
                    const selectedCount = kbCodes.filter((code) =>
                      competencies.includes(code)
                    ).length;
                    const allSelected = selectedCount === kbCodes.length;
                    const someSelected = selectedCount > 0 && !allSelected;

                    return (
                      <div key={kb.code} className="mb-1">
                        {/* Kompetenzbereich Header */}
                        <div className="hover:bg-surface-elevated flex items-center gap-2 rounded-lg">
                          <button
                            type="button"
                            onClick={() => toggleExpanded(kb.code)}
                            className="flex flex-1 items-center gap-2 px-3 py-2"
                          >
                            {isExpanded ? (
                              <ChevronDown className="text-text-muted h-4 w-4" />
                            ) : (
                              <ChevronRight className="text-text-muted h-4 w-4" />
                            )}
                            <span
                              className="rounded px-1.5 py-0.5 text-xs font-bold"
                              style={{
                                backgroundColor: `${selectedFachbereich.color}20`,
                                color: selectedFachbereich.color,
                              }}
                            >
                              {kb.code}
                            </span>
                            <span className="text-text text-sm font-medium">{kb.name}</span>
                            {selectedCount > 0 && (
                              <span className="bg-primary/10 text-primary ml-auto rounded-full px-2 py-0.5 text-xs">
                                {selectedCount}/{kbCodes.length}
                              </span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleKompetenzbereich(kb)}
                            className={`mr-2 flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                              allSelected
                                ? "border-primary bg-primary"
                                : someSelected
                                  ? "border-primary bg-primary/50"
                                  : "border-border hover:border-primary"
                            } `}
                          >
                            {(allSelected || someSelected) && (
                              <Check className="text-text-on-accent h-3 w-3" />
                            )}
                          </button>
                        </div>

                        {/* Kompetenzen */}
                        {isExpanded && (
                          <div className="ml-6 space-y-1 pb-2">
                            {kb.kompetenzen.map((kompetenz) => {
                              const isSelected = competencies.includes(kompetenz.code);

                              return (
                                <button
                                  key={kompetenz.code}
                                  type="button"
                                  onClick={() => toggleCompetency(kompetenz.code)}
                                  className={`flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors ${isSelected ? "bg-primary/10" : "hover:bg-surface-elevated"} `}
                                >
                                  <div
                                    className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${isSelected ? "border-primary bg-primary" : "border-border"} `}
                                  >
                                    {isSelected && (
                                      <Check className="text-text-on-accent h-3 w-3" />
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-primary font-mono text-xs font-semibold">
                                        {kompetenz.code}
                                      </span>
                                      <span className="text-text text-sm">{kompetenz.name}</span>
                                    </div>
                                    {kompetenz.handlungsaspekte &&
                                      kompetenz.handlungsaspekte.length > 0 && (
                                        <div className="text-text-muted mt-1 text-xs">
                                          {kompetenz.handlungsaspekte.join(" • ")}
                                        </div>
                                      )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          <p className="text-text-muted mt-2 text-xs">
            Wählen Sie die Kompetenzen aus dem Lehrplan 21, die zu Ihrer Ressource passen
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="border-info/30 bg-info/10 rounded-xl border p-4">
        <div className="flex gap-3">
          <div className="bg-info/20 flex h-8 w-8 items-center justify-center rounded-full">
            <BookOpen className="text-info h-4 w-4" />
          </div>
          <div className="text-text text-sm">
            <strong>Tipp:</strong> Je genauer Sie Ihre Ressource dem Lehrplan 21 zuordnen, desto
            besser finden Lehrpersonen Ihre Materialien. Wählen Sie alle relevanten Kompetenzen aus.
          </div>
        </div>
      </div>
    </div>
  );
}
