"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  ChevronDown,
  ChevronRight,
  X,
  Search,
  BookOpen,
  Calculator,
  Leaf,
  Globe,
  Palette,
  Scissors,
  Music,
  Activity,
  Monitor,
  Compass,
  FlaskConical,
  Briefcase,
  Map,
  Users,
  Tag,
  FileText,
  FileType,
  Presentation,
  Image,
  Table,
  Package,
  File,
  Loader2,
} from "lucide-react";
import { useCurriculum, ZYKLEN } from "@/lib/hooks/useCurriculum";
import type {
  Fachbereich,
  Kompetenzbereich,
  Kompetenz,
  CurriculumSearchResult,
} from "@/lib/curriculum-types";

// Icon mapping for Fachbereiche
const FACHBEREICH_ICONS: Record<string, React.ElementType> = {
  D: BookOpen,
  FS1E: Globe,
  FS2F: Globe,
  MA: Calculator,
  NMG: Leaf,
  NT: FlaskConical,
  WAH: Briefcase,
  RZG: Map,
  ERG: Users,
  BG: Palette,
  TTG: Scissors,
  MU: Music,
  BS: Activity,
  MI: Monitor,
  BO: Compass,
};

// Price options
const PRICE_OPTIONS = [
  { id: "free", label: "Kostenlos", value: 0 },
  { id: "under5", label: "< CHF 5", value: 5 },
  { id: "under10", label: "< CHF 10", value: 10 },
  { id: "under25", label: "< CHF 25", value: 25 },
] as const;

// Format options
const FORMAT_OPTIONS = [
  { id: "pdf", label: "PDF", icon: FileText },
  { id: "word", label: "Word", icon: FileType },
  { id: "ppt", label: "PowerPoint", icon: Presentation },
  { id: "excel", label: "Excel", icon: Table },
  { id: "image", label: "Bilder", icon: Image },
  { id: "canva", label: "Canva", icon: Palette },
] as const;

// Material scope options
const MATERIAL_SCOPE_OPTIONS = [
  { id: "single", label: "Einzelmaterial", icon: File },
  { id: "bundle", label: "Bundle", icon: Package },
] as const;

// Types for filter state
export interface LP21FilterState {
  zyklus: number | null;
  fachbereich: string | null;
  kompetenzbereich: string | null;
  kompetenz: string | null;
  searchQuery: string;
  // New filters
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
  const t = useTranslations("resourcesPage");

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

  // Get available Fachbereiche based on selected Zyklus
  const availableFachbereiche = useMemo(() => {
    if (filters.zyklus === null) {
      return fachbereiche;
    }
    return getFachbereicheByZyklus(filters.zyklus);
  }, [filters.zyklus, fachbereiche, getFachbereicheByZyklus]);

  // Search results
  const searchResults = useMemo(() => {
    if (!filters.searchQuery || filters.searchQuery.length < 2) {
      return [];
    }
    return searchByCode(filters.searchQuery).slice(0, 10);
  }, [filters.searchQuery, searchByCode]);

