"use client";

import { useCallback } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import type { useTranslations } from "next-intl";
import { Tooltip } from "./Tooltip";

// Canton abbreviation -> full name mapping (matching SWISS_CANTONS order)
export const CANTON_ABBREVS: { abbrev: string; name: string }[] = [
  { abbrev: "AG", name: "Aargau" },
  { abbrev: "AR", name: "Appenzell Ausserrhoden" },
  { abbrev: "AI", name: "Appenzell Innerrhoden" },
  { abbrev: "BL", name: "Basel-Landschaft" },
  { abbrev: "BS", name: "Basel-Stadt" },
  { abbrev: "BE", name: "Bern" },
  { abbrev: "FR", name: "Freiburg" },
  { abbrev: "GE", name: "Genf" },
  { abbrev: "GL", name: "Glarus" },
  { abbrev: "GR", name: "Graubünden" },
  { abbrev: "JU", name: "Jura" },
  { abbrev: "LU", name: "Luzern" },
  { abbrev: "NE", name: "Neuenburg" },
  { abbrev: "NW", name: "Nidwalden" },
  { abbrev: "OW", name: "Obwalden" },
  { abbrev: "SH", name: "Schaffhausen" },
  { abbrev: "SZ", name: "Schwyz" },
  { abbrev: "SO", name: "Solothurn" },
  { abbrev: "SG", name: "St. Gallen" },
  { abbrev: "TG", name: "Thurgau" },
  { abbrev: "TI", name: "Tessin" },
  { abbrev: "UR", name: "Uri" },
  { abbrev: "VD", name: "Waadt" },
  { abbrev: "VS", name: "Wallis" },
  { abbrev: "ZG", name: "Zug" },
  { abbrev: "ZH", name: "Zürich" },
];

interface CantonFilterProps {
  selectedCantons: string[];
  onCantonsChange: (cantons: string[]) => void;
  t: ReturnType<typeof useTranslations>;
}

export function CantonFilter({ selectedCantons, onCantonsChange, t }: CantonFilterProps) {
  const toggleCanton = useCallback(
    (cantonName: string) => {
      if (selectedCantons.includes(cantonName)) {
        onCantonsChange(selectedCantons.filter((c) => c !== cantonName));
      } else {
        onCantonsChange([...selectedCantons, cantonName]);
      }
    },
    [selectedCantons, onCantonsChange]
  );

  const clearAll = useCallback(() => {
    onCantonsChange([]);
  }, [onCantonsChange]);

  return (
    <div>
      {/* Clear link when cantons are selected */}
      {selectedCantons.length > 0 && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-text-muted text-xs">
            {t("sidebar.cantonSelected", { count: selectedCantons.length })}
          </span>
          <button
            onClick={clearAll}
            className="text-text-muted hover:text-primary text-xs font-medium transition-colors"
          >
            <X className="inline h-3 w-3" />
          </button>
        </div>
      )}

      {/* Canton grid */}
      <div className="grid grid-cols-4 gap-1.5">
        {CANTON_ABBREVS.map((canton) => {
          const isSelected = selectedCantons.includes(canton.name);
          return (
            <motion.button
              key={canton.abbrev}
              onClick={() => toggleCanton(canton.name)}
              className={`group relative rounded-lg border px-1 py-1.5 text-center text-xs font-semibold transition-colors ${
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-bg text-text-secondary hover:border-primary/50 hover:bg-surface-hover hover:text-text"
              }`}
              whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
              title={canton.name}
            >
              {canton.abbrev}
              <Tooltip text={canton.name} className="py-0.5 text-[10px]" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
