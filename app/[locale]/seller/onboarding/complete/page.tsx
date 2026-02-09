"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";

interface StripeStatus {
  hasAccount: boolean;
  accountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  onboardingComplete: boolean;
  termsAccepted: boolean;
  role: string;
  dashboardUrl: string | null;
  requirements: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
    pendingVerification: string[];
  } | null;
  error?: string;
}

export default function SellerOnboardingCompletePage() {
  const { status: sessionStatus } = useSession();
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("sellerOnboarding");

  useEffect(() => {
    async function fetchStripeStatus() {
      try {
        const res = await fetch("/api/seller/connect/status");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || t("error.fetchFailed"));
          return;
        }

        setStripeStatus(data);
      } catch {
        setError(t("error.fetchFailed"));
      } finally {
        setIsLoading(false);
      }
    }

    if (sessionStatus === "authenticated") {
      fetchStripeStatus();
    } else if (sessionStatus === "unauthenticated") {
      setIsLoading(false);
    }
  }, [sessionStatus, t]);

  const isFullySetup = stripeStatus?.chargesEnabled && stripeStatus?.detailsSubmitted;
  const isPending = stripeStatus?.hasAccount && !stripeStatus?.chargesEnabled;
  const hasRequirements =
    stripeStatus?.requirements &&
    (stripeStatus.requirements.currentlyDue.length > 0 ||
      stripeStatus.requirements.pastDue.length > 0);

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          {sessionStatus === "loading" || isLoading ? (
            <div className="text-center">
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
              <Link href="/become-seller" className="btn btn-primary px-6 py-2">
                {t("error.tryAgain")}
              </Link>
            </div>
          ) : isFullySetup ? (
            <div className="card p-8 text-center">
              <div className="bg-success-light mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
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
              </div>
              <h1 className="text-text mb-2 text-2xl font-bold">{t("success.title")}</h1>
              <p className="text-text-muted mb-6">{t("success.description")}</p>

              <div className="bg-bg-secondary mb-8 rounded-lg p-4">
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <svg
                      className="text-success h-5 w-5"
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
                    <span className="text-text-secondary text-sm">
                      {t("success.chargesEnabled")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {stripeStatus?.payoutsEnabled ? (
                      <svg
                        className="text-success h-5 w-5"
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
                        className="text-warning h-5 w-5"
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
                    )}
                    <span className="text-text-secondary text-sm">
                      {stripeStatus?.payoutsEnabled
                        ? t("success.payoutsEnabled")
                        : t("success.payoutsPending")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href="/account/materials/new" className="btn btn-primary px-6 py-2">
                  {t("success.uploadFirst")}
                </Link>
                {stripeStatus?.dashboardUrl && (
                  <a
                    href={stripeStatus.dashboardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary px-6 py-2"
                  >
                    {t("success.viewDashboard")}
                  </a>
                )}
              </div>
            </div>
          ) : isPending ? (
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
              <h1 className="text-text mb-2 text-xl font-bold">{t("pending.title")}</h1>
              <p className="text-text-muted mb-6">
                {hasRequirements ? t("pending.requirementsNeeded") : t("pending.description")}
              </p>

              {hasRequirements && stripeStatus?.requirements && (
                <div className="bg-bg-secondary mb-6 rounded-lg p-4 text-left">
                  <p className="text-text mb-2 text-sm font-medium">{t("pending.requiredInfo")}</p>
                  <ul className="text-text-muted list-inside list-disc space-y-1 text-sm">
                    {stripeStatus.requirements.currentlyDue.slice(0, 5).map((req, index) => (
                      <li key={index}>{req.replace(/_/g, " ")}</li>
                    ))}
                    {stripeStatus.requirements.currentlyDue.length > 5 && (
                      <li>
                        {t("pending.andMore", {
                          count: stripeStatus.requirements.currentlyDue.length - 5,
                        })}
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <Link href="/become-seller" className="btn btn-primary px-6 py-2">
                {t("pending.continueSetup")}
              </Link>
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
              <h1 className="text-text mb-2 text-xl font-bold">{t("noAccount.title")}</h1>
              <p className="text-text-muted mb-6">{t("noAccount.description")}</p>
              <Link href="/become-seller" className="btn btn-primary px-6 py-2">
                {t("noAccount.startSetup")}
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
