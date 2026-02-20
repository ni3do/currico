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
  verifiedOnly: boolean;
  onVerifiedOnlyChange: (value: boolean) => void;
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
  verifiedOnly,
  onVerifiedOnlyChange,
  t,
}: MaterialFiltersProps) {
  return (
    <>
      <div className="divider my-5" />

      <CollapsibleSection title={t("sidebar.verifiedSellerLabel")} defaultOpen={verifiedOnly}>
        <div
          className="flex cursor-pointer items-center gap-3 py-1"
          onClick={() => onVerifiedOnlyChange(!verifiedOnly)}
        >
          <button
            type="button"
            role="switch"
            aria-checked={verifiedOnly}
            aria-label={t("sidebar.verifiedSellerToggle")}
            onClick={(e) => {
              e.stopPropagation();
              onVerifiedOnlyChange(!verifiedOnly);
            }}
            className="relative"
          >
            <div
              className={`h-6 w-11 rounded-full transition-colors ${verifiedOnly ? "bg-success" : "bg-border"}`}
            >
              <div
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${verifiedOnly ? "translate-x-5" : "translate-x-0.5"}`}
              />
            </div>
          </button>
          <span className="text-sm">{t("sidebar.verifiedSellerToggle")}</span>
        </div>
      </CollapsibleSection>

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
