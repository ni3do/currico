"use client";

import type { useTranslations } from "next-intl";
import { CollapsibleSection } from "./CollapsibleSection";
import { PriceFilter } from "./PriceFilter";
import { FormatFilter } from "./FormatFilter";
import { DialectToggle } from "./DialectToggle";
import { CantonFilter } from "./CantonFilter";

interface MaterialFiltersProps {
  maxPrice: number | null;
  onMaxPriceChange: (maxPrice: number | null) => void;
  formats: string[];
  onFormatToggle: (formatId: string) => void;
  dialect: string | null;
  onDialectChange: (dialect: string | null) => void;
  cantons: string[];
  onCantonsChange: (cantons: string[]) => void;
  t: ReturnType<typeof useTranslations>;
}

export function MaterialFilters({
  maxPrice,
  onMaxPriceChange,
  formats,
  onFormatToggle,
  dialect,
  onDialectChange,
  cantons,
  onCantonsChange,
  t,
}: MaterialFiltersProps) {
  return (
    <>
      <div className="divider my-5" />

      <CollapsibleSection title={t("sidebar.priceSectionLabel")} defaultOpen={false}>
        <PriceFilter maxPrice={maxPrice} onMaxPriceChange={onMaxPriceChange} t={t} />
      </CollapsibleSection>

      <div className="divider my-5" />

      <CollapsibleSection title={t("sidebar.formatSectionLabel")} defaultOpen={false}>
        <FormatFilter selectedFormats={formats} onFormatToggle={onFormatToggle} t={t} />
      </CollapsibleSection>

      <div className="divider my-5" />

      <CollapsibleSection title={t("sidebar.dialectLabel")} defaultOpen={false}>
        <DialectToggle selectedDialect={dialect} onDialectChange={onDialectChange} t={t} />
      </CollapsibleSection>

      <div className="divider my-5" />

      <CollapsibleSection title={t("sidebar.cantonSectionLabel")} defaultOpen={false}>
        <CantonFilter selectedCantons={cantons} onCantonsChange={onCantonsChange} t={t} />
      </CollapsibleSection>
    </>
  );
}
