"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";

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
  const t = useTranslations("becomeSeller");
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
      // TODO: When Stripe integration is ready, redirect to Stripe onboarding
    } catch {
      setSubmitError(t("cta.error"));
    } finally {
      setIsSubmitting(false);
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
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[var(--ctp-blue)]/10 to-[var(--ctp-sapphire)]/10">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="text-center">
              <span className="mb-4 inline-block rounded-full bg-[var(--color-primary)]/10 px-4 py-1.5 text-sm font-medium text-[var(--color-primary)]">
                {t("hero.badge")}
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl lg:text-5xl">
                {t("hero.title")}
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--color-text-muted)]">
                {t("hero.subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-12 text-center text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
              {t("benefits.title")}
            </h2>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Benefit 1 - Earn */}
              <div className="card p-8 text-center">
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-3 text-lg font-bold text-[var(--color-text)]">
                  {t("benefits.earn.title")}
                </h3>
                <p className="leading-relaxed text-[var(--color-text-muted)]">
                  {t("benefits.earn.description")}
                </p>
              </div>

              {/* Benefit 2 - Reach */}
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-3 text-lg font-bold text-[var(--color-text)]">
                  {t("benefits.reach.title")}
                </h3>
                <p className="leading-relaxed text-[var(--color-text-muted)]">
                  {t("benefits.reach.description")}
                </p>
              </div>

              {/* Benefit 3 - Simple */}
              <div className="card p-8 text-center sm:col-span-2 lg:col-span-1">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent-light)]">
                  <svg
                    className="h-8 w-8 text-[var(--color-accent)]"
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
                <h3 className="mb-3 text-lg font-bold text-[var(--color-text)]">
                  {t("benefits.simple.title")}
                </h3>
                <p className="leading-relaxed text-[var(--color-text-muted)]">
                  {t("benefits.simple.description")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="bg-[var(--color-bg-secondary)] py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-6 text-xl font-semibold text-[var(--color-text)]">
              {t("requirements.title")}
            </h2>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-[var(--color-success)]"
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
              <li className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-[var(--color-success)]"
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
              <li className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-[var(--color-success)]"
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

        {/* Seller Terms Section */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
                {t("termsSection.title")}
              </h2>
              <p className="mt-2 text-[var(--color-text-muted)]">{t("termsSection.readBelow")}</p>
            </div>

            {/* Terms Card */}
            <div className="card overflow-hidden">
              <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-6 py-4">
                <h3 className="font-semibold text-[var(--color-text)]">{tTerms("pageTitle")}</h3>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {tTerms("lastUpdated")}
                </p>
              </div>

              <div className="max-h-[500px] overflow-y-auto px-6 py-6">
                <div className="prose prose-sm max-w-none text-[var(--color-text-secondary)]">
                  {/* Overview */}
                  <h4 className="text-base font-semibold text-[var(--color-text)]">
                    {tTerms("sections.overview.title")}
                  </h4>
                  <p>{tTerms("sections.overview.content")}</p>

                  {/* Platform Fee */}
                  <h4 className="mt-6 text-base font-semibold text-[var(--color-text)]">
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
                  <h4 className="mt-6 text-base font-semibold text-[var(--color-text)]">
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
                  <h4 className="mt-6 text-base font-semibold text-[var(--color-text)]">
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
                  <h4 className="mt-6 text-base font-semibold text-[var(--color-text)]">
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
                  <h4 className="mt-6 text-base font-semibold text-[var(--color-text)]">
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
                  <h4 className="mt-6 text-base font-semibold text-[var(--color-text)]">
                    {tTerms("sections.termination.title")}
                  </h4>
                  <p>{tTerms("sections.termination.content")}</p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>{tTerms("sections.termination.rights.remove")}</li>
                    <li>{tTerms("sections.termination.rights.suspend")}</li>
                    <li>{tTerms("sections.termination.rights.withhold")}</li>
                  </ul>

                  {/* Changes to Terms */}
                  <h4 className="mt-6 text-base font-semibold text-[var(--color-text)]">
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
                  className="mt-1 h-5 w-5 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] focus:ring-offset-0"
                />
                <span className="text-[var(--color-text-secondary)]">
                  {t("acceptance.checkboxLabel")}
                </span>
              </label>
            </div>

            {/* CTA Section */}
            <div className="mt-8 text-center">
              {isLoading ? (
                <div className="h-12 w-48 mx-auto animate-pulse rounded-lg bg-[var(--color-bg-secondary)]" />
              ) : !isLoggedIn ? (
                <div className="space-y-3">
                  <p className="text-[var(--color-text-muted)]">{t("cta.loginRequired")}</p>
                  <Link
                    href="/login"
                    className="btn btn-primary inline-block px-8 py-3"
                  >
                    {t("cta.login")}
                  </Link>
                </div>
              ) : !isEmailVerified ? (
                <div className="space-y-3">
                  <p className="text-[var(--color-text-muted)]">{t("cta.emailRequired")}</p>
                  <Link
                    href="/account"
                    className="btn btn-primary inline-block px-8 py-3"
                  >
                    {t("cta.verifyEmail")}
                  </Link>
                </div>
              ) : hasAcceptedTerms ? (
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-success-light)] px-4 py-2 text-[var(--color-success)]">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t("cta.termsAccepted")}
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)]">{t("cta.stripeComingSoon")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {!termsAccepted && (
                    <p className="text-[var(--color-text-muted)]">{t("acceptance.pleaseAccept")}</p>
                  )}
                  {submitError && (
                    <p className="text-sm text-[var(--color-error)]">{submitError}</p>
                  )}
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
