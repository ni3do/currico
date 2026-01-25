"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export type PreviewType = "watermark" | "pages";

interface PreviewBadgeProps {
  type: PreviewType;
  pageCount?: number;
  showTooltip?: boolean;
  className?: string;
}

export function PreviewBadge({
  type,
  pageCount = 2,
  showTooltip = true,
  className = "",
}: PreviewBadgeProps) {
  const t = useTranslations("previewBadge");
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const isWatermark = type === "watermark";

  const badgeClass = isWatermark
    ? "preview-badge preview-badge-watermark"
    : "preview-badge preview-badge-pages";

  const label = isWatermark
    ? t("watermark.label")
    : t("pages.label", { count: pageCount });

  const tooltip = isWatermark
    ? t("watermark.tooltip")
    : t("pages.tooltip", { count: pageCount });

  return (
    <div className={`relative inline-block ${className}`}>
      <span
        className={badgeClass}
        onMouseEnter={() => showTooltip && setIsTooltipVisible(true)}
        onMouseLeave={() => setIsTooltipVisible(false)}
        onFocus={() => showTooltip && setIsTooltipVisible(true)}
        onBlur={() => setIsTooltipVisible(false)}
        tabIndex={0}
        role="note"
        aria-label={`${label}: ${tooltip}`}
      >
        {isWatermark ? (
          <WatermarkIcon className="h-3.5 w-3.5" />
        ) : (
          <PagesIcon className="h-3.5 w-3.5" />
        )}
        <span>{label}</span>
      </span>

      {/* Tooltip */}
      {showTooltip && isTooltipVisible && (
        <div
          className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-secondary shadow-lg"
          role="tooltip"
        >
          {tooltip}
          {/* Arrow */}
          <div className="absolute left-1/2 top-full -translate-x-1/2">
            <div className="border-4 border-transparent border-t-border" />
            <div className="absolute -top-px left-1/2 -translate-x-1/2 border-4 border-transparent border-t-surface" />
          </div>
        </div>
      )}
    </div>
  );
}

// Watermark Icon - Eye with lock overlay
function WatermarkIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
      {/* Small lock indicator */}
      <rect x="16" y="14" width="6" height="5" rx="1" fill="currentColor" stroke="none" />
      <path d="M17.5 14v-1.5a1.5 1.5 0 013 0V14" strokeWidth={1.5} />
    </svg>
  );
}

// Pages Icon - Document with folded corner
function PagesIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Back page */}
      <path d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2v-1" opacity="0.5" />
      {/* Front page */}
      <path d="M14 2H10a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V8l-6-6z" />
      {/* Folded corner */}
      <path d="M14 2v6h6" />
      {/* Lines on page */}
      <line x1="11" y1="11" x2="17" y2="11" opacity="0.5" />
      <line x1="11" y1="14" x2="15" y2="14" opacity="0.5" />
    </svg>
  );
}

// Compound component for use in product cards
interface PreviewButtonWithBadgeProps {
  previewType: PreviewType;
  pageCount?: number;
  onClick?: () => void;
  buttonText?: string;
  className?: string;
}

export function PreviewButtonWithBadge({
  previewType,
  pageCount = 2,
  onClick,
  buttonText,
  className = "",
}: PreviewButtonWithBadgeProps) {
  const t = useTranslations("previewBadge");

  return (
    <div className={`flex flex-col items-start gap-2 ${className}`}>
      <button
        onClick={onClick}
        className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <span>{buttonText || t("buttonText")}</span>
      </button>
      <PreviewBadge type={previewType} pageCount={pageCount} />
    </div>
  );
}

// Inline badge variant for compact layouts
interface InlinePreviewInfoProps {
  previewType: PreviewType;
  pageCount?: number;
  className?: string;
}

export function InlinePreviewInfo({
  previewType,
  pageCount = 2,
  className = "",
}: InlinePreviewInfoProps) {
  const t = useTranslations("previewBadge");
  const isWatermark = previewType === "watermark";

  return (
    <div
      className={`flex items-center gap-1.5 text-xs text-text-muted ${className}`}
    >
      {isWatermark ? (
        <>
          <WatermarkIcon className="h-3 w-3" />
          <span>{t("watermark.inline")}</span>
        </>
      ) : (
        <>
          <PagesIcon className="h-3 w-3" />
          <span>{t("pages.inline", { count: pageCount })}</span>
        </>
      )}
    </div>
  );
}

export default PreviewBadge;
