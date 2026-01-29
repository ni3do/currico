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
          <div className="from-primary/5 pointer-events-none absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l to-transparent" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-8 py-12 md:gap-12 md:py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
              {/* Left Side - Text Content */}
              <div className="order-2 lg:order-1">
                <span className="bg-primary/10 text-primary mb-6 inline-block rounded-full px-4 py-1.5 text-sm font-medium">
                  {t("hero.badge")}
                </span>
                <h1 className="text-text text-3xl leading-tight font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {t("hero.title")}
                </h1>
                <p className="text-text-muted mt-6 max-w-xl text-xl leading-relaxed">
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
                  className="h-[280px] w-full rounded-xl object-cover object-center shadow-lg sm:h-[340px] md:h-[400px] lg:h-[480px]"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="bg-bg-secondary py-20 lg:py-28">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-primary mb-8 text-2xl font-semibold sm:text-3xl">
              {t("mission.title")}
            </h2>
            <div className="text-text-secondary space-y-6 text-lg leading-relaxed">
              <p>{t("mission.paragraph1")}</p>
              <p>{t("mission.paragraph2")}</p>
              <p>{t("mission.paragraph3")}</p>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-primary mb-16 text-center text-2xl font-semibold sm:text-3xl">
              {t("values.title")}
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
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
              <div className="card p-6 text-center sm:col-span-2 sm:mx-auto sm:max-w-sm md:p-8 lg:col-span-1 lg:max-w-none">
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
        </section>

        {/* Origin Story Section */}
        <section className="bg-bg-secondary py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-8 md:gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Left Side - Text Content */}
              <div>
                <h2 className="text-primary mb-8 text-2xl font-semibold sm:text-3xl">
                  {t("origin.title")}
                </h2>
                <div className="text-text-secondary space-y-6 text-lg leading-relaxed">
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
                  className="h-[260px] w-full rounded-xl object-cover object-center shadow-lg sm:h-[300px] md:h-[350px] lg:h-[400px]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Founders Section */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-primary mb-4 text-2xl font-semibold sm:text-3xl">
                {t("founders.title")}
              </h2>
              <p className="text-text-muted mx-auto max-w-2xl text-lg">{t("founders.subtitle")}</p>
            </div>

            {/* Founder Cards */}
            <div className="mb-12 grid gap-8 md:grid-cols-2">
              {/* Founder 1 - Tech */}
              <div className="card p-6 text-center md:p-8">
                <div className="bg-bg-secondary border-primary/20 mx-auto mb-6 h-32 w-32 overflow-hidden rounded-full border-4">
                  <div className="flex h-full w-full items-center justify-center">
                    <svg
                      className="text-text-muted h-16 w-16"
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
                <h3 className="text-text mb-1 text-xl font-bold">{t("founders.founder1.name")}</h3>
                <p className="text-primary mb-4 font-medium">{t("founders.founder1.role")}</p>
                <p className="text-text-muted leading-relaxed">{t("founders.founder1.bio")}</p>
              </div>

              {/* Founder 2 - Education */}
              <div className="card p-6 text-center md:p-8">
                <div className="bg-bg-secondary border-primary/20 mx-auto mb-6 h-32 w-32 overflow-hidden rounded-full border-4">
                  <div className="flex h-full w-full items-center justify-center">
                    <svg
                      className="text-text-muted h-16 w-16"
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
                <h3 className="text-text mb-1 text-xl font-bold">{t("founders.founder2.name")}</h3>
                <p className="text-primary mb-4 font-medium">{t("founders.founder2.role")}</p>
                <p className="text-text-muted leading-relaxed">{t("founders.founder2.bio")}</p>
              </div>
            </div>

            {/* Story & CTA */}
            <div className="text-text-secondary mx-auto max-w-3xl space-y-6 text-center text-lg leading-relaxed">
              <p>{t("founders.story")}</p>
            </div>
            <div className="border-primary/20 bg-primary/5 mt-10 rounded-xl border p-6 text-center">
              <p className="text-primary mb-4 text-lg font-medium">{t("founders.highlight")}</p>
              <a
                href="mailto:contact@currico.ch"
                className="text-primary inline-flex items-center gap-2 font-medium hover:underline"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                contact@currico.ch
              </a>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden py-20 lg:py-28">
          {/* Gradient background */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg,
                color-mix(in srgb, var(--ctp-blue) 12%, var(--ctp-mantle)) 0%,
                color-mix(in srgb, var(--ctp-teal) 8%, var(--ctp-mantle)) 50%,
                color-mix(in srgb, var(--ctp-mauve) 6%, var(--ctp-mantle)) 100%
              )`,
            }}
          />
          {/* Decorative blurred shapes */}
          <div
            className="absolute top-0 right-0 h-96 w-96 rounded-full opacity-40 blur-3xl"
            style={{ background: `linear-gradient(135deg, var(--ctp-blue), var(--ctp-sapphire))` }}
          />
          <div
            className="absolute bottom-0 left-0 h-64 w-64 rounded-full opacity-30 blur-3xl"
            style={{ background: `linear-gradient(135deg, var(--ctp-teal), var(--ctp-green))` }}
          />

          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-text mb-6 text-2xl font-bold sm:text-3xl lg:text-4xl">
              {t("cta.title")}
            </h2>
            <p className="text-text-muted mx-auto mb-10 max-w-2xl text-lg leading-relaxed">
              {t("cta.subtitle")}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-6">
              <Link
                href={`/${locale}/resources`}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--ctp-blue)] px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:bg-[var(--ctp-sapphire)] hover:shadow-xl"
                style={{
                  boxShadow: `0 4px 14px color-mix(in srgb, var(--ctp-blue) 40%, transparent)`,
                }}
              >
                {t("cta.button")}
                <svg
                  className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
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
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[var(--ctp-blue)] bg-transparent px-8 py-4 text-lg font-semibold text-[var(--ctp-blue)] transition-all duration-200 hover:-translate-y-1 hover:bg-[var(--ctp-blue)] hover:text-white hover:shadow-lg"
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
