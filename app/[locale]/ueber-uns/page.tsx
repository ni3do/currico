"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
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

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-8 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Page Header */}
        <div>
          <Breadcrumb items={[{ label: tCommon("breadcrumb.about") }]} />
          <h1 className="text-text text-2xl font-bold sm:text-3xl">{t("hero.title")}</h1>
          <p className="text-text-muted mt-1">{t("hero.subtitle")}</p>
        </div>

        {/* Meet the Team - Right at the top, personal first */}
        <div>
          <div className="mb-8 text-center">
            <h2 className="text-text mb-2 text-xl font-semibold">{t("founders.title")}</h2>
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
        <div className="bg-bg-secondary rounded-2xl p-6 sm:p-10">
          <h2 className="text-text mb-6 text-xl font-semibold">{t("origin.title")}</h2>
          <div className="text-text-secondary space-y-4 text-base leading-relaxed">
            <p>{t("origin.paragraph1")}</p>
            <p>{t("origin.paragraph2")}</p>
          </div>
        </div>

        {/* Mission Section */}
        <div>
          <h2 className="text-text mb-6 text-xl font-semibold">{t("mission.title")}</h2>
          <div className="text-text-secondary space-y-4 text-base leading-relaxed">
            <p>{t("mission.paragraph1")}</p>
            <p>{t("mission.paragraph2")}</p>
            <p>{t("mission.paragraph3")}</p>
          </div>
        </div>

        {/* Values Section */}
        <div>
          <h2 className="text-text mb-8 text-xl font-semibold">{t("values.title")}</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {/* Value 1 */}
            <div className="card p-6">
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
            <div className="card p-6">
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
            <div className="card p-6">
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

        {/* CTA Section */}
        <div className="bg-bg-secondary rounded-2xl p-6 text-center sm:p-10">
          <h2 className="text-text mb-4 text-xl font-semibold">{t("cta.title")}</h2>
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
