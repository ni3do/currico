"use client";

import { useTranslations } from "next-intl";
import { X, Check, FileText } from "lucide-react";
import { getSubjectPillClass } from "@/lib/constants/subject-colors";
import { FocusTrap } from "@/components/ui/FocusTrap";

interface PublishPreviewModalProps {
  title: string;
  subject: string;
  cycle: string;
  price: string;
  priceType: "free" | "paid";
  resourceType: string;
  fileName: string;
  previewImageUrl: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PublishPreviewModal({
  title,
  subject,
  cycle,
  price,
  priceType,
  resourceType,
  fileName,
  previewImageUrl,
  onConfirm,
  onCancel,
}: PublishPreviewModalProps) {
  const tPreview = useTranslations("uploadWizard.preview");

  const formattedPrice =
    priceType === "free" ? tPreview("free") : `CHF ${parseFloat(price || "0").toFixed(2)}`;

  const cycleLabel = cycle ? tPreview("cycleLabel", { number: cycle }) : "–";

  const subjectPillClass = getSubjectPillClass(subject);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <FocusTrap onEscape={onCancel}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-modal-title"
          className="border-border bg-surface relative z-10 w-full max-w-lg rounded-2xl border shadow-2xl"
        >
          {/* Header */}
          <div className="border-border flex items-center justify-between border-b p-5">
            <h2 id="preview-modal-title" className="text-text text-lg font-semibold">
              {tPreview("title")}
            </h2>
            <button
              onClick={onCancel}
              className="text-text-muted hover:text-text rounded-lg p-1 transition-colors"
              aria-label={tPreview("cancel")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] space-y-5 overflow-y-auto p-5">
            {/* Card Preview */}
            <div>
              <p className="text-text-muted mb-3 text-sm">{tPreview("description")}</p>
              <div className="border-border bg-bg overflow-hidden rounded-xl border">
                {/* Preview Image */}
                <div className="bg-surface-elevated relative aspect-[4/3] w-full">
                  {previewImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewImageUrl} alt={title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <FileText className="text-text-muted h-12 w-12" aria-hidden="true" />
                    </div>
                  )}
                  {/* Price badge */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                        priceType === "free"
                          ? "bg-success text-text-on-accent"
                          : "bg-surface text-text border-border border shadow-sm"
                      }`}
                    >
                      {formattedPrice}
                    </span>
                  </div>
                </div>
                {/* Card body */}
                <div className="p-3">
                  <h3 className="text-text truncate text-sm font-semibold">{title || "–"}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {subject && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${subjectPillClass}`}
                      >
                        {subject}
                      </span>
                    )}
                    {cycle && (
                      <span className="text-text-muted bg-surface-elevated rounded-full px-2 py-0.5 text-xs">
                        {cycleLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Grid */}
            <div>
              <h3 className="text-text mb-2 text-sm font-semibold">{tPreview("summaryTitle")}</h3>
              <div className="bg-bg border-border divide-border divide-y rounded-lg border text-sm">
                <div className="flex justify-between px-3 py-2">
                  <span className="text-text-muted">{tPreview("type")}</span>
                  <span className="text-text font-medium">{resourceType.toUpperCase()}</span>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <span className="text-text-muted">{tPreview("cycle")}</span>
                  <span className="text-text font-medium">{cycleLabel}</span>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <span className="text-text-muted">{tPreview("subject")}</span>
                  <span className="text-text font-medium">{subject || "–"}</span>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <span className="text-text-muted">{tPreview("price")}</span>
                  <span className="text-text font-medium">{formattedPrice}</span>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <span className="text-text-muted">{tPreview("file")}</span>
                  <span className="text-text max-w-[200px] truncate font-medium">
                    {fileName || "–"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-border flex gap-3 border-t p-5">
            <button
              onClick={onCancel}
              className="border-border text-text hover:bg-surface-elevated flex-1 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-colors"
            >
              {tPreview("cancel")}
            </button>
            <button
              onClick={onConfirm}
              className="from-primary to-primary-hover text-text-on-accent flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-4 py-2.5 text-sm font-semibold shadow-lg transition-all hover:shadow-xl"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              {tPreview("confirm")}
            </button>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
}
