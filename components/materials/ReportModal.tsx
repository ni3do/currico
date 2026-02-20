"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FocusTrap } from "@/components/ui/FocusTrap";
import { useToast } from "@/components/ui/Toast";

interface ReportModalProps {
  materialId: string;
  onClose: () => void;
}

export function ReportModal({ materialId, onClose }: ReportModalProps) {
  const { status: sessionStatus } = useSession();
  const router = useRouter();
  const t = useTranslations("materialDetail");
  const tCommon = useTranslations("common");
  const { toast } = useToast();

  const [reportReason, setReportReason] = useState("inappropriate");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportStatus, setReportStatus] = useState<"idle" | "success" | "error">("idle");
  const [reportErrorMessage, setReportErrorMessage] = useState("");

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (sessionStatus !== "authenticated") {
      router.push("/anmelden");
      return;
    }

    setReportSubmitting(true);
    setReportErrorMessage("");

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: reportReason,
          description: reportDescription || undefined,
          resource_id: materialId,
        }),
      });

      const data = await response.json();

      if (response.status === 409) {
        throw new Error(t("report.alreadyReported"));
      }

      if (!response.ok) {
        throw new Error(data.error || t("report.errorSend"));
      }

      setReportStatus("success");
      toast(tCommon("toast.reportSubmitted"), "success");
      setTimeout(() => {
        onClose();
      }, 4000);
    } catch (error) {
      setReportStatus("error");
      setReportErrorMessage(error instanceof Error ? error.message : t("report.errorUnexpected"));
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleClose = () => {
    if (reportStatus !== "success") {
      onClose();
    }
  };

  return (
    <div className="bg-ctp-crust/50 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <FocusTrap onEscape={handleClose}>
        <div className="card mx-4 w-full max-w-md p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-text text-xl font-semibold">{t("report.title")}</h3>
            <button
              onClick={handleClose}
              aria-label={t("a11y.closeDialog")}
              className="text-text-muted hover:text-text"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {reportStatus === "success" ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="bg-success-light mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <svg
                  className="text-success h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h4 className="text-text mb-2 font-semibold">{t("report.successTitle")}</h4>
              <p className="text-text-muted text-sm">{t("report.successDescription")}</p>
            </div>
          ) : (
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label htmlFor="report-reason" className="text-text mb-2 block text-sm font-medium">
                  {t("report.reason")}
                </label>
                <select
                  id="report-reason"
                  name="reason"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="input"
                  required
                >
                  <option value="inappropriate">{t("report.reasons.inappropriate")}</option>
                  <option value="copyright">{t("report.reasons.copyright")}</option>
                  <option value="quality">{t("report.reasons.quality")}</option>
                  <option value="spam">{t("report.reasons.spam")}</option>
                  <option value="fraud">{t("report.reasons.fraud")}</option>
                  <option value="other">{t("report.reasons.other")}</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="report-description"
                  className="text-text mb-2 block text-sm font-medium"
                >
                  {t("report.commentLabel")}
                </label>
                <textarea
                  id="report-description"
                  name="description"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  className="input min-h-[100px] resize-y"
                  placeholder={t("report.commentPlaceholder")}
                />
              </div>

              {/* Error Message */}
              {reportStatus === "error" && reportErrorMessage && (
                <div className="border-error/50 bg-error/10 flex items-center gap-3 rounded-lg border p-3">
                  <svg
                    className="text-error h-5 w-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-error text-sm">{reportErrorMessage}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={reportSubmitting}
                  className="btn-danger flex-1 px-4 py-3 disabled:opacity-50"
                >
                  {reportSubmitting ? t("report.submitting") : t("report.submit")}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={reportSubmitting}
                  className="btn-secondary px-6 py-3 disabled:opacity-50"
                >
                  {t("report.cancel")}
                </button>
              </div>
            </form>
          )}
        </div>
      </FocusTrap>
    </div>
  );
}

export default ReportModal;
