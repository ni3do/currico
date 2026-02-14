"use client";

import { motion } from "framer-motion";
import type { Zyklus } from "@/lib/curriculum-types";
import { Tooltip } from "./Tooltip";

interface ZyklusToggleProps {
  zyklen: Zyklus[];
  selectedZyklus: number | null;
  onZyklusChange: (zyklus: number | null) => void;
}

export function ZyklusToggle({ zyklen, selectedZyklus, onZyklusChange }: ZyklusToggleProps) {
  return (
    <div className="flex gap-2">
      {zyklen.map((zyklus, index) => {
        const isActive = selectedZyklus === zyklus.id;
        return (
          <motion.button
            key={zyklus.id}
            onClick={() => onZyklusChange(zyklus.id)}
            className={`group relative flex-1 rounded-lg border-2 px-3 py-2.5 text-center transition-colors ${
              isActive
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-bg text-text-secondary hover:border-primary/50 hover:bg-surface-hover"
            }`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.015, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
            whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
          >
            {isActive && (
              <motion.div
                layoutId="activeZyklus"
                className="bg-primary/10 absolute inset-0 rounded-lg"
                initial={false}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            <div className="relative z-10 text-sm font-semibold">{zyklus.shortName}</div>
            <div
              className={`relative z-10 text-xs ${isActive ? "text-primary/80" : "text-text-muted"}`}
            >
              {zyklus.id === 1 ? "KG-2" : zyklus.id === 2 ? "3-6" : "7-9"}
            </div>
            <Tooltip text={zyklus.description} />
          </motion.button>
        );
      })}
    </div>
  );
}
