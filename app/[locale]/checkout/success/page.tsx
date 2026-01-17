"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";

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
  };
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { status: sessionStatus } = useSession();
  const t = useTranslations("checkoutSuccess");

  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const isPending = transaction?.status === "PENDING";
  const isCompleted = transaction?.status === "COMPLETED";

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          {sessionStatus === "loading" || isLoading ? (
            <div className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
              <p className="text-[var(--color-text-muted)]">{t("loading")}</p>
            </div>
          ) : sessionStatus === "unauthenticated" ? (
            <div className="card p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-error-light)]">
                <svg
                  className="h-8 w-8 text-[var(--color-error)]"
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
              <h1 className="mb-2 text-xl font-bold text-[var(--color-text)]">
                {t("notLoggedIn.title")}
              </h1>
              <p className="mb-6 text-[var(--color-text-muted)]">
                {t("notLoggedIn.description")}
              </p>
              <Link href="/login" className="btn btn-primary px-6 py-2">
                {t("notLoggedIn.loginButton")}
              </Link>
            </div>
          ) : error ? (
            <div className="card p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-error-light)]">
                <svg
                  className="h-8 w-8 text-[var(--color-error)]"
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
              <h1 className="mb-2 text-xl font-bold text-[var(--color-text)]">
                {t("error.title")}
              </h1>
              <p className="mb-6 text-[var(--color-text-muted)]">{error}</p>
              <Link href="/resources" className="btn btn-primary px-6 py-2">
                {t("error.browseResources")}
              </Link>
            </div>
          ) : transaction ? (
            <div className="card p-8 text-center">
              {/* Success Icon */}
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-success-light)]">
                <svg
                  className="h-8 w-8 text-[var(--color-success)]"
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

              {/* Title and Description */}
              <h1 className="mb-2 text-2xl font-bold text-[var(--color-text)]">
                {isPending ? t("pending.title") : t("success.title")}
              </h1>
              <p className="mb-6 text-[var(--color-text-muted)]">
                {isPending ? t("pending.description") : t("success.description")}
              </p>

              {/* Purchase Details */}
              <div className="mb-8 rounded-lg bg-[var(--color-bg-secondary)] p-6 text-left">
                <h2 className="mb-4 font-semibold text-[var(--color-text)]">
                  {t("purchaseDetails.title")}
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">
                      {t("purchaseDetails.resource")}
                    </span>
                    <span className="font-medium text-[var(--color-text)]">
                      {transaction.resource.title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">
                      {t("purchaseDetails.amount")}
                    </span>
                    <span className="font-medium text-[var(--color-text)]">
                      {transaction.amountFormatted}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">
                      {t("purchaseDetails.status")}
                    </span>
                    <span
                      className={`font-medium ${
                        isCompleted
                          ? "text-[var(--color-success)]"
                          : "text-[var(--color-warning)]"
                      }`}
                    >
                      {isCompleted
                        ? t("purchaseDetails.statusCompleted")
                        : t("purchaseDetails.statusPending")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href={`/resources/${transaction.resource.id}`}
                  className="btn btn-primary px-6 py-2"
                >
                  {t("actions.viewResource")}
                </Link>
                <Link
                  href="/account/library"
                  className="btn btn-secondary px-6 py-2"
                >
                  {t("actions.goToLibrary")}
                </Link>
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-light)]">
                <svg
                  className="h-8 w-8 text-[var(--color-primary)]"
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
              <h1 className="mb-2 text-xl font-bold text-[var(--color-text)]">
                {t("noTransaction.title")}
              </h1>
              <p className="mb-6 text-[var(--color-text-muted)]">
                {t("noTransaction.description")}
              </p>
              <Link href="/resources" className="btn btn-primary px-6 py-2">
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
