"use client";

import { useState, useSyncExternalStore } from "react";
import { useUploadWizard } from "./UploadWizardContext";
import { Save, Trash2, Check, Loader2, Cloud, CloudOff } from "lucide-react";

const emptySubscribe = () => () => {};

export function DraftIndicator() {
  const { lastSavedAt, hasDraft, clearDraft, isSaving, serverSynced } = useUploadWizard();
  const [showConfirm, setShowConfirm] = useState(false);
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("de-CH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `heute um ${formatTime(date)}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `gestern um ${formatTime(date)}`;
    } else {
      return date.toLocaleDateString("de-CH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const handleClearDraft = () => {
    clearDraft();
    setShowConfirm(false);
  };

  if (!isClient || (!hasDraft && !isSaving)) {
    return null;
  }

  return (
    <>
      <div className="border-border bg-surface-elevated flex items-center justify-between rounded-xl border px-4 py-3">
        <div className="flex items-center gap-2">
          {isSaving ? (
            <>
              <Loader2 className="text-primary h-4 w-4 animate-spin" />
              <span className="text-text-muted text-sm">Speichere...</span>
            </>
          ) : lastSavedAt ? (
            <>
              <div className="bg-success/20 flex h-6 w-6 items-center justify-center rounded-full">
                {serverSynced ? (
                  <Cloud className="text-success h-3.5 w-3.5" />
                ) : (
                  <Check className="text-success h-3.5 w-3.5" />
                )}
              </div>
              <div className="text-sm">
                <span className="text-text-muted">Entwurf gespeichert </span>
                <span className="text-text font-medium">{formatDate(lastSavedAt)}</span>
                {serverSynced ? (
                  <span className="text-success ml-1.5 text-xs">(Cloud)</span>
                ) : (
                  <span className="text-warning ml-1.5 text-xs">(Lokal)</span>
                )}
              </div>
            </>
          ) : (
            <>
              <Save className="text-text-muted h-4 w-4" />
              <span className="text-text-muted text-sm">Entwurf vorhanden</span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="text-text-muted hover:text-error hover:bg-error/10 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Verwerfen</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface mx-4 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="bg-warning/20 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <Trash2 className="text-warning h-6 w-6" />
            </div>

            <h3 className="text-text text-lg font-semibold">Entwurf verwerfen?</h3>
            <p className="text-text-muted mt-2 text-sm">
              Sind Sie sicher, dass Sie den gespeicherten Entwurf löschen möchten? Alle eingegebenen
              Daten gehen verloren und können nicht wiederhergestellt werden.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="border-border text-text hover:bg-surface-elevated flex-1 rounded-lg border px-4 py-2.5 font-medium transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleClearDraft}
                className="bg-error text-text-on-accent hover:bg-error/90 flex-1 rounded-lg px-4 py-2.5 font-medium transition-colors"
              >
                Verwerfen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Toast notification for draft restored
export function DraftRestoredToast({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="animate-slide-up fixed right-4 bottom-4 z-50">
      <div className="border-info/30 bg-info/10 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg">
        <div className="bg-info/20 flex h-8 w-8 items-center justify-center rounded-full">
          <Save className="text-info h-4 w-4" />
        </div>
        <div>
          <p className="text-text font-medium">Entwurf wiederhergestellt</p>
          <p className="text-text-muted text-sm">Ihr vorheriger Entwurf wurde geladen.</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-text-muted hover:text-text hover:bg-surface-elevated ml-2 rounded-lg p-1.5 transition-colors"
          aria-label="Schliessen"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
