"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LP21FilterSidebar } from "@/components/search/LP21FilterSidebar";
import { FocusTrap } from "@/components/ui/FocusTrap";
import type { LP21FilterState } from "@/lib/types/search";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  filters: LP21FilterState;
  onFiltersChange: (filters: LP21FilterState) => void;
  activeFilterCount: number;
  totalCount: number;
  labels: {
    filterTitle: string;
    showResults: string;
    closeFilters: string;
  };
}

export function MobileFilterDrawer({
  isOpen,
  onOpen,
  onClose,
  filters,
  onFiltersChange,
  activeFilterCount,
  totalCount,
  labels,
}: MobileFilterDrawerProps) {
  return (
    <div className="lg:hidden">
      <button
        onClick={onOpen}
        className="border-border bg-bg-secondary text-text-secondary hover:border-primary hover:text-primary flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3.5 text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]"
      >
        <SlidersHorizontal className="h-5 w-5" />
        <span>{labels.filterTitle}</span>
        {activeFilterCount > 0 && (
          <span className="bg-primary text-text-on-accent flex h-5 w-5 items-center justify-center rounded-full text-xs">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Mobile Filter Drawer (Bottom Sheet) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
              onClick={onClose}
            />
            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label={labels.filterTitle}
              className="bg-bg fixed inset-x-0 bottom-0 z-[101] max-h-[85vh] overflow-y-auto rounded-t-2xl shadow-2xl"
            >
              <FocusTrap active={isOpen} onEscape={onClose}>
                {/* Drawer handle */}
                <div className="bg-bg border-border sticky top-0 z-10 flex items-center justify-between border-b px-5 pt-3 pb-4">
                  <div
                    aria-hidden="true"
                    className="bg-border mx-auto mb-3 h-1 w-10 rounded-full"
                  />
                </div>
                <div className="bg-bg sticky top-0 z-10 flex items-center justify-between px-5 pb-3">
                  <h2 className="text-text text-lg font-semibold">{labels.filterTitle}</h2>
                  <button
                    onClick={onClose}
                    aria-label={labels.closeFilters}
                    className="text-text-muted hover:text-text hover:bg-surface flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="px-1 pb-8">
                  <LP21FilterSidebar filters={filters} onFiltersChange={onFiltersChange} />
                </div>
                {/* Apply button */}
                <div className="bg-bg border-border sticky bottom-0 border-t px-5 py-4">
                  <button
                    onClick={onClose}
                    className="bg-primary text-text-on-accent hover:bg-primary-hover w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors"
                  >
                    {labels.showResults}
                  </button>
                </div>
              </FocusTrap>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
