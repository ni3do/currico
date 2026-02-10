"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  X,
  Search,
  BookOpen,
  Tag,
  FileText,
  FileType,
  Presentation,
  Table,
  Package,
  File,
  Loader2,
  Users,
} from "lucide-react";
import { useCurriculum } from "@/lib/hooks/useCurriculum";
import { FACHBEREICH_ICONS } from "@/lib/constants/subject-icons";
import {
  parseSearchQuery,
  getSuggestedFilters,
  type ParsedSearchQuery,
} from "@/lib/search-query-parser";
import type {
  Fachbereich,
  Kompetenzbereich,
  Kompetenz,
  Zyklus,
  CurriculumSearchResult,
} from "@/lib/curriculum-types";

// Price options (labels are i18n keys resolved at render time)
const PRICE_OPTIONS = [
  { id: "free", value: 0 },
  { id: "under5", value: 5 },
  { id: "under10", value: 10 },
  { id: "under25", value: 25 },
] as const;

// Format options
const FORMAT_OPTIONS = [
  { id: "pdf", label: "PDF", icon: FileText },
  { id: "word", label: "Word", icon: FileType },
  { id: "ppt", label: "PowerPoint", icon: Presentation },
  { id: "excel", label: "Excel", icon: Table },
] as const;

// Material scope options (labels resolved via i18n at render time)
const MATERIAL_SCOPE_OPTIONS = [
  { id: "single", icon: File },
  { id: "bundle", icon: Package },
] as const;

// Translation function type
type TranslationFn = ReturnType<typeof useTranslations>;

// Helper to get price label from translation function
function getPriceLabel(t: TranslationFn, option: { id: string; value: number }): string {
  if (option.id === "free") return t("sidebar.priceFree");
  return t("sidebar.priceUnder", { amount: option.value });
}

// Helper to get scope label from translation function
function getScopeLabel(t: TranslationFn, id: string): string {
  if (id === "single") return t("sidebar.scopeSingle");
  return t("sidebar.scopeBundle");
}

// ============ COLLAPSIBLE SECTION ============
interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  icon,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group mb-3 flex w-full items-center gap-2"
      >
        {icon}
        <h3 className="label-meta flex-1 text-left">{title}</h3>
        <motion.span
          animate={{ rotate: isOpen ? 0 : -90 }}
          transition={{ duration: 0.2 }}
          className="text-text-muted group-hover:text-text transition-colors"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Types for filter state
export interface LP21FilterState {
  showMaterials: boolean;
  showCreators: boolean;
  zyklus: number | null;
  fachbereich: string | null;
  kompetenzbereich: string | null;
  kompetenz: string | null;
  searchQuery: string;
  // New filters
  dialect: string | null;
  priceType: string | null;
  maxPrice: number | null;
  formats: string[];
  materialScope: string | null;
}

interface LP21FilterSidebarProps {
  filters: LP21FilterState;
  onFiltersChange: (filters: LP21FilterState) => void;
  className?: string;
}

