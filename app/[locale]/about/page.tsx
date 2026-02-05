"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export default function AboutPage() {
  const t = useTranslations("aboutPage");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <Breadcrumb items={[{ label: tCommon("breadcrumb.about") }]} />
          <h1 className="text-text text-2xl font-bold">{t("hero.title")}</h1>
          <p className="text-text-muted mt-1">{t("hero.subtitle")}</p>
        </div>

        {/* Hero Image */}
        <div className="mb-12">
          <Image
            src="/images/about-hero.png"
            alt={t("hero.imageAlt")}
            width={1200}
            height={400}
            className="h-[200px] w-full rounded-xl object-cover object-center shadow-lg sm:h-[280px] md:h-[340px]"
            priority
          />
        </div>

        {/* Mission Section */}
        <div className="bg-bg-secondary mb-12 rounded-xl p-6 sm:p-8">
          <h2 className="text-text mb-6 text-xl font-semibold">{t("mission.title")}</h2>
          <div className="text-text-secondary space-y-4 leading-relaxed">
            <p>{t("mission.paragraph1")}</p>
            <p>{t("mission.paragraph2")}</p>
            <p>{t("mission.paragraph3")}</p>
          </div>
        </div>

        {/* Core Values Section */}
        <div className="mb-12">
          <h2 className="text-text mb-8 text-xl font-semibold">{t("values.title")}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Value 1 - Time Savings */}
            <div className="card p-6 text-center md:p-8">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-text mb-3 text-lg font-bold">{t("values.value1.title")}</h3>
              <p className="text-text-muted leading-relaxed">{t("values.value1.description")}</p>
            </div>

            {/* Value 2 - Swiss Quality */}
            <div className="card p-6 text-center md:p-8">
              <div className="bg-accent-light mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
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
                    d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                  />
                </svg>
              </div>
              <h3 className="text-text mb-3 text-lg font-bold">{t("values.value2.title")}</h3>
              <p className="text-text-muted leading-relaxed">{t("values.value2.description")}</p>
            </div>

            {/* Value 3 - Teacher Verified */}
            <div className="card p-6 text-center">
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-text mb-3 text-lg font-bold">{t("values.value3.title")}</h3>
              <p className="text-text-muted leading-relaxed">{t("values.value3.description")}</p>
            </div>
          </div>
        </div>

        {/* Origin Story Section */}
        <div className="bg-bg-secondary mb-12 rounded-xl p-6 sm:p-8">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            {/* Left Side - Text Content */}
            <div>
              <h2 className="text-text mb-6 text-xl font-semibold">{t("origin.title")}</h2>
              <div className="text-text-secondary space-y-4 leading-relaxed">
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
                className="h-[200px] w-full rounded-xl object-cover object-center shadow-lg sm:h-[260px]"
              />
            </div>
          </div>
        </div>

        {/* Founders Section */}
        <div className="mb-12">
          <div className="mb-8 text-center">
            <h2 className="text-text mb-2 text-xl font-semibold">{t("founders.title")}</h2>
            <p className="text-text-muted">{t("founders.subtitle")}</p>
          </div>

          {/* Founder Cards */}
          <div className="mb-8 grid gap-6 md:grid-cols-2">
            {/* Founder 1 - Tech */}
            <div className="card p-6 text-center">
              <div className="bg-bg-secondary border-primary/20 mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border-4">
                <div className="flex h-full w-full items-center justify-center">
                  <svg
                    className="text-text-muted h-12 w-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-text mb-1 text-lg font-bold">{t("founders.founder1.name")}</h3>
              <p className="text-primary mb-3 text-sm font-medium">{t("founders.founder1.role")}</p>
              <p className="text-text-muted text-sm leading-relaxed">
                {t("founders.founder1.bio")}
              </p>
            </div>

            {/* Founder 2 - Education */}
            <div className="card p-6 text-center">
              <div className="bg-bg-secondary border-primary/20 mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border-4">
                <div className="flex h-full w-full items-center justify-center">
                  <svg
                    className="text-text-muted h-12 w-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-text mb-1 text-lg font-bold">{t("founders.founder2.name")}</h3>
              <p className="text-primary mb-3 text-sm font-medium">{t("founders.founder2.role")}</p>
              <p className="text-text-muted text-sm leading-relaxed">
                {t("founders.founder2.bio")}
              </p>
            </div>
          </div>

          {/* Story & Contact */}
          <div className="text-text-secondary mx-auto max-w-3xl text-center leading-relaxed">
            <p>{t("founders.story")}</p>
          </div>
          <div className="border-primary/20 bg-primary/5 mt-6 rounded-xl border p-6 text-center">
            <p className="text-primary mb-3 font-medium">{t("founders.highlight")}</p>
            <a
              href="mailto:info@currico.ch"
              className="text-primary inline-flex items-center gap-2 text-sm font-medium hover:underline"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              info@currico.ch
            </a>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-bg-secondary rounded-xl p-6 text-center sm:p-8">
          <h2 className="text-text mb-4 text-xl font-bold">{t("cta.title")}</h2>
          <p className="text-text-muted mx-auto mb-6 max-w-2xl leading-relaxed">
            {t("cta.subtitle")}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href={`/${locale}/resources`}
              className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors"
            >
              {t("cta.button")}
              <svg
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
              className="border-border text-text hover:bg-surface inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 font-medium transition-colors"
            >
              {t("cta.secondaryButton")}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
