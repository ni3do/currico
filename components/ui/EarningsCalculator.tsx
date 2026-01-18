"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface EarningsCalculatorProps {
  className?: string;
}

export function EarningsCalculator({ className = "" }: EarningsCalculatorProps) {
  const t = useTranslations("earningsCalculator");

  const [materialsPerMonth, setMaterialsPerMonth] = useState(10);
  const [averagePrice, setAveragePrice] = useState(15);

  const COMMISSION_RATE = 0.70; // Seller keeps 70%

  const yearlyEarnings = useMemo(() => {
    return materialsPerMonth * averagePrice * 12 * COMMISSION_RATE;
  }, [materialsPerMonth, averagePrice]);

  const monthlyEarnings = useMemo(() => {
    return materialsPerMonth * averagePrice * COMMISSION_RATE;
  }, [materialsPerMonth, averagePrice]);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  return (
    <div className={`card p-6 lg:p-8 ${className}`}>
      {/* Header */}
      <div className="mb-6 text-center">
        <h3 className="text-xl font-semibold text-text lg:text-2xl">
          {t("title")}
        </h3>
        <p className="mt-2 text-sm text-text-muted">
          {t("subtitle")}
        </p>
      </div>

      {/* Sliders */}
      <div className="space-y-6">
        {/* Materials per Month Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-secondary">
              {t("materialsLabel")}
            </label>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              {materialsPerMonth}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={materialsPerMonth}
            onChange={(e) => setMaterialsPerMonth(Number(e.target.value))}
            className="earnings-slider w-full"
            aria-label={t("materialsLabel")}
          />
          <div className="flex justify-between text-xs text-text-muted">
            <span>1</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        {/* Average Price Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-secondary">
              {t("priceLabel")}
            </label>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              {formatCurrency(averagePrice)}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={averagePrice}
            onChange={(e) => setAveragePrice(Number(e.target.value))}
            className="earnings-slider w-full"
            aria-label={t("priceLabel")}
          />
          <div className="flex justify-between text-xs text-text-muted">
            <span>CHF 1</span>
            <span>CHF 25</span>
            <span>CHF 50</span>
          </div>
        </div>
      </div>

      {/* Earnings Display */}
      <div className="mt-8 rounded-xl bg-success/10 p-6 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-success">
          {t("yearlyEarnings")}
        </p>
        <p className="earnings-amount mt-2 text-4xl font-bold text-success lg:text-5xl">
          {formatCurrency(yearlyEarnings)}
        </p>
        <p className="mt-2 text-sm text-text-muted">
          {t("monthlyBreakdown", { amount: formatCurrency(monthlyEarnings) })}
        </p>
      </div>

      {/* Commission Info */}
      <div className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface p-3">
        <svg
          className="h-5 w-5 flex-shrink-0 text-success"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm text-text-secondary">
          {t("commissionNote")}
        </p>
      </div>

      {/* CTA Button */}
      <div className="mt-6 text-center">
        <Link
          href="/register"
          className="btn-action inline-flex items-center gap-2 px-6 py-3"
        >
          <span>{t("ctaButton")}</span>
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default EarningsCalculator;
