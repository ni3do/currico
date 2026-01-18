"use client";

import { useTranslations } from "next-intl";

interface FilterSidebarProps {
  selectedSubject: string;
  onSubjectChange: (value: string) => void;
  selectedCycle: string;
  onCycleChange: (value: string) => void;
  selectedPriceType: string;
  onPriceTypeChange: (value: string) => void;
  onReset: () => void;
}

export function FilterSidebar({
  selectedSubject,
  onSubjectChange,
  selectedCycle,
  onCycleChange,
  selectedPriceType,
  onPriceTypeChange,
  onReset,
}: FilterSidebarProps) {
  const t = useTranslations("resourcesPage");

  const hasActiveFilters = selectedSubject || selectedCycle || selectedPriceType;

  return (
    <aside className="sticky top-24 h-fit rounded-lg bg-bg-secondary p-5">
      {/* Sidebar Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">
          {t("sidebar.title")}
        </h2>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-sm font-medium text-text-muted transition-colors hover:text-primary"
          >
            {t("sidebar.reset")}
          </button>
        )}
      </div>

      {/* Subject Filter */}
      <div className="mb-6">
        <label className="label-meta mb-3 block">
          {t("sidebar.subjectLabel")}
        </label>
        <div className="flex flex-col gap-2">
          <FilterOption
            value=""
            label={t("search.subjectFilter.all")}
            isSelected={selectedSubject === ""}
            onClick={() => onSubjectChange("")}
          />
          <FilterOption
            value="Deutsch"
            label={t("search.subjectFilter.german")}
            isSelected={selectedSubject === "Deutsch"}
            onClick={() => onSubjectChange("Deutsch")}
            colorClass="pill-deutsch"
          />
          <FilterOption
            value="Mathematik"
            label={t("search.subjectFilter.math")}
            isSelected={selectedSubject === "Mathematik"}
            onClick={() => onSubjectChange("Mathematik")}
            colorClass="pill-mathe"
          />
          <FilterOption
            value="NMG"
            label={t("search.subjectFilter.nmg")}
            isSelected={selectedSubject === "NMG"}
            onClick={() => onSubjectChange("NMG")}
            colorClass="pill-nmg"
          />
          <FilterOption
            value="BG"
            label={t("search.subjectFilter.arts")}
            isSelected={selectedSubject === "BG"}
            onClick={() => onSubjectChange("BG")}
            colorClass="pill-gestalten"
          />
          <FilterOption
            value="Musik"
            label={t("search.subjectFilter.music")}
            isSelected={selectedSubject === "Musik"}
            onClick={() => onSubjectChange("Musik")}
            colorClass="pill-musik"
          />
          <FilterOption
            value="Sport"
            label={t("search.subjectFilter.sports")}
            isSelected={selectedSubject === "Sport"}
            onClick={() => onSubjectChange("Sport")}
            colorClass="pill-sport"
          />
          <FilterOption
            value="Englisch"
            label={t("search.subjectFilter.english")}
            isSelected={selectedSubject === "Englisch"}
            onClick={() => onSubjectChange("Englisch")}
            colorClass="pill-fremdsprachen"
          />
          <FilterOption
            value="Franzosisch"
            label={t("search.subjectFilter.french")}
            isSelected={selectedSubject === "Franzosisch"}
            onClick={() => onSubjectChange("Franzosisch")}
            colorClass="pill-fremdsprachen"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="divider mb-6" />

      {/* Cycle/Level Filter */}
      <div className="mb-6">
        <label className="label-meta mb-3 block">
          {t("sidebar.cycleLabel")}
        </label>
        <div className="flex flex-col gap-2">
          <FilterOption
            value=""
            label={t("advancedFilters.cycleFilter.all")}
            isSelected={selectedCycle === ""}
            onClick={() => onCycleChange("")}
          />
          <FilterOption
            value="1"
            label={t("advancedFilters.cycleFilter.cycle1")}
            isSelected={selectedCycle === "1"}
            onClick={() => onCycleChange("1")}
          />
          <FilterOption
            value="2"
            label={t("advancedFilters.cycleFilter.cycle2")}
            isSelected={selectedCycle === "2"}
            onClick={() => onCycleChange("2")}
          />
          <FilterOption
            value="3"
            label={t("advancedFilters.cycleFilter.cycle3")}
            isSelected={selectedCycle === "3"}
            onClick={() => onCycleChange("3")}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="divider mb-6" />

      {/* Price Filter */}
      <div>
        <label className="label-meta mb-3 block">
          {t("sidebar.priceLabel")}
        </label>
        <div className="flex flex-col gap-2">
          <FilterOption
            value=""
            label={t("advancedFilters.priceFilter.all")}
            isSelected={selectedPriceType === ""}
            onClick={() => onPriceTypeChange("")}
          />
          <FilterOption
            value="free"
            label={t("advancedFilters.priceFilter.free")}
            isSelected={selectedPriceType === "free"}
            onClick={() => onPriceTypeChange("free")}
          />
          <FilterOption
            value="paid"
            label={t("advancedFilters.priceFilter.paid")}
            isSelected={selectedPriceType === "paid"}
            onClick={() => onPriceTypeChange("paid")}
          />
        </div>
      </div>
    </aside>
  );
}

interface FilterOptionProps {
  value: string;
  label: string;
  isSelected: boolean;
  onClick: () => void;
  colorClass?: string;
}

function FilterOption({
  label,
  isSelected,
  onClick,
  colorClass,
}: FilterOptionProps) {
  // Map pill class to background color class
  const getColorDotClass = (pillClass?: string): string => {
    const colorMap: Record<string, string> = {
      "pill-deutsch": "bg-subject-deutsch",
      "pill-mathe": "bg-subject-mathe",
      "pill-nmg": "bg-subject-nmg",
      "pill-gestalten": "bg-subject-gestalten",
      "pill-musik": "bg-subject-musik",
      "pill-sport": "bg-subject-sport",
      "pill-fremdsprachen": "bg-subject-fremdsprachen",
      "pill-medien": "bg-subject-medien",
    };
    return colorMap[pillClass ?? ""] || "";
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-all ${
        isSelected
          ? "bg-surface text-text"
          : "text-text-secondary hover:bg-surface-hover hover:text-text"
      }`}
    >
      {colorClass && (
        <span className={`h-2.5 w-2.5 rounded-full ${getColorDotClass(colorClass)}`} />
      )}
      <span>{label}</span>
      {isSelected && (
        <svg
          className="ml-auto h-4 w-4 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </button>
  );
}

export default FilterSidebar;
