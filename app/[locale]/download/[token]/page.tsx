"use client";

import { useState, useEffect, use } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";

interface DownloadInfo {
  status: "valid" | "expired" | "max_downloads";
  expiresAt: string;
  downloadCount: number;
  maxDownloads: number;
  remainingDownloads: number;
  purchaseDate: string;
  amount: number;
  amountFormatted: string;
  resource: {
    id: string;
    title: string;
    description: string;
    subjects: string[];
    cycles: string[];
    sellerName: string;
  };
}

export default function GuestDownloadPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const t = useTranslations("guestDownload");

  const [info, setInfo] = useState<DownloadInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    async function fetchInfo() {
      try {
        const res = await fetch(`/api/download/${token}/info`);
        const data = await res.json();

        if (!res.ok) {
          if (data.error === "invalid_token") {
            setError("invalid_token");
          } else if (data.error === "payment_incomplete") {
            setError("payment_incomplete");
          } else {
            setError("generic");
          }
          return;
        }

        setInfo(data);
      } catch {
        setError("generic");
      } finally {
        setIsLoading(false);
      }
    }

    fetchInfo();
  }, [token]);

  async function handleDownload() {
    if (!info || info.status !== "valid") return;

    setIsDownloading(true);
    try {
      // Create a temporary link to trigger the download
      const link = document.createElement("a");
      link.href = `/api/download/${token}`;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update local state after a small delay to allow download to start
      setTimeout(() => {
        setDownloadSuccess(true);
        setInfo((prev) =>
          prev
            ? {
                ...prev,
                downloadCount: prev.downloadCount + 1,
                remainingDownloads: Math.max(0, prev.remainingDownloads - 1),
                status: prev.remainingDownloads - 1 <= 0 ? "max_downloads" : prev.status,
              }
            : null
        );
        setIsDownloading(false);
      }, 1000);
    } catch {
      setIsDownloading(false);
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center">
              <div className="border-primary mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent" />
              <p className="text-text-muted">{t("loading")}</p>
            </div>
          ) : error ? (
            <div className="card p-8 text-center">
              <div className="bg-error-light mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-error h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-text mb-2 text-xl font-bold">{t(`errors.${error}.title`)}</h1>
              <p className="text-text-muted mb-6">{t(`errors.${error}.description`)}</p>
              <Link href="/materialien" className="btn btn-primary px-6 py-2">
                {t("browseResources")}
              </Link>
            </div>
          ) : info?.status === "expired" ? (
            <div className="card p-8 text-center">
              <div className="bg-warning-light mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-warning h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-text mb-2 text-xl font-bold">{t("expired.title")}</h1>
              <p className="text-text-muted mb-4">{t("expired.description")}</p>
              <p className="text-text-muted mb-6 text-sm">
                {t("expired.expiredOn", { date: formatDate(info.expiresAt) })}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href="/register" className="btn btn-primary px-6 py-2">
                  {t("createAccount")}
                </Link>
                <Link href="/materialien" className="btn btn-secondary px-6 py-2">
                  {t("browseResources")}
                </Link>
              </div>
            </div>
          ) : info?.status === "max_downloads" ? (
            <div className="card p-8 text-center">
              <div className="bg-warning-light mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-warning h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-text mb-2 text-xl font-bold">{t("maxDownloads.title")}</h1>
              <p className="text-text-muted mb-4">
                {t("maxDownloads.description", { max: info.maxDownloads })}
              </p>
              <p className="text-text-muted mb-6 text-sm">{t("maxDownloads.suggestion")}</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href="/register" className="btn btn-primary px-6 py-2">
                  {t("createAccount")}
                </Link>
                <Link href="/materialien" className="btn btn-secondary px-6 py-2">
                  {t("browseResources")}
                </Link>
              </div>
            </div>
          ) : info ? (
            <div className="card p-8">
              {/* Success Icon or Download Icon */}
              <div className="mb-6 text-center">
                <div
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
                    downloadSuccess ? "bg-success-light" : "bg-primary-light"
                  }`}
                >
                  {downloadSuccess ? (
                    <svg
                      className="text-success h-8 w-8"
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
                  ) : (
                    <svg
                      className="text-primary h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  )}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-text mb-2 text-center text-2xl font-bold">
                {downloadSuccess ? t("success.title") : t("ready.title")}
              </h1>
              <p className="text-text-muted mb-6 text-center">
                {downloadSuccess ? t("success.description") : t("ready.description")}
              </p>

              {/* Resource Details */}
              <div className="bg-bg-secondary mb-6 rounded-lg p-6">
                <h2 className="text-text mb-4 font-semibold">{info.resource.title}</h2>
                <p className="text-text-muted mb-4 text-sm">
                  {info.resource.description.length > 200
                    ? `${info.resource.description.slice(0, 200)}...`
                    : info.resource.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {info.resource.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="bg-primary-light text-primary rounded px-2 py-1 text-xs"
                    >
                      {subject}
                    </span>
                  ))}
                  {info.resource.cycles.map((cycle) => (
                    <span
                      key={cycle}
                      className="bg-bg-tertiary text-text-muted rounded px-2 py-1 text-xs"
                    >
                      {cycle}
                    </span>
                  ))}
                </div>
              </div>

              {/* Download Info */}
              <div className="mb-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">{t("info.remainingDownloads")}</span>
                  <span className="text-text font-medium">
                    {info.remainingDownloads} / {info.maxDownloads}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">{t("info.expiresOn")}</span>
                  <span className="text-text font-medium">{formatDate(info.expiresAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">{t("info.purchaseDate")}</span>
                  <span className="text-text font-medium">{formatDate(info.purchaseDate)}</span>
                </div>
              </div>

              {/* Download Button */}
              {info.remainingDownloads > 0 && (
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="btn btn-primary mb-6 w-full py-3"
                >
                  {isDownloading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {t("downloading")}
                    </span>
                  ) : (
                    t("downloadButton")
                  )}
                </button>
              )}

              {/* Create Account CTA */}
              <div className="border-primary bg-primary-light rounded-lg border-2 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-full">
                    <svg
                      className="h-5 w-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-text text-lg font-semibold">{t("createAccountCta.title")}</h3>
                </div>
                <p className="text-text-muted mb-4 text-sm">{t("createAccountCta.description")}</p>
                <ul className="text-text mb-5 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <svg
                      className="text-success h-4 w-4 flex-shrink-0"
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
                    {t("createAccountCta.benefits.unlimitedDownloads")}
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="text-success h-4 w-4 flex-shrink-0"
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
                    {t("createAccountCta.benefits.neverExpires")}
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="text-success h-4 w-4 flex-shrink-0"
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
                    {t("createAccountCta.benefits.purchaseHistory")}
                  </li>
                </ul>
                <Link href="/register" className="btn btn-primary w-full py-2.5">
                  {t("createAccountCta.button")}
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
