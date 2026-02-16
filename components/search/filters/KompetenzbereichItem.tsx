"use client";

import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Kompetenzbereich } from "@/lib/curriculum-types";

interface KompetenzbereichItemProps {
  kompetenzbereich: Kompetenzbereich;
  fachbereichColor: string;
  isSelected: boolean;
  isExpanded: boolean;
  selectedKompetenz: string | null;
  onSelect: () => void;
  onToggleExpand: () => void;
  onKompetenzSelect: (code: string | null) => void;
  expandLabel: string;
  collapseLabel: string;
  index?: number;
}

export function KompetenzbereichItem({
  kompetenzbereich,
  fachbereichColor,
  isSelected,
  isExpanded,
  selectedKompetenz,
  onSelect,
  onToggleExpand,
  onKompetenzSelect,
  expandLabel,
  collapseLabel,
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
            aria-label={`${isExpanded ? collapseLabel : expandLabel} ${kompetenzbereich.code}`}
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
