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
import {
  Check,
  AlertTriangle,
  Coins,
  Users,
  RefreshCw,
  ExternalLink,
  ArrowRight,
  Info,
} from "lucide-react";
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
                {step.completed ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
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

  // Determine disabled tooltip for CTA buttons
  const getDisabledTooltip = () => {
    if (!isLoggedIn) return t("cta.disabledLoginTooltip");
    if (!isEmailVerified) return t("cta.disabledEmailTooltip");
    if (!hasAcceptedTerms && !termsAccepted) return t("cta.disabledTermsTooltip");
    return undefined;
  };

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

        {/* Stripe Refresh Banner */}
        {isStripeRefresh && (
          <div className="border-warning/30 bg-warning/10 mb-8 rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-warning h-5 w-5 flex-shrink-0" aria-hidden="true" />
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

        {/* Progress Stepper - show when logged in and data loaded */}
        {!isLoading && isLoggedIn && (
          <OnboardingStepper
            isLoggedIn={isLoggedIn}
            isEmailVerified={isEmailVerified}
            hasAcceptedTerms={hasAcceptedTerms}
            stripeComplete={stripeComplete}
            t={t}
          />
        )}

        {/* Status-aware banners */}
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
                <Coins className="text-success h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="heading-4 mb-3">{t("benefits.earn.title")}</h3>
              <p className="text-text-muted leading-relaxed">{t("benefits.earn.description")}</p>
            </div>

            {/* Benefit 2 - Reach */}
            <div className="card p-6 text-center">
              <div className="bg-primary/15 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                <Users className="text-primary h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="heading-4 mb-3">{t("benefits.reach.title")}</h3>
              <p className="text-text-muted leading-relaxed">{t("benefits.reach.description")}</p>
            </div>

            {/* Benefit 3 - Simple */}
            <div className="card p-6 text-center sm:col-span-2 lg:col-span-1">
              <div className="bg-accent/15 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                <RefreshCw className="text-accent h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="heading-4 mb-3">{t("benefits.simple.title")}</h3>
              <p className="text-text-muted leading-relaxed">{t("benefits.simple.description")}</p>
            </div>
          </div>
        </section>

        {/* Requirements Section - dynamic checklist */}
        <section className="mb-12">
          <div className="card mx-auto max-w-3xl p-6">
            <h2 className="text-text mb-6 text-xl font-semibold">{t("requirements.title")}</h2>
            <ul className="space-y-3">
              {[
                {
                  label: t("requirements.emailVerified"),
                  completed: isLoggedIn && isEmailVerified,
                },
                { label: t("requirements.acceptTerms"), completed: isLoggedIn && hasAcceptedTerms },
                { label: t("requirements.stripeAccount"), completed: stripeComplete },
              ].map((req, i) => (
                <li key={i} className="text-text-secondary flex items-center gap-3">
                  {isLoggedIn && !isLoading ? (
                    req.completed ? (
                      <div className="bg-success flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full">
                        <Check className="h-4 w-4 text-white" aria-hidden="true" />
                      </div>
                    ) : (
                      <div className="border-border h-6 w-6 flex-shrink-0 rounded-full border-2" />
                    )
                  ) : (
                    <div className="border-border h-6 w-6 flex-shrink-0 rounded-full border-2" />
                  )}
                  <span className={req.completed && isLoggedIn && !isLoading ? "text-text" : ""}>
                    {req.label}
                  </span>
                </li>
              ))}
            </ul>
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
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-text font-semibold">{tTerms("pageTitle")}</h3>
                    <p className="text-text-muted mt-1 text-sm">{tTerms("lastUpdated")}</p>
                  </div>
                  {/* Copyright callout integrated into terms header */}
                  <Link
                    href="/urheberrecht"
                    className="text-primary border-primary/20 bg-primary/5 hidden items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:underline sm:inline-flex"
                  >
                    <Info className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("copyrightCallout.link")}
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </div>
                {/* Mobile copyright callout */}
                <Link
                  href="/urheberrecht"
                  className="text-primary mt-2 inline-flex items-center gap-1 text-xs font-medium hover:underline sm:hidden"
                >
                  <Info className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("copyrightCallout.link")}
                </Link>
              </div>

              <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
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

                  {/* Copyright Warranty */}
                  <h4 className="text-text mt-6 text-base font-semibold">
                    {tTerms("sections.copyrightWarranty.title")}
                  </h4>
                  <p>{tTerms("sections.copyrightWarranty.content")}</p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>{tTerms("sections.copyrightWarranty.warranties.ownership")}</li>
                    <li>{tTerms("sections.copyrightWarranty.warranties.noInfringement")}</li>
                    <li>{tTerms("sections.copyrightWarranty.warranties.noThirdParty")}</li>
                  </ul>
                  <p className="mt-2 text-sm font-medium">
                    {tTerms("sections.copyrightWarranty.indemnification.title")}
                  </p>
                  <p className="text-sm">
                    {tTerms("sections.copyrightWarranty.indemnification.content")}
                  </p>
                  <ul className="ml-4 list-disc space-y-1 text-sm">
                    <li>
                      {tTerms("sections.copyrightWarranty.indemnification.items.infringement")}
                    </li>
                    <li>{tTerms("sections.copyrightWarranty.indemnification.items.breach")}</li>
                    <li>{tTerms("sections.copyrightWarranty.indemnification.items.content")}</li>
                  </ul>

                  {/* Notice and Takedown */}
                  <h4 className="text-text mt-6 text-base font-semibold">
                    {tTerms("sections.noticeTakedown.title")}
                  </h4>
                  <p>{tTerms("sections.noticeTakedown.content")}</p>
                  <p className="mt-2 text-sm font-medium">
                    {tTerms("sections.noticeTakedown.procedure.title")}
                  </p>
                  <p className="text-sm">{tTerms("sections.noticeTakedown.procedure.content")}</p>
                  <ul className="ml-4 list-disc space-y-1 text-sm">
                    <li>{tTerms("sections.noticeTakedown.procedure.items.identify")}</li>
                    <li>{tTerms("sections.noticeTakedown.procedure.items.location")}</li>
                    <li>{tTerms("sections.noticeTakedown.procedure.items.contact")}</li>
                    <li>{tTerms("sections.noticeTakedown.procedure.items.statement")}</li>
                    <li>{tTerms("sections.noticeTakedown.procedure.items.signature")}</li>
                  </ul>
                  <p className="mt-2 text-sm font-medium">
                    {tTerms("sections.noticeTakedown.response.title")}
                  </p>
                  <p className="text-sm">{tTerms("sections.noticeTakedown.response.content")}</p>

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
                  <Link
                    href="/konto/settings/profile"
                    className="btn btn-primary inline-block px-8 py-3"
                  >
                    {t("cta.verifyEmail")}
                  </Link>
                </div>
              ) : hasAcceptedTerms ? (
                <div className="space-y-4">
                  <div className="bg-success/10 text-success border-success/20 inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-medium">
                    <Check className="h-5 w-5" aria-hidden="true" />
                    {t("cta.termsAccepted")}
                  </div>
                  {stripeError && <p className="text-error text-sm">{stripeError}</p>}
                  <div>
                    <button
                      onClick={handleStartStripeOnboarding}
                      disabled={isStripeLoading}
                      className="btn btn-primary inline-flex items-center gap-2 px-10 py-3.5 text-base disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isStripeLoading
                        ? t("cta.stripeOnboardingLoading")
                        : t("cta.startStripeOnboarding")}
                      {!isStripeLoading && <ArrowRight className="h-5 w-5" aria-hidden="true" />}
                    </button>
                  </div>
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
                    title={!termsAccepted ? getDisabledTooltip() : undefined}
                    className="btn btn-primary inline-flex items-center gap-2 px-8 py-3 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? t("cta.submitting") : t("cta.button")}
                    {!isSubmitting && termsAccepted && (
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    )}
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
