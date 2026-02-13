"use client";

import { motion } from "framer-motion";
import type { useTranslations } from "next-intl";

interface DialectToggleProps {
  selectedDialect: string | null;
  onDialectChange: (dialect: string | null) => void;
  t: ReturnType<typeof useTranslations>;
}

export function DialectToggle({ selectedDialect, onDialectChange, t }: DialectToggleProps) {
  const options = [
    {
      value: "SWISS",
      labelKey: "sidebar.dialectCH" as const,
      titleKey: "sidebar.dialectSwiss" as const,
    },
    {
      value: "STANDARD",
      labelKey: "sidebar.dialectDE" as const,
      titleKey: "sidebar.dialectStandard" as const,
    },
  ];

  return (
    <div className="flex gap-2">
      {options.map((option) => {
        const isActive = selectedDialect === option.value;
        const label = t(option.labelKey);
        const title = t(option.titleKey);
        return (
          <motion.button
            key={option.value}
            onClick={() => onDialectChange(isActive ? null : option.value)}
            className={`group relative flex-1 rounded-lg border-2 px-3 py-2.5 text-center transition-colors ${
              isActive
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-bg text-text-secondary hover:border-primary/50 hover:bg-surface-hover"
            }`}
            whileHover={{ scale: 1.015, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
            whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
          >
            <div className="relative z-10 text-sm font-semibold">{label}</div>
            <div
              className={`relative z-10 text-xs ${isActive ? "text-primary/80" : "text-text-muted"}`}
            >
              {title}
            </div>
            {/* Tooltip on hover */}
            <div className="bg-text text-bg pointer-events-none absolute -top-10 left-1/2 z-50 -translate-x-1/2 rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {title}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
