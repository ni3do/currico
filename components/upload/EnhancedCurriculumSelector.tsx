"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { FACHBEREICHE, getFachbereicheByZyklus, getFachbereichByCode } from "@/lib/data/lehrplan21";
import type { Fachbereich } from "@/lib/curriculum-types";
import { InfoTooltip, useFieldTooltip } from "./InfoTooltip";
import { SONSTIGE_CODE } from "@/lib/validations/material";
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
  FolderOpen,
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

// Canton codes and names (proper nouns, consistent across locales in Swiss context)
const CANTON_ENTRIES = [
  { value: "AG", label: "Aargau" },
  { value: "AI", label: "Appenzell Innerrhoden" },
  { value: "AR", label: "Appenzell Ausserrhoden" },
  { value: "BE", label: "Bern" },
  { value: "BL", label: "Basel-Landschaft" },
  { value: "BS", label: "Basel-Stadt" },
  { value: "FR", label: "Freiburg" },
  { value: "GE", label: "Genf" },
  { value: "GL", label: "Glarus" },
  { value: "GR", label: "Graubünden" },
  { value: "JU", label: "Jura" },
  { value: "LU", label: "Luzern" },
  { value: "NE", label: "Neuenburg" },
  { value: "NW", label: "Nidwalden" },
  { value: "OW", label: "Obwalden" },
  { value: "SG", label: "St. Gallen" },
  { value: "SH", label: "Schaffhausen" },
  { value: "SO", label: "Solothurn" },
  { value: "SZ", label: "Schwyz" },
  { value: "TG", label: "Thurgau" },
  { value: "TI", label: "Tessin" },
  { value: "UR", label: "Uri" },
  { value: "VD", label: "Waadt" },
  { value: "VS", label: "Wallis" },
  { value: "ZG", label: "Zug" },
  { value: "ZH", label: "Zürich" },
];

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

