"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { LoginLink } from "@/components/ui/LoginLink";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { StripeStatus } from "@/lib/types/account";

interface UserData {
  emailVerified: string | null;
  sellerTermsAcceptedAt: string | null;
}

// Stepper component for onboarding progress
function OnboardingStepper({
  isLoggedIn,
  isEmailVerified,
  hasAcceptedTerms,
  stripeComplete,
  t,
}: {
  isLoggedIn: boolean;
  isEmailVerified: boolean;
  hasAcceptedTerms: boolean;
  stripeComplete: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const steps = [
    { label: t("stepLogin"), completed: isLoggedIn },
    { label: t("stepVerifyEmail"), completed: isEmailVerified },
    { label: t("stepAcceptTerms"), completed: hasAcceptedTerms },
    { label: t("stepConnectStripe"), completed: stripeComplete },
  ];

  // Find the current step (first incomplete)
  const currentIndex = steps.findIndex((s) => !s.completed);

  return (
    <div className="mb-10">
      <div className="flex items-center justify-center">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  step.completed
                    ? "bg-success text-white"
                    : i === currentIndex
                      ? "bg-primary text-white"
                      : "bg-bg-secondary text-text-muted"
                }`}
              >
                {step.completed ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`mt-1.5 text-xs ${
                  step.completed
                    ? "text-success font-medium"
                    : i === currentIndex
                      ? "text-primary font-medium"
                      : "text-text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
            {/* Connecting line */}
            {i < steps.length - 1 && (
              <div
                className={`mx-2 mb-5 h-0.5 w-8 sm:w-12 ${
                  step.completed ? "bg-success" : "bg-bg-secondary"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BecomeSellerPage() {
  const { status } = useSession();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [fetchState, setFetchState] = useState<"idle" | "loading" | "done">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [termsAcceptedAt, setTermsAcceptedAt] = useState<string | null>(null);
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const t = useTranslations("becomeSeller");
  const tCommon = useTranslations("common");
  const tTerms = useTranslations("sellerTerms");
  const searchParams = useSearchParams();
  const router = useRouter();

  const isStripeRefresh = searchParams.get("stripe_refresh") === "true";

  // Fetch user data and Stripe status on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchUserData() {
      try {
        // Fetch user stats, terms status, and stripe status in parallel
        const [statsRes, termsRes, stripeRes] = await Promise.all([
          fetch("/api/user/stats"),
          fetch("/api/seller/accept-terms"),
          fetch("/api/seller/connect/status"),
        ]);

        if (!cancelled) {
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            if (statsData?.user) {
              setUserData({
                emailVerified: statsData.user.emailVerified,
                sellerTermsAcceptedAt: null,
              });
            }
          }

          if (termsRes.ok) {
            const termsData = await termsRes.json();
            if (termsData?.acceptedAt) {
              setTermsAcceptedAt(termsData.acceptedAt);
              setTermsAccepted(true);
            }
          }

          if (stripeRes.ok) {
            const stripeData = await stripeRes.json();
            setStripeStatus(stripeData);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setFetchState("done");
        }
      }
    }

    if (status === "authenticated") {
      setFetchState("loading");
      fetchUserData();
    }

    return () => {
      cancelled = true;
    };
  }, [status]);

  // Redirect to account if Stripe is fully active
  useEffect(() => {
    if (stripeStatus?.chargesEnabled && stripeStatus?.detailsSubmitted) {
      router.replace("/konto");
    }
  }, [stripeStatus, router]);

  const handleAcceptTerms = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/seller/accept-terms", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || t("cta.error"));
        return;
      }

      setTermsAcceptedAt(data.acceptedAt);
    } catch {
      setSubmitError(t("cta.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartStripeOnboarding = async () => {
    setIsStripeLoading(true);
    setStripeError(null);

    try {
      const res = await fetch("/api/seller/connect", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setStripeError(data.error || t("cta.stripeOnboardingError"));
        return;
      }

      // Redirect to Stripe onboarding
      if (data.url) {
        window.location.href = data.url;
      } else {
        setStripeError(t("cta.stripeOnboardingError"));
      }
    } catch {
      setStripeError(t("cta.stripeOnboardingError"));
      setIsStripeLoading(false);
    }
  };

  const isLoading = status === "loading" || (status === "authenticated" && fetchState !== "done");
  const isLoggedIn = status === "authenticated";
  const isEmailVerified = !!userData?.emailVerified;
  const hasAcceptedTerms = !!termsAcceptedAt;
  const isPendingVerification =
    stripeStatus?.hasAccount &&
    !stripeStatus?.chargesEnabled &&
    stripeStatus?.detailsSubmitted &&
    stripeStatus?.requirements?.pendingVerification &&
    stripeStatus.requirements.pendingVerification.length > 0;
  const isRestricted =
    stripeStatus?.hasAccount &&
    !stripeStatus?.chargesEnabled &&
    stripeStatus?.requirements &&
    (stripeStatus.requirements.currentlyDue.length > 0 ||
      stripeStatus.requirements.pastDue.length > 0);
  const stripeComplete = !!stripeStatus?.chargesEnabled && !!stripeStatus?.detailsSubmitted;

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <Breadcrumb items={[{ label: tCommon("breadcrumb.becomeSeller") }]} />
          <h1 className="text-text text-2xl font-bold sm:text-3xl">{t("hero.title")}</h1>
          <p className="text-text-muted mt-1">{t("hero.subtitle")}</p>
        </div>

        {/* Stripe Refresh Banner (13a) */}
        {isStripeRefresh && (
          <div className="border-warning/30 bg-warning/10 mb-8 rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <svg
                className="text-warning h-5 w-5 flex-shrink-0"
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
              <p className="text-text-secondary text-sm">{t("stripeRefreshMessage")}</p>
              {hasAcceptedTerms && (
                <button
                  onClick={handleStartStripeOnboarding}
                  disabled={isStripeLoading}
                  className="btn btn-primary ml-auto px-4 py-1.5 text-sm whitespace-nowrap"
                >
                  {isStripeLoading ? t("cta.stripeOnboardingLoading") : t("retryStripe")}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Progress Stepper (13c) - show when logged in and data loaded */}
        {!isLoading && isLoggedIn && (
          <OnboardingStepper
            isLoggedIn={isLoggedIn}
            isEmailVerified={isEmailVerified}
            hasAcceptedTerms={hasAcceptedTerms}
            stripeComplete={stripeComplete}
            t={t}
          />
        )}

        {/* Status-aware banners (13b) */}
        {!isLoading && isLoggedIn && isPendingVerification && (
          <div className="border-primary/30 bg-primary/5 mb-8 rounded-lg border p-4 text-center">
            <p className="text-text-secondary">{t("statusPendingVerification")}</p>
          </div>
        )}

        {!isLoading && isLoggedIn && isRestricted && !isPendingVerification && (
          <div className="border-warning/30 bg-warning/5 mb-8 rounded-lg border p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-text-secondary text-sm">{t("statusRestricted")}</p>
              <button
                onClick={handleStartStripeOnboarding}
                disabled={isStripeLoading}
                className="btn btn-primary px-4 py-1.5 text-sm whitespace-nowrap"
              >
                {isStripeLoading ? t("cta.stripeOnboardingLoading") : t("retryStripe")}
              </button>
            </div>
          </div>
        )}

        {/* Benefits Section */}
        <section className="mb-12">
          <h2 className="text-text mb-8 text-center text-xl font-semibold">
            {t("benefits.title")}
          </h2>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Benefit 1 - Earn */}
            <div className="card p-6 text-center">
              <div className="bg-success/15 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="heading-4 mb-3">{t("benefits.earn.title")}</h3>
              <p className="text-text-muted leading-relaxed">{t("benefits.earn.description")}</p>
            </div>

            {/* Benefit 2 - Reach */}
            <div className="card p-6 text-center">
              <div className="bg-primary/15 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="heading-4 mb-3">{t("benefits.reach.title")}</h3>
              <p className="text-text-muted leading-relaxed">{t("benefits.reach.description")}</p>
            </div>

            {/* Benefit 3 - Simple */}
            <div className="card p-6 text-center sm:col-span-2 lg:col-span-1">
              <div className="bg-accent/15 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-accent h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <h3 className="heading-4 mb-3">{t("benefits.simple.title")}</h3>
              <p className="text-text-muted leading-relaxed">{t("benefits.simple.description")}</p>
            </div>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="mb-12">
          <div className="card mx-auto max-w-3xl p-6">
            <h2 className="text-text mb-6 text-xl font-semibold">{t("requirements.title")}</h2>
            <ul className="space-y-3">
              <li className="text-text-secondary flex items-center gap-3">
                <svg
                  className="text-success h-5 w-5 flex-shrink-0"
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
                {t("requirements.emailVerified")}
              </li>
              <li className="text-text-secondary flex items-center gap-3">
                <svg
                  className="text-success h-5 w-5 flex-shrink-0"
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
                {t("requirements.acceptTerms")}
              </li>
              <li className="text-text-secondary flex items-center gap-3">
                <svg
                  className="text-success h-5 w-5 flex-shrink-0"
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
                {t("requirements.stripeAccount")}
              </li>
            </ul>
          </div>
        </section>

        {/* Copyright Guide Callout */}
        <section className="mb-12">
          <div className="mx-auto max-w-4xl">
            <div className="border-primary/20 bg-primary/5 rounded-xl border p-6 text-center">
              <h3 className="text-text text-lg font-semibold">{t("copyrightCallout.title")}</h3>
              <p className="text-text-muted mx-auto mt-2 max-w-md text-sm">
                {t("copyrightCallout.description")}
              </p>
              <Link
                href="/urheberrecht"
                className="text-primary mt-3 inline-flex items-center gap-1 text-sm font-medium hover:underline"
              >
                {t("copyrightCallout.link")} →
              </Link>
            </div>
          </div>
        </section>

        {/* Seller Terms Section */}
        <section className="mb-12">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <h2 className="heading-2">{t("termsSection.title")}</h2>
              <p className="text-text-muted mt-2">{t("termsSection.readBelow")}</p>
            </div>

            {/* Terms Card */}
            <div className="card overflow-hidden">
              <div className="border-border bg-bg-secondary border-b px-6 py-4">
                <h3 className="text-text font-semibold">{tTerms("pageTitle")}</h3>
                <p className="text-text-muted mt-1 text-sm">{tTerms("lastUpdated")}</p>
              </div>

              <div className="max-h-[500px] overflow-y-auto px-6 py-6">
                <div className="prose prose-sm text-text-secondary max-w-none">
                  {/* Overview */}
                  <h4 className="text-text text-base font-semibold">
                    {tTerms("sections.overview.title")}
                  </h4>
                  <p>{tTerms("sections.overview.content")}</p>

                  {/* Platform Fee */}
                  <h4 className="text-text mt-6 text-base font-semibold">
                    {tTerms("sections.platformFee.title")}
                  </h4>
                  <p>{tTerms("sections.platformFee.content")}</p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>{tTerms("sections.platformFee.breakdown.seller")}</li>
                    <li>{tTerms("sections.platformFee.breakdown.platform")}</li>
                    <li className="text-sm italic">
                      {tTerms("sections.platformFee.breakdown.example")}
                    </li>
                  </ul>
                  <p className="text-sm">{tTerms("sections.platformFee.note")}</p>

                  {/* Payouts */}
                  <h4 className="text-text mt-6 text-base font-semibold">
                    {tTerms("sections.payouts.title")}
                  </h4>
                  <p>{tTerms("sections.payouts.content")}</p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>{tTerms("sections.payouts.details.schedule")}</li>
                    <li>{tTerms("sections.payouts.details.minimum")}</li>
                    <li>{tTerms("sections.payouts.details.currency")}</li>
                    <li>{tTerms("sections.payouts.details.account")}</li>
                  </ul>

                  {/* Content Policies */}
                  <h4 className="text-text mt-6 text-base font-semibold">
                    {tTerms("sections.contentPolicies.title")}
                  </h4>
                  <p>{tTerms("sections.contentPolicies.content")}</p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>{tTerms("sections.contentPolicies.requirements.original")}</li>
                    <li>{tTerms("sections.contentPolicies.requirements.appropriate")}</li>
                    <li>{tTerms("sections.contentPolicies.requirements.accurate")}</li>
                    <li>{tTerms("sections.contentPolicies.requirements.quality")}</li>
                    <li>{tTerms("sections.contentPolicies.requirements.lp21")}</li>
                  </ul>

                  {/* Prohibited Content */}
                  <h4 className="text-text mt-6 text-base font-semibold">
                    {tTerms("sections.prohibited.title")}
                  </h4>
                  <p>{tTerms("sections.prohibited.content")}</p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>{tTerms("sections.prohibited.items.copyright")}</li>
                    <li>{tTerms("sections.prohibited.items.inappropriate")}</li>
                    <li>{tTerms("sections.prohibited.items.misleading")}</li>
                    <li>{tTerms("sections.prohibited.items.plagiarized")}</li>
                    <li>{tTerms("sections.prohibited.items.malicious")}</li>
                    <li>{tTerms("sections.prohibited.items.personal")}</li>
                  </ul>

                  {/* Seller Responsibilities */}
                  <h4 className="text-text mt-6 text-base font-semibold">
                    {tTerms("sections.responsibilities.title")}
                  </h4>
                  <p>{tTerms("sections.responsibilities.content")}</p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>{tTerms("sections.responsibilities.items.accuracy")}</li>
                    <li>{tTerms("sections.responsibilities.items.support")}</li>
                    <li>{tTerms("sections.responsibilities.items.updates")}</li>
                    <li>{tTerms("sections.responsibilities.items.taxes")}</li>
                    <li>{tTerms("sections.responsibilities.items.compliance")}</li>
                  </ul>

                  {/* Account Termination */}
                  <h4 className="text-text mt-6 text-base font-semibold">
                    {tTerms("sections.termination.title")}
                  </h4>
                  <p>{tTerms("sections.termination.content")}</p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>{tTerms("sections.termination.rights.remove")}</li>
                    <li>{tTerms("sections.termination.rights.suspend")}</li>
                    <li>{tTerms("sections.termination.rights.withhold")}</li>
                  </ul>

                  {/* Changes to Terms */}
                  <h4 className="text-text mt-6 text-base font-semibold">
                    {tTerms("sections.changes.title")}
                  </h4>
                  <p>{tTerms("sections.changes.content")}</p>
                </div>
              </div>
            </div>

            {/* Terms Acceptance Checkbox */}
            <div className="mt-6">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="border-border text-primary focus:ring-primary mt-1 h-5 w-5 rounded focus:ring-offset-0"
                />
                <span className="text-text-secondary">{t("acceptance.checkboxLabel")}</span>
              </label>
            </div>

            {/* CTA Section */}
            <div className="mt-8 text-center">
              {isLoading ? (
                <div className="bg-bg-secondary mx-auto h-12 w-48 animate-pulse rounded-lg" />
              ) : !isLoggedIn ? (
                <div className="space-y-3">
                  <p className="text-text-muted">{t("cta.loginRequired")}</p>
                  <LoginLink className="btn btn-primary inline-block px-8 py-3">
                    {t("cta.login")}
                  </LoginLink>
                </div>
              ) : !isEmailVerified ? (
                <div className="space-y-3">
                  <p className="text-text-muted">{t("cta.emailRequired")}</p>
                  <Link href="/konto" className="btn btn-primary inline-block px-8 py-3">
                    {t("cta.verifyEmail")}
                  </Link>
                </div>
              ) : hasAcceptedTerms ? (
                <div className="space-y-4">
                  <div className="bg-success-light text-success inline-flex items-center gap-2 rounded-lg px-4 py-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {t("cta.termsAccepted")}
                  </div>
                  {stripeError && <p className="text-error text-sm">{stripeError}</p>}
                  <button
                    onClick={handleStartStripeOnboarding}
                    disabled={isStripeLoading}
                    className="btn btn-primary px-8 py-3 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isStripeLoading
                      ? t("cta.stripeOnboardingLoading")
                      : t("cta.startStripeOnboarding")}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {!termsAccepted && (
                    <p className="text-text-muted">{t("acceptance.pleaseAccept")}</p>
                  )}
                  {submitError && <p className="text-error text-sm">{submitError}</p>}
                  <button
                    onClick={handleAcceptTerms}
                    disabled={!termsAccepted || isSubmitting}
                    className="btn btn-primary px-8 py-3 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? t("cta.submitting") : t("cta.button")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
