"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LoginLink } from "@/components/ui/LoginLink";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Check, AlertTriangle, X, Clock, Info, ArrowRight, ExternalLink } from "lucide-react";
import type { StripeStatus } from "@/lib/types/account";

export default function SellerOnboardingCompletePage() {
  const { status: sessionStatus } = useSession();
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const t = useTranslations("sellerOnboarding");
  const tCommon = useTranslations("common");

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

  const handleContinueStripeOnboarding = async () => {
    setIsStripeLoading(true);
    try {
      const res = await fetch("/api/seller/connect", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || t("error.fetchFailed"));
        setIsStripeLoading(false);
      }
    } catch {
      setError(t("error.fetchFailed"));
      setIsStripeLoading(false);
    }
  };

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
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb
              items={[
                { label: tCommon("breadcrumb.becomeSeller"), href: "/verkaeufer-werden" },
                { label: t("breadcrumbComplete") },
              ]}
            />
          </div>

          {sessionStatus === "loading" || isLoading ? (
            <div className="text-center">
              <div className="border-primary mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent" />
              <p className="text-text-muted">{t("loading")}</p>
            </div>
          ) : sessionStatus === "unauthenticated" ? (
            <div className="card p-8 text-center">
              <div className="bg-error-light mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                <AlertTriangle className="text-error h-8 w-8" aria-hidden="true" />
              </div>
              <h1 className="text-text mb-2 text-xl font-bold">{t("notLoggedIn.title")}</h1>
              <p className="text-text-muted mb-6">{t("notLoggedIn.description")}</p>
              <LoginLink className="btn btn-primary px-6 py-2">
                {t("notLoggedIn.loginButton")}
              </LoginLink>
            </div>
          ) : error ? (
            <div className="card p-8 text-center">
              <div className="bg-error-light mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                <X className="text-error h-8 w-8" aria-hidden="true" />
              </div>
              <h1 className="text-text mb-2 text-xl font-bold">{t("error.title")}</h1>
              <p className="text-text-muted mb-6">{error}</p>
              <Link href="/verkaeufer-werden" className="btn btn-primary px-6 py-2">
                {t("error.tryAgain")}
              </Link>
            </div>
          ) : isFullySetup ? (
            <div className="card p-8 text-center">
              <div className="bg-success-light mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                <Check className="text-success h-8 w-8" aria-hidden="true" />
              </div>
              <h1 className="text-text mb-2 text-2xl font-bold">{t("success.title")}</h1>
              <p className="text-text-muted mb-6">{t("success.description")}</p>

              <div className="bg-bg-secondary mb-8 rounded-lg p-4">
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <Check className="text-success h-5 w-5" aria-hidden="true" />
                    <span className="text-text-secondary text-sm">
                      {t("success.chargesEnabled")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {stripeStatus?.payoutsEnabled ? (
                      <Check className="text-success h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Clock className="text-warning h-5 w-5" aria-hidden="true" />
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
                <Link
                  href="/hochladen"
                  className="btn btn-primary inline-flex items-center justify-center gap-2 px-6 py-2"
                >
                  {t("success.uploadFirst")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                {stripeStatus?.dashboardUrl && (
                  <a
                    href={stripeStatus.dashboardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary inline-flex items-center justify-center gap-2 px-6 py-2"
                  >
                    {t("success.viewDashboard")}
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
              </div>

              <div className="mt-4">
                <Link href="/konto" className="text-text-muted text-sm hover:underline">
                  {t("backToAccount")}
                </Link>
              </div>
            </div>
          ) : isPending ? (
            <div className="card p-8 text-center">
              <div className="bg-warning-light mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                <Clock className="text-warning h-8 w-8" aria-hidden="true" />
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

              <button
                onClick={handleContinueStripeOnboarding}
                disabled={isStripeLoading}
                className="btn btn-primary inline-flex items-center gap-2 px-6 py-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isStripeLoading ? t("pending.continueLoading") : t("pending.continueSetup")}
                {!isStripeLoading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
              </button>

              <div className="mt-4">
                <Link href="/konto" className="text-text-muted text-sm hover:underline">
                  {t("backToAccount")}
                </Link>
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <div className="bg-primary-light mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                <Info className="text-primary h-8 w-8" aria-hidden="true" />
              </div>
              <h1 className="text-text mb-2 text-xl font-bold">{t("noAccount.title")}</h1>
              <p className="text-text-muted mb-6">{t("noAccount.description")}</p>
              <Link
                href="/verkaeufer-werden"
                className="btn btn-primary inline-flex items-center gap-2 px-6 py-2"
              >
                {t("noAccount.startSetup")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
