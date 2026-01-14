"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";

export default function Home() {
  const t = useTranslations("homePage");
  const tCommon = useTranslations("common");

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
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--color-primary-light)] rounded-md mb-6">
                  <span className="text-[var(--color-primary)] text-sm font-medium">{t("hero.badge")}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-text)] leading-tight tracking-tight">
                  {t("hero.title")}
                </h1>
                <p className="mt-6 text-lg text-[var(--color-text-muted)] leading-relaxed max-w-xl">
                  {t("hero.description")}
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/resources"
                    className="btn-primary px-6 py-3.5 hover:-translate-y-0.5"
                  >
                    {t("hero.primaryButton")}
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <a
                    href="#features"
                    className="btn-secondary px-6 py-3.5"
                  >
                    {t("hero.secondaryButton")}
                  </a>
                </div>
                <div className="mt-10 pt-8 border-t border-[var(--color-border)]">
                  <p className="text-sm text-[var(--color-text-muted)] mb-3">{t("hero.trustLabel")}</p>
                  <div className="flex items-center gap-6 text-[var(--color-text-faint)]">
                    <span className="text-sm font-medium">{t("hero.trustBadges.lehrplan21")}</span>
                    <span className="text-[var(--color-border)]">|</span>
                    <span className="text-sm font-medium">{t("hero.trustBadges.qualityChecked")}</span>
                    <span className="text-[var(--color-border)]">|</span>
                    <span className="text-sm font-medium">{t("hero.trustBadges.swissStandard")}</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Hero Image */}
              <div className="order-1 lg:order-2">
                <div
                  className="w-full h-[320px] sm:h-[400px] lg:h-[480px] rounded-xl bg-[var(--color-surface)]"
                  style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Category Navigation - Clean Horizontal */}
        <section className="bg-[var(--color-bg-secondary)] border-y border-[var(--color-border)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 py-4 overflow-x-auto">
              <Link href="/resources" className="px-4 py-2 rounded-md bg-[var(--color-primary)] text-white font-medium text-sm whitespace-nowrap">
                {t("categories.allSubjects")}
              </Link>
              <Link href="/resources?subject=NMG" className="px-4 py-2 rounded-md text-[var(--color-text-secondary)] font-medium text-sm whitespace-nowrap hover:bg-[var(--color-surface)] transition-colors">
                {t("categories.science")}
              </Link>
              <Link href="/resources?subject=Deutsch" className="px-4 py-2 rounded-md text-[var(--color-text-secondary)] font-medium text-sm whitespace-nowrap hover:bg-[var(--color-surface)] transition-colors">
                {t("categories.languages")}
              </Link>
              <Link href="/resources?subject=Mathematik" className="px-4 py-2 rounded-md text-[var(--color-text-secondary)] font-medium text-sm whitespace-nowrap hover:bg-[var(--color-surface)] transition-colors">
                {t("categories.math")}
              </Link>
              <Link href="/resources?subject=BG" className="px-4 py-2 rounded-md text-[var(--color-text-secondary)] font-medium text-sm whitespace-nowrap hover:bg-[var(--color-surface)] transition-colors">
                {t("categories.arts")}
              </Link>
              <Link href="/resources?subject=Geschichte" className="px-4 py-2 rounded-md text-[var(--color-text-secondary)] font-medium text-sm whitespace-nowrap hover:bg-[var(--color-surface)] transition-colors">
                {t("categories.history")}
              </Link>
              <Link href="/resources?subject=Musik" className="px-4 py-2 rounded-md text-[var(--color-text-secondary)] font-medium text-sm whitespace-nowrap hover:bg-[var(--color-surface)] transition-colors">
                {t("categories.music")}
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Resources - Clean Card Grid */}
        <section className="bg-[var(--color-bg)] py-20">
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
              {/* Card 1 */}
              <article className="card group overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div
                  className="w-full h-[180px] bg-[var(--color-surface)]"
                  style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="pill pill-accent">
                      {t("featuredResources.card1.category")}
                    </span>
                    <span className="pill pill-neutral">
                      {t("featuredResources.card1.cycle")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                    {t("featuredResources.card1.title")}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--color-text-muted)] line-clamp-2">
                    {t("featuredResources.card1.description")}
                  </p>
                  <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text-muted)]">{t("featuredResources.card1.documents")}</span>
                    <div className="flex items-center gap-1 text-sm font-medium text-[var(--color-text-secondary)]">
                      <svg className="w-4 h-4 text-[var(--color-warning)]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {t("featuredResources.card1.rating")}
                    </div>
                  </div>
                </div>
              </article>

              {/* Card 2 */}
              <article className="card group overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div
                  className="w-full h-[180px] bg-[var(--color-surface)]"
                  style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="pill pill-success">
                      {t("featuredResources.card2.category")}
                    </span>
                    <span className="pill pill-neutral">
                      {t("featuredResources.card2.cycle")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                    {t("featuredResources.card2.title")}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--color-text-muted)] line-clamp-2">
                    {t("featuredResources.card2.description")}
                  </p>
                  <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text-muted)]">{t("featuredResources.card2.documents")}</span>
                    <div className="flex items-center gap-1 text-sm font-medium text-[var(--color-text-secondary)]">
                      <svg className="w-4 h-4 text-[var(--color-warning)]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {t("featuredResources.card2.rating")}
                    </div>
                  </div>
                </div>
              </article>

              {/* Card 3 */}
              <article className="card group overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div
                  className="w-full h-[180px] bg-[var(--color-surface)]"
                  style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="pill pill-primary">
                      {t("featuredResources.card3.category")}
                    </span>
                    <span className="pill pill-neutral">
                      {t("featuredResources.card3.cycle")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                    {t("featuredResources.card3.title")}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--color-text-muted)] line-clamp-2">
                    {t("featuredResources.card3.description")}
                  </p>
                  <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text-muted)]">{t("featuredResources.card3.documents")}</span>
                    <div className="flex items-center gap-1 text-sm font-medium text-[var(--color-text-secondary)]">
                      <svg className="w-4 h-4 text-[var(--color-warning)]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {t("featuredResources.card3.rating")}
                    </div>
                  </div>
                </div>
              </article>
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

        {/* Stats Section - Clean numbers */}
        <section className="bg-[var(--color-bg)] py-20 border-y border-[var(--color-border)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-4xl font-bold text-[var(--color-primary)]">{t("stats.materials.value")}</div>
                <div className="mt-2 text-sm text-[var(--color-text-muted)] font-medium">{t("stats.materials.label")}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[var(--color-accent)]">{t("stats.teachers.value")}</div>
                <div className="mt-2 text-sm text-[var(--color-text-muted)] font-medium">{t("stats.teachers.label")}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[var(--color-primary)]">{t("stats.satisfaction.value")}</div>
                <div className="mt-2 text-sm text-[var(--color-text-muted)] font-medium">{t("stats.satisfaction.label")}</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[var(--color-primary)] py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white">
              {t("cta.title")}
            </h2>
            <p className="mt-4 text-lg text-white/80">
              {t("cta.description")}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3.5 font-semibold text-[var(--color-primary)] hover:bg-[var(--color-surface)] transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                {t("cta.primaryButton")}
              </Link>
              <Link
                href="/resources"
                className="inline-flex items-center justify-center rounded-lg bg-white/10 px-6 py-3.5 font-semibold text-white border border-white/20 hover:bg-white/20 transition-all"
              >
                {t("cta.secondaryButton")}
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Grounded with slate background */}
      <footer className="bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-[var(--color-primary)] rounded-md">
                  <span className="text-white font-bold text-sm">{tCommon("brand.logoText")}</span>
                </div>
                <span className="text-lg font-semibold text-[var(--color-text)]">{tCommon("brand.name")}</span>
              </div>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                {tCommon("footer.brandDescription")}
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold text-[var(--color-text)] text-sm uppercase tracking-wider">{tCommon("footer.platformSection.title")}</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/resources" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">{tCommon("footer.platformSection.resources")}</Link></li>
                <li><Link href="/coming-soon" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">{tCommon("footer.platformSection.pricing")}</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-[var(--color-text)] text-sm uppercase tracking-wider">{tCommon("footer.infoSection.title")}</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/coming-soon" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">{tCommon("footer.infoSection.aboutUs")}</Link></li>
                <li><Link href="/coming-soon" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">{tCommon("footer.infoSection.contact")}</Link></li>
                <li><Link href="/coming-soon" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">{tCommon("footer.infoSection.help")}</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-[var(--color-text)] text-sm uppercase tracking-wider">{tCommon("footer.legalSection.title")}</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/coming-soon" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">{tCommon("footer.legalSection.privacy")}</Link></li>
                <li><Link href="/coming-soon" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">{tCommon("footer.legalSection.terms")}</Link></li>
                <li><Link href="/coming-soon" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">{tCommon("footer.legalSection.imprint")}</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[var(--color-border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              {tCommon("footer.copyright")}
            </p>
            <p className="text-sm text-[var(--color-text-faint)]">
              {tCommon("footer.initiative")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