// ============ MAIN COMPONENT ============
export function LP21FilterSidebar({
  filters,
  onFiltersChange,
  className = "",
}: LP21FilterSidebarProps) {
  const t = useTranslations("materialsPage");

  // Fetch curriculum data from API
  const {
    fachbereiche,
    zyklen,
    loading: curriculumLoading,
    error: curriculumError,
    getFachbereicheByZyklus,
    searchByCode,
  } = useCurriculum();

  // Local state for UI
  const [expandedFachbereiche, setExpandedFachbereiche] = useState<Set<string>>(new Set());
  const [expandedKompetenzbereiche, setExpandedKompetenzbereiche] = useState<Set<string>>(
    new Set()
  );
  const [searchFocused, setSearchFocused] = useState(false);
  const [parsedQuery, setParsedQuery] = useState<ParsedSearchQuery | null>(null);

  // Local search input value for immediate UI feedback (debounced before propagating)
  const [localSearchQuery, setLocalSearchQuery] = useState(filters.searchQuery);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local value when parent resets search (e.g. "clear search" button, suggestion click)
  // Uses the React-recommended "store previous prop in state" pattern to avoid useEffect
  const [prevSearchQuery, setPrevSearchQuery] = useState(filters.searchQuery);
  if (prevSearchQuery !== filters.searchQuery) {
    setPrevSearchQuery(filters.searchQuery);
    setLocalSearchQuery(filters.searchQuery);
  }

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  // Get available Fachbereiche based on selected Zyklus
  const availableFachbereiche = useMemo(() => {
    if (filters.zyklus === null) {
      return fachbereiche;
    }
    return getFachbereicheByZyklus(filters.zyklus);
  }, [filters.zyklus, fachbereiche, getFachbereicheByZyklus]);

  // Search results use local value for instant dropdown feedback
  const searchResults = useMemo(() => {
    if (!localSearchQuery || localSearchQuery.length < 2) {
      return [];
    }
    return searchByCode(localSearchQuery).slice(0, 10);
  }, [localSearchQuery, searchByCode]);

  // Check if any filters are active
  const hasActiveFilters =
    filters.zyklus !== null ||
    filters.fachbereich !== null ||
    filters.kompetenzbereich !== null ||
    filters.kompetenz !== null ||
    filters.searchQuery.length > 0 ||
    filters.dialect !== null ||
    filters.priceType !== null ||
    filters.maxPrice !== null ||
    filters.formats.length > 0 ||
    filters.materialScope !== null;

  // Handlers for toggling materials/creators checkboxes
  const handleToggleMaterials = useCallback(() => {
    // Prevent unchecking the last active checkbox
    if (filters.showMaterials && !filters.showCreators) return;
    const newShowMaterials = !filters.showMaterials;
    onFiltersChange({
      ...filters,
      showMaterials: newShowMaterials,
      // Clear price/format/scope/dialect filters when turning off materials
      ...(!newShowMaterials && {
        dialect: null,
        priceType: null,
        maxPrice: null,
        formats: [],
        materialScope: null,
      }),
    });
  }, [filters, onFiltersChange]);

  const handleToggleCreators = useCallback(() => {
    // Prevent unchecking the last active checkbox
    if (filters.showCreators && !filters.showMaterials) return;
    onFiltersChange({
      ...filters,
      showCreators: !filters.showCreators,
    });
  }, [filters, onFiltersChange]);

  // Handlers
  const handleZyklusChange = useCallback(
    (zyklusId: number | null) => {
      // Clear lower-level selections when Zyklus changes
      onFiltersChange({
        ...filters,
        zyklus: filters.zyklus === zyklusId ? null : zyklusId,
        fachbereich: null,
        kompetenzbereich: null,
        kompetenz: null,
      });
    },
    [filters, onFiltersChange]
  );

  const handleFachbereichChange = useCallback(
    (code: string | null) => {
      onFiltersChange({
        ...filters,
        fachbereich: filters.fachbereich === code ? null : code,
        kompetenzbereich: null,
        kompetenz: null,
      });
      // Expand only this Fachbereich when selected (accordion behavior)
      if (code && filters.fachbereich !== code) {
        setExpandedFachbereiche(new Set([code]));
        setExpandedKompetenzbereiche(new Set());
      }
    },
    [filters, onFiltersChange]
  );

  const handleKompetenzbereichChange = useCallback(
    (code: string | null) => {
      onFiltersChange({
        ...filters,
        kompetenzbereich: filters.kompetenzbereich === code ? null : code,
        kompetenz: null,
      });
      // Expand the Kompetenzbereich when selected
      if (code && filters.kompetenzbereich !== code) {
        setExpandedKompetenzbereiche((prev) => new Set([...prev, code]));
      }
    },
    [filters, onFiltersChange]
  );

  const handleKompetenzChange = useCallback(
    (code: string | null) => {
      onFiltersChange({
        ...filters,
        kompetenz: filters.kompetenz === code ? null : code,
      });
    },
    [filters, onFiltersChange]
  );

  const handleSearchChange = useCallback(
    (query: string) => {
      // Update local value immediately (no lag while typing)
      setLocalSearchQuery(query);

      // Parse the query for smart suggestions (instant, local only)
      if (query.length >= 2) {
        const parsed = parseSearchQuery(query);
        if (parsed.detectedTerms.length > 0) {
          setParsedQuery(parsed);
        } else {
          setParsedQuery(null);
        }
      } else {
        setParsedQuery(null);
      }

      // Debounce the API call (300ms)
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      searchDebounceRef.current = setTimeout(() => {
        onFiltersChange({
          ...filters,
          searchQuery: query,
        });
      }, 300);
    },
    [filters, onFiltersChange]
  );

  // Apply smart search suggestions
  const handleApplySmartSearch = useCallback(() => {
    if (!parsedQuery) return;

    const suggestions = getSuggestedFilters(parsedQuery);
    const newFilters = { ...filters };

    if (suggestions.zyklus !== undefined) {
      newFilters.zyklus = suggestions.zyklus;
    }
    if (suggestions.fachbereich !== undefined) {
      newFilters.fachbereich = suggestions.fachbereich;
      // Expand the selected Fachbereich
      setExpandedFachbereiche(new Set([suggestions.fachbereich]));
    }
    if (suggestions.kompetenzbereich !== undefined) {
      newFilters.kompetenzbereich = suggestions.kompetenzbereich;
      // Expand the Kompetenzbereich
      setExpandedKompetenzbereiche(new Set([suggestions.kompetenzbereich]));
    }
    if (suggestions.kompetenz !== undefined) {
      newFilters.kompetenz = suggestions.kompetenz;
    }

    // Keep remaining terms as search query
    newFilters.searchQuery = parsedQuery.remainingTerms.join(" ");

    onFiltersChange(newFilters);
    setParsedQuery(null);
  }, [parsedQuery, filters, onFiltersChange]);

  const handleSearchResultSelect = useCallback(
    (result: CurriculumSearchResult) => {
      let newFilters: LP21FilterState = {
        ...filters,
        searchQuery: "",
      };

      // Determine the Zyklus from the Fachbereich
      const zyklusFromFb = result.fachbereich.cycles[0];

      switch (result.type) {
        case "fachbereich":
          newFilters = {
            ...newFilters,
            zyklus: filters.zyklus ?? zyklusFromFb,
            fachbereich: result.code,
            kompetenzbereich: null,
            kompetenz: null,
          };
          setExpandedFachbereiche(new Set([result.code]));
          setExpandedKompetenzbereiche(new Set());
          break;
        case "kompetenzbereich":
          newFilters = {
            ...newFilters,
            zyklus: filters.zyklus ?? zyklusFromFb,
            fachbereich: result.fachbereich.code,
            kompetenzbereich: result.code,
            kompetenz: null,
          };
          setExpandedFachbereiche(new Set([result.fachbereich.code]));
          setExpandedKompetenzbereiche(new Set([result.code]));
          break;
        case "kompetenz":
          newFilters = {
            ...newFilters,
            zyklus: filters.zyklus ?? zyklusFromFb,
            fachbereich: result.fachbereich.code,
            kompetenzbereich: result.kompetenzbereich?.code ?? null,
            kompetenz: result.code,
          };
          setExpandedFachbereiche(new Set([result.fachbereich.code]));
          if (result.kompetenzbereich) {
            setExpandedKompetenzbereiche(new Set([result.kompetenzbereich!.code]));
          } else {
            setExpandedKompetenzbereiche(new Set());
          }
          break;
      }

      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange]
  );

  const handleClearAll = useCallback(() => {
    onFiltersChange({
      showMaterials: filters.showMaterials,
      showCreators: filters.showCreators,
      zyklus: null,
      fachbereich: null,
      kompetenzbereich: null,
      kompetenz: null,
      searchQuery: "",
      dialect: null,
      priceType: null,
      maxPrice: null,
      formats: [],
      materialScope: null,
    });
    setExpandedFachbereiche(new Set());
    setExpandedKompetenzbereiche(new Set());
  }, [onFiltersChange, filters.showMaterials, filters.showCreators]);

  const handleRemoveFilter = useCallback(
    (type: FilterType, value?: string) => {
      switch (type) {
        case "zyklus":
          onFiltersChange({
            ...filters,
            zyklus: null,
            fachbereich: null,
            kompetenzbereich: null,
            kompetenz: null,
          });
          break;
        case "fachbereich":
          onFiltersChange({
            ...filters,
            fachbereich: null,
            kompetenzbereich: null,
            kompetenz: null,
          });
          break;
        case "kompetenzbereich":
          onFiltersChange({
            ...filters,
            kompetenzbereich: null,
            kompetenz: null,
          });
          break;
        case "kompetenz":
          onFiltersChange({
            ...filters,
            kompetenz: null,
          });
          break;
        case "dialect":
          onFiltersChange({
            ...filters,
            dialect: null,
          });
          break;
        case "price":
          onFiltersChange({
            ...filters,
            priceType: null,
            maxPrice: null,
          });
          break;
        case "format":
          // Remove specific format if value provided, otherwise clear all
          onFiltersChange({
            ...filters,
            formats: value ? filters.formats.filter((f) => f !== value) : [],
          });
          break;
        case "materialScope":
          onFiltersChange({
            ...filters,
            materialScope: null,
          });
          break;
      }
    },
    [filters, onFiltersChange]
  );

  const toggleFachbereichExpansion = useCallback((code: string) => {
    setExpandedFachbereiche((prev) => {
      // If already expanded, collapse it
      if (prev.has(code)) {
        return new Set();
      }
      // Otherwise, expand only this one (close all others)
      return new Set([code]);
    });
    // Also collapse any expanded Kompetenzbereiche when switching Fachbereich
    setExpandedKompetenzbereiche(new Set());
  }, []);

  const toggleKompetenzbereichExpansion = useCallback((code: string) => {
    setExpandedKompetenzbereiche((prev) => {
      // If already expanded, collapse it
      if (prev.has(code)) {
        return new Set();
      }
      // Otherwise, expand only this one (close all others)
      return new Set([code]);
    });
  }, []);

  // New filter handlers
  const handlePriceTypeChange = useCallback(
    (priceType: string | null) => {
      // Find the price option to get its value
      const option = PRICE_OPTIONS.find((o) => o.id === priceType);
      const newPriceType = filters.priceType === priceType ? null : priceType;

      onFiltersChange({
        ...filters,
        priceType: newPriceType,
        // Set slider to the option's value for smooth snapping
        maxPrice: newPriceType && option ? option.value : null,
      });
    },
    [filters, onFiltersChange]
  );

  const handleMaxPriceChange = useCallback(
    (maxPrice: number) => {
      onFiltersChange({
        ...filters,
        priceType: null, // Clear preset when using slider
        maxPrice: maxPrice,
      });
    },
    [filters, onFiltersChange]
  );

  const handleFormatToggle = useCallback(
    (formatId: string) => {
      const newFormats = filters.formats.includes(formatId)
        ? filters.formats.filter((f) => f !== formatId)
        : [...filters.formats, formatId];
      onFiltersChange({
        ...filters,
        formats: newFormats,
      });
    },
    [filters, onFiltersChange]
  );

  const handleMaterialScopeChange = useCallback(
    (scope: string | null) => {
      onFiltersChange({
        ...filters,
        materialScope: filters.materialScope === scope ? null : scope,
      });
    },
    [filters, onFiltersChange]
  );

  return (
    <aside className={`border-border bg-bg-secondary rounded-xl border shadow-sm ${className}`}>
      <div className="p-5">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-text text-lg font-semibold">{t("sidebar.title")}</h2>
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="text-text-muted hover:text-primary flex items-center gap-1 text-sm font-medium transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              {t("sidebar.reset")}
            </button>
          )}
        </div>

        {/* Search Type Checkboxes */}
        <SearchTypeCheckboxes
          showMaterials={filters.showMaterials}
          showCreators={filters.showCreators}
          onToggleMaterials={handleToggleMaterials}
          onToggleCreators={handleToggleCreators}
          t={t}
        />

        <div className="divider my-5" />

        {/* Active Filter Chips */}
        <AnimatePresence>
          {hasActiveFilters && (
            <ActiveFilterChips
              filters={filters}
              fachbereiche={fachbereiche}
              zyklen={zyklen}
              onRemoveFilter={handleRemoveFilter}
              t={t}
            />
          )}
        </AnimatePresence>

        {/* Search Input */}
        <div className="relative mb-5">
          <div className="relative">
            <Search className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              value={localSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder={
                !filters.showMaterials && filters.showCreators
                  ? t("sidebar.searchPlaceholderCreators")
                  : filters.showMaterials && filters.showCreators
                    ? t("sidebar.searchPlaceholderBoth")
                    : t("sidebar.searchPlaceholderDefault")
              }
              className="border-border bg-bg text-text placeholder:text-text-faint focus:border-primary focus:ring-primary/20 w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm focus:ring-2 focus:outline-none"
            />
          </div>

          {/* Search Results Dropdown */}
          {searchFocused && searchResults.length > 0 && (
            <div className="border-border bg-surface absolute top-full right-0 left-0 z-50 mt-1 rounded-lg border shadow-lg">
              <div className="max-h-64 overflow-y-auto p-2">
                {searchResults.map((result) => (
                  <button
                    key={result.code}
                    onClick={() => handleSearchResultSelect(result)}
                    className="hover:bg-surface-hover flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors"
                  >
                    <span
                      className="inline-flex h-5 w-5 items-center justify-center rounded text-xs font-bold text-white"
                      style={{ backgroundColor: result.fachbereich.color }}
                    >
                      {result.fachbereich.shortName.charAt(0)}
                    </span>
                    <span className="text-primary font-mono text-xs font-medium">
                      {result.code}
                    </span>
                    <span className="text-text-secondary flex-1 truncate">{result.name}</span>
                    <span className="text-text-muted text-xs">
                      {result.type === "fachbereich"
                        ? t("sidebar.searchResultSubject")
                        : result.type === "kompetenzbereich"
                          ? t("sidebar.searchResultArea")
                          : t("sidebar.searchResultCompetence")}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Smart Search Suggestions */}
        <SmartSearchSuggestions
          parsedQuery={parsedQuery}
          fachbereiche={fachbereiche}
          zyklen={zyklen}
          onApply={handleApplySmartSearch}
          onDismiss={() => setParsedQuery(null)}
          t={t}
        />

        {/* Zyklus Toggle */}
        <CollapsibleSection title={t("sidebar.zyklusLabel")}>
          <ZyklusToggle
            zyklen={zyklen}
            selectedZyklus={filters.zyklus}
            onZyklusChange={handleZyklusChange}
          />
        </CollapsibleSection>

        <div className="divider my-5" />

        {/* Fachbereiche Tree */}
        <CollapsibleSection title={t("sidebar.subjectLabel")}>
          <div className="space-y-2">
            {curriculumLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="text-primary h-6 w-6 animate-spin" />
              </div>
            ) : curriculumError ? (
              <div className="text-error py-4 text-center text-sm">{t("sidebar.loadingError")}</div>
            ) : (
              availableFachbereiche.map((fb, index) => (
                <FachbereichAccordion
                  key={fb.code}
                  fachbereich={fb}
                  isSelected={filters.fachbereich === fb.code}
                  isExpanded={expandedFachbereiche.has(fb.code)}
                  selectedKompetenzbereich={filters.kompetenzbereich}
                  selectedKompetenz={filters.kompetenz}
                  expandedKompetenzbereiche={expandedKompetenzbereiche}
                  onSelect={() => handleFachbereichChange(fb.code)}
                  onToggleExpand={() => toggleFachbereichExpansion(fb.code)}
                  onKompetenzbereichSelect={handleKompetenzbereichChange}
                  onKompetenzbereichToggle={toggleKompetenzbereichExpansion}
                  onKompetenzSelect={handleKompetenzChange}
                  index={index}
                />
              ))
            )}
          </div>
        </CollapsibleSection>

        {/* Show price/dialect/format/scope filters only when materials are shown */}
        {filters.showMaterials && (
          <>
            <div className="divider my-5" />

            {/* Price Filter */}
            <CollapsibleSection title={t("sidebar.priceLabel")}>
              <PriceFilter
                selectedPriceType={filters.priceType}
                maxPrice={filters.maxPrice}
                onPriceTypeChange={handlePriceTypeChange}
                onMaxPriceChange={handleMaxPriceChange}
                t={t}
              />
            </CollapsibleSection>

            <div className="divider my-5" />

            {/* Dialect Toggle */}
            <CollapsibleSection title={t("sidebar.dialectLabel")}>
              <DialectToggle
                selectedDialect={filters.dialect}
                onDialectChange={(dialect) => onFiltersChange({ ...filters, dialect })}
                t={t}
              />
            </CollapsibleSection>

            <div className="divider my-5" />

            {/* Format Filter */}
            <CollapsibleSection title={t("sidebar.formatSectionLabel")}>
              <FormatFilter selectedFormats={filters.formats} onFormatToggle={handleFormatToggle} />
            </CollapsibleSection>

            <div className="divider my-5" />

            {/* Material Scope Filter */}
            <CollapsibleSection title={t("sidebar.scopeLabel")}>
              <MaterialScopeFilter
                selectedScope={filters.materialScope}
                onScopeChange={handleMaterialScopeChange}
                t={t}
              />
            </CollapsibleSection>
          </>
        )}
      </div>
    </aside>
  );
}

// ============ SEARCH TYPE CHECKBOXES ============
interface SearchTypeCheckboxesProps {
  showMaterials: boolean;
  showCreators: boolean;
  onToggleMaterials: () => void;
  onToggleCreators: () => void;
  t: ReturnType<typeof useTranslations>;
}

function SearchTypeCheckboxes({
  showMaterials,
  showCreators,
  onToggleMaterials,
  onToggleCreators,
  t,
}: SearchTypeCheckboxesProps) {
  return (
    <div>
      <h3 className="label-meta mb-3">{t("sidebar.displayLabel")}</h3>
      <div className="flex gap-2">
        <label
          className={`group relative flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 px-3 py-2.5 text-center transition-colors select-none ${
            showMaterials
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-bg text-text-secondary hover:border-primary/50 hover:bg-surface-hover"
          } ${showMaterials && !showCreators ? "cursor-not-allowed opacity-75" : ""}`}
        >
          <input
            type="checkbox"
            checked={showMaterials}
            onChange={onToggleMaterials}
            className="sr-only"
          />
          <FileText className="h-4 w-4" />
          <span className="text-sm font-semibold">{t("sidebar.showMaterials")}</span>
        </label>

        <label
          className={`group relative flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 px-3 py-2.5 text-center transition-colors select-none ${
            showCreators
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-bg text-text-secondary hover:border-primary/50 hover:bg-surface-hover"
          } ${showCreators && !showMaterials ? "cursor-not-allowed opacity-75" : ""}`}
        >
          <input
            type="checkbox"
            checked={showCreators}
            onChange={onToggleCreators}
            className="sr-only"
          />
          <Users className="h-4 w-4" />
          <span className="text-sm font-semibold">{t("sidebar.showCreators")}</span>
        </label>
      </div>
    </div>
  );
}

// ============ ZYKLUS TOGGLE ============
interface ZyklusToggleProps {
  zyklen: Zyklus[];
  selectedZyklus: number | null;
  onZyklusChange: (zyklus: number | null) => void;
}

function ZyklusToggle({ zyklen, selectedZyklus, onZyklusChange }: ZyklusToggleProps) {
  return (
    <div className="flex gap-2">
      {zyklen.map((zyklus, index) => {
        const isActive = selectedZyklus === zyklus.id;
        return (
          <motion.button
            key={zyklus.id}
            onClick={() => onZyklusChange(zyklus.id)}
            className={`group relative flex-1 rounded-lg border-2 px-3 py-2.5 text-center transition-colors ${
              isActive
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-bg text-text-secondary hover:border-primary/50 hover:bg-surface-hover"
            }`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.015, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
            whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
          >
            {isActive && (
              <motion.div
                layoutId="activeZyklus"
                className="bg-primary/10 absolute inset-0 rounded-lg"
                initial={false}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            <div className="relative z-10 text-sm font-semibold">{zyklus.shortName}</div>
            <div
              className={`relative z-10 text-xs ${isActive ? "text-primary/80" : "text-text-muted"}`}
            >
              {zyklus.id === 1 ? "KG-2" : zyklus.id === 2 ? "3-6" : "7-9"}
            </div>
            {/* Tooltip on hover */}
            <div className="bg-text text-bg pointer-events-none absolute -top-10 left-1/2 z-50 -translate-x-1/2 rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {zyklus.description}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

// ============ DIALECT TOGGLE ============
interface DialectToggleProps {
  selectedDialect: string | null;
  onDialectChange: (dialect: string | null) => void;
  t: TranslationFn;
}

function DialectToggle({ selectedDialect, onDialectChange, t }: DialectToggleProps) {
  const options = [
    {
      value: "SWISS",
      labelKey: "sidebar.dialectCH" as const,
      titleKey: "sidebar.dialectSwiss" as const,
    },
    {
      value: "STANDARD",
      labelKey: "sidebar.dialectDE" as const,
      titleKey: "sidebar.dialectStandard" as const,
    },
  ];

  return (
    <div className="flex gap-2">
      {options.map((option) => {
        const isActive = selectedDialect === option.value;
        const label = t(option.labelKey);
        const title = t(option.titleKey);
        return (
          <motion.button
            key={option.value}
            onClick={() => onDialectChange(isActive ? null : option.value)}
            className={`group relative flex-1 rounded-lg border-2 px-3 py-2.5 text-center transition-colors ${
              isActive
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-bg text-text-secondary hover:border-primary/50 hover:bg-surface-hover"
            }`}
            whileHover={{ scale: 1.015, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
            whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
          >
            <div className="relative z-10 text-sm font-semibold">{label}</div>
            <div
              className={`relative z-10 text-xs ${isActive ? "text-primary/80" : "text-text-muted"}`}
            >
              {title}
            </div>
            {/* Tooltip on hover */}
            <div className="bg-text text-bg pointer-events-none absolute -top-10 left-1/2 z-50 -translate-x-1/2 rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {title}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

// ============ ACTIVE FILTER CHIPS ============
type FilterType =
  | "zyklus"
  | "fachbereich"
  | "kompetenzbereich"
  | "kompetenz"
  | "dialect"
  | "price"
  | "format"
  | "materialScope";

interface ActiveFilterChipsProps {
  filters: LP21FilterState;
  fachbereiche: Fachbereich[];
  zyklen: Zyklus[];
  onRemoveFilter: (type: FilterType, value?: string) => void;
  t: TranslationFn;
}

function ActiveFilterChips({
  filters,
  fachbereiche,
  zyklen,
  onRemoveFilter,
  t,
}: ActiveFilterChipsProps) {
  const chips: {
    type: FilterType;
    label: string;
    color: string;
    value?: string;
  }[] = [];

  // Neutral grey for non-curriculum filters (Catppuccin overlay)
  const NEUTRAL_GREY = "#7c7f93";

  // Get the selected Fachbereich for color inheritance
  const selectedFb = filters.fachbereich
    ? fachbereiche.find((f) => f.code === filters.fachbereich)
    : null;

  // Always show Zyklus if selected
  if (filters.zyklus !== null) {
    const zyklus = zyklen.find((z) => z.id === filters.zyklus);
    if (zyklus) {
      chips.push({
        type: "zyklus",
        label: zyklus.shortName,
        color: "#1e66f5", // Primary blue for Zyklus
      });
    }
  }

  // For Fachbereich hierarchy: only show the deepest selected level
  // Priority: kompetenz > kompetenzbereich > fachbereich
  if (filters.kompetenz) {
    // Show only the most specific: Kompetenz
    let kompetenzColor = selectedFb?.color || "#1e66f5";
    for (const fb of fachbereiche) {
      for (const kb of fb.kompetenzbereiche) {
        if (kb.kompetenzen.some((k) => k.code === filters.kompetenz)) {
          kompetenzColor = fb.color;
          break;
        }
      }
    }
    chips.push({
      type: "kompetenz",
      label: filters.kompetenz,
      color: kompetenzColor,
    });
  } else if (filters.kompetenzbereich) {
    // Show only Kompetenzbereich
    const parentFb = fachbereiche.find((fb) =>
      fb.kompetenzbereiche.some((kb) => kb.code === filters.kompetenzbereich)
    );
    chips.push({
      type: "kompetenzbereich",
      label: filters.kompetenzbereich,
      color: parentFb?.color || selectedFb?.color || "#1e66f5",
    });
  } else if (filters.fachbereich && selectedFb) {
    // Show only Fachbereich
    chips.push({
      type: "fachbereich",
      label: selectedFb.shortName,
      color: selectedFb.color,
    });
  }

  // Dialect filter chip
  if (filters.dialect !== null) {
    chips.push({
      type: "dialect",
      label: filters.dialect === "SWISS" ? t("sidebar.dialectCH") : t("sidebar.dialectDE"),
      color: NEUTRAL_GREY,
    });
  }

  // Price filter chip
  if (filters.priceType !== null || filters.maxPrice !== null) {
    const priceOption = PRICE_OPTIONS.find((o) => o.id === filters.priceType);
    const priceLabel = priceOption
      ? getPriceLabel(t, priceOption)
      : filters.maxPrice !== null
        ? `< CHF ${filters.maxPrice}`
        : "";
    if (priceLabel) {
      chips.push({
        type: "price",
        label: priceLabel,
        color: NEUTRAL_GREY,
      });
    }
  }

  // Format filter chips (one chip per selected format)
  if (filters.formats.length > 0) {
    filters.formats.forEach((formatId) => {
      const format = FORMAT_OPTIONS.find((f) => f.id === formatId);
      if (format) {
        chips.push({
          type: "format",
          label: format.label,
          color: NEUTRAL_GREY,
          value: formatId,
        });
      }
    });
  }

  // Material scope filter chip
  if (filters.materialScope !== null) {
    const scope = MATERIAL_SCOPE_OPTIONS.find((s) => s.id === filters.materialScope);
    if (scope) {
      chips.push({
        type: "materialScope",
        label: getScopeLabel(t, scope.id),
        color: NEUTRAL_GREY,
      });
    }
  }

  if (chips.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="mb-5 overflow-hidden"
    >
      <div className="bg-surface/50 border-border/50 rounded-lg border p-3">
        <div className="mb-2 flex items-center gap-2">
          <Tag className="text-text-muted h-3.5 w-3.5" />
          <span className="text-text-muted text-xs font-medium">{t("sidebar.activeFilters")}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {chips.map((chip, index) => (
              <motion.span
                key={chip.value ? `${chip.type}-${chip.value}` : chip.type}
                initial={{ opacity: 0, scale: 0.9, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -8 }}
                transition={{
                  duration: 0.25,
                  delay: index * 0.04,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group inline-flex items-center gap-1.5 rounded-full py-1.5 pr-1.5 pl-3 text-xs font-semibold shadow-sm transition-shadow duration-300 hover:shadow-md"
                style={{
                  backgroundColor: `${chip.color}18`,
                  color: chip.color,
                  border: `1px solid ${chip.color}30`,
                }}
              >
                {chip.label}
                <motion.button
                  onClick={() => onRemoveFilter(chip.type, chip.value)}
                  className="flex h-5 w-5 items-center justify-center rounded-full transition-colors"
                  style={{
                    backgroundColor: `${chip.color}20`,
                  }}
                  whileHover={{ scale: 1.1, backgroundColor: `${chip.color}35` }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="h-3 w-3" />
                </motion.button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ============ FACHBEREICH ACCORDION ============
interface FachbereichAccordionProps {
  fachbereich: Fachbereich;
  isSelected: boolean;
  isExpanded: boolean;
  selectedKompetenzbereich: string | null;
  selectedKompetenz: string | null;
  expandedKompetenzbereiche: Set<string>;
  onSelect: () => void;
  onToggleExpand: () => void;
  onKompetenzbereichSelect: (code: string | null) => void;
  onKompetenzbereichToggle: (code: string) => void;
  onKompetenzSelect: (code: string | null) => void;
  index?: number;
}

function FachbereichAccordion({
  fachbereich,
  isSelected,
  isExpanded,
  selectedKompetenzbereich,
  selectedKompetenz,
  expandedKompetenzbereiche,
  onSelect,
  onToggleExpand,
  onKompetenzbereichSelect,
  onKompetenzbereichToggle,
  onKompetenzSelect,
  index = 0,
}: FachbereichAccordionProps) {
  const Icon = FACHBEREICH_ICONS[fachbereich.code] || BookOpen;
  const hasChildren = fachbereich.kompetenzbereiche.length > 0;

  return (
    <motion.div
      className={`overflow-hidden rounded-lg border transition-colors ${
        isSelected ? "border-transparent" : "border-border hover:border-border-subtle"
      }`}
      style={{
        ...(isSelected && {
          boxShadow: `0 0 0 2px ${fachbereich.color}`,
        }),
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      {/* Header with subtle background color */}
      <motion.div
        className="relative flex items-center rounded-lg"
        style={{
          backgroundColor: isSelected ? `${fachbereich.color}20` : `${fachbereich.color}08`,
        }}
        whileHover={{
          backgroundColor: isSelected ? `${fachbereich.color}25` : `${fachbereich.color}15`,
          x: 2,
        }}
        transition={{ duration: 0.15 }}
      >
        {/* Content */}
        <div className="flex flex-1 items-center">
          {/* Expand toggle - only show if there are subcategories */}
          {hasChildren ? (
            <motion.button
              onClick={onToggleExpand}
              className={`flex h-full items-center px-2 transition-colors ${
                isSelected ? "text-text hover:text-text" : "text-text-muted hover:text-text"
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <motion.span animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronRight className="h-4 w-4" />
              </motion.span>
            </motion.button>
          ) : (
            // Spacer to maintain alignment when there's no expand button
            <div className="w-8" />
          )}

          {/* Main button */}
          <motion.button
            onClick={onSelect}
            className="flex flex-1 items-center gap-2.5 py-2 pr-3 text-left"
            whileTap={{ scale: 0.98 }}
          >
            <motion.span
              className="flex h-7 w-10 shrink-0 items-center justify-center rounded-md text-xs font-bold"
              initial={false}
              animate={{
                backgroundColor: isSelected ? fachbereich.color : `${fachbereich.color}20`,
                color: isSelected ? "white" : fachbereich.color,
              }}
              transition={{ duration: 0.2 }}
            >
              {fachbereich.shortName}
            </motion.span>
            <div className="min-w-0 flex-1">
              <div
                className={`text-sm leading-tight font-medium ${isSelected ? "" : "text-text"}`}
                style={isSelected ? { color: fachbereich.color } : undefined}
              >
                {fachbereich.name}
              </div>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Expanded content - Kompetenzbereiche (only if there are children) */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-border bg-bg/50 border-t px-2 py-2">
              <div className="space-y-1">
                {[...fachbereich.kompetenzbereiche]
                  .sort((a, b) => {
                    // Extract the numeric part from codes like "D.1", "MA.2", etc.
                    const numA = parseInt(a.code.split(".").pop() || "0", 10);
                    const numB = parseInt(b.code.split(".").pop() || "0", 10);
                    return numA - numB;
                  })
                  .map((kb, kbIndex) => (
                    <KompetenzbereichItem
                      key={kb.code}
                      kompetenzbereich={kb}
                      fachbereichColor={fachbereich.color}
                      isSelected={selectedKompetenzbereich === kb.code}
                      isExpanded={expandedKompetenzbereiche.has(kb.code)}
                      selectedKompetenz={selectedKompetenz}
                      onSelect={() => onKompetenzbereichSelect(kb.code)}
                      onToggleExpand={() => onKompetenzbereichToggle(kb.code)}
                      onKompetenzSelect={onKompetenzSelect}
                      index={kbIndex}
                    />
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============ KOMPETENZBEREICH ITEM ============
interface KompetenzbereichItemProps {
  kompetenzbereich: Kompetenzbereich;
  fachbereichColor: string;
  isSelected: boolean;
  isExpanded: boolean;
  selectedKompetenz: string | null;
  onSelect: () => void;
  onToggleExpand: () => void;
  onKompetenzSelect: (code: string | null) => void;
  index?: number;
}

function KompetenzbereichItem({
  kompetenzbereich,
  fachbereichColor,
  isSelected,
  isExpanded,
  selectedKompetenz,
  onSelect,
  onToggleExpand,
  onKompetenzSelect,
  index = 0,
}: KompetenzbereichItemProps) {
  const hasChildren = kompetenzbereich.kompetenzen.length > 0;

  return (
    <motion.div
      className="overflow-hidden rounded-md"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
    >
      <motion.div
        className="flex items-center rounded-md"
        style={{
          backgroundColor: isSelected ? `${fachbereichColor}18` : `${fachbereichColor}06`,
        }}
        whileHover={{
          backgroundColor: isSelected ? `${fachbereichColor}22` : `${fachbereichColor}12`,
          x: 2,
        }}
        transition={{ duration: 0.15 }}
      >
        {/* Expand toggle - only show if there are children */}
        {hasChildren ? (
          <motion.button
            onClick={onToggleExpand}
            className={`flex items-center px-1.5 transition-colors ${
              isSelected ? "text-text" : "text-text-muted hover:text-text"
            }`}
            whileTap={{ scale: 0.9 }}
          >
            <motion.span animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight className="h-3.5 w-3.5" />
            </motion.span>
          </motion.button>
        ) : (
          // Spacer to maintain alignment when there's no expand button
          <div className="w-6" />
        )}

        {/* Main button */}
        <motion.button
          onClick={onSelect}
          className={`flex flex-1 items-center gap-2 py-1.5 pr-2 text-left text-sm transition-colors ${
            isSelected ? "" : "text-text-secondary hover:text-text"
          }`}
          whileTap={{ scale: 0.98 }}
        >
          <span className="font-mono text-xs font-semibold" style={{ color: fachbereichColor }}>
            {kompetenzbereich.code}
          </span>
          <span
            className={`flex-1 truncate ${isSelected ? "font-medium" : ""}`}
            style={isSelected ? { color: fachbereichColor } : undefined}
            title={kompetenzbereich.name}
          >
            {kompetenzbereich.name}
          </span>
        </motion.button>
      </motion.div>

      {/* Kompetenzen (only if there are children) */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="mt-1 ml-5 space-y-0.5 border-l-2 pl-3"
              style={{ borderColor: `${fachbereichColor}40` }}
            >
              {kompetenzbereich.kompetenzen.map((k, kIndex) => {
                const isKompetenzSelected = selectedKompetenz === k.code;
                return (
                  <motion.div
                    key={k.code}
                    className="overflow-hidden rounded"
                    style={{
                      backgroundColor: isKompetenzSelected
                        ? `${fachbereichColor}15`
                        : `${fachbereichColor}05`,
                    }}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: kIndex * 0.02 }}
                    whileHover={{
                      backgroundColor: isKompetenzSelected
                        ? `${fachbereichColor}20`
                        : `${fachbereichColor}10`,
                      x: 2,
                    }}
                  >
                    <div className="flex items-center">
                      <motion.button
                        onClick={() => onKompetenzSelect(k.code)}
                        className={`flex w-full items-center gap-2 px-2 py-1 text-left text-xs transition-colors ${
                          isKompetenzSelected ? "" : "text-text-muted hover:text-text"
                        }`}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="font-mono font-medium" style={{ color: fachbereichColor }}>
                          {k.code}
                        </span>
                        <span
                          className={`flex-1 truncate ${isKompetenzSelected ? "font-medium" : ""}`}
                          style={isKompetenzSelected ? { color: fachbereichColor } : undefined}
                          title={k.name}
                        >
                          {k.name}
                        </span>
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============ PRICE FILTER ============
interface PriceFilterProps {
  selectedPriceType: string | null;
  maxPrice: number | null;
  onPriceTypeChange: (priceType: string | null) => void;
  onMaxPriceChange: (maxPrice: number) => void;
  t: TranslationFn;
}

function PriceFilter({
  selectedPriceType,
  maxPrice,
  onPriceTypeChange,
  onMaxPriceChange,
  t,
}: PriceFilterProps) {
  const MAX_PRICE = 50;
  // Calculate the effective value for display and slider position
  const effectiveValue = maxPrice ?? MAX_PRICE;
  const sliderPercent = (effectiveValue / MAX_PRICE) * 100;

  return (
    <div>
      {/* Price preset buttons */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {PRICE_OPTIONS.map((option, index) => {
          // Check if this option is selected based on priceType OR if slider matches the value
          const isSelected =
            selectedPriceType === option.id ||
            (selectedPriceType === null && maxPrice === option.value);
          return (
            <motion.button
              key={option.id}
              onClick={() => onPriceTypeChange(option.id)}
              className={`relative rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                isSelected
                  ? "bg-primary text-white"
                  : "bg-surface border-border text-text-secondary hover:border-primary/50 hover:text-text border"
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {getPriceLabel(t, option)}
            </motion.button>
          );
        })}
      </div>

      {/* Price slider */}
      <div className="space-y-2">
        <div className="text-text-muted flex items-center justify-between text-xs">
          <span>{t("sidebar.maxPrice")}</span>
          <motion.span
            className="text-text font-medium"
            key={effectiveValue}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.15 }}
          >
            CHF {effectiveValue}
          </motion.span>
        </div>
        <div className="relative flex h-5 items-center">
          {/* Track background */}
          <div className="bg-surface-hover absolute h-2 w-full rounded-full" />
          {/* Filled track - account for thumb width (16px = 1rem) */}
          <motion.div
            className="bg-primary absolute h-2 rounded-full"
            style={{ left: 0 }}
            initial={false}
            animate={{ width: `calc(${sliderPercent}% + ${(100 - sliderPercent) * 0.08}px)` }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          />
          {/* Range input */}
          <input
            type="range"
            min="0"
            max={MAX_PRICE}
            step="1"
            value={effectiveValue}
            onChange={(e) => onMaxPriceChange(Number(e.target.value))}
            className="[&::-moz-range-thumb]:bg-primary [&::-webkit-slider-thumb]:bg-primary relative z-10 h-5 w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:duration-200 [&::-moz-range-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:scale-110"
          />
        </div>
        <div className="text-text-faint flex justify-between text-xs">
          <span>CHF 0</span>
          <span>CHF {MAX_PRICE}</span>
        </div>
      </div>
    </div>
  );
}

// ============ FORMAT FILTER ============
interface FormatFilterProps {
  selectedFormats: string[];
  onFormatToggle: (formatId: string) => void;
}

function FormatFilter({ selectedFormats, onFormatToggle }: FormatFilterProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {FORMAT_OPTIONS.map((format, index) => {
        const Icon = format.icon;
        const isSelected = selectedFormats.includes(format.id);
        return (
          <motion.button
            key={format.id}
            onClick={() => onFormatToggle(format.id)}
            className={`relative flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
              isSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-bg text-text-secondary hover:border-primary/50 hover:text-text"
            }`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon className="h-4 w-4" />
            <span className="font-medium">{format.label}</span>
            <AnimatePresence>
              {isSelected && (
                <motion.span
                  className="bg-primary absolute -top-1 -right-1 h-2 w-2 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}

// ============ MATERIAL SCOPE FILTER ============
interface MaterialScopeFilterProps {
  selectedScope: string | null;
  onScopeChange: (scope: string | null) => void;
  t: TranslationFn;
}

function MaterialScopeFilter({ selectedScope, onScopeChange, t }: MaterialScopeFilterProps) {
  return (
    <div className="flex gap-2">
      {MATERIAL_SCOPE_OPTIONS.map((option, index) => {
        const Icon = option.icon;
        const isSelected = selectedScope === option.id;
        return (
          <motion.button
            key={option.id}
            onClick={() => onScopeChange(option.id)}
            className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-3 py-2.5 text-sm transition-colors ${
              isSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-bg text-text-secondary hover:border-primary/50 hover:text-text"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSelected && (
              <motion.div
                layoutId="activeMaterialScope"
                className="bg-primary/10 absolute inset-0 rounded-lg"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span className="font-medium">{getScopeLabel(t, option.id)}</span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

// ============ SMART SEARCH SUGGESTIONS ============
interface SmartSearchSuggestionsProps {
  parsedQuery: ParsedSearchQuery | null;
  fachbereiche: Fachbereich[];
  zyklen: Zyklus[];
  onApply: () => void;
  onDismiss: () => void;
  t: TranslationFn;
}

function SmartSearchSuggestions({
  parsedQuery,
  fachbereiche,
  zyklen,
  onApply,
  onDismiss,
  t,
}: SmartSearchSuggestionsProps) {
  if (!parsedQuery || parsedQuery.detectedTerms.length === 0) {
    return null;
  }

  const suggestions = getSuggestedFilters(parsedQuery);
  const suggestedFachbereich = suggestions.fachbereich
    ? fachbereiche.find((fb) => fb.code === suggestions.fachbereich)
    : null;
  const suggestedZyklus = suggestions.zyklus
    ? zyklen.find((z) => z.id === suggestions.zyklus)
    : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        transition={{ duration: 0.2 }}
        className="mb-5 overflow-hidden"
      >
        <div className="bg-primary/5 border-primary/20 rounded-lg border p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="text-primary h-4 w-4" />
              <span className="text-primary text-xs font-semibold">
                {t("sidebar.smartSearchDetected")}
              </span>
            </div>
            <button
              onClick={onDismiss}
              className="text-text-muted hover:text-text rounded p-0.5 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Show detected items */}
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestedZyklus && (
              <span className="bg-primary/10 text-primary group relative inline-flex cursor-help items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium">
                <span className="text-primary/70">{t("sidebar.smartSearchLevel")}</span>
                {suggestedZyklus.shortName}
                {/* Tooltip */}
                <span className="bg-text text-bg pointer-events-none absolute bottom-full left-0 z-50 mb-1 rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                  {suggestedZyklus.description}
                </span>
              </span>
            )}
            {suggestedFachbereich && (
              <span
                className="group relative inline-flex cursor-help items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                style={{
                  backgroundColor: `${suggestedFachbereich.color}15`,
                  color: suggestedFachbereich.color,
                }}
              >
                <span style={{ opacity: 0.7 }}>{t("sidebar.smartSearchSubject")}</span>
                {suggestedFachbereich.shortName}
                {/* Tooltip */}
                <span className="bg-text text-bg pointer-events-none absolute bottom-full left-0 z-50 mb-1 rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                  {suggestedFachbereich.name}
                </span>
              </span>
            )}
            {suggestions.kompetenzbereich && (
              <span
                className="group relative inline-flex cursor-help items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                style={{
                  backgroundColor: suggestedFachbereich
                    ? `${suggestedFachbereich.color}15`
                    : "#1e66f515",
                  color: suggestedFachbereich?.color || "#1e66f5",
                }}
              >
                <span style={{ opacity: 0.7 }}>{t("sidebar.smartSearchArea")}</span>
                {suggestions.kompetenzbereich}
                {/* Tooltip */}
                <span className="bg-text text-bg pointer-events-none absolute bottom-full left-0 z-50 mb-1 rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                  {(() => {
                    // Find the kompetenzbereich name from code
                    for (const fb of fachbereiche) {
                      const kb = fb.kompetenzbereiche.find(
                        (k) => k.code === suggestions.kompetenzbereich
                      );
                      if (kb) return kb.name;
                    }
                    return suggestions.kompetenzbereich;
                  })()}
                </span>
              </span>
            )}
          </div>

          {/* Apply button */}
          <motion.button
            onClick={onApply}
            className="bg-primary hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <ChevronRight className="h-4 w-4" />
            {t("sidebar.smartSearchApply")}
          </motion.button>

          {/* Remaining terms info */}
          {parsedQuery.remainingTerms.length > 0 && (
            <p className="text-text-muted mt-2 text-xs">
              {t("sidebar.smartSearchRemaining", { query: parsedQuery.remainingTerms.join(" ") })}
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default LP21FilterSidebar;
