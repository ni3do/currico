"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

interface UserData {
  emailVerified: string | null;
  sellerTermsAcceptedAt: string | null;
}

export default function BecomeSellerPage() {
  const { data: session, status } = useSession();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [fetchState, setFetchState] = useState<"idle" | "loading" | "done">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [termsAcceptedAt, setTermsAcceptedAt] = useState<string | null>(null);
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const t = useTranslations("becomeSeller");
  const tCommon = useTranslations("common");
  const tTerms = useTranslations("sellerTerms");

  // Fetch user data to get emailVerified status and terms acceptance
  useEffect(() => {
    let cancelled = false;

    async function fetchUserData() {
      try {
        // Fetch both user stats and terms status in parallel
        const [statsRes, termsRes] = await Promise.all([
          fetch("/api/user/stats"),
          fetch("/api/seller/accept-terms"),
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

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: tCommon("breadcrumb.becomeSeller") }]} />
        </div>

        {/* Hero Section */}
        <section className="from-primary/10 to-primary-hover/10 relative overflow-hidden bg-gradient-to-br">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="text-center">
              <span className="bg-primary/10 text-primary mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-medium">
                {t("hero.badge")}
              </span>
              <h1 className="text-text text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {t("hero.title")}
              </h1>
              <p className="text-text-muted mx-auto mt-6 max-w-2xl text-lg">{t("hero.subtitle")}</p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="section-padding">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="heading-2 mb-12 text-center">{t("benefits.title")}</h2>

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
                <p className="text-text-muted leading-relaxed">
                  {t("benefits.simple.description")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="section-padding bg-bg-secondary">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="heading-3 mb-6">{t("requirements.title")}</h2>
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
        <section className="section-padding">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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
        <section className="section-padding">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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
                  <Link href="/login" className="btn btn-primary inline-block px-8 py-3">
                    {t("cta.login")}
                  </Link>
                </div>
              ) : !isEmailVerified ? (
                <div className="space-y-3">
                  <p className="text-text-muted">{t("cta.emailRequired")}</p>
                  <Link href="/account" className="btn btn-primary inline-block px-8 py-3">
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
