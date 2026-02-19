"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CANTON_ABBREVS } from "./filters/CantonFilter";
import type { LP21FilterState } from "@/lib/types/search";
import type { Fachbereich } from "@/lib/curriculum-types";

const CHIP_TRANSITION = { duration: 0.15 };
const CHIP_INITIAL = { opacity: 0, scale: 0.9 };
const CHIP_ANIMATE = { opacity: 1, scale: 1 };

interface FilterChipsProps {
  filters: LP21FilterState;
  onFiltersChange: (filters: LP21FilterState) => void;
  activeFilterCount: number;
  getFachbereichByCode: (code: string) => Fachbereich | undefined;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
}

function DismissButton({
  onClick,
  className = "hover:bg-primary/20",
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-5 w-5 items-center justify-center rounded-full transition-colors ${className}`}
    >
      <X className="h-3 w-3" />
    </button>
  );
}

export function FilterChips({
  filters,
  onFiltersChange,
  activeFilterCount,
  getFachbereichByCode,
  t,
}: FilterChipsProps) {
  if (activeFilterCount === 0) return null;

  const resetAll = () =>
    onFiltersChange({
      showMaterials: filters.showMaterials,
      showCreators: filters.showCreators,
      zyklus: null,
      fachbereich: null,
      kompetenzbereich: null,
      kompetenz: null,
      searchQuery: "",
      dialect: null,
      maxPrice: null,
      formats: [],
      cantons: [],
      tags: [],
    });

  return (
    <motion.div
      className="mb-4 flex flex-wrap items-center gap-2"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <AnimatePresence mode="popLayout">
        {filters.searchQuery && (
          <motion.span
            key="chip-search"
            layout
            initial={CHIP_INITIAL}
            animate={CHIP_ANIMATE}
            exit={CHIP_INITIAL}
            transition={CHIP_TRANSITION}
            className="bg-primary/10 text-primary border-primary/20 hover-chip inline-flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-3 text-xs font-semibold"
          >
            &quot;{filters.searchQuery}&quot;
            <DismissButton onClick={() => onFiltersChange({ ...filters, searchQuery: "" })} />
          </motion.span>
        )}
        {filters.zyklus && (
          <motion.span
            key="chip-zyklus"
            layout
            initial={CHIP_INITIAL}
            animate={CHIP_ANIMATE}
            exit={CHIP_INITIAL}
            transition={CHIP_TRANSITION}
            className="bg-primary/10 text-primary border-primary/20 hover-chip inline-flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-3 text-xs font-semibold"
          >
            {t("sidebar.chipCycle", { number: filters.zyklus })}
            <DismissButton
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  zyklus: null,
                  fachbereich: null,
                  kompetenzbereich: null,
                  kompetenz: null,
                })
              }
            />
          </motion.span>
        )}
        {filters.fachbereich && (
          <motion.span
            key="chip-fachbereich"
            layout
            initial={CHIP_INITIAL}
            animate={CHIP_ANIMATE}
            exit={CHIP_INITIAL}
            transition={CHIP_TRANSITION}
            className="bg-accent/10 text-accent border-accent/20 hover-chip inline-flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-3 text-xs font-semibold"
          >
            {getFachbereichByCode(filters.fachbereich)?.shortName || filters.fachbereich}
            <DismissButton
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  fachbereich: null,
                  kompetenzbereich: null,
                  kompetenz: null,
                })
              }
              className="hover:bg-accent/20"
            />
          </motion.span>
        )}
        {filters.kompetenzbereich && (
          <motion.span
            key="chip-kompetenzbereich"
            layout
            initial={CHIP_INITIAL}
            animate={CHIP_ANIMATE}
            exit={CHIP_INITIAL}
            transition={CHIP_TRANSITION}
            className="bg-accent/10 text-accent border-accent/20 hover-chip inline-flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-3 text-xs font-semibold"
          >
            {filters.kompetenzbereich}
            <DismissButton
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  kompetenzbereich: null,
                  kompetenz: null,
                })
              }
              className="hover:bg-accent/20"
            />
          </motion.span>
        )}
        {filters.kompetenz && (
          <motion.span
            key="chip-kompetenz"
            layout
            initial={CHIP_INITIAL}
            animate={CHIP_ANIMATE}
            exit={CHIP_INITIAL}
            transition={CHIP_TRANSITION}
            className="bg-accent/10 text-accent border-accent/20 hover-chip inline-flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-3 text-xs font-semibold"
          >
            {filters.kompetenz}
            <DismissButton
              onClick={() => onFiltersChange({ ...filters, kompetenz: null })}
              className="hover:bg-accent/20"
            />
          </motion.span>
        )}
        {filters.dialect && (
          <motion.span
            key="chip-dialect"
            layout
            initial={CHIP_INITIAL}
            animate={CHIP_ANIMATE}
            exit={CHIP_INITIAL}
            transition={CHIP_TRANSITION}
            className="bg-surface text-text-secondary border-border hover-chip inline-flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-3 text-xs font-semibold"
          >
            {filters.dialect === "SWISS" ? "CH" : "DE"}
            <DismissButton
              onClick={() => onFiltersChange({ ...filters, dialect: null })}
              className="hover:bg-surface-hover"
            />
          </motion.span>
        )}
        {filters.maxPrice !== null && (
          <motion.span
            key="chip-price"
            layout
            initial={CHIP_INITIAL}
            animate={CHIP_ANIMATE}
            exit={CHIP_INITIAL}
            transition={CHIP_TRANSITION}
            className="bg-surface text-text-secondary border-border hover-chip inline-flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-3 text-xs font-semibold"
          >
            {t("sidebar.priceUnder", { amount: filters.maxPrice })}
            <DismissButton
              onClick={() => onFiltersChange({ ...filters, maxPrice: null })}
              className="hover:bg-surface-hover"
            />
          </motion.span>
        )}
        {filters.formats.map((fmt) => (
          <motion.span
            key={`chip-fmt-${fmt}`}
            layout
            initial={CHIP_INITIAL}
            animate={CHIP_ANIMATE}
            exit={CHIP_INITIAL}
            transition={CHIP_TRANSITION}
            className="bg-surface text-text-secondary border-border hover-chip inline-flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-3 text-xs font-semibold"
          >
            {fmt.toUpperCase()}
            <DismissButton
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  formats: filters.formats.filter((f) => f !== fmt),
                })
              }
              className="hover:bg-surface-hover"
            />
          </motion.span>
        ))}
        {filters.tags.map((tag) => (
          <motion.span
            key={`chip-tag-${tag}`}
            layout
            initial={CHIP_INITIAL}
            animate={CHIP_ANIMATE}
            exit={CHIP_INITIAL}
            transition={CHIP_TRANSITION}
            className="bg-surface text-text-secondary border-border hover-chip inline-flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-3 text-xs font-semibold"
          >
            #{tag}
            <DismissButton
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  tags: filters.tags.filter((t) => t !== tag),
                })
              }
              className="hover:bg-surface-hover"
            />
          </motion.span>
        ))}
        {filters.cantons.length > 0 && (
          <motion.span
            key="chip-cantons"
            layout
            initial={CHIP_INITIAL}
            animate={CHIP_ANIMATE}
            exit={CHIP_INITIAL}
            transition={CHIP_TRANSITION}
            className="bg-surface text-text-secondary border-border hover-chip inline-flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-3 text-xs font-semibold"
          >
            {filters.cantons.length <= 3
              ? filters.cantons
                  .map((c) => CANTON_ABBREVS.find((ca) => ca.name === c)?.abbrev || c)
                  .join(", ")
              : t("sidebar.cantonChipMultiple", { count: filters.cantons.length })}
            <DismissButton
              onClick={() => onFiltersChange({ ...filters, cantons: [] })}
              className="hover:bg-surface-hover"
            />
          </motion.span>
        )}
        {activeFilterCount >= 1 && (
          <motion.button
            key="chip-reset"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={CHIP_TRANSITION}
            onClick={resetAll}
            className="text-text-muted hover:text-error text-xs font-medium transition-colors"
          >
            {t("sidebar.reset")}
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
