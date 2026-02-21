"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { FocusTrap } from "@/components/ui/FocusTrap";

interface UnsavedChangesDialogProps {
  open: boolean;
  title: string;
  message: string;
  discardLabel: string;
  saveLabel: string;
  onDiscard: () => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function UnsavedChangesDialog({
  open,
  title,
  message,
  discardLabel,
  saveLabel,
  onDiscard,
  onSave,
  onCancel,
  isSaving = false,
}: UnsavedChangesDialogProps) {
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
          <FocusTrap onEscape={onCancel}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="unsaved-dialog-title"
              aria-describedby="unsaved-dialog-message"
              className="border-border bg-surface mx-4 w-full max-w-sm rounded-2xl border p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-warning/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <AlertTriangle className="text-warning h-6 w-6" aria-hidden="true" />
              </div>
              <h3 id="unsaved-dialog-title" className="text-text text-center text-lg font-semibold">
                {title}
              </h3>
              <p id="unsaved-dialog-message" className="text-text-muted mt-2 text-center text-sm">
                {message}
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={onDiscard}
                  disabled={isSaving}
                  className="btn-tertiary flex-1 px-4 py-2.5 text-sm"
                >
                  {discardLabel}
                </button>
                <button
                  onClick={onSave}
                  disabled={isSaving}
                  className="btn-primary flex-1 px-4 py-2.5 text-sm font-medium"
                >
                  {isSaving ? "..." : saveLabel}
                </button>
              </div>
            </motion.div>
          </FocusTrap>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
