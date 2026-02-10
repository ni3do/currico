"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { FACHBEREICHE, getFachbereicheByZyklus, getFachbereichByCode } from "@/lib/data/lehrplan21";
import type { Fachbereich, Kompetenzbereich } from "@/lib/curriculum-types";
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
  Check,
  Search,
  X,
  AlertCircle,
  Scissors,
  Activity,
  FlaskConical,
  ClipboardList,
  ChevronDown,
  Filter,
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
  scissors: Scissors,
  activity: Activity,
  flask: FlaskConical,
  "clipboard-list": ClipboardList,
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
  { value: "", label: "Alle Kantone" },
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
  const [competencySearch, setCompetencySearch] = useState("");

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

  const MAX_COMPETENCIES = 5;

  // Toggle competency selection
  const toggleCompetency = (code: string) => {
    if (competencies.includes(code)) {
      onCompetenciesChange(competencies.filter((c) => c !== code));
    } else if (competencies.length < MAX_COMPETENCIES) {
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
        if (!newCompetencies.includes(code) && newCompetencies.length < MAX_COMPETENCIES) {
          newCompetencies.push(code);
        }
      });
      onCompetenciesChange(newCompetencies);
    }
  };

  // Get icon component for a subject
  const getSubjectIcon = (iconName: string) => {
    return ICON_MAP[iconName] || BookOpen;
  };

  // State to control competencies panel visibility with animation
  const [showCompetencies, setShowCompetencies] = useState(false);

  // Handle subject selection - opens competencies panel
  const handleSelectSubject = (fachbereich: Fachbereich) => {
    const isSameSubject = subjectCode === fachbereich.code;

    if (isSameSubject) {
      // Toggle competencies panel if clicking same subject
      setShowCompetencies(!showCompetencies);
    } else {
      // New subject selected - open competencies
      onSubjectChange(fachbereich.name, fachbereich.code);
      onCompetenciesChange([]); // Reset competencies when subject changes
      setShowCompetencies(true);
    }
  };

  // Helper to clear subject and close competencies panel
  const clearSubject = () => {
    onSubjectChange("", "");
    onCompetenciesChange([]);
    setShowCompetencies(false);
  };

  // Get canton label
  const getCantonLabel = (value: string) => {
    return CANTONS.find((c) => c.value === value)?.label || value;
  };

  // Get cycle label
  const getCycleLabel = (value: string) => {
    return CYCLES.find((c) => c.value === value)?.label || value;
  };

  // Check if any filters are selected
  const hasFilters = cycle || subject || competencies.length > 0 || canton;

  // State for collapsible competency sections - stores user overrides only
  const [sectionOverrides, setSectionOverrides] = useState<Record<string, boolean>>({});

  // Compute expanded state: all sections expanded by default, with user overrides applied
  const expandedSections = useMemo(() => {
    if (!selectedFachbereich) return {};
    const expanded: Record<string, boolean> = {};
    selectedFachbereich.kompetenzbereiche.forEach((kb) => {
      // Default to expanded, but use override if user has toggled
      expanded[kb.code] = sectionOverrides[kb.code] ?? true;
    });
    return expanded;
  }, [selectedFachbereich, sectionOverrides]);

  const toggleSection = (code: string) => {
    setSectionOverrides((prev) => ({
      ...prev,
      [code]: !(prev[code] ?? true), // Toggle from current state (default true)
    }));
  };

  // Ref for scroll container to maintain position
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Filter Overview - Sticky summary bar */}
      {hasFilters && (
        <div className="border-border bg-surface-elevated sticky top-0 z-10 -mx-2 rounded-xl border p-3 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Filter className="text-text-muted h-4 w-4 flex-shrink-0" />
            <span className="text-text-muted text-xs font-medium">Filter:</span>
            <div className="flex flex-1 flex-wrap items-center gap-1.5">
              {/* Cycle chip */}
              {cycle && (
                <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium">
                  {getCycleLabel(cycle)}
                  <button
                    type="button"
                    onClick={() => {
                      onCycleChange("");
                      clearSubject();
                    }}
                    className="hover:text-error ml-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {/* Subject chip */}
              {subject && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: selectedFachbereich
                      ? `${selectedFachbereich.color}15`
                      : undefined,
                    color: selectedFachbereich?.color,
                  }}
                >
                  {subject}
                  <button
                    type="button"
                    onClick={clearSubject}
                    className="hover:text-error ml-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {/* Canton chip */}
              {canton && (
                <span className="bg-info/10 text-info inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium">
                  {getCantonLabel(canton)}
                  <button
                    type="button"
                    onClick={() => onCantonChange("")}
                    className="hover:text-error ml-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {/* Competencies count chip */}
              {competencies.length > 0 && (
                <span className="bg-success/10 text-success inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium">
                  {competencies.length} Kompetenz{competencies.length !== 1 ? "en" : ""}
                  <button
                    type="button"
                    onClick={() => onCompetenciesChange([])}
                    className="hover:text-error ml-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
            {/* Clear all */}
            {(cycle || subject || competencies.length > 0 || canton) && (
              <button
                type="button"
                onClick={() => {
                  onCycleChange("");
                  clearSubject();
                  onCantonChange("");
                }}
                className="text-text-muted hover:text-error text-xs transition-colors"
              >
                Alle löschen
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cycle Selection - Cards */}
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
              className={`group relative flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-colors duration-150 ${
                cycle === c.value
                  ? "border-primary bg-primary/10"
                  : touchedCycle && cycleError
                    ? "border-error/50 bg-error/5 hover:border-error"
                    : "border-border bg-bg hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="cycle"
                  value={c.value}
                  checked={cycle === c.value}
                  onChange={(e) => {
                    onCycleChange(e.target.value);
                    // Reset subject when cycle changes if not available
                    if (subjectCode) {
                      const newSubjects = getFachbereicheByZyklus(parseInt(e.target.value));
                      const currentSubjectAvailable = newSubjects.some(
                        (s) => s.code === subjectCode
                      );
                      if (!currentSubjectAvailable) {
                        clearSubject();
                      }
                    }
                  }}
                  onBlur={onCycleBlur}
                  className="text-primary focus:ring-primary/20 h-4 w-4"
                />
                <span className="text-text font-medium">{c.label}</span>
                <span className="bg-surface-elevated text-text-muted ml-auto rounded-full px-2 py-0.5 text-xs font-medium">
                  {c.grades}
                </span>
              </div>
              <span className="text-text-muted mt-1.5 text-xs">{c.description}</span>
              {cycle === c.value && (
                <div className="bg-primary absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full">
                  <Check className="text-text-on-accent h-3 w-3" />
                </div>
              )}
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

      {/* Subject Selection - Always visible grid */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <label className="text-text text-sm font-medium">
              Fach <span className="text-error">*</span>
            </label>
            <InfoTooltip content={FIELD_TOOLTIPS.subject.content} />
          </div>
          {!cycle && <span className="text-text-muted text-xs">Bitte zuerst Zyklus wählen</span>}
        </div>

        {cycle ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {availableSubjects.map((fachbereich) => {
              const Icon = getSubjectIcon(fachbereich.icon);
              const isSelected = subjectCode === fachbereich.code;
              const isExpanded = isSelected && showCompetencies;

              return (
                <button
                  key={fachbereich.code}
                  type="button"
                  onClick={() => handleSelectSubject(fachbereich)}
                  onBlur={onSubjectBlur}
                  className={`group relative flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors duration-150 ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : touchedSubject && subjectError
                        ? "border-error/50 bg-error/5 hover:border-error"
                        : "border-border bg-bg hover:border-primary/50"
                  }`}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${fachbereich.color}20` }}
                  >
                    <span style={{ color: fachbereich.color }}>
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-text truncate text-sm font-medium">{fachbereich.name}</div>
                    <div className="text-text-muted flex items-center gap-1 text-xs">
                      <span>{fachbereich.kompetenzbereiche.length} Bereiche</span>
                      {isSelected && competencies.length > 0 && (
                        <span className="text-primary font-medium">
                          • {competencies.length} gewählt
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Expand indicator */}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-150 ${
                      isExpanded ? "rotate-180" : ""
                    } ${isSelected ? "text-primary" : "text-text-muted group-hover:text-text"}`}
                  />
                  {isSelected && (
                    <div className="bg-primary absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full">
                      <Check className="text-text-on-accent h-3 w-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="border-border bg-surface-elevated rounded-xl border-2 border-dashed p-8 text-center">
            <div className="text-text-muted text-sm">
              Wählen Sie oben einen Zyklus, um die verfügbaren Fächer zu sehen
            </div>
          </div>
        )}

        {touchedSubject && subjectError && (
          <div className="text-error mt-2 flex items-center gap-1.5 text-sm">
            <AlertCircle className="h-4 w-4" />
            {subjectError}
          </div>
        )}
      </div>

      {/* Competencies - Opens when Fach is clicked */}
      {selectedFachbereich && showCompetencies && (
        <div
          className="animate-in fade-in slide-in-from-top-2 overflow-hidden rounded-xl border-2 duration-200"
          style={{ borderColor: `${selectedFachbereich.color}40` }}
        >
          {/* Header bar with subject color */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ backgroundColor: `${selectedFachbereich.color}15` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: `${selectedFachbereich.color}30`,
                  color: selectedFachbereich.color,
                }}
              >
                {(() => {
                  const Icon = getSubjectIcon(selectedFachbereich.icon);
                  return <Icon className="h-4 w-4" />;
                })()}
              </div>
              <div>
                <div className="text-text text-sm font-semibold">
                  Kompetenzen: {selectedFachbereich.name}
                </div>
                <div className="text-text-muted text-xs">
                  {selectedFachbereich.kompetenzbereiche.length} Bereiche verfügbar
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {competencies.length > 0 && (
                <span className="bg-primary/20 text-primary rounded-full px-3 py-1 text-xs font-semibold">
                  {competencies.length} ausgewählt
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowCompetencies(false)}
                className="text-text-muted hover:text-text rounded-lg p-1 transition-colors"
                title="Schliessen"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-4">
            {/* Search and selected pills row */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative min-w-[200px] flex-1">
                <Search className="text-text-muted absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
                <input
                  type="text"
                  value={competencySearch}
                  onChange={(e) => setCompetencySearch(e.target.value)}
                  placeholder="Suchen (z.B. MA.1.A)..."
                  className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary focus:ring-primary/20 w-full rounded-lg border py-2 pr-8 pl-8 text-sm transition-colors duration-100 focus:ring-1 focus:outline-none"
                />
                {competencySearch && (
                  <button
                    type="button"
                    onClick={() => setCompetencySearch("")}
                    className="text-text-muted hover:text-text absolute top-1/2 right-2.5 -translate-y-1/2 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {competencies.length > 0 && (
                <button
                  type="button"
                  onClick={() => onCompetenciesChange([])}
                  className="text-text-muted hover:text-error text-xs transition-colors"
                >
                  Alle entfernen
                </button>
              )}
            </div>

            {/* Selected Competencies Pills */}
            {competencies.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-1">
                {competencies.map((code) => (
                  <span
                    key={code}
                    className="bg-primary/10 text-primary inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-mono text-[11px] font-medium"
                  >
                    {code}
                    <button
                      type="button"
                      onClick={() => toggleCompetency(code)}
                      className="hover:text-error ml-0.5 transition-colors"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Competency Tree - Collapsible sections */}
            <div className="bg-surface overflow-hidden rounded-lg">
              {filteredKompetenzbereiche.length === 0 ? (
                <div className="text-text-muted py-8 text-center text-sm">
                  {competencySearch ? "Keine Kompetenzen gefunden" : "Keine Kompetenzen verfügbar"}
                </div>
              ) : (
                <div className="divide-border divide-y">
                  {filteredKompetenzbereiche.map((kb) => {
                    const kbCodes = kb.kompetenzen.map((k) => k.code);
                    const selectedCount = kbCodes.filter((code) =>
                      competencies.includes(code)
                    ).length;
                    const allSelected = selectedCount === kbCodes.length;
                    const someSelected = selectedCount > 0 && !allSelected;
                    const isExpanded = expandedSections[kb.code] ?? true;

                    return (
                      <div key={kb.code}>
                        {/* Kompetenzbereich Header - Prominent theme header */}
                        <button
                          type="button"
                          onClick={() => toggleSection(kb.code)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors duration-100"
                          style={{
                            backgroundColor: `${selectedFachbereich.color}08`,
                            borderBottom: isExpanded
                              ? `1px solid ${selectedFachbereich.color}20`
                              : undefined,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-150 ${isExpanded ? "" : "-rotate-90"}`}
                              style={{ color: selectedFachbereich.color }}
                            />
                            <div
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold"
                              style={{
                                backgroundColor: `${selectedFachbereich.color}20`,
                                color: selectedFachbereich.color,
                              }}
                            >
                              {kb.code.split(".").pop()}
                            </div>
                            <div>
                              <div className="text-text text-sm font-semibold">{kb.name}</div>
                              <div className="text-text-muted text-xs">{kb.code}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-text-muted text-sm">
                              {selectedCount > 0 ? (
                                <span className="text-success font-semibold">{selectedCount}</span>
                              ) : (
                                "0"
                              )}
                              <span className="mx-0.5">/</span>
                              {kbCodes.length}
                            </span>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleKompetenzbereich(kb);
                              }}
                              className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg transition-colors duration-100 ${
                                allSelected
                                  ? "bg-primary"
                                  : someSelected
                                    ? "bg-primary/50"
                                    : "border-border hover:border-primary/50 border-2"
                              }`}
                              title={allSelected ? "Alle abwählen" : "Alle auswählen"}
                            >
                              {(allSelected || someSelected) && (
                                <Check className="text-text-on-accent h-3.5 w-3.5" />
                              )}
                            </div>
                          </div>
                        </button>

                        {/* Kompetenzen - Card layout matching Fach exactly */}
                        <div
                          className={`grid transition-all duration-200 ease-in-out ${
                            isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="grid grid-cols-1 gap-2 px-4 pb-4 sm:grid-cols-2 md:grid-cols-3">
                              {kb.kompetenzen.map((kompetenz) => {
                                const isSelected = competencies.includes(kompetenz.code);

                                return (
                                  <button
                                    key={kompetenz.code}
                                    type="button"
                                    onClick={() => toggleCompetency(kompetenz.code)}
                                    className={`group relative flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors duration-150 ${
                                      isSelected
                                        ? "border-primary bg-primary/10"
                                        : "border-border bg-bg hover:border-primary/50"
                                    }`}
                                  >
                                    {/* Icon area - matches Fach style */}
                                    <div
                                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold"
                                      style={{
                                        backgroundColor: `${selectedFachbereich.color}20`,
                                        color: selectedFachbereich.color,
                                      }}
                                    >
                                      {kompetenz.code.split(".").pop()}
                                    </div>
                                    {/* Content - matches Fach style */}
                                    <div className="min-w-0 flex-1">
                                      <div
                                        className="text-text truncate text-sm font-medium"
                                        title={kompetenz.name}
                                      >
                                        {kompetenz.name}
                                      </div>
                                      <div className="text-text-muted text-xs">
                                        {kompetenz.code}
                                      </div>
                                    </div>
                                    {/* Checkmark badge - matches Fach style */}
                                    {isSelected && (
                                      <div className="bg-primary absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full">
                                        <Check className="text-text-on-accent h-3 w-3" />
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tip */}
            <p className="text-text-muted mt-3 text-xs">
              <strong className="text-text">Tipp:</strong> Wählen Sie alle passenden Kompetenzen aus
              für bessere Auffindbarkeit.
            </p>
          </div>
        </div>
      )}

      {/* Canton Selection - Moved after Competencies */}
      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <label className="text-text text-sm font-medium">Kanton (optional)</label>
          <InfoTooltip content={FIELD_TOOLTIPS.canton.content} />
        </div>
        <select
          value={canton}
          onChange={(e) => onCantonChange(e.target.value)}
          className="border-border bg-bg text-text focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-4 py-3 transition-colors duration-150 focus:ring-2 focus:outline-none sm:w-auto sm:min-w-[200px]"
        >
          {CANTONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <p className="text-text-muted mt-1 text-xs">Für kantonsspezifische Lehrmittel</p>
      </div>
    </div>
  );
}
