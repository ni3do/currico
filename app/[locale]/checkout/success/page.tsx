"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  CheckCircle,
  Download,
  Library,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface TransactionData {
  id: string;
  amount: number;
  amountFormatted: string;
  status: string;
  createdAt: string;
  resource: {
    id: string;
    title: string;
    description: string;
    subjects: string[];
    cycles: string[];
    previewUrl?: string | null;
    seller: {
      id: string;
      name: string | null;
      displayName: string | null;
      image: string | null;
    };
  };
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { status: sessionStatus } = useSession();
  const t = useTranslations("checkoutSuccess");
  const tCommon = useTranslations("common");

  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    async function fetchTransaction() {
      if (!sessionId) {
        setError(t("errors.noSession"));
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/payments/checkout-session/${sessionId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || t("errors.fetchFailed"));
          return;
        }

        setTransaction(data);
      } catch {
        setError(t("errors.fetchFailed"));
      } finally {
        setIsLoading(false);
      }
    }

    if (sessionStatus === "authenticated") {
      fetchTransaction();
    } else if (sessionStatus === "unauthenticated") {
      setIsLoading(false);
    }
  }, [sessionId, sessionStatus, t]);

  const handleDownload = async () => {
    if (!transaction) return;
    setIsDownloading(true);
    try {
      window.open(`/api/materials/${transaction.resource.id}/download`, "_blank");
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  const isPending = transaction?.status === "PENDING";
  const isCompleted = transaction?.status === "COMPLETED";

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:py-6">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: tCommon("breadcrumb.checkout"), href: "/materialien" },
              { label: tCommon("breadcrumb.checkoutSuccess") },
            ]}
            className="mb-4"
          />
          {sessionStatus === "loading" || isLoading ? (
            <div className="py-16 text-center">
              <div className="border-primary mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent" />
              <p className="text-text-muted">{t("loading")}</p>
            </div>
          ) : sessionStatus === "unauthenticated" ? (
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-text mb-2 text-xl font-bold">{t("notLoggedIn.title")}</h1>
              <p className="text-text-muted mb-6">{t("notLoggedIn.description")}</p>
              <Link href="/login" className="btn btn-primary px-6 py-2">
                {t("notLoggedIn.loginButton")}
              </Link>
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
              <h1 className="text-text mb-2 text-xl font-bold">{t("error.title")}</h1>
              <p className="text-text-muted mb-6">{error}</p>
              <Link href="/materialien" className="btn btn-primary px-6 py-2">
                {t("error.browseResources")}
              </Link>
            </div>
          ) : transaction ? (
            <div className="space-y-6">
              {/* Success Header */}
              <div className="card overflow-hidden">
                {/* Gradient header with confetti effect */}
                <div className="from-success to-primary relative bg-gradient-to-r px-6 py-8 text-center">
                  <div className="absolute inset-0 opacity-20">
                    <Sparkles className="absolute top-4 left-8 h-6 w-6 animate-pulse text-white" />
                    <Sparkles className="absolute top-12 right-12 h-4 w-4 animate-pulse text-white delay-100" />
                    <Sparkles className="absolute bottom-6 left-1/4 h-5 w-5 animate-pulse text-white delay-200" />
                    <Sparkles className="absolute top-6 right-1/4 h-4 w-4 animate-pulse text-white delay-300" />
                  </div>
                  <div className="relative">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      {isPending ? (
                        <Clock className="h-8 w-8 text-white" />
                      ) : (
                        <CheckCircle className="h-8 w-8 text-white" />
                      )}
                    </div>
                    <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
                      {isPending ? t("pending.title") : t("success.title")}
                    </h1>
                    <p className="mx-auto max-w-md text-white/90">
                      {isPending ? t("pending.description") : t("success.description")}
                    </p>
                  </div>
                </div>

                {/* Resource Preview Card */}
                <div className="p-6">
                  <div className="flex flex-col gap-6 sm:flex-row">
                    {/* Preview Image */}
                    <div className="flex-shrink-0 sm:w-48">
                      <div className="bg-bg-secondary relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-md">
                        {transaction.resource.previewUrl ? (
                          <Image
                            src={transaction.resource.previewUrl}
                            alt={transaction.resource.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <FileText className="text-text-faint h-12 w-12" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Resource Info */}
                    <div className="min-w-0 flex-1">
                      {/* Subject & Cycle badges */}
                      <div className="mb-3 flex flex-wrap gap-2">
                        {transaction.resource.subjects?.slice(0, 2).map((subject) => (
                          <span
                            key={subject}
                            className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                          >
                            {subject}
                          </span>
                        ))}
                        {transaction.resource.cycles?.slice(0, 1).map((cycle) => (
                          <span
                            key={cycle}
                            className="bg-accent/10 text-accent inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                          >
                            {cycle}
                          </span>
                        ))}
                      </div>

                      {/* Title */}
                      <h2 className="text-text mb-2 line-clamp-2 text-xl font-bold">
                        {transaction.resource.title}
                      </h2>

                      {/* Description */}
                      {transaction.resource.description && (
                        <p className="text-text-muted mb-4 line-clamp-2 text-sm">
                          {transaction.resource.description}
                        </p>
                      )}

                      {/* Seller info */}
                      <div className="text-text-muted flex items-center gap-2 text-sm">
                        {transaction.resource.seller.image ? (
                          <Image
                            src={transaction.resource.seller.image}
                            alt={transaction.resource.seller.displayName || "Seller"}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full">
                            <span className="text-primary text-xs font-medium">
                              {(transaction.resource.seller.displayName ||
                                transaction.resource.seller.name ||
                                "?")[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span>
                          {t("purchaseDetails.by")}{" "}
                          <Link
                            href={`/seller/${transaction.resource.seller.id}`}
                            className="text-primary font-medium hover:underline"
                          >
                            {transaction.resource.seller.displayName ||
                              transaction.resource.seller.name ||
                              "Unknown"}
                          </Link>
                        </span>
                      </div>
                    </div>

                    {/* Price display */}
                    <div className="flex-shrink-0 sm:text-right">
                      <div className="text-text text-2xl font-bold">
                        {transaction.amountFormatted}
                      </div>
                      <div
                        className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          isCompleted ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-3.5 w-3.5" />
                        ) : (
                          <Clock className="h-3.5 w-3.5" />
                        )}
                        {isCompleted
                          ? t("purchaseDetails.statusCompleted")
                          : t("purchaseDetails.statusPending")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Download Button - Primary */}
                <button
                  onClick={handleDownload}
                  disabled={isDownloading || isPending}
                  className="group bg-primary hover:bg-primary-hover relative flex items-center justify-center gap-3 rounded-xl px-6 py-4 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download className={`h-5 w-5 ${isDownloading ? "animate-bounce" : ""}`} />
                  <span>{isDownloading ? t("actions.downloading") : t("actions.downloadNow")}</span>
                  {!isPending && (
                    <ArrowRight className="h-4 w-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  )}
                </button>

                {/* Go to Library Button - Secondary */}
                <Link
                  href="/account?tab=library"
                  className="group border-border bg-surface text-text hover:border-primary hover:bg-primary/5 flex items-center justify-center gap-3 rounded-xl border-2 px-6 py-4 font-semibold transition-all"
                >
                  <Library className="h-5 w-5" />
                  <span>{t("actions.goToLibrary")}</span>
                  <ArrowRight className="h-4 w-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
              </div>

              {/* Quick Tips */}
              <div className="card bg-bg-secondary/50 p-5">
                <h3 className="text-text mb-3 text-sm font-semibold">{t("tips.title")}</h3>
                <ul className="text-text-muted space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{t("tips.accessAnytime")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{t("tips.findInLibrary")}</span>
                  </li>
                </ul>
              </div>

              {/* Continue Shopping Link */}
              <div className="text-center">
                <Link
                  href="/materialien"
                  className="text-text-muted hover:text-primary inline-flex items-center gap-2 text-sm transition-colors"
                >
                  {t("actions.continueBrowsing")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <div className="bg-primary-light mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-text mb-2 text-xl font-bold">{t("noTransaction.title")}</h1>
              <p className="text-text-muted mb-6">{t("noTransaction.description")}</p>
              <Link href="/materialien" className="btn btn-primary px-6 py-2">
                {t("noTransaction.browseResources")}
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
