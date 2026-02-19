"use client";

import { Loader2, FolderOpen } from "lucide-react";
import type { Fachbereich } from "@/lib/curriculum-types";
import { SONSTIGE_CODE } from "@/lib/validations/material";
import { FachbereichAccordion } from "./FachbereichAccordion";

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
    <div className="space-y-2">
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
        <button
          type="button"
          onClick={() => onFachbereichChange(SONSTIGE_CODE)}
          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
            isSonstigeSelected
              ? "bg-primary/10 text-primary ring-primary/30 ring-1"
              : "text-text-muted hover:bg-surface hover:text-text"
          }`}
        >
          <FolderOpen className="h-4 w-4 flex-shrink-0" />
          <div className="min-w-0">
            <div>{sonstigeLabel}</div>
            {sonstigeDescription && !isSonstigeSelected && (
              <div className="text-text-faint text-xs">{sonstigeDescription}</div>
            )}
          </div>
        </button>
      )}
    </div>
  );
}
