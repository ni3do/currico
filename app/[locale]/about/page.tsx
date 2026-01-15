"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";

export default function AboutPage() {
  const t = useTranslations("aboutPage");

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <TopBar />

      <main>
        {/* Hero Section */}
        <section className="bg-[var(--color-bg)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 py-16 lg:py-24 items-center">
              {/* Left Side - Text Content */}
              <div className="order-2 lg:order-1">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-text)] leading-tight tracking-tight">
                  {t("hero.title")}
                </h1>
                <p className="mt-6 text-xl text-[var(--color-text-muted)] leading-relaxed max-w-xl">
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
                  className="w-full h-[320px] sm:h-[400px] lg:h-[480px] rounded-xl shadow-lg object-cover object-center"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="bg-[var(--color-bg-secondary)] py-20 lg:py-28">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--color-primary)] mb-8">
              {t("mission.title")}
            </h2>
            <div className="space-y-6 text-lg text-[var(--color-text-secondary)] leading-relaxed">
              <p>{t("mission.paragraph1")}</p>
              <p>{t("mission.paragraph2")}</p>
              <p>{t("mission.paragraph3")}</p>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="bg-[var(--color-bg)] py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--color-primary)] text-center mb-16">
              {t("values.title")}
            </h2>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Value 1 - Time Savings */}
              <div className="card p-8 text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-[var(--color-primary-light)] rounded-full mx-auto mb-6">
                  <svg className="w-8 h-8 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[var(--color-text)] mb-3">
                  {t("values.value1.title")}
                </h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  {t("values.value1.description")}
                </p>
              </div>

              {/* Value 2 - Swiss Quality */}
              <div className="card p-8 text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-[var(--color-accent-light)] rounded-full mx-auto mb-6">
                  <svg className="w-8 h-8 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[var(--color-text)] mb-3">
                  {t("values.value2.title")}
                </h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  {t("values.value2.description")}
                </p>
              </div>

              {/* Value 3 - Teacher Verified */}
              <div className="card p-8 text-center sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-center w-16 h-16 bg-[var(--color-success-light)] rounded-full mx-auto mb-6">
                  <svg className="w-8 h-8 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[var(--color-text)] mb-3">
                  {t("values.value3.title")}
                </h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  {t("values.value3.description")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Origin Story Section */}
        <section className="bg-[var(--color-bg-secondary)] py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Side - Text Content */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--color-primary)] mb-8">
                  {t("origin.title")}
                </h2>
                <div className="space-y-6 text-lg text-[var(--color-text-secondary)] leading-relaxed">
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
                  className="w-full h-[300px] sm:h-[350px] lg:h-[400px] rounded-xl shadow-lg object-cover object-center"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[var(--color-primary)] py-20 lg:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white">
              {t("cta.title")}
            </h2>
            <div className="mt-8">
              <Link
                href="/resources"
                className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 font-semibold text-[var(--color-primary)] hover:bg-[var(--color-surface)] transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                {t("cta.button")}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
