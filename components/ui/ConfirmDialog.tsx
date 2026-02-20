"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { FocusTrap } from "@/components/ui/FocusTrap";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      cancelRef.current?.focus();
    }
  }, [open]);

  const confirmStyles = variant === "danger" ? "btn-danger" : "btn-primary";

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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-dialog-title"
              aria-describedby="confirm-dialog-message"
              className="border-border bg-surface mx-4 w-full max-w-sm rounded-2xl border p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {variant === "danger" && (
                <div className="bg-error/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                  <AlertTriangle className="text-error h-6 w-6" />
                </div>
              )}
              <h3 id="confirm-dialog-title" className="text-text text-center text-lg font-semibold">
                {title}
              </h3>
              <p id="confirm-dialog-message" className="text-text-muted mt-2 text-center text-sm">
                {message}
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  ref={cancelRef}
                  onClick={onCancel}
                  className="btn-tertiary flex-1 px-4 py-2.5 text-sm"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${confirmStyles}`}
                >
                  {confirmLabel}
                </button>
              </div>
            </motion.div>
          </FocusTrap>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