  // Check if any filters are active
  const hasActiveFilters =
    filters.zyklus !== null ||
    filters.fachbereich !== null ||
    filters.kompetenzbereich !== null ||
    filters.kompetenz !== null ||
    filters.searchQuery.length > 0 ||
    filters.priceType !== null ||
    filters.maxPrice !== null ||
    filters.formats.length > 0 ||
    filters.materialScope !== null;

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
      // Expand the Fachbereich when selected
      if (code && filters.fachbereich !== code) {
        setExpandedFachbereiche((prev) => new Set([...prev, code]));
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
      onFiltersChange({
        ...filters,
        searchQuery: query,
      });
    },
    [filters, onFiltersChange]
  );

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
          setExpandedFachbereiche((prev) => new Set([...prev, result.code]));
          break;
        case "kompetenzbereich":
          newFilters = {
            ...newFilters,
            zyklus: filters.zyklus ?? zyklusFromFb,
            fachbereich: result.fachbereich.code,
            kompetenzbereich: result.code,
            kompetenz: null,
          };
          setExpandedFachbereiche((prev) => new Set([...prev, result.fachbereich.code]));
          setExpandedKompetenzbereiche((prev) => new Set([...prev, result.code]));
          break;
        case "kompetenz":
          newFilters = {
            ...newFilters,
            zyklus: filters.zyklus ?? zyklusFromFb,
            fachbereich: result.fachbereich.code,
            kompetenzbereich: result.kompetenzbereich?.code ?? null,
            kompetenz: result.code,
          };
          setExpandedFachbereiche((prev) => new Set([...prev, result.fachbereich.code]));
          if (result.kompetenzbereich) {
            setExpandedKompetenzbereiche(
              (prev) => new Set([...prev, result.kompetenzbereich!.code])
            );
          }
          break;
      }

      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange]
  );

  const handleClearAll = useCallback(() => {
    onFiltersChange({
      zyklus: null,
      fachbereich: null,
      kompetenzbereich: null,
      kompetenz: null,
      searchQuery: "",
      priceType: null,
      maxPrice: null,
      formats: [],
      materialScope: null,
    });
    setExpandedFachbereiche(new Set());
    setExpandedKompetenzbereiche(new Set());
  }, [onFiltersChange]);

  const handleRemoveFilter = useCallback(
    (type: "zyklus" | "fachbereich" | "kompetenzbereich" | "kompetenz") => {
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
      }
    },
    [filters, onFiltersChange]
  );

  const toggleFachbereichExpansion = useCallback((code: string) => {
    setExpandedFachbereiche((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  }, []);

  const toggleKompetenzbereichExpansion = useCallback((code: string) => {
    setExpandedKompetenzbereiche((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
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

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <ActiveFilterChips
            filters={filters}
            fachbereiche={fachbereiche}
            onRemoveFilter={handleRemoveFilter}
          />
        )}

        {/* Search Input */}
        <div className="relative mb-5">
          <div className="relative">
            <Search className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder="Suche: Stichwort oder Code (z.B. MA.1.A)"
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
                        ? "Fach"
                        : result.type === "kompetenzbereich"
                          ? "Bereich"
                          : "Kompetenz"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Zyklus Toggle */}
        <ZyklusToggle selectedZyklus={filters.zyklus} onZyklusChange={handleZyklusChange} />

        <div className="divider my-5" />

        {/* Fachbereiche Tree */}
        <div className="space-y-2">
          <h3 className="label-meta mb-3">Fachbereich</h3>
          {curriculumLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="text-primary h-6 w-6 animate-spin" />
            </div>
          ) : curriculumError ? (
            <div className="text-error py-4 text-center text-sm">
              Fehler beim Laden der Fachbereiche
            </div>
          ) : (
            availableFachbereiche.map((fb) => (
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
              />
            ))
          )}
        </div>

        <div className="divider my-5" />

        {/* Price Filter */}
        <PriceFilter
          selectedPriceType={filters.priceType}
          maxPrice={filters.maxPrice}
          onPriceTypeChange={handlePriceTypeChange}
          onMaxPriceChange={handleMaxPriceChange}
        />

        <div className="divider my-5" />

        {/* Format Filter */}
        <FormatFilter selectedFormats={filters.formats} onFormatToggle={handleFormatToggle} />

        <div className="divider my-5" />

        {/* Material Scope Filter */}
        <MaterialScopeFilter
          selectedScope={filters.materialScope}
          onScopeChange={handleMaterialScopeChange}
        />
      </div>
    </aside>
  );
}

// ============ ZYKLUS TOGGLE ============
interface ZyklusToggleProps {
  selectedZyklus: number | null;
  onZyklusChange: (zyklus: number | null) => void;
}

