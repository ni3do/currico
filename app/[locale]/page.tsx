"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { ResourceCard } from "@/components/ui/ResourceCard";
import { EarningsCalculator } from "@/components/ui/EarningsCalculator";

export default function Home() {
  const t = useTranslations("homePage");
  const tCommon = useTranslations("common"); // Used for buttons.viewAll
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      router.push(`/resources?search=${encodeURIComponent(trimmedQuery)}`);
    } else {
      router.push("/resources");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <main className="flex-1">
        {/* Hero Section - Split-Screen Layout */}
        <section className="hero-section">
          {/* Decorative floating shapes */}
          <div className="hero-decoration hero-decoration-1" aria-hidden="true" />
          <div className="hero-decoration hero-decoration-2" aria-hidden="true" />
          <div className="hero-decoration hero-decoration-3" aria-hidden="true" />

          <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="grid items-center gap-12 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
              {/* Left Side - Text Content (Mobile: order-1, Desktop: order-1) */}
              <div className="order-1 max-w-xl">
                <h1 className="text-4xl leading-[1.1] font-extrabold tracking-tight text-text sm:text-5xl lg:text-6xl">
                  {t("hero.title")}
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-text-muted sm:text-xl">
                  {t.rich("hero.description", {
                    bold: (chunks) => (
                      <strong className="font-semibold text-text">{chunks}</strong>
                    ),
                  })}
                </p>
                {/* Hero Search Bar */}
                <form onSubmit={handleSearch} className="mt-10 w-full max-w-[600px]">
                  <div className="relative flex items-center rounded-full bg-white shadow-lg">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t("hero.search.placeholder")}
                      className="w-full rounded-full py-4 pl-6 pr-32 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-semibold text-white transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <span className="hidden sm:inline">{t("hero.search.button")}</span>
                    </button>
                  </div>
                </form>

                {/* Secondary CTA */}
                <div className="mt-6">
                  <a
                    href="#features"
                    className="hero-cta-secondary inline-flex items-center justify-center"
                  >
                    {t("hero.secondaryButton")}
                  </a>
                </div>

                {/* Trust indicators */}
                <div className="mt-10 flex items-center gap-6 text-sm text-text-muted">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-success"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Lehrplan 21</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-success"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Schweizer Lehrpersonen</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Hero Image with decorative container */}
              <div className="hero-image-container order-2">
                <Image
                  src="/images/hero-teachers.png"
                  alt="Lehrer hilft Schülern bei Gruppenarbeit im Klassenzimmer"
                  width={1000}
                  height={667}
                  className="hero-image h-[320px] w-full object-cover object-center sm:h-[420px] lg:h-[500px]"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-semibold text-text">
                {t("howItWorks.title")}
              </h2>
              <p className="mt-2 text-text-muted">{t("howItWorks.description")}</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light">
                    <svg
                      className="h-8 w-8 text-primary"
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
                  <div className="absolute top-8 left-[60%] hidden w-[80%] border-t-2 border-dashed border-border md:block" />
                  <span className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-text-on-accent">
                    1
                  </span>
                  <h3 className="text-lg font-semibold text-text">
                    {t("howItWorks.step1.title")}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm text-text-muted">
                    {t("howItWorks.step1.description")}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-light">
                    <svg
                      className="h-8 w-8 text-accent"
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
                  <div className="absolute top-8 left-[60%] hidden w-[80%] border-t-2 border-dashed border-border md:block" />
                  <span className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-text-on-accent">
                    2
                  </span>
                  <h3 className="text-lg font-semibold text-text">
                    {t("howItWorks.step2.title")}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm text-text-muted">
                    {t("howItWorks.step2.description")}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-success-light">
                    <svg
                      className="h-8 w-8 text-success"
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
                  <span className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-text-on-accent">
                    3
                  </span>
                  <h3 className="text-lg font-semibold text-text">
                    {t("howItWorks.step3.title")}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm text-text-muted">
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
                <h2 className="text-2xl font-semibold text-text">
                  {t("featuredResources.title")}
                </h2>
                <p className="mt-2 text-text-muted">
                  {t("featuredResources.description")}
                </p>
              </div>
              <Link
                href="/resources"
                className="hidden items-center text-sm font-medium text-primary hover:underline sm:flex"
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
                <ResourceCard
                  key={card.key}
                  id={card.key}
                  title={t(`featuredResources.${card.key}.title`)}
                  description={t(`featuredResources.${card.key}.description`)}
                  subject={t(`featuredResources.${card.key}.category`)}
                  cycle={t(`featuredResources.${card.key}.cycle`)}
                  previewUrl={`https://images.unsplash.com/${card.image}?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80`}
                  subjectPillClass={card.pillClass}
                  showPriceBadge={false}
                  verified={false}
                  href="/resources"
                  footer={
                    <div className="flex items-center justify-between border-t border-border-subtle pt-4">
                      <span className="text-sm text-text-muted">
                        {t(`featuredResources.${card.key}.documents`)}
                      </span>
                      <div className="flex items-center gap-1 text-sm font-medium text-text-secondary">
                        <svg
                          className="h-4 w-4 text-warning"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {t(`featuredResources.${card.key}.rating`)}
                      </div>
                    </div>
                  }
                />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/resources"
                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
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
        <section className="bg-gradient-to-br from-ctp-blue/60 to-ctp-sapphire/60 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* Left - Text Content */}
              <div className="text-white">
                <h2 className="text-3xl leading-tight font-bold">{t("sellerCta.title")}</h2>
                <p className="mt-4 text-lg leading-relaxed text-white/80">
                  {t("sellerCta.description")}
                </p>

                {/* Benefits List */}
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold">{t("sellerCta.benefits.earn")}</span>
                      <span className="ml-1 text-white/70">– {t("sellerCta.benefits.earnDesc")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold">{t("sellerCta.benefits.reach")}</span>
                      <span className="ml-1 text-white/70">– {t("sellerCta.benefits.reachDesc")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold">{t("sellerCta.benefits.simple")}</span>
                      <span className="ml-1 text-white/70">– {t("sellerCta.benefits.simpleDesc")}</span>
                    </div>
                  </div>
                </div>

                <p className="mt-6 text-sm text-white/60">{t("sellerCta.note")}</p>
              </div>

              {/* Right - Earnings Calculator */}
              <div className="flex justify-center lg:justify-end">
                <EarningsCalculator className="w-full max-w-md" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Clean Grid */}
        <section id="features" className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="text-3xl font-semibold text-text">
                {t("features.title")}
              </h2>
              <p className="mt-4 text-lg text-text-muted">
                {t("features.description")}
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="card p-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light">
                  <svg
                    className="h-6 w-6 text-primary"
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
                <h3 className="text-lg font-bold text-text">
                  {t("features.feature1.title")}
                </h3>
                <p className="mt-3 leading-relaxed text-text-muted">
                  {t("features.feature1.description")}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card p-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-light">
                  <svg
                    className="h-6 w-6 text-accent"
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
                <h3 className="text-lg font-bold text-text">
                  {t("features.feature2.title")}
                </h3>
                <p className="mt-3 leading-relaxed text-text-muted">
                  {t("features.feature2.description")}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card p-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-success-light">
                  <svg
                    className="h-6 w-6 text-success"
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
                <h3 className="text-lg font-bold text-text">
                  {t("features.feature3.title")}
                </h3>
                <p className="mt-3 leading-relaxed text-text-muted">
                  {t("features.feature3.description")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-surface py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-semibold text-text">
                {t("testimonials.title")}
              </h2>
              <p className="mt-2 text-text-muted">{t("testimonials.description")}</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                { key: "testimonial1", color: "var(--ctp-blue)" },
                { key: "testimonial2", color: "var(--ctp-green)" },
                { key: "testimonial3", color: "var(--ctp-mauve)" },
              ].map((testimonial) => (
                <div
                  key={testimonial.key}
                  className="relative rounded-xl border border-border-subtle bg-bg p-6"
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
                  <p className="mb-6 leading-relaxed text-text-secondary">
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
                      <div className="font-medium text-text">
                        {t(`testimonials.${testimonial.key}.name`)}
                      </div>
                      <div className="text-sm text-text-muted">
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