type UnifiedSearchResult = {
  type: "subject" | "area" | "competency";
  label: string;
  code: string;
  fachbereich: Fachbereich;
  cycleValues: number[];
};

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
  const tCurr = useTranslations("uploadWizard.curriculum");
  const tCycles = useTranslations("uploadWizard.cycles");
  const tFields = useTranslations("uploadWizard.fields");
  const cycleTooltip = useFieldTooltip("cycle");
  const subjectTooltip = useFieldTooltip("subject");
  const cantonTooltip = useFieldTooltip("canton");
  const [unifiedSearch, setUnifiedSearch] = useState("");
  const [showUnifiedResults, setShowUnifiedResults] = useState(false);
  const unifiedSearchRef = useRef<HTMLDivElement>(null);
  const MAX_COMPETENCIES = 5;
  // State to control competencies panel visibility with animation
  const [showCompetencies, setShowCompetencies] = useState(false);
  // State for which Kompetenzbereich is expanded (card drill-down)
  const [expandedKbCode, setExpandedKbCode] = useState<string | null>(null);

  // Close unified search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (unifiedSearchRef.current && !unifiedSearchRef.current.contains(event.target as Node)) {
        setShowUnifiedResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Unified search across all subjects and competencies
  const unifiedSearchResults = useMemo((): UnifiedSearchResult[] => {
    const query = unifiedSearch.trim().toLowerCase();
    if (query.length < 2) return [];

    const results: UnifiedSearchResult[] = [];
    const allFachbereiche = cycle ? getFachbereicheByZyklus(parseInt(cycle)) : FACHBEREICHE;

    for (const fb of allFachbereiche) {
      // Search subject names
      if (fb.name.toLowerCase().includes(query) || fb.code.toLowerCase().includes(query)) {
        results.push({
          type: "subject",
          label: fb.name,
          code: fb.code,
          fachbereich: fb,
          cycleValues: fb.cycles,
        });
      }

      for (const kb of fb.kompetenzbereiche) {
        // Search area names/codes
        if (kb.name.toLowerCase().includes(query) || kb.code.toLowerCase().includes(query)) {
          results.push({
            type: "area",
            label: `${kb.name} (${kb.code})`,
            code: kb.code,
            fachbereich: fb,
            cycleValues: fb.cycles,
          });
        }

        for (const k of kb.kompetenzen) {
          // Search competency names/codes
          if (k.name.toLowerCase().includes(query) || k.code.toLowerCase().includes(query)) {
            results.push({
              type: "competency",
              label: `${k.name} (${k.code})`,
              code: k.code,
              fachbereich: fb,
              cycleValues: fb.cycles,
            });
          }
        }
      }

      if (results.length >= 20) break;
    }

    return results.slice(0, 20);
  }, [unifiedSearch, cycle]);

  const handleUnifiedResultClick = useCallback(
    (result: UnifiedSearchResult) => {
      // Auto-select cycle if not selected
      if (!cycle && result.cycleValues.length > 0) {
        onCycleChange(result.cycleValues[0].toString());
      }

      // Select the subject
      onSubjectChange(result.fachbereich.name, result.fachbereich.code);

      // If it's a competency, also select it
      if (result.type === "competency" && !competencies.includes(result.code)) {
        if (competencies.length < MAX_COMPETENCIES) {
          onCompetenciesChange([...competencies, result.code]);
        }
      }

      // Open competencies panel
      setShowCompetencies(true);
      setUnifiedSearch("");
      setShowUnifiedResults(false);
    },
    [cycle, competencies, onCycleChange, onSubjectChange, onCompetenciesChange]
  );

  // Build cycles array from i18n
  const cycles = useMemo(
    () => [
      {
        value: "1",
        label: tCycles("cycle1"),
        description: tCycles("cycle1Desc"),
        grades: tCycles("cycle1Grades"),
      },
      {
        value: "2",
        label: tCycles("cycle2"),
        description: tCycles("cycle2Desc"),
        grades: tCycles("cycle2Grades"),
      },
      {
        value: "3",
        label: tCycles("cycle3"),
        description: tCycles("cycle3Desc"),
        grades: tCycles("cycle3Grades"),
      },
    ],
    [tCycles]
  );

  // Build cantons array with translated "All" option
  const cantons = useMemo(
    () => [{ value: "", label: tCurr("allCantons") }, ...CANTON_ENTRIES],
    [tCurr]
  );

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

  // Toggle competency selection
  const toggleCompetency = (code: string) => {
    if (competencies.includes(code)) {
      onCompetenciesChange(competencies.filter((c) => c !== code));
    } else if (competencies.length < MAX_COMPETENCIES) {
      onCompetenciesChange([...competencies, code]);
    }
  };

  // Get icon component for a subject
  const getSubjectIcon = (iconName: string) => {
    return ICON_MAP[iconName] || BookOpen;
  };

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
      setExpandedKbCode(null);
    }
  };

  // Helper to clear subject and close competencies panel
  const clearSubject = () => {
    onSubjectChange("", "");
    onCompetenciesChange([]);
    setShowCompetencies(false);
    setExpandedKbCode(null);
  };

  // Get canton label
  const getCantonLabel = (value: string) => {
    return cantons.find((c) => c.value === value)?.label || value;
  };

  // Get cycle label
  const getCycleLabel = (value: string) => {
    return cycles.find((c) => c.value === value)?.label || value;
  };

  // Check if any filters are selected
  const hasFilters = cycle || subject || competencies.length > 0 || canton;

  // Ref for scroll container to maintain position
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Filter Overview - Sticky summary bar */}
      {hasFilters && (
        <div className="border-border bg-surface-elevated sticky top-0 z-10 -mx-2 rounded-xl border p-3 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Filter className="text-text-muted h-4 w-4 flex-shrink-0" />
            <span className="text-text-muted text-xs font-medium">{tCurr("filterLabel")}</span>
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
                  {tCurr("competencyCount", { count: competencies.length })}
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
                {tCurr("clearAll")}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Unified Search */}
      <div ref={unifiedSearchRef} className="relative">
        <div className="relative">
          <Search className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            value={unifiedSearch}
            onChange={(e) => {
              setUnifiedSearch(e.target.value);
              setShowUnifiedResults(e.target.value.trim().length >= 2);
            }}
            onFocus={() => {
              if (unifiedSearch.trim().length >= 2) {
                setShowUnifiedResults(true);
              }
            }}
            placeholder={tCurr("unifiedSearch")}
            role="combobox"
            aria-expanded={showUnifiedResults && unifiedSearchResults.length > 0}
            aria-controls="unified-search-results"
            aria-autocomplete="list"
            className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary focus:ring-primary/20 w-full rounded-xl border py-3 pr-4 pl-10 text-sm transition-colors focus:ring-2 focus:outline-none"
          />
          {unifiedSearch && (
            <button
              type="button"
              onClick={() => {
                setUnifiedSearch("");
                setShowUnifiedResults(false);
              }}
              className="text-text-muted hover:text-text absolute top-1/2 right-3 -translate-y-1/2"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {!unifiedSearch && <p className="text-text-muted mt-1.5 text-xs">{tCurr("searchHint")}</p>}
        {showUnifiedResults && unifiedSearchResults.length > 0 && (
          <div
            id="unified-search-results"
            role="listbox"
            className="border-border bg-surface absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border shadow-lg"
          >
            {unifiedSearchResults.map((result, i) => (
              <button
                key={`${result.type}-${result.code}-${i}`}
                type="button"
                role="option"
                aria-selected={false}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleUnifiedResultClick(result)}
                className="hover:bg-surface-elevated flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors"
              >
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
                  style={{
                    backgroundColor: `${result.fachbereich.color}20`,
                    color: result.fachbereich.color,
                  }}
                >
                  {result.type === "subject"
                    ? tCurr("searchResultSubject")
                    : result.type === "area"
                      ? tCurr("searchResultArea")
                      : tCurr("searchResultCompetency")}
                </span>
                <span className="text-text min-w-0 flex-1 truncate text-sm">{result.label}</span>
              </button>
            ))}
          </div>
        )}
        {showUnifiedResults &&
          unifiedSearch.trim().length >= 2 &&
          unifiedSearchResults.length === 0 && (
            <div className="border-border bg-surface absolute z-20 mt-1 w-full rounded-xl border p-4 text-center shadow-lg">
              <span className="text-text-muted text-sm">{tCurr("noSearchResults")}</span>
            </div>
          )}
      </div>

      {/* Cycle Selection - Cards */}
      <div>
        <div className="mb-3 flex items-center gap-1.5">
          <label className="text-text text-sm font-medium">
            {tFields("cycle")}{" "}
            {subjectCode !== SONSTIGE_CODE && <span className="text-error">*</span>}
          </label>
          <InfoTooltip content={cycleTooltip.content} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {cycles.map((c) => (
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
                    // Reset subject when cycle changes if not available (Sonstige is always available)
                    if (subjectCode && subjectCode !== SONSTIGE_CODE) {
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
              {tFields("subject")} <span className="text-error">*</span>
            </label>
            <InfoTooltip content={subjectTooltip.content} />
          </div>
          {!cycle && <span className="text-text-muted text-xs">{tCurr("selectCycleFirst")}</span>}
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
                      <span>
                        {tCurr("areasCount", { count: fachbereich.kompetenzbereiche.length })}
                      </span>
                      {isSelected && competencies.length > 0 && (
                        <span className="text-primary font-medium">
                          • {tCurr("selectedCount", { count: competencies.length })}
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

            {/* Sonstige — same card size as other subjects */}
            <button
              type="button"
              onClick={() => {
                if (subjectCode === SONSTIGE_CODE) {
                  onSubjectChange("", "");
                  setShowCompetencies(false);
                } else {
                  onSubjectChange(tCurr("sonstigeLabel"), SONSTIGE_CODE);
                  onCompetenciesChange([]);
                  setShowCompetencies(false);
                }
              }}
              onBlur={onSubjectBlur}
              className={`group relative flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors duration-150 ${
                subjectCode === SONSTIGE_CODE
                  ? "border-primary bg-primary/10"
                  : touchedSubject && subjectError
                    ? "border-error/50 bg-error/5 hover:border-error"
                    : "border-border bg-bg hover:border-primary/50"
              }`}
            >
              <div className="bg-text-muted/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <FolderOpen className="text-text-muted h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-text truncate text-sm font-medium">
                  {tCurr("sonstigeLabel")}
                </div>
                <div className="text-text-muted text-xs">{tCurr("sonstigeDescription")}</div>
              </div>
              {subjectCode === SONSTIGE_CODE && (
                <div className="bg-primary absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full">
                  <Check className="text-text-on-accent h-3 w-3" />
                </div>
              )}
            </button>
          </div>
        ) : (
          <div className="border-border bg-surface-elevated rounded-xl border-2 border-dashed p-8 text-center">
            <div className="text-text-muted text-sm">{tCurr("selectCycleHint")}</div>
          </div>
        )}

        {touchedSubject && subjectError && (
          <div className="text-error mt-2 flex items-center gap-1.5 text-sm">
            <AlertCircle className="h-4 w-4" />
            {subjectError}
          </div>
        )}
      </div>

      {/* Competencies - Kompetenzbereich cards (same layout as Fach) */}
      {selectedFachbereich && showCompetencies && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Section heading */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-text text-sm font-medium">
                {tCurr("competenciesFor", { name: selectedFachbereich.name })}
              </label>
              {competencies.length > 0 && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${competencies.length >= MAX_COMPETENCIES ? "bg-warning/20 text-warning" : "bg-primary/20 text-primary"}`}
                >
                  {competencies.length}/{MAX_COMPETENCIES}
                </span>
              )}
            </div>
            {competencies.length > 0 && (
              <button
                type="button"
                onClick={() => onCompetenciesChange([])}
                className="text-text-muted hover:text-error text-xs transition-colors"
              >
                {tCurr("removeAll")}
              </button>
            )}
          </div>

          {/* Selected competencies pills */}
          {competencies.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {competencies.map((code) => (
                <span
                  key={code}
                  className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-xs font-medium"
                >
                  {code}
                  <button
                    type="button"
                    onClick={() => toggleCompetency(code)}
                    className="hover:text-error ml-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Kompetenzbereich grid - same card style as Fach */}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {selectedFachbereich.kompetenzbereiche.map((kb) => {
              const kbCodes = kb.kompetenzen.map((k) => k.code);
              const selectedCount = kbCodes.filter((code) => competencies.includes(code)).length;
              const isExpanded = expandedKbCode === kb.code;

              return (
                <button
                  key={kb.code}
                  type="button"
                  onClick={() => setExpandedKbCode(isExpanded ? null : kb.code)}
                  className={`group relative flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors duration-150 ${
                    isExpanded
                      ? "border-primary bg-primary/10"
                      : selectedCount > 0
                        ? "border-primary/40 bg-primary/5"
                        : "border-border bg-bg hover:border-primary/50"
                  }`}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold"
                    style={{
                      backgroundColor: `${selectedFachbereich.color}20`,
                      color: selectedFachbereich.color,
                    }}
                  >
                    {kb.code.split(".").pop()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-text truncate text-sm font-medium">{kb.name}</div>
                    <div className="text-text-muted flex items-center gap-1 text-xs">
                      <span>{tCurr("competencyCount", { count: kb.kompetenzen.length })}</span>
                      {selectedCount > 0 && (
                        <span className="text-primary font-medium">
                          • {tCurr("selectedCount", { count: selectedCount })}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-150 ${
                      isExpanded ? "rotate-180" : ""
                    } ${isExpanded ? "text-primary" : "text-text-muted group-hover:text-text"}`}
                  />
                  {selectedCount > 0 && (
                    <div className="bg-primary absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full">
                      <Check className="text-text-on-accent h-3 w-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Expanded Kompetenz cards - shown below the Kompetenzbereich grid */}
          {expandedKbCode &&
            (() => {
              const expandedKb = selectedFachbereich.kompetenzbereiche.find(
                (kb) => kb.code === expandedKbCode
              );
              if (!expandedKb) return null;

              return (
                <div
                  className="animate-in fade-in slide-in-from-top-2 mt-4 rounded-xl border-2 p-4 duration-200"
                  style={{ borderColor: `${selectedFachbereich.color}40` }}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold"
                      style={{
                        backgroundColor: `${selectedFachbereich.color}20`,
                        color: selectedFachbereich.color,
                      }}
                    >
                      {expandedKb.code.split(".").pop()}
                    </div>
                    <div>
                      <div className="text-text text-sm font-semibold">{expandedKb.name}</div>
                      <div className="text-text-muted text-xs">{expandedKb.code}</div>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {expandedKb.kompetenzen.map((kompetenz) => {
                      const isSelected = competencies.includes(kompetenz.code);
                      const isMaxReached = competencies.length >= MAX_COMPETENCIES && !isSelected;

                      return (
                        <button
                          key={kompetenz.code}
                          type="button"
                          onClick={() => toggleCompetency(kompetenz.code)}
                          disabled={isMaxReached}
                          className={`group relative flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors duration-150 ${
                            isSelected
                              ? "border-primary bg-primary/10"
                              : isMaxReached
                                ? "border-border bg-bg cursor-not-allowed opacity-50"
                                : "border-border bg-bg hover:border-primary/50"
                          }`}
                        >
                          <div
                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold"
                            style={{
                              backgroundColor: `${selectedFachbereich.color}20`,
                              color: selectedFachbereich.color,
                            }}
                          >
                            {kompetenz.code.split(".").pop()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div
                              className="text-text truncate text-sm font-medium"
                              title={kompetenz.name}
                            >
                              {kompetenz.name}
                            </div>
                            <div className="text-text-muted text-xs">{kompetenz.code}</div>
                          </div>
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
              );
            })()}

          {/* Tip */}
          <p className="text-text-muted mt-3 text-xs">
            <strong className="text-text">{tCurr("tip")}</strong> {tCurr("tipText")}
          </p>
        </div>
      )}

      {/* Canton Selection - Moved after Competencies */}
      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <label className="text-text text-sm font-medium">{tCurr("cantonOptional")}</label>
          <InfoTooltip content={cantonTooltip.content} />
        </div>
        <select
          value={canton}
          onChange={(e) => onCantonChange(e.target.value)}
          className="border-border bg-bg text-text focus:border-primary focus:ring-primary/20 w-full rounded-full border px-4 py-3 transition-colors duration-150 focus:ring-2 focus:outline-none sm:w-auto sm:min-w-[200px]"
        >
          {cantons.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <p className="text-text-muted mt-1 text-xs">{tCurr("cantonHint")}</p>
      </div>
    </div>
  );
}
