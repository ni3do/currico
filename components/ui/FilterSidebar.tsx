"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight, Check, X } from "lucide-react";

// Filter configuration data
const CYCLES_WITH_GRADES = [
  {
    value: "1",
    labelKey: "cycle1",
    grades: [
      { value: "kg", labelKey: "kindergarten" },
      { value: "1", labelKey: "grade1" },
      { value: "2", labelKey: "grade2" },
    ],
  },
  {
    value: "2",
    labelKey: "cycle2",
    grades: [
      { value: "3", labelKey: "grade3" },
      { value: "4", labelKey: "grade4" },
      { value: "5", labelKey: "grade5" },
      { value: "6", labelKey: "grade6" },
    ],
  },
  {
    value: "3",
    labelKey: "cycle3",
    grades: [
      { value: "7", labelKey: "grade7" },
      { value: "8", labelKey: "grade8" },
      { value: "9", labelKey: "grade9" },
    ],
    hasNiveau: true,
  },
];

const NMG_SUBCATEGORIES = [
  { value: "nmg-nt", labelKey: "nt" },
  { value: "nmg-wah", labelKey: "wah" },
  { value: "nmg-rzg", labelKey: "rzg" },
  { value: "nmg-erg", labelKey: "erg" },
];

const SUBJECTS = [
  { value: "Deutsch", labelKey: "german", colorClass: "pill-deutsch" },
  { value: "Mathematik", labelKey: "math", colorClass: "pill-mathe" },
  { value: "NMG", labelKey: "nmg", colorClass: "pill-nmg", hasSubcategories: true },
  { value: "BG", labelKey: "arts", colorClass: "pill-gestalten" },
  { value: "TTG", labelKey: "ttg", colorClass: "pill-gestalten" },
  { value: "Musik", labelKey: "music", colorClass: "pill-musik" },
  { value: "Sport", labelKey: "sports", colorClass: "pill-sport" },
  { value: "Englisch", labelKey: "english", colorClass: "pill-fremdsprachen" },
  { value: "Franzoesisch", labelKey: "french", colorClass: "pill-fremdsprachen" },
  { value: "MI", labelKey: "mi", colorClass: "pill-medien" },
  { value: "BO", labelKey: "bo", colorClass: "pill-default" },
];

const MATERIAL_TYPES = [
  { value: "arbeitsblatt", labelKey: "worksheet" },
  { value: "lernkontrolle", labelKey: "test" },
  { value: "spiel", labelKey: "game" },
  { value: "unterrichtsplanung", labelKey: "lessonPlan" },
  { value: "praesentation", labelKey: "presentation" },
  { value: "merkblatt", labelKey: "factsheet" },
  { value: "werkstatt", labelKey: "station" },
];

const FORMAT_OPTIONS = [
  { value: "editierbar", labelKey: "editable" },
  { value: "pdf", labelKey: "pdf" },
  { value: "mit-loesungen", labelKey: "withSolutions" },
  { value: "differenziert", labelKey: "differentiated" },
];

const NIVEAU_OPTIONS = [
  { value: "grundlegend", labelKey: "basic" },
  { value: "erweitert", labelKey: "extended" },
];

export interface FilterState {
  subject: string;
  nmgSubcategory: string;
  cycle: string;
  grades: string[];
  niveau: string;
  materialTypes: string[];
  formats: string[];
  priceType: string;
}

interface FilterSidebarProps {
  selectedSubject: string;
  onSubjectChange: (value: string) => void;
  selectedCycle: string;
  onCycleChange: (value: string) => void;
  selectedPriceType: string;
  onPriceTypeChange: (value: string) => void;
  onReset: () => void;
  // New extended filter props
  selectedNmgSubcategory?: string;
  onNmgSubcategoryChange?: (value: string) => void;
  selectedGrades?: string[];
  onGradesChange?: (value: string[]) => void;
  selectedNiveau?: string;
  onNiveauChange?: (value: string) => void;
  selectedMaterialTypes?: string[];
  onMaterialTypesChange?: (value: string[]) => void;
  selectedFormats?: string[];
  onFormatsChange?: (value: string[]) => void;
}