function ZyklusToggle({ selectedZyklus, onZyklusChange }: ZyklusToggleProps) {
  return (
    <div>
      <h3 className="label-meta mb-3">Zyklus</h3>
      <div className="flex gap-2">
        {ZYKLEN.map((zyklus) => (
          <button
            key={zyklus.id}
            onClick={() => onZyklusChange(zyklus.id)}
            className={`group relative flex-1 rounded-lg border-2 px-3 py-2.5 text-center transition-all ${
              selectedZyklus === zyklus.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-bg text-text-secondary hover:border-primary/50 hover:bg-surface-hover"
            }`}
          >
            <div className="text-sm font-semibold">{zyklus.shortName}</div>
            <div
              className={`text-xs ${selectedZyklus === zyklus.id ? "text-primary/80" : "text-text-muted"}`}
            >
              {zyklus.id === 1 ? "KG-2" : zyklus.id === 2 ? "3-6" : "7-9"}
            </div>
            {/* Tooltip on hover */}
            <div className="bg-text text-bg pointer-events-none absolute -top-10 left-1/2 z-50 -translate-x-1/2 rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
              {zyklus.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============ ACTIVE FILTER CHIPS ============
interface ActiveFilterChipsProps {
  filters: LP21FilterState;
  fachbereiche: Fachbereich[];
  onRemoveFilter: (type: "zyklus" | "fachbereich" | "kompetenzbereich" | "kompetenz") => void;
}

function ActiveFilterChips({ filters, fachbereiche, onRemoveFilter }: ActiveFilterChipsProps) {
  const chips: {
    type: "zyklus" | "fachbereich" | "kompetenzbereich" | "kompetenz";
    label: string;
    color?: string;
  }[] = [];

  if (filters.zyklus !== null) {
    const zyklus = ZYKLEN.find((z) => z.id === filters.zyklus);
    if (zyklus) {
      chips.push({ type: "zyklus", label: zyklus.name });
    }
  }

  if (filters.fachbereich) {
    const fb = fachbereiche.find((f) => f.code === filters.fachbereich);
    if (fb) {
      chips.push({ type: "fachbereich", label: fb.shortName, color: fb.color });
    }
  }

  if (filters.kompetenzbereich) {
    chips.push({ type: "kompetenzbereich", label: filters.kompetenzbereich });
  }

  if (filters.kompetenz) {
    chips.push({ type: "kompetenz", label: filters.kompetenz });
  }

  if (chips.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {chips.map((chip) => (
        <span
          key={chip.type}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
          style={{
            backgroundColor: chip.color ? `${chip.color}20` : undefined,
            color: chip.color || undefined,
          }}
        >
          {!chip.color && (
            <span className="bg-primary/10 text-primary rounded-full px-2.5 py-1">
              {chip.label}
              <button
                onClick={() => onRemoveFilter(chip.type)}
                className="hover:bg-primary/20 ml-1.5 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {chip.color && (
            <>
              {chip.label}
              <button
                onClick={() => onRemoveFilter(chip.type)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-black/10"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          )}
        </span>
      ))}
    </div>
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
}: FachbereichAccordionProps) {
  const Icon = FACHBEREICH_ICONS[fachbereich.code] || BookOpen;

  return (
    <div
      className={`overflow-hidden rounded-lg border transition-all ${
        isSelected ? "border-transparent ring-2" : "border-border hover:border-border-subtle"
      }`}
      style={{
        ...(isSelected && {
          ringColor: fachbereich.color,
          backgroundColor: `${fachbereich.color}08`,
        }),
      }}
    >
      {/* Header with color strip/background */}
      <div
        className="relative flex items-stretch transition-all duration-200"
        style={{
          backgroundColor: isSelected ? `${fachbereich.color}25` : undefined,
        }}
      >
        {/* Color strip - expands when selected */}
        <div
          className="flex-shrink-0 transition-all duration-200"
          style={{
            backgroundColor: fachbereich.color,
            width: isSelected ? "6px" : "4px",
          }}
        />

        {/* Content */}
        <div className="flex flex-1 items-center">
          {/* Expand toggle */}
          <button
            onClick={onToggleExpand}
            className={`flex h-full items-center px-2 transition-colors ${
              isSelected ? "text-text hover:text-text" : "text-text-muted hover:text-text"
            }`}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {/* Main button */}
          <button onClick={onSelect} className="flex flex-1 items-center gap-2 py-2 pr-3 text-left">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-md transition-all duration-200"
              style={{
                backgroundColor: isSelected ? fachbereich.color : `${fachbereich.color}20`,
                color: isSelected ? "white" : fachbereich.color,
              }}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div
              className={`truncate text-sm font-semibold ${isSelected ? "" : "text-text"}`}
              style={isSelected ? { color: fachbereich.color } : undefined}
            >
              {fachbereich.name}
            </div>
          </button>
        </div>
      </div>

      {/* Expanded content - Kompetenzbereiche */}
      {isExpanded && (
        <div className="border-border bg-bg/50 border-t px-2 py-2">
          <div className="space-y-1">
            {fachbereich.kompetenzbereiche.map((kb) => (
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
              />
            ))}
          </div>
        </div>
      )}
    </div>
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
}: KompetenzbereichItemProps) {
  return (
    <div className="overflow-hidden rounded-md">
      <div
        className="flex items-stretch transition-all duration-200"
        style={{
          backgroundColor: isSelected ? `${fachbereichColor}20` : undefined,
        }}
      >
        {/* Color strip - full height, visible when selected */}
        <div
          className="flex-shrink-0 transition-all duration-200"
          style={{
            backgroundColor: isSelected ? fachbereichColor : "transparent",
            width: isSelected ? "4px" : "0px",
          }}
        />

        {/* Expand toggle */}
        <button
          onClick={onToggleExpand}
          className={`flex items-center px-1.5 transition-colors ${
            isSelected ? "text-text" : "text-text-muted hover:text-text"
          }`}
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Main button */}
        <button
          onClick={onSelect}
          className={`flex flex-1 items-center gap-2 py-1.5 pr-2 text-left text-sm transition-colors ${
            isSelected ? "" : "text-text-secondary hover:text-text"
          }`}
        >
          <span className="font-mono text-xs font-semibold" style={{ color: fachbereichColor }}>
            {kompetenzbereich.code}
          </span>
          <span
            className={`flex-1 truncate ${isSelected ? "font-medium" : ""}`}
            style={isSelected ? { color: fachbereichColor } : undefined}
          >
            {kompetenzbereich.name}
          </span>
        </button>
      </div>

      {/* Kompetenzen */}
      {isExpanded && kompetenzbereich.kompetenzen.length > 0 && (
        <div
          className="mt-1 ml-5 space-y-0.5 border-l-2 pl-3"
          style={{ borderColor: `${fachbereichColor}40` }}
        >
          {kompetenzbereich.kompetenzen.map((k) => {
            const isKompetenzSelected = selectedKompetenz === k.code;
            return (
              <div
                key={k.code}
                className="overflow-hidden rounded transition-all duration-200"
                style={{
                  backgroundColor: isKompetenzSelected ? `${fachbereichColor}15` : undefined,
                }}
              >
                <div className="flex items-stretch">
                  {/* Color strip for kompetenz */}
                  <div
                    className="flex-shrink-0 transition-all duration-200"
                    style={{
                      backgroundColor: isKompetenzSelected ? fachbereichColor : "transparent",
                      width: isKompetenzSelected ? "3px" : "0px",
                    }}
                  />
                  <button
                    onClick={() => onKompetenzSelect(k.code)}
                    className={`flex w-full items-center gap-2 px-2 py-1 text-left text-xs transition-colors ${
                      isKompetenzSelected ? "" : "text-text-muted hover:text-text"
                    }`}
                  >
                    <span className="font-mono font-medium" style={{ color: fachbereichColor }}>
                      {k.code}
                    </span>
                    <span
                      className={`flex-1 truncate ${isKompetenzSelected ? "font-medium" : ""}`}
                      style={isKompetenzSelected ? { color: fachbereichColor } : undefined}
                    >
                      {k.name}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============ PRICE FILTER ============
interface PriceFilterProps {
  selectedPriceType: string | null;
  maxPrice: number | null;
  onPriceTypeChange: (priceType: string | null) => void;
  onMaxPriceChange: (maxPrice: number) => void;
}

function PriceFilter({
  selectedPriceType,
  maxPrice,
  onPriceTypeChange,
  onMaxPriceChange,
}: PriceFilterProps) {
  // Calculate the effective value for display and slider position
  const effectiveValue = maxPrice ?? 100;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Tag className="text-text-muted h-4 w-4" />
        <h3 className="label-meta">Preis</h3>
      </div>

      {/* Price preset buttons */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {PRICE_OPTIONS.map((option) => {
          // Check if this option is selected based on priceType OR if slider matches the value
          const isSelected =
            selectedPriceType === option.id ||
            (selectedPriceType === null && maxPrice === option.value);
          return (
            <button
              key={option.id}
              onClick={() => onPriceTypeChange(option.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
                isSelected
                  ? "bg-primary text-white"
                  : "bg-surface border-border text-text-secondary hover:border-primary/50 hover:text-text border"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Price slider */}
      <div className="space-y-2">
        <div className="text-text-muted flex items-center justify-between text-xs">
          <span>Max. Preis</span>
          <span className="text-text font-medium transition-all duration-200">
            CHF {effectiveValue}
          </span>
        </div>
        <div className="relative">
          {/* Track background */}
          <div className="bg-surface-hover absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-lg" />
          {/* Filled track */}
          <div
            className="bg-primary absolute top-1/2 h-2 -translate-y-1/2 rounded-l-lg transition-all duration-200 ease-out"
            style={{ width: `${effectiveValue}%` }}
          />
          {/* Range input */}
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={effectiveValue}
            onChange={(e) => onMaxPriceChange(Number(e.target.value))}
            className="[&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:bg-primary relative z-10 h-2 w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:duration-200 [&::-moz-range-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:scale-110"
          />
        </div>
        <div className="text-text-faint flex justify-between text-xs">
          <span>CHF 0</span>
          <span>CHF 100</span>
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
    <div>
      <div className="mb-3 flex items-center gap-2">
        <FileText className="text-text-muted h-4 w-4" />
        <h3 className="label-meta">Format</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {FORMAT_OPTIONS.map((format) => {
          const Icon = format.icon;
          const isSelected = selectedFormats.includes(format.id);
          return (
            <button
              key={format.id}
              onClick={() => onFormatToggle(format.id)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-bg text-text-secondary hover:border-primary/50 hover:text-text"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{format.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============ MATERIAL SCOPE FILTER ============
interface MaterialScopeFilterProps {
  selectedScope: string | null;
  onScopeChange: (scope: string | null) => void;
}

function MaterialScopeFilter({ selectedScope, onScopeChange }: MaterialScopeFilterProps) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Package className="text-text-muted h-4 w-4" />
        <h3 className="label-meta">Materialumfang</h3>
      </div>

      <div className="flex gap-2">
        {MATERIAL_SCOPE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedScope === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onScopeChange(option.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-3 py-2.5 text-sm transition-all ${
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-bg text-text-secondary hover:border-primary/50 hover:text-text"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default LP21FilterSidebar;
