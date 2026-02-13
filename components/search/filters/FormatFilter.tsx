"use client";

import { FileText, FileType, Presentation, Table, StickyNote, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import type { useTranslations } from "next-intl";

export const FORMAT_OPTIONS = [
  { id: "pdf", labelKey: "formatPdf", icon: FileText },
  { id: "word", labelKey: "formatWord", icon: FileType },
  { id: "ppt", labelKey: "formatPpt", icon: Presentation },
  { id: "excel", labelKey: "formatExcel", icon: Table },
  { id: "onenote", labelKey: "formatOnenote", icon: StickyNote },
  { id: "other", labelKey: "formatOther", icon: MoreHorizontal },
] as const;

interface FormatFilterProps {
  selectedFormats: string[];
  onFormatToggle: (formatId: string) => void;
  t: ReturnType<typeof useTranslations>;
}

export function FormatFilter({ selectedFormats, onFormatToggle, t }: FormatFilterProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {FORMAT_OPTIONS.map((format, index) => {
        const Icon = format.icon;
        const isSelected = selectedFormats.includes(format.id);
        return (
          <motion.button
            key={format.id}
            onClick={() => onFormatToggle(format.id)}
            className={`relative flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
              isSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-bg text-text-secondary hover:border-primary/50 hover:bg-surface-hover hover:text-text"
            }`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ scale: 1.015, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
            whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
          >
            <Icon className="h-4 w-4" />
            <span className="font-medium">{t(`sidebar.${format.labelKey}`)}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
