"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { Fachbereich } from "@/lib/curriculum-types";
import { SONSTIGE_CODE } from "@/lib/validations/material";
import { FachbereichAccordion } from "./FachbereichAccordion";

// Neutral gray-blue accent for "Sonstige" — Catppuccin overlay1
const SONSTIGE_COLOR = "#8c8fa1";

interface FachbereichTreeProps {
  fachbereiche: Fachbereich[];
  loading: boolean;
  error: Error | null;
  selectedFachbereich: string | null;
  selectedKompetenzbereich: string | null;
  selectedKompetenz: string | null;
  expandedFachbereiche: Set<string>;
  expandedKompetenzbereiche: Set<string>;
  onFachbereichChange: (code: string) => void;
  onToggleFachbereichExpansion: (code: string) => void;
  onKompetenzbereichSelect: (code: string | null) => void;
  onKompetenzbereichToggle: (code: string) => void;
  onKompetenzSelect: (code: string | null) => void;
  errorLabel: string;
  expandLabel: string;
  collapseLabel: string;
  sonstigeLabel?: string;
  sonstigeDescription?: string;
}

export function FachbereichTree({
  fachbereiche,
  loading,
  error,
  selectedFachbereich,
  selectedKompetenzbereich,
  selectedKompetenz,
  expandedFachbereiche,
  expandedKompetenzbereiche,
  onFachbereichChange,
  onToggleFachbereichExpansion,
  onKompetenzbereichSelect,
  onKompetenzbereichToggle,
  onKompetenzSelect,
  errorLabel,
  expandLabel,
  collapseLabel,
  sonstigeLabel,
  sonstigeDescription,
}: FachbereichTreeProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="text-primary h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-error py-4 text-center text-sm">{errorLabel}</div>;
  }

  const isSonstigeSelected = selectedFachbereich === SONSTIGE_CODE;

  return (
    <div className="space-y-2 p-0.5">
      {fachbereiche.map((fb, index) => (
        <FachbereichAccordion
          key={fb.code}
          fachbereich={fb}
          isSelected={selectedFachbereich === fb.code}
          isExpanded={expandedFachbereiche.has(fb.code)}
          selectedKompetenzbereich={selectedKompetenzbereich}
          selectedKompetenz={selectedKompetenz}
          expandedKompetenzbereiche={expandedKompetenzbereiche}
          onSelect={() => onFachbereichChange(fb.code)}
          onToggleExpand={() => onToggleFachbereichExpansion(fb.code)}
          onKompetenzbereichSelect={onKompetenzbereichSelect}
          onKompetenzbereichToggle={onKompetenzbereichToggle}
          onKompetenzSelect={onKompetenzSelect}
          expandLabel={expandLabel}
          collapseLabel={collapseLabel}
          index={index}
        />
      ))}

      {/* Sonstige — non-LP21 materials */}
      {sonstigeLabel && (
        <motion.div
          className={`overflow-hidden rounded-lg border transition-colors ${
            isSonstigeSelected ? "border-transparent" : "border-border hover:border-border-subtle"
          }`}
          style={{
            ...(isSonstigeSelected && {
              boxShadow: `0 0 0 2px ${SONSTIGE_COLOR}`,
            }),
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: fachbereiche.length * 0.03 }}
        >
          <motion.div
            className="relative flex items-center"
            style={{
              backgroundColor: isSonstigeSelected ? `${SONSTIGE_COLOR}20` : `${SONSTIGE_COLOR}08`,
            }}
            whileHover={{
              backgroundColor: isSonstigeSelected ? `${SONSTIGE_COLOR}25` : `${SONSTIGE_COLOR}15`,
              x: 2,
              scale: 1.005,
            }}
            transition={{ duration: 0.15 }}
          >
            {/* Spacer matching FachbereichAccordion alignment */}
            <div className="w-8" />

            <motion.button
              type="button"
              onClick={() => onFachbereichChange(SONSTIGE_CODE)}
              className="flex flex-1 items-center gap-2.5 py-2 pr-3 text-left"
              whileTap={{ scale: 0.98 }}
            >
              <motion.span
                className="flex h-7 w-10 shrink-0 items-center justify-center rounded-md text-xs font-bold"
                initial={false}
                animate={{
                  backgroundColor: isSonstigeSelected ? SONSTIGE_COLOR : `${SONSTIGE_COLOR}20`,
                  color: isSonstigeSelected ? "white" : SONSTIGE_COLOR,
                }}
                transition={{ duration: 0.2 }}
              >
                SO
              </motion.span>
              <div className="min-w-0 flex-1">
                <div
                  className={`text-sm leading-tight font-medium ${isSonstigeSelected ? "" : "text-text"}`}
                  style={isSonstigeSelected ? { color: SONSTIGE_COLOR } : undefined}
                >
                  {sonstigeLabel}
                </div>
                {sonstigeDescription && (
                  <div className="text-text-faint text-xs leading-tight">{sonstigeDescription}</div>
                )}
              </div>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
