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

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb items={[{ label: tCommon("breadcrumb.about") }]} />
        </div>

        {/* Hero Section - Personal & Warm */}
        <div className="mb-16 text-center">
          <span className="bg-primary/10 text-primary mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-medium">
            {t("hero.badge")}
          </span>
          <h1 className="text-text mb-4 text-3xl font-bold sm:text-4xl">{t("hero.title")}</h1>
          <p className="text-text-muted mx-auto max-w-2xl text-lg leading-relaxed">
            {t("hero.subtitle")}
          </p>
        </div>

        {/* Meet the Team - Right at the top, personal first */}
        <div className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="text-text mb-2 text-2xl font-bold">{t("founders.title")}</h2>
            <p className="text-text-muted mx-auto max-w-xl">{t("founders.subtitle")}</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            {/* Simon Wachter */}
            <div className="card overflow-hidden">
              <div className="relative mx-auto h-72 w-full overflow-hidden">
                <Image
                  src="/images/simon-wachter.jpg"
                  alt={t("founders.founder1.name")}
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-text mb-1 text-xl font-bold">{t("founders.founder1.name")}</h3>
                <p className="text-primary mb-4 text-sm font-medium">
                  {t("founders.founder1.role")}
                </p>
                <p className="text-text-muted text-sm leading-relaxed">
                  {t("founders.founder1.bio")}
                </p>
              </div>
            </div>

            {/* Laurent Zoccoletti */}
            <div className="card overflow-hidden">
              <div className="relative mx-auto h-72 w-full overflow-hidden">
                <Image
                  src="/images/laurent-zoccoletti.png"
                  alt={t("founders.founder2.name")}
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-text mb-1 text-xl font-bold">{t("founders.founder2.name")}</h3>
                <p className="text-primary mb-4 text-sm font-medium">
                  {t("founders.founder2.role")}
                </p>
                <p className="text-text-muted text-sm leading-relaxed">
                  {t("founders.founder2.bio")}
                </p>
              </div>
            </div>
          </div>

          {/* Personal story */}
          <div className="text-text-secondary mx-auto mt-8 max-w-3xl text-center leading-relaxed">
            <p className="italic">&ldquo;{t("founders.story")}&rdquo;</p>
          </div>
        </div>

        {/* Our Story Section */}
        <div className="bg-bg-secondary mb-16 rounded-2xl p-6 sm:p-10">
          <h2 className="text-text mb-6 text-2xl font-bold">{t("origin.title")}</h2>
          <div className="text-text-secondary space-y-4 text-base leading-relaxed">
            <p>{t("origin.paragraph1")}</p>
            <p>{t("origin.paragraph2")}</p>
          </div>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <h2 className="text-text mb-6 text-2xl font-bold">{t("mission.title")}</h2>
          <div className="text-text-secondary space-y-4 text-base leading-relaxed">
            <p>{t("mission.paragraph1")}</p>
            <p>{t("mission.paragraph2")}</p>
            <p>{t("mission.paragraph3")}</p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-text mb-8 text-2xl font-bold">{t("values.title")}</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {/* Value 1 */}
            <div className="border-border rounded-2xl border p-6">
              <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                <svg
                  className="text-primary h-6 w-6"
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
              <h3 className="text-text mb-2 font-bold">{t("values.value1.title")}</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                {t("values.value1.description")}
              </p>
            </div>

            {/* Value 2 */}
            <div className="border-border rounded-2xl border p-6">
              <div className="bg-accent/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                <svg
                  className="text-accent h-6 w-6"
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
              <h3 className="text-text mb-2 font-bold">{t("values.value2.title")}</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                {t("values.value2.description")}
              </p>
            </div>

            {/* Value 3 */}
            <div className="border-border rounded-2xl border p-6">
              <div className="bg-success/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                <svg
                  className="text-success h-6 w-6"
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
              <h3 className="text-text mb-2 font-bold">{t("values.value3.title")}</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                {t("values.value3.description")}
              </p>
            </div>
          </div>
        </div>

        {/* Contact / Get in Touch */}
        <div className="border-primary/20 bg-primary/5 mb-16 rounded-2xl border p-6 text-center sm:p-8">
          <p className="text-text mb-2 text-lg font-medium">{t("founders.highlight")}</p>
          <a
            href="mailto:info@currico.ch"
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
            info@currico.ch
          </a>
        </div>

        {/* CTA Section */}
        <div className="bg-bg-secondary rounded-2xl p-6 text-center sm:p-10">
          <h2 className="text-text mb-4 text-2xl font-bold">{t("cta.title")}</h2>
          <p className="text-text-muted mx-auto mb-6 max-w-2xl leading-relaxed">
            {t("cta.subtitle")}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href={`/${locale}/materialien`}
              className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors"
            >
              {t("cta.button")}
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
