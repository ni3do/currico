"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";

export default function Home() {
  const t = useTranslations("homePage");
  const tCommon = useTranslations("common"); // Used for buttons.viewAll

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <TopBar />

      <main>
        {/* Hero Section - Split-Screen Layout */}
        <section className="bg-[var(--color-bg)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 py-16 lg:py-24 items-center">
              {/* Left Side - Text Content */}
              <div className="order-2 lg:order-1">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-text)] leading-tight tracking-tight">
                  {t("hero.title")}
                </h1>
                <p className="mt-6 text-lg text-[var(--color-text-muted)] leading-relaxed max-w-xl">
                  {t.rich("hero.description", {
                    bold: (chunks) => <strong className="font-semibold text-[var(--color-text)]">{chunks}</strong>
                  })}
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/resources"
                    className="btn-primary inline-flex items-center justify-center px-6 py-2.5 hover:-translate-y-0.5"
                  >
                    {t("hero.primaryButton")}
                  </Link>
                  <a
                    href="#features"
                    className="btn-secondary inline-flex items-center justify-center px-6 py-2.5"
                  >
                    {t("hero.secondaryButton")}
                  </a>
                </div>
              </div>

              {/* Right Side - Hero Image */}
              <div className="order-1 lg:order-2">
                <Image
                  src="/images/hero-teachers.png"
                  alt="Lehrer hilft Schülern bei Gruppenarbeit im Klassenzimmer"
                  width={1000}
                  height={667}
                  className="w-full h-[320px] sm:h-[400px] lg:h-[480px] rounded-xl shadow-lg object-cover object-center"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Resources - Clean Card Grid */}
        <section className="bg-[var(--color-bg)] py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-[var(--color-text)]">{t("featuredResources.title")}</h2>
                <p className="mt-2 text-[var(--color-text-muted)]">{t("featuredResources.description")}</p>
              </div>
              <Link href="/resources" className="hidden sm:flex items-center text-[var(--color-primary)] font-medium text-sm hover:underline">
                {tCommon("buttons.viewAll")}
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { key: "card1", pillClass: "pill-accent", image: "photo-1532094349884-543bc11b234d" },
                { key: "card2", pillClass: "pill-success", image: "photo-1456513080510-7bf3a84b82f8" },
                { key: "card3", pillClass: "pill-primary", image: "photo-1635070041078-e363dbe005cb" },
              ].map((card) => (
                <article key={card.key} className="card group overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <div
                    className="w-full h-[180px] bg-[var(--color-surface)]"
                    style={{
                      backgroundImage: `url("https://images.unsplash.com/${card.image}?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`pill ${card.pillClass}`}>
                        {t(`featuredResources.${card.key}.category`)}
                      </span>
                      <span className="pill pill-neutral">
                        {t(`featuredResources.${card.key}.cycle`)}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                      {t(`featuredResources.${card.key}.title`)}
                    </h3>
                    <p className="mt-2 text-sm text-[var(--color-text-muted)] line-clamp-2">
                      {t(`featuredResources.${card.key}.description`)}
                    </p>
                    <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                      <span className="text-sm text-[var(--color-text-muted)]">{t(`featuredResources.${card.key}.documents`)}</span>
                      <div className="flex items-center gap-1 text-sm font-medium text-[var(--color-text-secondary)]">
                        <svg className="w-4 h-4 text-[var(--color-warning)]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {t(`featuredResources.${card.key}.rating`)}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link href="/resources" className="inline-flex items-center text-[var(--color-primary)] font-medium text-sm hover:underline">
                {t("featuredResources.viewAllMobile")}
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section - Clean Grid */}
        <section id="features" className="bg-[var(--color-bg)] py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-semibold text-[var(--color-text)]">
                {t("features.title")}
              </h2>
              <p className="mt-4 text-lg text-[var(--color-text-muted)]">
                {t("features.description")}
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="card p-8">
                <div className="flex items-center justify-center w-12 h-12 bg-[var(--color-primary-light)] rounded-xl mb-6">
                  <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[var(--color-text)]">
                  {t("features.feature1.title")}
                </h3>
                <p className="mt-3 text-[var(--color-text-muted)] leading-relaxed">
                  {t("features.feature1.description")}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card p-8">
                <div className="flex items-center justify-center w-12 h-12 bg-[var(--color-accent-light)] rounded-xl mb-6">
                  <svg className="w-6 h-6 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[var(--color-text)]">
                  {t("features.feature2.title")}
                </h3>
                <p className="mt-3 text-[var(--color-text-muted)] leading-relaxed">
                  {t("features.feature2.description")}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card p-8">
                <div className="flex items-center justify-center w-12 h-12 bg-[var(--color-success-light)] rounded-xl mb-6">
                  <svg className="w-6 h-6 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[var(--color-text)]">
                  {t("features.feature3.title")}
                </h3>
                <p className="mt-3 text-[var(--color-text-muted)] leading-relaxed">
                  {t("features.feature3.description")}
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
