"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export default function AboutPage() {
  const t = useTranslations("aboutPage");
  const tCommon = useTranslations("common");

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="bg-bg-secondary">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
              <Breadcrumb items={[{ label: tCommon("breadcrumb.about") }]} />

              <div className="mt-6 grid items-center gap-12 lg:grid-cols-2">
                <div>
                  <span className="pill pill-primary mb-4 inline-block">{t("hero.badge")}</span>
                  <h1 className="text-text text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
                    {t("hero.title")}
                  </h1>
                  <p className="text-text-secondary mt-6 text-lg leading-relaxed sm:text-xl">
                    {t("hero.subtitle")}
                  </p>
                </div>
                <div className="relative hidden aspect-square overflow-hidden rounded-2xl lg:block">
                  <Image
                    src="/images/about-hero.png"
                    alt={t("hero.imageAlt")}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-text text-2xl font-bold sm:text-3xl">{t("problem.title")}</h2>
            <p className="text-text-muted mt-4 text-lg">{t("problem.subtitle")}</p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {/* Pain point 1 */}
            <div className="card group p-8 text-center transition-all hover:scale-[1.02]">
              <div className="bg-primary/10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl">
                <svg
                  className="text-primary h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-text mb-2 text-lg font-bold">{t("problem.point1.title")}</h3>
              <p className="text-text-muted leading-relaxed">{t("problem.point1.description")}</p>
            </div>

            {/* Pain point 2 */}
            <div className="card group p-8 text-center transition-all hover:scale-[1.02]">
              <div className="bg-accent/10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl">
                <svg
                  className="text-accent h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-text mb-2 text-lg font-bold">{t("problem.point2.title")}</h3>
              <p className="text-text-muted leading-relaxed">{t("problem.point2.description")}</p>
            </div>

            {/* Pain point 3 */}
            <div className="card group p-8 text-center transition-all hover:scale-[1.02]">
              <div className="bg-warning/10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl">
                <svg
                  className="text-warning h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-text mb-2 text-lg font-bold">{t("problem.point3.title")}</h3>
              <p className="text-text-muted leading-relaxed">{t("problem.point3.description")}</p>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="bg-bg-secondary">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src="/images/about-team.png"
                  alt={t("origin.imageAlt")}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-text text-2xl font-bold sm:text-3xl">{t("origin.title")}</h2>
                <div className="text-text-secondary mt-6 space-y-4 text-base leading-relaxed sm:text-lg">
                  <p>{t("origin.paragraph1")}</p>
                  <p>{t("origin.paragraph2")}</p>
                  <p>{t("origin.paragraph3")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Meet the Team */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-text text-2xl font-bold sm:text-3xl">{t("founders.title")}</h2>
            <p className="text-text-muted mt-4 text-lg">{t("founders.subtitle")}</p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-2">
            {/* Simon */}
            <div className="card group overflow-hidden transition-all hover:scale-[1.01]">
              <div className="relative h-80 w-full overflow-hidden">
                <Image
                  src="/images/simon-wachter.jpg"
                  alt={t("founders.founder1.name")}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-text text-xl font-bold">{t("founders.founder1.name")}</h3>
                <p className="text-primary mb-3 text-sm font-semibold">
                  {t("founders.founder1.role")}
                </p>
                <p className="text-text-muted text-sm leading-relaxed">
                  {t("founders.founder1.bio")}
                </p>
              </div>
            </div>

            {/* Laurent */}
            <div className="card group overflow-hidden transition-all hover:scale-[1.01]">
              <div className="relative flex h-80 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600">
                <span className="text-7xl font-bold text-white/90 transition-transform duration-500 group-hover:scale-105">
                  LZ
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-text text-xl font-bold">{t("founders.founder2.name")}</h3>
                <p className="text-primary mb-3 text-sm font-semibold">
                  {t("founders.founder2.role")}
                </p>
                <p className="text-text-muted text-sm leading-relaxed">
                  {t("founders.founder2.bio")}
                </p>
              </div>
            </div>
          </div>

          {/* Personal quote */}
          <div className="mx-auto mt-12 max-w-3xl">
            <blockquote className="border-primary/30 bg-bg-secondary rounded-xl border-l-4 p-6 sm:p-8">
              <p className="text-text-secondary text-lg leading-relaxed italic">
                &ldquo;{t("founders.story")}&rdquo;
              </p>
            </blockquote>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-bg-secondary">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-text text-2xl font-bold sm:text-3xl">{t("values.title")}</h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Value 1 */}
              <div className="card p-6 text-center">
                <div className="bg-primary/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl">
                  <svg
                    className="text-primary h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
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
              <div className="card p-6 text-center">
                <div className="bg-accent/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl">
                  <svg
                    className="text-accent h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-text mb-2 font-bold">{t("values.value2.title")}</h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {t("values.value2.description")}
                </p>
              </div>

              {/* Value 3 */}
              <div className="card p-6 text-center">
                <div className="bg-success/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl">
                  <svg
                    className="text-success h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                    />
                  </svg>
                </div>
                <h3 className="text-text mb-2 font-bold">{t("values.value3.title")}</h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {t("values.value3.description")}
                </p>
              </div>

              {/* Value 4 */}
              <div className="card p-6 text-center">
                <div className="bg-warning/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl">
                  <svg
                    className="text-warning h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-text mb-2 font-bold">{t("values.value4.title")}</h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {t("values.value4.description")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Help Us Grow Section - NEW */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="border-primary/20 bg-primary/5 rounded-3xl border-2 border-dashed p-8 sm:p-12">
            <div className="mx-auto max-w-3xl text-center">
              <div className="bg-primary/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-primary h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h2 className="text-text text-2xl font-bold sm:text-3xl">{t("helpUs.title")}</h2>
              <p className="text-text-secondary mt-4 text-lg leading-relaxed">
                {t("helpUs.paragraph1")}
              </p>
              <p className="text-text-secondary mt-4 text-lg leading-relaxed">
                {t("helpUs.paragraph2")}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="card p-5">
                  <div className="text-primary mb-2 text-2xl font-bold">
                    <svg
                      className="text-accent mx-auto h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <p className="text-text text-sm font-semibold">{t("helpUs.idea1")}</p>
                </div>
                <div className="card p-5">
                  <div className="text-primary mb-2 text-2xl font-bold">
                    <svg
                      className="text-accent mx-auto h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <p className="text-text text-sm font-semibold">{t("helpUs.idea2")}</p>
                </div>
                <div className="card p-5">
                  <div className="text-primary mb-2 text-2xl font-bold">
                    <svg
                      className="text-accent mx-auto h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-text text-sm font-semibold">{t("helpUs.idea3")}</p>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/kontakt"
                  className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center gap-2 rounded-lg px-8 py-3 font-medium transition-colors"
                >
                  {t("helpUs.button")}
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-bg-secondary">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-text text-2xl font-bold sm:text-3xl">{t("cta.title")}</h2>
              <p className="text-text-muted mx-auto mt-4 max-w-2xl text-lg leading-relaxed">
                {t("cta.subtitle")}
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/materialien"
                  className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3.5 text-lg font-medium transition-colors"
                >
                  {t("cta.button")}
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
                <Link
                  href="/anmelden"
                  className="border-border text-text hover:bg-surface inline-flex items-center justify-center gap-2 rounded-lg border px-8 py-3.5 text-lg font-medium transition-colors"
                >
                  {t("cta.secondaryButton")}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
