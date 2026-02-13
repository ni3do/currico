"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";

interface DeleteConfirmDialogProps {
  open: boolean;
  title: string;
  type: "material" | "bundle";
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  open,
  title,
  type,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  const t = useTranslations("deleteConfirm");
  const tCommon = useTranslations("common");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="border-border bg-surface mx-4 w-full max-w-sm rounded-2xl border p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-error/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <Trash2 className="text-error h-6 w-6" />
            </div>
            <h3 className="text-text text-center text-lg font-bold">
              {type === "material" ? t("materialTitle") : t("bundleTitle")}
            </h3>
            <p className="text-text-muted mt-2 text-center text-sm">
              <strong className="text-text">&ldquo;{title}&rdquo;</strong> {t("permanentWarning")}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={onCancel}
                className="border-border text-text hover:bg-surface-elevated flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors"
              >
                {tCommon("buttons.cancel")}
              </button>
              <button
                onClick={onConfirm}
                className="bg-error hover:bg-error/90 flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors"
              >
                {tCommon("buttons.delete")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
