"use client";

import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Fachbereich, Kompetenzbereich } from "@/lib/curriculum-types";

// ============ FACHBEREICH ACCORDION ============
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
        className="relative flex items-center rounded-lg"
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
              aria-label={`${isExpanded ? "Collapse" : "Expand"} ${fachbereich.name}`}
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

// ============ KOMPETENZBEREICH ITEM ============
interface KompetenzbereichItemProps {
  kompetenzbereich: Kompetenzbereich;
  fachbereichColor: string;
  isSelected: boolean;
  isExpanded: boolean;
  selectedKompetenz: string | null;
  onSelect: () => void;
  onToggleExpand: () => void;
  onKompetenzSelect: (code: string | null) => void;
  index?: number;
}

function KompetenzbereichItem({
  kompetenzbereich,
  fachbereichColor,
  isSelected,
  isExpanded,
  selectedKompetenz,
  onSelect,
  onToggleExpand,
  onKompetenzSelect,
  index = 0,
}: KompetenzbereichItemProps) {
  const hasChildren = kompetenzbereich.kompetenzen.length > 0;

  return (
    <motion.div
      className="overflow-hidden rounded-md"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
    >
      <motion.div
        className="flex items-center rounded-md"
        style={{
          backgroundColor: isSelected ? `${fachbereichColor}18` : `${fachbereichColor}06`,
        }}
        whileHover={{
          backgroundColor: isSelected ? `${fachbereichColor}22` : `${fachbereichColor}12`,
          x: 2,
          scale: 1.005,
        }}
        transition={{ duration: 0.15 }}
      >
        {/* Expand toggle - only show if there are children */}
        {hasChildren ? (
          <motion.button
            onClick={onToggleExpand}
            className={`flex items-center px-1.5 transition-colors ${
              isSelected ? "text-text" : "text-text-muted hover:text-text"
            }`}
            whileTap={{ scale: 0.9 }}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? "Collapse" : "Expand"} ${kompetenzbereich.code}`}
          >
            <motion.span animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight className="h-3.5 w-3.5" />
            </motion.span>
          </motion.button>
        ) : (
          // Spacer to maintain alignment when there's no expand button
          <div className="w-6" />
        )}

        {/* Main button */}
        <motion.button
          onClick={onSelect}
          className={`flex flex-1 items-center gap-2 py-1.5 pr-2 text-left text-sm transition-colors ${
            isSelected ? "" : "text-text-secondary hover:text-text"
          }`}
          whileTap={{ scale: 0.98 }}
        >
          <span className="font-mono text-xs font-semibold" style={{ color: fachbereichColor }}>
            {kompetenzbereich.code}
          </span>
          <span
            className={`flex-1 truncate ${isSelected ? "font-medium" : ""}`}
            style={isSelected ? { color: fachbereichColor } : undefined}
            title={kompetenzbereich.name}
          >
            {kompetenzbereich.name}
          </span>
        </motion.button>
      </motion.div>

      {/* Kompetenzen (only if there are children) */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="mt-1 ml-5 space-y-0.5 border-l-2 pl-3"
              style={{ borderColor: `${fachbereichColor}40` }}
            >
              {kompetenzbereich.kompetenzen.map((k, kIndex) => {
                const isKompetenzSelected = selectedKompetenz === k.code;
                return (
                  <motion.div
                    key={k.code}
                    className="overflow-hidden rounded"
                    style={{
                      backgroundColor: isKompetenzSelected
                        ? `${fachbereichColor}15`
                        : `${fachbereichColor}05`,
                    }}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: kIndex * 0.02 }}
                    whileHover={{
                      backgroundColor: isKompetenzSelected
                        ? `${fachbereichColor}20`
                        : `${fachbereichColor}10`,
                      x: 2,
                      scale: 1.005,
                    }}
                  >
                    <div className="flex items-center">
                      <motion.button
                        onClick={() => onKompetenzSelect(k.code)}
                        className={`flex w-full items-center gap-2 px-2 py-1 text-left text-xs transition-colors ${
                          isKompetenzSelected ? "" : "text-text-muted hover:text-text"
                        }`}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="font-mono font-medium" style={{ color: fachbereichColor }}>
                          {k.code}
                        </span>
                        <span
                          className={`flex-1 truncate ${isKompetenzSelected ? "font-medium" : ""}`}
                          style={isKompetenzSelected ? { color: fachbereichColor } : undefined}
                          title={k.name}
                        >
                          {k.name}
                        </span>
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
