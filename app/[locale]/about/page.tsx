"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";

export default function AboutPage() {
  const t = useTranslations("aboutPage");
  const locale = useLocale();

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <main className="flex-1">
        {/* Hero Section with gradient accent */}
        <section className="relative overflow-hidden">
          {/* Subtle gradient accent */}
          <div className="pointer-events-none absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-[var(--color-primary)]/5 to-transparent" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
              {/* Left Side - Text Content */}
              <div className="order-2 lg:order-1">
                <span className="mb-6 inline-block rounded-full bg-[var(--color-primary)]/10 px-4 py-1.5 text-sm font-medium text-[var(--color-primary)]">
                  {t("hero.badge")}
                </span>
                <h1 className="text-3xl leading-tight font-bold tracking-tight text-[var(--color-text)] sm:text-4xl lg:text-5xl">
                  {t("hero.title")}
                </h1>
                <p className="mt-6 max-w-xl text-xl leading-relaxed text-[var(--color-text-muted)]">
                  {t("hero.subtitle")}
                </p>
              </div>

              {/* Right Side - Hero Image */}
              <div className="order-1 lg:order-2">
                <Image
                  src="/images/about-hero.png"
                  alt={t("hero.imageAlt")}
                  width={1000}
                  height={667}
                  className="h-[320px] w-full rounded-xl object-cover object-center shadow-lg sm:h-[400px] lg:h-[480px]"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="bg-[var(--color-bg-secondary)] py-20 lg:py-28">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-semibold text-[var(--color-primary)] sm:text-3xl">
              {t("mission.title")}
            </h2>
            <div className="space-y-6 text-lg leading-relaxed text-[var(--color-text-secondary)]">
              <p>{t("mission.paragraph1")}</p>
              <p>{t("mission.paragraph2")}</p>
              <p>{t("mission.paragraph3")}</p>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-16 text-center text-2xl font-semibold text-[var(--color-primary)] sm:text-3xl">
              {t("values.title")}
            </h2>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Value 1 - Time Savings */}
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-3 text-lg font-bold text-[var(--color-text)]">
                  {t("values.value1.title")}
                </h3>
                <p className="leading-relaxed text-[var(--color-text-muted)]">
                  {t("values.value1.description")}
                </p>
              </div>

              {/* Value 2 - Swiss Quality */}
              <div className="card p-8 text-center">
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
                      d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                    />
                  </svg>
                </div>
                <h3 className="mb-3 text-lg font-bold text-[var(--color-text)]">
                  {t("values.value2.title")}
                </h3>
                <p className="leading-relaxed text-[var(--color-text-muted)]">
                  {t("values.value2.description")}
                </p>
              </div>

              {/* Value 3 - Teacher Verified */}
              <div className="card p-8 text-center sm:col-span-2 lg:col-span-1">
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="mb-3 text-lg font-bold text-[var(--color-text)]">
                  {t("values.value3.title")}
                </h3>
                <p className="leading-relaxed text-[var(--color-text-muted)]">
                  {t("values.value3.description")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Origin Story Section */}
        <section className="bg-[var(--color-bg-secondary)] py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Left Side - Text Content */}
              <div>
                <h2 className="mb-8 text-2xl font-semibold text-[var(--color-primary)] sm:text-3xl">
                  {t("origin.title")}
                </h2>
                <div className="space-y-6 text-lg leading-relaxed text-[var(--color-text-secondary)]">
                  <p>{t("origin.paragraph1")}</p>
                  <p>{t("origin.paragraph2")}</p>
                </div>
              </div>

              {/* Right Side - Team Image */}
              <div>
                <Image
                  src="/images/about-team.png"
                  alt={t("origin.imageAlt")}
                  width={800}
                  height={533}
                  className="h-[300px] w-full rounded-xl object-cover object-center shadow-lg sm:h-[350px] lg:h-[400px]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Founders Section */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
                <svg
                  className="h-10 w-10 text-[var(--color-primary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h2 className="mb-8 text-2xl font-semibold text-[var(--color-primary)] sm:text-3xl">
                {t("founders.title")}
              </h2>
            </div>
            <div className="space-y-6 text-lg leading-relaxed text-[var(--color-text-secondary)]">
              <p>{t("founders.paragraph1")}</p>
              <p>{t("founders.paragraph2")}</p>
              <p>{t("founders.paragraph3")}</p>
            </div>
            <div className="mt-10 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-6 text-center">
              <p className="text-lg font-medium text-[var(--color-primary)]">
                {t("founders.highlight")}
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-[var(--ctp-blue)]/60 to-[var(--ctp-sapphire)]/60 py-20 lg:py-28">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-6 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              {t("cta.title")}
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-white/80">{t("cta.subtitle")}</p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href={`/${locale}/resources`}
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 font-semibold text-[var(--ctp-blue)] transition-colors hover:bg-white/90"
              >
                {t("cta.button")}
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
              <Link
                href={`/${locale}/register`}
                className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/20"
              >
                {t("cta.secondaryButton")}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
