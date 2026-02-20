"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { useCurriculum } from "@/lib/hooks/useCurriculum";
import type { LP21FilterState } from "@/lib/types/search";
import { useSearchInput, useFilterHandlers } from "./hooks";
import {
  CollapsibleSection,
  SearchTypeTabs,
  ZyklusToggle,
  SmartSearchSuggestions,
  SearchInput,
  FachbereichTree,
  MaterialFilters,
} from "./filters";

// Re-export for backward compatibility
export type { LP21FilterState } from "@/lib/types/search";
export { CANTON_ABBREVS } from "./filters/CantonFilter";

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

  // Search input state (debounced query, focus, smart parse)
  const {
    localSearchQuery,
    searchFocused,
    setSearchFocused,
    handleSearchChange,
    parsedQuery,
    setParsedQuery,
  } = useSearchInput(filters, onFiltersChange);

  // All filter handlers + accordion UI state
  const {
    expandedFachbereiche,
    expandedKompetenzbereiche,
    hasActiveFilters,
    handleToggleMaterials,
    handleToggleCreators,
    handleZyklusChange,
    handleFachbereichChange,
    handleKompetenzbereichChange,
    handleKompetenzChange,
    handleApplySmartSearch,
    handleSearchResultSelect,
    handleClearAll,
    toggleFachbereichExpansion,
    toggleKompetenzbereichExpansion,
    handleFormatToggle,
    handleTagToggle,
  } = useFilterHandlers({
    filters,
    onFiltersChange,
    getFachbereicheByZyklus,
    parsedQuery,
    setParsedQuery,
  });

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

        {/* Search Type Tabs */}
        <SearchTypeTabs
          showMaterials={filters.showMaterials}
          showCreators={filters.showCreators}
          onToggleMaterials={handleToggleMaterials}
          onToggleCreators={handleToggleCreators}
          t={t}
        />

        <div className="divider my-5" />

        {/* Search Input */}
        <SearchInput
          localSearchQuery={localSearchQuery}
          searchFocused={searchFocused}
          setSearchFocused={setSearchFocused}
          handleSearchChange={handleSearchChange}
          searchResults={searchResults}
          onResultSelect={handleSearchResultSelect}
          placeholder={
            filters.showCreators
              ? t("sidebar.searchPlaceholderProfiles")
              : t("sidebar.searchPlaceholderDefault")
          }
          t={t}
        />

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
          <FachbereichTree
            fachbereiche={availableFachbereiche}
            loading={curriculumLoading}
            error={curriculumError}
            selectedFachbereich={filters.fachbereich}
            selectedKompetenzbereich={filters.kompetenzbereich}
            selectedKompetenz={filters.kompetenz}
            expandedFachbereiche={expandedFachbereiche}
            expandedKompetenzbereiche={expandedKompetenzbereiche}
            onFachbereichChange={handleFachbereichChange}
            onToggleFachbereichExpansion={toggleFachbereichExpansion}
            onKompetenzbereichSelect={handleKompetenzbereichChange}
            onKompetenzbereichToggle={toggleKompetenzbereichExpansion}
            onKompetenzSelect={handleKompetenzChange}
            errorLabel={t("sidebar.loadingError")}
            expandLabel={t("sidebar.expand")}
            collapseLabel={t("sidebar.collapse")}
            sonstigeLabel={t("sidebar.sonstigeLabel")}
            sonstigeDescription={t("sidebar.sonstigeDescription")}
          />
        </CollapsibleSection>

        {/* Material-specific filters (price, format, dialect, canton) */}
        {filters.showMaterials && (
          <MaterialFilters
            maxPrice={filters.maxPrice}
            onMaxPriceChange={(maxPrice) => onFiltersChange({ ...filters, maxPrice })}
            formats={filters.formats}
            onFormatToggle={handleFormatToggle}
            dialect={filters.dialect}
            onDialectChange={(dialect) => onFiltersChange({ ...filters, dialect })}
            cantons={filters.cantons}
            onCantonsChange={(cantons) => onFiltersChange({ ...filters, cantons })}
            tags={filters.tags}
            onTagToggle={handleTagToggle}
            verifiedOnly={filters.verifiedOnly}
            onVerifiedOnlyChange={(v) => onFiltersChange({ ...filters, verifiedOnly: v })}
            t={t}
          />
        )}
      </div>
    </aside>
  );
}

export default LP21FilterSidebar;
