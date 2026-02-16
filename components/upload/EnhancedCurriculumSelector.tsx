"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { FACHBEREICHE, getFachbereicheByZyklus, getFachbereichByCode } from "@/lib/data/lehrplan21";
import type { Fachbereich, Kompetenzbereich } from "@/lib/curriculum-types";
import { InfoTooltip, useFieldTooltip } from "./InfoTooltip";
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
  const [competencySearch, setCompetencySearch] = useState("");
  const [unifiedSearch, setUnifiedSearch] = useState("");
  const [showUnifiedResults, setShowUnifiedResults] = useState(false);
  const unifiedSearchRef = useRef<HTMLDivElement>(null);
  const MAX_COMPETENCIES = 5;
  // State to control competencies panel visibility with animation
  const [showCompetencies, setShowCompetencies] = useState(false);

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
    return cantons.find((c) => c.value === value)?.label || value;
  };

  // Get cycle label
  const getCycleLabel = (value: string) => {
    return cycles.find((c) => c.value === value)?.label || value;
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
            {tFields("cycle")} <span className="text-error">*</span>
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
                  {tCurr("competenciesFor", { name: selectedFachbereich.name })}
                </div>
                <div className="text-text-muted text-xs">
                  {tCurr("areasAvailable", { count: selectedFachbereich.kompetenzbereiche.length })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {competencies.length > 0 && (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${competencies.length >= MAX_COMPETENCIES ? "bg-warning/20 text-warning" : "bg-primary/20 text-primary"}`}
                >
                  {tCurr("competenciesSelected", { count: competencies.length })}
                  {competencies.length >= MAX_COMPETENCIES && ` (max)`}
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowCompetencies(false)}
                className="text-text-muted hover:text-text rounded-lg p-1 transition-colors"
                title={tCurr("close")}
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
                  placeholder={tFields("competencySearch")}
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
                  {tCurr("removeAll")}
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
                  {competencySearch ? tCurr("noSearchResults") : tCurr("noCompetencies")}
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
                              title={allSelected ? tCurr("deselectAll") : tCurr("selectAll")}
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
                                const isMaxReached =
                                  competencies.length >= MAX_COMPETENCIES && !isSelected;

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
              <strong className="text-text">{tCurr("tip")}</strong> {tCurr("tipText")}
            </p>
          </div>
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