export function FilterSidebar({
  selectedSubject,
  onSubjectChange,
  selectedCycle,
  onCycleChange,
  selectedPriceType,
  onPriceTypeChange,
  onReset,
  selectedNmgSubcategory = "",
  onNmgSubcategoryChange,
  selectedGrades = [],
  onGradesChange,
  selectedNiveau = "",
  onNiveauChange,
  selectedMaterialTypes = [],
  onMaterialTypesChange,
  selectedFormats = [],
  onFormatsChange,
}: FilterSidebarProps) {
  const t = useTranslations("resourcesPage");

  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState({
    subject: true,
    cycle: true,
    materialType: false,
    format: false,
    price: true,
  });

  // NMG subcategory expansion
  const [showNmgSubs, setShowNmgSubs] = useState(selectedSubject === "NMG");

  // Cycle grades expansion
  const [expandedCycles, setExpandedCycles] = useState<Record<string, boolean>>({
    "1": selectedCycle === "1",
    "2": selectedCycle === "2",
    "3": selectedCycle === "3",
  });

  const hasActiveFilters =
    selectedSubject ||
    selectedCycle ||
    selectedPriceType ||
    selectedNmgSubcategory ||
    selectedGrades.length > 0 ||
    selectedNiveau ||
    selectedMaterialTypes.length > 0 ||
    selectedFormats.length > 0;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSubjectChange = (value: string) => {
    onSubjectChange(value);
    if (value === "NMG") {
      setShowNmgSubs(true);
    } else {
      setShowNmgSubs(false);
      onNmgSubcategoryChange?.("");
    }
  };

  const handleCycleChange = (cycleValue: string) => {
    const isSelected = selectedCycle === cycleValue;
    onCycleChange(isSelected ? "" : cycleValue);

    // Expand the cycle to show grades
    if (!isSelected) {
      setExpandedCycles((prev) => ({ ...prev, [cycleValue]: true }));
    }

    // Clear grades if cycle is deselected
    if (isSelected) {
      onGradesChange?.([]);
      if (cycleValue === "3") {
        onNiveauChange?.("");
      }
    }
  };

  const handleGradeToggle = (grade: string) => {
    const newGrades = selectedGrades.includes(grade)
      ? selectedGrades.filter((g) => g !== grade)
      : [...selectedGrades, grade];
    onGradesChange?.(newGrades);
  };

  const handleMaterialTypeToggle = (type: string) => {
    const newTypes = selectedMaterialTypes.includes(type)
      ? selectedMaterialTypes.filter((t) => t !== type)
      : [...selectedMaterialTypes, type];
    onMaterialTypesChange?.(newTypes);
  };

  const handleFormatToggle = (format: string) => {
    const newFormats = selectedFormats.includes(format)
      ? selectedFormats.filter((f) => f !== format)
      : [...selectedFormats, format];
    onFormatsChange?.(newFormats);
  };

  const handleFullReset = () => {
    onReset();
    onNmgSubcategoryChange?.("");
    onGradesChange?.([]);
    onNiveauChange?.("");
    onMaterialTypesChange?.([]);
    onFormatsChange?.([]);
    setShowNmgSubs(false);
    setExpandedCycles({ "1": false, "2": false, "3": false });
  };

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
      "pill-default": "bg-gray-400",
    };
    return colorMap[pillClass ?? ""] || "";
  };

  return (
    <aside className="sticky top-24 h-fit rounded-lg bg-bg-secondary p-5">
      {/* Sidebar Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">{t("sidebar.title")}</h2>
        {hasActiveFilters && (
          <button
            onClick={handleFullReset}
            className="flex items-center gap-1 text-sm font-medium text-text-muted transition-colors hover:text-primary"
          >
            <X className="h-3 w-3" />
            {t("sidebar.reset")}
          </button>
        )}
      </div>

      {/* Subject Filter */}
      <FilterSection
        title={t("sidebar.subjectLabel")}
        isExpanded={expandedSections.subject}
        onToggle={() => toggleSection("subject")}
      >
        <div className="flex flex-col gap-1">
          <FilterOption
            label={t("search.subjectFilter.all")}
            isSelected={selectedSubject === ""}
            onClick={() => handleSubjectChange("")}
          />
          {SUBJECTS.map((subject) => (
            <div key={subject.value}>
              <FilterOption
                label={t(`search.subjectFilter.${subject.labelKey}`)}
                isSelected={selectedSubject === subject.value}
                onClick={() => handleSubjectChange(subject.value)}
                colorClass={subject.colorClass}
                hasExpander={subject.hasSubcategories}
                isExpanded={subject.value === "NMG" && showNmgSubs}
              />
              {/* NMG Subcategories */}
              {subject.value === "NMG" && showNmgSubs && selectedSubject === "NMG" && (
                <div className="ml-6 mt-1 flex flex-col gap-1 border-l-2 border-surface-hover pl-3">
                  {NMG_SUBCATEGORIES.map((sub) => (
                    <FilterOption
                      key={sub.value}
                      label={t(`search.nmgSubcategories.${sub.labelKey}`)}
                      isSelected={selectedNmgSubcategory === sub.value}
                      onClick={() => onNmgSubcategoryChange?.(
                        selectedNmgSubcategory === sub.value ? "" : sub.value
                      )}
                      size="small"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Divider */}
      <div className="divider mb-6" />

      {/* Cycle/Level Filter with Grades */}
      <FilterSection
        title={t("sidebar.cycleLabel")}
        isExpanded={expandedSections.cycle}
        onToggle={() => toggleSection("cycle")}
      >
        <div className="flex flex-col gap-1">
          <FilterOption
            label={t("advancedFilters.cycleFilter.all")}
            isSelected={selectedCycle === ""}
            onClick={() => {
              onCycleChange("");
              onGradesChange?.([]);
              onNiveauChange?.("");
            }}
          />
          {CYCLES_WITH_GRADES.map((cycle) => (
            <div key={cycle.value}>
              <FilterOption
                label={t(`advancedFilters.cycleFilter.${cycle.labelKey}`)}
                isSelected={selectedCycle === cycle.value}
                onClick={() => handleCycleChange(cycle.value)}
                hasExpander
                isExpanded={expandedCycles[cycle.value]}
                onExpanderClick={() =>
                  setExpandedCycles((prev) => ({
                    ...prev,
                    [cycle.value]: !prev[cycle.value],
                  }))
                }
              />
              {/* Grade checkboxes */}
              {expandedCycles[cycle.value] && (
                <div className="ml-6 mt-1 flex flex-col gap-1 border-l-2 border-surface-hover pl-3">
                  {cycle.grades.map((grade) => (
                    <CheckboxOption
                      key={grade.value}
                      label={t(`advancedFilters.grades.${grade.labelKey}`)}
                      isChecked={selectedGrades.includes(grade.value)}
                      onChange={() => handleGradeToggle(grade.value)}
                    />
                  ))}
                  {/* Niveau options for Zyklus 3 */}
                  {cycle.hasNiveau && selectedCycle === "3" && (
                    <div className="mt-2 border-t border-surface-hover pt-2">
                      <span className="mb-1 block text-xs font-medium text-text-muted">
                        {t("advancedFilters.niveauFilter.label")}
                      </span>
                      {NIVEAU_OPTIONS.map((niveau) => (
                        <FilterOption
                          key={niveau.value}
                          label={t(`advancedFilters.niveauFilter.${niveau.labelKey}`)}
                          isSelected={selectedNiveau === niveau.value}
                          onClick={() =>
                            onNiveauChange?.(
                              selectedNiveau === niveau.value ? "" : niveau.value
                            )
                          }
                          size="small"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Divider */}
      <div className="divider mb-6" />

      {/* Material Type Filter */}
      <FilterSection
        title={t("sidebar.materialTypeLabel")}
        isExpanded={expandedSections.materialType}
        onToggle={() => toggleSection("materialType")}
        badge={selectedMaterialTypes.length > 0 ? selectedMaterialTypes.length : undefined}
      >
        <div className="flex flex-col gap-1">
          {MATERIAL_TYPES.map((type) => (
            <CheckboxOption
              key={type.value}
              label={t(`advancedFilters.materialTypes.${type.labelKey}`)}
              isChecked={selectedMaterialTypes.includes(type.value)}
              onChange={() => handleMaterialTypeToggle(type.value)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Divider */}
      <div className="divider mb-6" />

      {/* Format & Properties Filter */}
      <FilterSection
        title={t("sidebar.formatLabel")}
        isExpanded={expandedSections.format}
        onToggle={() => toggleSection("format")}
        badge={selectedFormats.length > 0 ? selectedFormats.length : undefined}
      >
        <div className="flex flex-col gap-1">
          {FORMAT_OPTIONS.map((format) => (
            <CheckboxOption
              key={format.value}
              label={t(`advancedFilters.formats.${format.labelKey}`)}
              isChecked={selectedFormats.includes(format.value)}
              onChange={() => handleFormatToggle(format.value)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Divider */}
      <div className="divider mb-6" />

      {/* Price Filter */}
      <FilterSection
        title={t("sidebar.priceLabel")}
        isExpanded={expandedSections.price}
        onToggle={() => toggleSection("price")}
      >
        <div className="flex flex-col gap-1">
          <FilterOption
            label={t("advancedFilters.priceFilter.all")}
            isSelected={selectedPriceType === ""}
            onClick={() => onPriceTypeChange("")}
          />
          <FilterOption
            label={t("advancedFilters.priceFilter.free")}
            isSelected={selectedPriceType === "free"}
            onClick={() => onPriceTypeChange("free")}
          />
          <FilterOption
            label={t("advancedFilters.priceFilter.paid")}
            isSelected={selectedPriceType === "paid"}
            onClick={() => onPriceTypeChange("paid")}
          />
        </div>
      </FilterSection>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <>
          <div className="divider mb-4" />
          <ActiveFilterChips
            selectedSubject={selectedSubject}
            selectedNmgSubcategory={selectedNmgSubcategory}
            selectedCycle={selectedCycle}
            selectedGrades={selectedGrades}
            selectedNiveau={selectedNiveau}
            selectedMaterialTypes={selectedMaterialTypes}
            selectedFormats={selectedFormats}
            selectedPriceType={selectedPriceType}
            onRemoveSubject={() => handleSubjectChange("")}
            onRemoveNmgSub={() => onNmgSubcategoryChange?.("")}
            onRemoveCycle={() => {
              onCycleChange("");
              onGradesChange?.([]);
              onNiveauChange?.("");
            }}
            onRemoveGrade={(grade) => handleGradeToggle(grade)}
            onRemoveNiveau={() => onNiveauChange?.("")}
            onRemoveMaterialType={(type) => handleMaterialTypeToggle(type)}
            onRemoveFormat={(format) => handleFormatToggle(format)}
            onRemovePriceType={() => onPriceTypeChange("")}
            t={t}
          />
        </>
      )}
    </aside>
  );
}

// Collapsible Section Component
interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: number;
}

function FilterSection({ title, isExpanded, onToggle, children, badge }: FilterSectionProps) {
  return (
    <div className="mb-6">
      <button
        onClick={onToggle}
        className="mb-3 flex w-full items-center justify-between"
      >
        <span className="label-meta flex items-center gap-2">
          {title}
          {badge !== undefined && (
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs text-white">
              {badge}
            </span>
          )}
        </span>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-text-muted" />
        ) : (
          <ChevronRight className="h-4 w-4 text-text-muted" />
        )}
      </button>
      {isExpanded && children}
    </div>
  );
}

// Filter Option Component (radio-like)
interface FilterOptionProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  colorClass?: string;
  size?: "normal" | "small";
  hasExpander?: boolean;
  isExpanded?: boolean;
  onExpanderClick?: () => void;
}

function FilterOption({
  label,
  isSelected,
  onClick,
  colorClass,
  size = "normal",
  hasExpander,
  isExpanded,
  onExpanderClick,
}: FilterOptionProps) {
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
      "pill-default": "bg-gray-400",
    };
    return colorMap[pillClass ?? ""] || "";
  };

  return (
    <div className="flex items-center">
      {hasExpander && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExpanderClick?.();
          }}
          className="mr-1 p-0.5 text-text-muted hover:text-text"
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>
      )}
      <button
        onClick={onClick}
        className={`flex flex-1 items-center gap-2 rounded-md px-3 text-left font-medium transition-all ${
          size === "small" ? "py-1.5 text-xs" : "py-2 text-sm"
        } ${
          isSelected
            ? "bg-surface text-text"
            : "text-text-secondary hover:bg-surface-hover hover:text-text"
        }`}
      >
        {colorClass && (
          <span className={`h-2.5 w-2.5 rounded-full ${getColorDotClass(colorClass)}`} />
        )}
        <span className="flex-1">{label}</span>
        {isSelected && <Check className="h-4 w-4 text-primary" />}
      </button>
    </div>
  );
}

// Checkbox Option Component (for multi-select)
interface CheckboxOptionProps {
  label: string;
  isChecked: boolean;
  onChange: () => void;
}

function CheckboxOption({ label, isChecked, onChange }: CheckboxOptionProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-surface-hover">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={onChange}
        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
      />
      <span className={isChecked ? "font-medium text-text" : "text-text-secondary"}>
        {label}
      </span>
    </label>
  );
}

// Active Filter Chips Component
interface ActiveFilterChipsProps {
  selectedSubject: string;
  selectedNmgSubcategory: string;
  selectedCycle: string;
  selectedGrades: string[];
  selectedNiveau: string;
  selectedMaterialTypes: string[];
  selectedFormats: string[];
  selectedPriceType: string;
  onRemoveSubject: () => void;
  onRemoveNmgSub: () => void;
  onRemoveCycle: () => void;
  onRemoveGrade: (grade: string) => void;
  onRemoveNiveau: () => void;
  onRemoveMaterialType: (type: string) => void;
  onRemoveFormat: (format: string) => void;
  onRemovePriceType: () => void;
  t: ReturnType<typeof useTranslations>;
}

function ActiveFilterChips({
  selectedSubject,
  selectedNmgSubcategory,
  selectedCycle,
  selectedGrades,
  selectedNiveau,
  selectedMaterialTypes,
  selectedFormats,
  selectedPriceType,
  onRemoveSubject,
  onRemoveNmgSub,
  onRemoveCycle,
  onRemoveGrade,
  onRemoveNiveau,
  onRemoveMaterialType,
  onRemoveFormat,
  onRemovePriceType,
  t,
}: ActiveFilterChipsProps) {
  const subjectLabels: Record<string, string> = {
    Deutsch: t("search.subjectFilter.german"),
    Mathematik: t("search.subjectFilter.math"),
    NMG: t("search.subjectFilter.nmg"),
    BG: t("search.subjectFilter.arts"),
    TTG: t("search.subjectFilter.ttg"),
    Musik: t("search.subjectFilter.music"),
    Sport: t("search.subjectFilter.sports"),
    Englisch: t("search.subjectFilter.english"),
    Franzoesisch: t("search.subjectFilter.french"),
    MI: t("search.subjectFilter.mi"),
    BO: t("search.subjectFilter.bo"),
  };

  return (
    <div className="flex flex-wrap gap-2">
      {selectedSubject && (
        <Chip label={subjectLabels[selectedSubject] || selectedSubject} onRemove={onRemoveSubject} />
      )}
      {selectedNmgSubcategory && (
        <Chip
          label={t(`search.nmgSubcategories.${selectedNmgSubcategory.replace("nmg-", "")}`)}
          onRemove={onRemoveNmgSub}
        />
      )}
      {selectedCycle && (
        <Chip
          label={t(`advancedFilters.cycleFilter.cycle${selectedCycle}`)}
          onRemove={onRemoveCycle}
        />
      )}
      {selectedGrades.map((grade) => (
        <Chip
          key={grade}
          label={t(`advancedFilters.grades.${grade === "kg" ? "kindergarten" : `grade${grade}`}`)}
          onRemove={() => onRemoveGrade(grade)}
        />
      ))}
      {selectedNiveau && (
        <Chip
          label={t(`advancedFilters.niveauFilter.${selectedNiveau === "grundlegend" ? "basic" : "extended"}`)}
          onRemove={onRemoveNiveau}
        />
      )}
      {selectedMaterialTypes.map((type) => (
        <Chip
          key={type}
          label={t(`advancedFilters.materialTypes.${type === "arbeitsblatt" ? "worksheet" : type === "lernkontrolle" ? "test" : type === "spiel" ? "game" : type === "unterrichtsplanung" ? "lessonPlan" : type === "praesentation" ? "presentation" : type === "merkblatt" ? "factsheet" : "station"}`)}
          onRemove={() => onRemoveMaterialType(type)}
        />
      ))}
      {selectedFormats.map((format) => (
        <Chip
          key={format}
          label={t(`advancedFilters.formats.${format === "editierbar" ? "editable" : format === "pdf" ? "pdf" : format === "mit-loesungen" ? "withSolutions" : "differentiated"}`)}
          onRemove={() => onRemoveFormat(format)}
        />
      ))}
      {selectedPriceType && (
        <Chip
          label={t(`advancedFilters.priceFilter.${selectedPriceType}`)}
          onRemove={onRemovePriceType}
        />
      )}
    </div>
  );
}

// Chip Component
interface ChipProps {
  label: string;
  onRemove: () => void;
}

function Chip({ label, onRemove }: ChipProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

export default FilterSidebar;
