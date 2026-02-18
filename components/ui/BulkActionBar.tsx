"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, Loader2, CheckSquare, XSquare } from "lucide-react";
import { useTranslations } from "next-intl";

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDownload: () => void;
  downloading: boolean;
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onDownload,
  downloading,
}: BulkActionBarProps) {
  const t = useTranslations("accountPage.library.bulk");

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="border-border bg-surface fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)]"
          role="toolbar"
          aria-label={t("actions")}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="text-text text-sm font-medium">
                {t("selected", { count: selectedCount, total: totalCount })}
              </span>
              {selectedCount < totalCount ? (
                <button
                  type="button"
                  onClick={onSelectAll}
                  className="text-primary hover:text-primary-hover inline-flex items-center gap-1.5 text-sm font-medium"
                >
                  <CheckSquare className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{t("selectAll")}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onDeselectAll}
                  className="text-text-muted hover:text-text inline-flex items-center gap-1.5 text-sm font-medium"
                >
                  <XSquare className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{t("deselectAll")}</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onDownload}
              disabled={downloading}
              className="btn-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm disabled:opacity-60"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Download className="h-4 w-4" aria-hidden="true" />
              )}
              {downloading ? t("downloading") : t("download", { count: selectedCount })}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
