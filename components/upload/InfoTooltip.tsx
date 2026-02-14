"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { useTranslations } from "next-intl";
import { Info } from "lucide-react";

interface InfoTooltipProps {
  content: string;
  example?: string;
  className?: string;
}

export function InfoTooltip({ content, example, className = "" }: InfoTooltipProps) {
  const t = useTranslations("uploadWizard.tooltips");
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape key
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        className="text-text-muted hover:text-info hover:bg-info/10 focus-visible:ring-primary/30 rounded-full p-0.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
        aria-label={t("moreInfo")}
        aria-expanded={isOpen}
        aria-describedby={tooltipId}
      >
        <Info className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          ref={tooltipRef}
          id={tooltipId}
          className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 sm:w-72"
          role="tooltip"
        >
          <div className="border-border bg-surface-elevated rounded-xl border p-3 shadow-xl">
            <p className="text-text text-sm">{content}</p>
            {example && (
              <div className="bg-bg mt-2 rounded-lg px-3 py-2">
                <span className="text-text-muted text-xs">{t("example")} </span>
                <span className="text-text text-xs font-medium">{example}</span>
              </div>
            )}
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2">
            <div className="border-t-surface-elevated border-8 border-transparent" />
          </div>
        </div>
      )}
    </div>
  );
}

// Tooltip key mapping for all upload form fields.
// Values reference keys in uploadWizard.tooltips namespace.
export const FIELD_TOOLTIP_KEYS: Record<string, { contentKey: string; exampleKey?: string }> = {
  title: { contentKey: "title", exampleKey: "titleExample" },
  description: { contentKey: "description", exampleKey: "descriptionExample" },
  language: { contentKey: "language" },
  resourceType: { contentKey: "materialType" },
  cycle: { contentKey: "cycle" },
  subject: { contentKey: "subject" },
  canton: { contentKey: "canton" },
  competencies: { contentKey: "competencies", exampleKey: "competenciesExample" },
  lehrmittel: { contentKey: "lehrmittel" },
  priceType: { contentKey: "priceType" },
  price: { contentKey: "price", exampleKey: "priceExample" },
  editable: { contentKey: "editable" },
  files: { contentKey: "files" },
  previewFiles: { contentKey: "preview" },
  legalOwnContent: { contentKey: "legalOwnContent" },
  legalNoTextbookScans: { contentKey: "legalNoTextbookScans" },
  legalNoTrademarks: { contentKey: "legalNoTrademarks" },
  legalSwissGerman: { contentKey: "legalSwissGerman" },
  legalTermsAccepted: { contentKey: "legalTermsAccepted" },
};

/**
 * Hook to get tooltip content and example from i18n.
 * Usage: const { content, example } = useFieldTooltip("title");
 */
export function useFieldTooltip(field: string) {
  const t = useTranslations("uploadWizard.tooltips");
  const keys = FIELD_TOOLTIP_KEYS[field];
  if (!keys) {
    if (field && process.env.NODE_ENV === "development") {
      console.warn(`useFieldTooltip: unknown field "${field}" — add it to FIELD_TOOLTIP_KEYS`);
    }
    return { content: "", example: undefined };
  }
  return {
    content: t(keys.contentKey),
    example: keys.exampleKey ? t(keys.exampleKey) : undefined,
  };
}
