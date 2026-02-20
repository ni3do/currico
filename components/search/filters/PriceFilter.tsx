"use client";

import type { useTranslations } from "next-intl";

interface PriceFilterProps {
  maxPrice: number | null;
  onMaxPriceChange: (maxPrice: number | null) => void;
  t: ReturnType<typeof useTranslations>;
}

export function PriceFilter({ maxPrice, onMaxPriceChange, t }: PriceFilterProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor="price-range" className="text-text-muted text-xs font-medium">
          {t("sidebar.priceMaxLabel")}
        </label>
        <span className="text-text text-xs font-semibold">
          {maxPrice !== null ? `CHF ${maxPrice}` : t("sidebar.priceAll")}
        </span>
      </div>
      <input
        id="price-range"
        type="range"
        min={0}
        max={50}
        step={1}
        value={maxPrice ?? 50}
        onChange={(e) => {
          const val = parseInt(e.target.value, 10);
          onMaxPriceChange(val >= 50 ? null : val);
        }}
        aria-valuetext={maxPrice !== null ? `CHF ${maxPrice}` : t("sidebar.priceAll")}
        className="bg-surface-hover [&::-webkit-slider-thumb]:bg-primary accent-primary h-2 w-full cursor-pointer appearance-none rounded-lg [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
      />
      <div className="text-text-muted mt-0.5 flex justify-between text-xs">
        <span>CHF 0</span>
        <span>CHF 50+</span>
      </div>
    </div>
  );
}
