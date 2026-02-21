"use client";

import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Fachbereich } from "@/lib/curriculum-types";
import { KompetenzbereichItem } from "./KompetenzbereichItem";

interface FachbereichAccordionProps {
  fachbereich: Fachbereich;
  isSelected: boolean;
  isExpanded: boolean;
  selectedKompetenzbereich: string | null;
  selectedKompetenz: string | null;
  expandedKompetenzbereiche: Set<string>;
  onSelect: () => void;
  onToggleExpand: () => void;
  onKompetenzbereichSelect: (code: string | null) => void;
  onKompetenzbereichToggle: (code: string) => void;
  onKompetenzSelect: (code: string | null) => void;
  expandLabel: string;
  collapseLabel: string;
  index?: number;
}

export function FachbereichAccordion({
  fachbereich,
  isSelected,
  isExpanded,
  selectedKompetenzbereich,
  selectedKompetenz,
  expandedKompetenzbereiche,
  onSelect,
  onToggleExpand,
  onKompetenzbereichSelect,
  onKompetenzbereichToggle,
  onKompetenzSelect,
  expandLabel,
  collapseLabel,
  index = 0,
}: FachbereichAccordionProps) {
  const hasChildren = fachbereich.kompetenzbereiche.length > 0;

  return (
    <motion.div
      className={`overflow-hidden rounded-lg border transition-colors ${
        isSelected ? "border-transparent" : "border-border hover:border-border-subtle"
      }`}
      style={{
        ...(isSelected && {
          boxShadow: `0 0 0 2px ${fachbereich.color}`,
        }),
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      {/* Header with subtle background color */}
      <motion.div
        className="relative flex items-center"
        style={{
          backgroundColor: isSelected ? `${fachbereich.color}20` : `${fachbereich.color}08`,
        }}
        whileHover={{
          backgroundColor: isSelected ? `${fachbereich.color}25` : `${fachbereich.color}15`,
          x: 2,
          scale: 1.005,
        }}
        transition={{ duration: 0.15 }}
      >
        {/* Content */}
        <div className="flex flex-1 items-center">
          {/* Expand toggle - only show if there are subcategories */}
          {hasChildren ? (
            <motion.button
              onClick={onToggleExpand}
              aria-expanded={isExpanded}
              aria-label={`${isExpanded ? collapseLabel : expandLabel} ${fachbereich.name}`}
              className={`flex h-full items-center px-2 transition-colors ${
                isSelected ? "text-text hover:text-text" : "text-text-muted hover:text-text"
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <motion.span animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronRight className="h-4 w-4" />
              </motion.span>
            </motion.button>
          ) : (
            // Spacer to maintain alignment when there's no expand button
            <div className="w-8" />
          )}

          {/* Main button */}
          <motion.button
            onClick={onSelect}
            aria-pressed={isSelected}
            className="flex flex-1 items-center gap-2.5 py-2 pr-3 text-left"
            whileTap={{ scale: 0.98 }}
          >
            <motion.span
              className="flex h-7 w-10 shrink-0 items-center justify-center rounded-md text-xs font-bold"
              initial={false}
              animate={{
                backgroundColor: isSelected ? fachbereich.color : `${fachbereich.color}20`,
                color: isSelected ? "white" : fachbereich.color,
              }}
              transition={{ duration: 0.2 }}
            >
              {fachbereich.shortName}
            </motion.span>
            <div className="min-w-0 flex-1">
              <div
                className={`text-sm leading-tight font-medium ${isSelected ? "" : "text-text"}`}
                style={isSelected ? { color: fachbereich.color } : undefined}
              >
                {fachbereich.name}
              </div>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Expanded content - Kompetenzbereiche (only if there are children) */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-border bg-bg/50 border-t px-2 py-2">
              <div className="space-y-1">
                {[...fachbereich.kompetenzbereiche]
                  .sort((a, b) => {
                    // Extract the numeric part from codes like "D.1", "MA.2", etc.
                    const numA = parseInt(a.code.split(".").pop() || "0", 10);
                    const numB = parseInt(b.code.split(".").pop() || "0", 10);
                    return numA - numB;
                  })
                  .map((kb, kbIndex) => (
                    <KompetenzbereichItem
                      key={kb.code}
                      kompetenzbereich={kb}
                      fachbereichColor={fachbereich.color}
                      isSelected={selectedKompetenzbereich === kb.code}
                      isExpanded={expandedKompetenzbereiche.has(kb.code)}
                      selectedKompetenz={selectedKompetenz}
                      onSelect={() => onKompetenzbereichSelect(kb.code)}
                      onToggleExpand={() => onKompetenzbereichToggle(kb.code)}
                      onKompetenzSelect={onKompetenzSelect}
                      expandLabel={expandLabel}
                      collapseLabel={collapseLabel}
                      index={kbIndex}
                    />
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
