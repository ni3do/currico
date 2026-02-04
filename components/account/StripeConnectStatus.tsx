"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

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

interface StripeConnectStatusProps {
  isSeller: boolean;
}

export function StripeConnectStatus({ isSeller }: StripeConnectStatusProps) {
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("stripeConnectStatus");

  const fetchStatus = useCallback(async () => {
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
  }, [t]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const isFullySetup = stripeStatus?.chargesEnabled && stripeStatus?.detailsSubmitted;
  const isPending = stripeStatus?.hasAccount && !stripeStatus?.chargesEnabled;
  const hasRequirements =
    stripeStatus?.requirements &&
    (stripeStatus.requirements.currentlyDue.length > 0 ||
      stripeStatus.requirements.pastDue.length > 0);

  // Loading state
  if (isLoading) {
    return (
      <div className="border-border bg-surface rounded-2xl border p-6">
        <div className="flex items-center gap-3">
          <div className="bg-bg h-10 w-10 animate-pulse rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="bg-bg h-4 w-32 animate-pulse rounded" />
            <div className="bg-bg h-3 w-48 animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="border-error/30 bg-error/5 rounded-2xl border p-6">
        <div className="flex items-start gap-4">
          <div className="bg-error/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
            <svg
              className="text-error h-5 w-5"
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
          <div className="flex-1">
            <h3 className="text-text font-semibold">{t("error.title")}</h3>
            <p className="text-text-muted mt-1 text-sm">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                fetchStatus();
              }}
              className="text-primary mt-3 text-sm font-medium hover:underline"
            >
              {t("error.tryAgain")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fully setup - show success state
  if (isFullySetup) {
    return (
      <div className="border-success/30 bg-success/5 rounded-2xl border p-6">
        <div className="flex items-start gap-4">
          <div className="bg-success/20 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
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
          </div>
          <div className="flex-1">
            <h3 className="text-text font-semibold">{t("active.title")}</h3>
            <p className="text-text-muted mt-1 text-sm">{t("active.description")}</p>

            {/* Status indicators */}
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="bg-success/10 flex items-center gap-1.5 rounded-full px-3 py-1">
                <svg
                  className="text-success h-4 w-4"
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
                <span className="text-success text-xs font-medium">
                  {t("active.chargesEnabled")}
                </span>
              </div>
              <div className="bg-success/10 flex items-center gap-1.5 rounded-full px-3 py-1">
                {stripeStatus?.payoutsEnabled ? (
                  <>
                    <svg
                      className="text-success h-4 w-4"
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
                    <span className="text-success text-xs font-medium">
                      {t("active.payoutsEnabled")}
                    </span>
                  </>
                ) : (
                  <>
                    <svg
                      className="text-warning h-4 w-4"
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
                    <span className="text-warning text-xs font-medium">
                      {t("active.payoutsPending")}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Stripe Dashboard Button */}
            {stripeStatus?.dashboardUrl && (
              <a
                href={stripeStatus.dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-surface text-text hover:bg-bg-secondary mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-all hover:shadow"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                {t("active.viewDashboard")}
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Pending state - onboarding incomplete
  if (isPending) {
    return (
      <div className="border-warning/30 bg-warning/5 rounded-2xl border p-6">
        <div className="flex items-start gap-4">
          <div className="bg-warning/20 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
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
          </div>
          <div className="flex-1">
            <h3 className="text-text font-semibold">{t("pending.title")}</h3>
            <p className="text-text-muted mt-1 text-sm">
              {hasRequirements ? t("pending.requirementsNeeded") : t("pending.description")}
            </p>

            {hasRequirements && stripeStatus?.requirements && (
              <div className="bg-bg mt-3 rounded-lg p-3">
                <p className="text-text-secondary mb-2 text-xs font-medium">
                  {t("pending.requiredInfo")}
                </p>
                <ul className="text-text-muted list-inside list-disc space-y-1 text-xs">
                  {stripeStatus.requirements.currentlyDue.slice(0, 3).map((req, index) => (
                    <li key={index}>{req.replace(/_/g, " ")}</li>
                  ))}
                  {stripeStatus.requirements.currentlyDue.length > 3 && (
                    <li>
                      {t("pending.andMore", {
                        count: stripeStatus.requirements.currentlyDue.length - 3,
                      })}
                    </li>
                  )}
                </ul>
              </div>
            )}

            <Link
              href="/become-seller"
              className="bg-warning text-text-on-accent hover:bg-warning-hover mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              {t("pending.continueSetup")}
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // No account - show invitation to become a seller
  if (!isSeller && !stripeStatus?.hasAccount) {
    return (
      <div className="border-primary/30 from-primary/5 to-accent/5 rounded-2xl border bg-gradient-to-br p-6">
        <div className="flex items-start gap-4">
          <div className="bg-primary/20 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
            <svg
              className="text-primary h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-text font-semibold">{t("invite.title")}</h3>
            <p className="text-text-muted mt-1 text-sm">{t("invite.description")}</p>

            {/* Benefits */}
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="bg-bg flex items-center gap-1.5 rounded-full px-3 py-1">
                <span className="text-text-secondary text-xs font-medium">
                  {t("invite.benefit1")}
                </span>
              </div>
              <div className="bg-bg flex items-center gap-1.5 rounded-full px-3 py-1">
                <span className="text-text-secondary text-xs font-medium">
                  {t("invite.benefit2")}
                </span>
              </div>
            </div>

            <Link
              href="/become-seller"
              className="bg-primary text-text-on-accent hover:bg-primary-hover mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              {t("invite.cta")}
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fallback - no account but is seller (shouldn't happen in normal flow)
  return null;
}
