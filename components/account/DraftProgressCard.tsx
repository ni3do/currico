"use client";

import { useState, useSyncExternalStore } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FileText, BookOpen, Tag, Upload, Check, Trash2, ArrowRight, PenLine } from "lucide-react";
import { clearDraftFiles } from "@/lib/utils/draft-file-storage";

const STORAGE_KEY = "currico_upload_draft";

interface DraftFormData {
  title: string;
  description: string;
  cycle: string;
  subject: string;
  priceType: string;
  price: string;
  fileNames: string[];
  legalOwnContent: boolean;
  legalNoTextbookScans: boolean;
  legalNoTrademarks: boolean;
  legalSwissGerman: boolean;
  legalTermsAccepted: boolean;
}

interface DraftData {
  formData: DraftFormData;
  currentStep: number;
  visitedSteps: number[];
  lastSavedAt: string;
}

function isStepComplete(fd: DraftFormData, step: number): boolean {
  switch (step) {
    case 1:
      return fd.title.trim().length > 0 && fd.description.trim().length > 0;
    case 2:
      return fd.cycle !== "" && fd.subject !== "";
    case 3:
      return fd.priceType === "free" || (fd.priceType === "paid" && fd.price !== "");
    case 4:
      return (
        fd.fileNames.length > 0 &&
        fd.legalOwnContent &&
        fd.legalNoTextbookScans &&
        fd.legalNoTrademarks &&
        fd.legalSwissGerman &&
        fd.legalTermsAccepted
      );
    default:
      return false;
  }
}

function loadDraft(): DraftData | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as DraftData) : null;
  } catch {
    return null;
  }
}

const emptySubscribe = () => () => {};

const STEPS = [
  { step: 1, icon: FileText },
  { step: 2, icon: BookOpen },
  { step: 3, icon: Tag },
  { step: 4, icon: Upload },
] as const;

export function DraftProgressCard() {
  const t = useTranslations("accountPage.uploads.draft");
  const tSteps = useTranslations("uploadWizard.steps");
  const tDraft = useTranslations("uploadWizard.draft");
  const locale = useLocale();
  const [showConfirm, setShowConfirm] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const draft = isClient ? loadDraft() : null;

  if (!draft || dismissed) return null;

  const fd = draft.formData;
  const completedSteps = [1, 2, 3, 4].filter((s) => isStepComplete(fd, s)).length;

  const dateLocale = locale === "de" ? "de-CH" : "en-CH";
  const savedDate = new Date(draft.lastSavedAt);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let timeLabel: string;
  if (savedDate.toDateString() === today.toDateString()) {
    timeLabel = tDraft("today", {
      time: savedDate.toLocaleTimeString(dateLocale, { hour: "2-digit", minute: "2-digit" }),
    });
  } else if (savedDate.toDateString() === yesterday.toDateString()) {
    timeLabel = tDraft("yesterday", {
      time: savedDate.toLocaleTimeString(dateLocale, { hour: "2-digit", minute: "2-digit" }),
    });
  } else {
    timeLabel = savedDate.toLocaleString(dateLocale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const stepLabels: Record<number, string> = {
    1: tSteps("basicsShort"),
    2: tSteps("curriculumShort"),
    3: tSteps("priceShort"),
    4: tSteps("filesShort"),
  };

  const handleDiscard = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    clearDraftFiles();
    setShowConfirm(false);
    setDismissed(true);
  };

  return (
    <>
      <div className="border-primary/30 bg-primary/5 mb-6 rounded-xl border p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Draft info */}
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <div className="bg-primary/20 flex h-8 w-8 items-center justify-center rounded-full">
                <PenLine className="text-primary h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-text text-sm font-semibold">{t("title")}</h3>
                <p className="text-text-muted text-xs">{t("savedAt", { time: timeLabel })}</p>
              </div>
            </div>

            {/* Draft title preview */}
            {fd.title && (
              <p className="text-text mb-3 truncate text-sm font-medium">
                &laquo;{fd.title}&raquo;
              </p>
            )}

            {/* Step progress circles */}
            <div className="mb-2 flex items-center gap-1.5">
              {STEPS.map(({ step, icon: Icon }) => {
                const complete = isStepComplete(fd, step);
                const visited = draft.visitedSteps.includes(step);
                return (
                  <div key={step} className="flex items-center gap-1.5">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                        complete
                          ? "border-success bg-success text-text-on-accent"
                          : visited
                            ? "border-primary/50 bg-primary/10 text-primary"
                            : "border-border bg-surface text-text-muted"
                      }`}
                      title={stepLabels[step]}
                    >
                      {complete ? (
                        <Check className="h-3 w-3" aria-hidden="true" />
                      ) : (
                        <Icon className="h-3 w-3" aria-hidden="true" />
                      )}
                    </div>
                    <span
                      className={`hidden text-xs sm:inline ${
                        complete ? "text-success" : visited ? "text-text" : "text-text-muted"
                      }`}
                    >
                      {stepLabels[step]}
                    </span>
                    {step < 4 && (
                      <div
                        className={`h-0.5 w-3 rounded-full sm:w-6 ${
                          complete ? "bg-success" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-text-muted text-xs">
              {t("progress", { completed: completedSteps, total: 4 })}
            </p>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:flex-col sm:items-stretch">
            <Link
              href="/hochladen"
              className="btn-primary inline-flex flex-1 items-center justify-center gap-2 px-4 py-2 text-sm sm:flex-initial"
            >
              {t("resume")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="text-text-muted hover:text-error hover:bg-error/10 inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{t("discard")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Discard confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface mx-4 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="bg-warning/20 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <Trash2 className="text-warning h-6 w-6" aria-hidden="true" />
            </div>

            <h3 className="text-text text-lg font-semibold">{t("discardTitle")}</h3>
            <p className="text-text-muted mt-2 text-sm">{t("discardMessage")}</p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="btn-tertiary flex-1 px-4 py-2.5"
              >
                {t("discardCancel")}
              </button>
              <button
                type="button"
                onClick={handleDiscard}
                className="btn-danger flex-1 px-4 py-2.5"
              >
                {t("discardConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
