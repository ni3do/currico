"use client";

import { useCallback } from "react";
import { FileText, Users } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { useTranslations } from "next-intl";

interface SearchTypeTabsProps {
  showMaterials: boolean;
  showCreators: boolean;
  onToggleMaterials: () => void;
  onToggleCreators: () => void;
  t: ReturnType<typeof useTranslations>;
}

export function SearchTypeTabs({
  showMaterials,
  showCreators,
  onToggleMaterials,
  onToggleCreators,
  t,
}: SearchTypeTabsProps) {
  const prefersReducedMotion = useReducedMotion();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        if (showMaterials) onToggleCreators();
        else onToggleMaterials();
        // Move focus to the newly active tab
        const target = e.currentTarget.querySelector(
          '[aria-selected="true"]'
        ) as HTMLElement | null;
        requestAnimationFrame(() => {
          const next = e.currentTarget.querySelector(
            '[aria-selected="true"]'
          ) as HTMLElement | null;
          if (next && next !== target) next.focus();
        });
      }
    },
    [showMaterials, onToggleMaterials, onToggleCreators]
  );

  const hoverAnimation = prefersReducedMotion
    ? undefined
    : ({ scale: 1.015, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const } } as const);
  const tapAnimation = prefersReducedMotion
    ? undefined
    : ({ scale: 0.97, transition: { duration: 0.1 } } as const);

  return (
    <div>
      <h3 className="label-meta mb-3">{t("sidebar.displayLabel")}</h3>
      <div
        className="flex gap-2"
        role="tablist"
        aria-label={t("sidebar.displayLabel")}
        onKeyDown={handleKeyDown}
      >
        <motion.button
          role="tab"
          aria-selected={showMaterials}
          aria-controls="search-results-panel"
          tabIndex={showMaterials ? 0 : -1}
          onClick={onToggleMaterials}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-3 py-2.5 text-center transition-colors ${
            showMaterials
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-bg text-text-secondary hover:border-primary/50 hover:bg-surface-hover"
          }`}
          whileHover={hoverAnimation}
          whileTap={tapAnimation}
        >
          <FileText className="h-4 w-4" />
          <span className="text-sm font-semibold">{t("sidebar.showMaterials")}</span>
        </motion.button>

        <motion.button
          role="tab"
          aria-selected={showCreators}
          aria-controls="search-results-panel"
          tabIndex={showCreators ? 0 : -1}
          onClick={onToggleCreators}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-3 py-2.5 text-center transition-colors ${
            showCreators
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-bg text-text-secondary hover:border-primary/50 hover:bg-surface-hover"
          }`}
          whileHover={hoverAnimation}
          whileTap={tapAnimation}
        >
          <Users className="h-4 w-4" />
          <span className="text-sm font-semibold">{t("sidebar.showCreators")}</span>
        </motion.button>
      </div>
    </div>
  );
}
