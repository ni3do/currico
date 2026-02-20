"use client";

import { useState } from "react";
import type { useTranslations } from "next-intl";
import { X } from "lucide-react";
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
  tags: string[];
  onTagToggle: (tag: string) => void;
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
  tags,
  onTagToggle,
  verifiedOnly,
  onVerifiedOnlyChange,
  t,
}: MaterialFiltersProps) {
  const [tagInput, setTagInput] = useState("");

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = tagInput.toLowerCase().trim();
      if (value.length >= 2 && !tags.includes(value)) {
        onTagToggle(value);
      }
      setTagInput("");
    }
  };

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

      <CollapsibleSection title={t("sidebar.tagSectionLabel")} defaultOpen={tags.length > 0}>
        <div className="space-y-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder={t("sidebar.tagFilterPlaceholder")}
            className="input-field w-full text-sm"
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onTagToggle(tag)}
                  className="bg-primary/10 text-primary hover:bg-primary/20 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
                >
                  #{tag}
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          )}
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
