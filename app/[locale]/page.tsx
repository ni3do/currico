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
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <main className="flex-1">
        {/* Hero Section - Split-Screen Layout */}
        <section>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
              {/* Left Side - Text Content */}
              <div className="order-2 lg:order-1">
                <h1 className="text-3xl leading-tight font-bold tracking-tight text-[var(--color-text)] sm:text-4xl lg:text-5xl">
                  {t("hero.title")}
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--color-text-muted)]">
                  {t.rich("hero.description", {
                    bold: (chunks) => (
                      <strong className="font-semibold text-[var(--color-text)]">{chunks}</strong>
                    ),
                  })}
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
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
                  className="h-[320px] w-full rounded-xl object-cover object-center shadow-lg sm:h-[400px] lg:h-[480px]"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-[var(--color-surface)] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-semibold text-[var(--color-text)]">
                {t("howItWorks.title")}
              </h2>
              <p className="mt-2 text-[var(--color-text-muted)]">{t("howItWorks.description")}</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary-light)]">
                    <svg
                      className="h-8 w-8 text-[var(--color-primary)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <div className="absolute top-8 left-[60%] hidden w-[80%] border-t-2 border-dashed border-[var(--color-border)] md:block" />
                  <span className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-bold text-[var(--btn-primary-text)]">
                    1
                  </span>
                  <h3 className="text-lg font-semibold text-[var(--color-text)]">
                    {t("howItWorks.step1.title")}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm text-[var(--color-text-muted)]">
                    {t("howItWorks.step1.description")}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-accent-light)]">
                    <svg
                      className="h-8 w-8 text-[var(--color-accent)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </div>
                  <div className="absolute top-8 left-[60%] hidden w-[80%] border-t-2 border-dashed border-[var(--color-border)] md:block" />
                  <span className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-bold text-[var(--btn-primary-text)]">
                    2
                  </span>
                  <h3 className="text-lg font-semibold text-[var(--color-text)]">
                    {t("howItWorks.step2.title")}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm text-[var(--color-text-muted)]">
                    {t("howItWorks.step2.description")}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-success-light)]">
                    <svg
                      className="h-8 w-8 text-[var(--color-success)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </div>
                  <span className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-bold text-[var(--btn-primary-text)]">
                    3
                  </span>
                  <h3 className="text-lg font-semibold text-[var(--color-text)]">
                    {t("howItWorks.step3.title")}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm text-[var(--color-text-muted)]">
                    {t("howItWorks.step3.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Resources - Clean Card Grid */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-[var(--color-text)]">
                  {t("featuredResources.title")}
                </h2>
                <p className="mt-2 text-[var(--color-text-muted)]">
                  {t("featuredResources.description")}
                </p>
              </div>
              <Link
                href="/resources"
                className="hidden items-center text-sm font-medium text-[var(--color-primary)] hover:underline sm:flex"
              >
                {tCommon("buttons.viewAll")}
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  key: "card1",
                  pillClass: "pill-accent",
                  image: "photo-1532094349884-543bc11b234d",
                },
                {
                  key: "card2",
                  pillClass: "pill-success",
                  image: "photo-1456513080510-7bf3a84b82f8",
                },
                {
                  key: "card3",
                  pillClass: "pill-primary",
                  image: "photo-1635070041078-e363dbe005cb",
                },
              ].map((card) => (
                <article
                  key={card.key}
                  className="card group overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div
                    className="h-[180px] w-full bg-[var(--color-surface)]"
                    style={{
                      backgroundImage: `url("https://images.unsplash.com/${card.image}?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className="p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <span className={`pill ${card.pillClass}`}>
                        {t(`featuredResources.${card.key}.category`)}
                      </span>
                      <span className="pill pill-neutral">
                        {t(`featuredResources.${card.key}.cycle`)}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[var(--color-text)] transition-colors group-hover:text-[var(--color-primary)]">
                      {t(`featuredResources.${card.key}.title`)}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-[var(--color-text-muted)]">
                      {t(`featuredResources.${card.key}.description`)}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-4">
                      <span className="text-sm text-[var(--color-text-muted)]">
                        {t(`featuredResources.${card.key}.documents`)}
                      </span>
                      <div className="flex items-center gap-1 text-sm font-medium text-[var(--color-text-secondary)]">
                        <svg
                          className="h-4 w-4 text-[var(--color-warning)]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
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
              <Link
                href="/resources"
                className="inline-flex items-center text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                {t("featuredResources.viewAllMobile")}
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Seller CTA Section */}
        <section className="bg-gradient-to-br from-[var(--ctp-blue)]/60 to-[var(--ctp-sapphire)]/60 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* Left - Text Content */}
              <div className="text-white">
                <h2 className="text-3xl leading-tight font-bold">{t("sellerCta.title")}</h2>
                <p className="mt-4 text-lg leading-relaxed text-white/80">
                  {t("sellerCta.description")}
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/become-seller"
                    className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 font-semibold text-[var(--ctp-blue)] transition-colors hover:bg-white/90"
                  >
                    {t("sellerCta.button")}
                    <svg
                      className="ml-2 h-5 w-5"
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
                </div>
                <p className="mt-4 text-sm text-white/60">{t("sellerCta.note")}</p>
              </div>

              {/* Right - Benefits Grid */}
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                    <svg
                      className="h-5 w-5 text-white"
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
                  <h3 className="font-semibold text-white">{t("sellerCta.benefits.earn")}</h3>
                  <p className="mt-2 text-sm text-white/70">{t("sellerCta.benefits.earnDesc")}</p>
                </div>

                <div className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                    <svg
                      className="h-5 w-5 text-white"
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
                  <h3 className="font-semibold text-white">{t("sellerCta.benefits.reach")}</h3>
                  <p className="mt-2 text-sm text-white/70">{t("sellerCta.benefits.reachDesc")}</p>
                </div>

                <div className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                    <svg
                      className="h-5 w-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-white">{t("sellerCta.benefits.simple")}</h3>
                  <p className="mt-2 text-sm text-white/70">{t("sellerCta.benefits.simpleDesc")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Clean Grid */}
        <section id="features" className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-2xl text-center">
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
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary-light)]">
                  <svg
                    className="h-6 w-6 text-[var(--color-primary)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[var(--color-text)]">
                  {t("features.feature1.title")}
                </h3>
                <p className="mt-3 leading-relaxed text-[var(--color-text-muted)]">
                  {t("features.feature1.description")}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card p-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent-light)]">
                  <svg
                    className="h-6 w-6 text-[var(--color-accent)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[var(--color-text)]">
                  {t("features.feature2.title")}
                </h3>
                <p className="mt-3 leading-relaxed text-[var(--color-text-muted)]">
                  {t("features.feature2.description")}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card p-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-success-light)]">
                  <svg
                    className="h-6 w-6 text-[var(--color-success)]"
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
                <h3 className="text-lg font-bold text-[var(--color-text)]">
                  {t("features.feature3.title")}
                </h3>
                <p className="mt-3 leading-relaxed text-[var(--color-text-muted)]">
                  {t("features.feature3.description")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-[var(--color-surface)] py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-semibold text-[var(--color-text)]">
                {t("testimonials.title")}
              </h2>
              <p className="mt-2 text-[var(--color-text-muted)]">{t("testimonials.description")}</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                { key: "testimonial1", color: "var(--ctp-blue)" },
                { key: "testimonial2", color: "var(--ctp-green)" },
                { key: "testimonial3", color: "var(--ctp-mauve)" },
              ].map((testimonial) => (
                <div
                  key={testimonial.key}
                  className="relative rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg)] p-6"
                >
                  {/* Quote icon */}
                  <svg
                    className="absolute top-6 right-6 h-8 w-8 opacity-10"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: testimonial.color }}
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>

                  {/* Quote text */}
                  <p className="mb-6 leading-relaxed text-[var(--color-text-secondary)]">
                    &ldquo;{t(`testimonials.${testimonial.key}.quote`)}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: testimonial.color }}
                    >
                      {t(`testimonials.${testimonial.key}.name`).charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-[var(--color-text)]">
                        {t(`testimonials.${testimonial.key}.name`)}
                      </div>
                      <div className="text-sm text-[var(--color-text-muted)]">
                        {t(`testimonials.${testimonial.key}.role`)} ·{" "}
                        {t(`testimonials.${testimonial.key}.location`)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
