"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { ResourceCard } from "@/components/ui/ResourceCard";
import { SellerHeroSection } from "@/components/ui/SellerHeroSection";
import {
  BadgeCheck,
  BookOpen,
  Zap,
  Clock,
  Shield,
  Sparkles,
  MessageCircle,
  Gift,
} from "lucide-react";

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
        <section className="hero-section flex min-h-[calc(100vh-4rem)] items-center">
          {/* Decorative floating shapes */}
          <div className="hero-decoration hero-decoration-1" aria-hidden="true" />
          <div className="hero-decoration hero-decoration-2" aria-hidden="true" />
          <div className="hero-decoration hero-decoration-3" aria-hidden="true" />

          <div className="relative mx-auto w-full max-w-7xl px-6 pt-6 pb-12 sm:px-8 sm:pt-8 sm:pb-16 lg:px-12 lg:pt-10 lg:pb-20">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
              {/* Left Side - Text Content (Mobile: order-1, Desktop: order-1) */}
              <div className="order-1 max-w-xl">
                <h1 className="text-text text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                  {t("hero.title")}
                </h1>
                <p className="text-text-muted mt-6 text-lg leading-relaxed sm:text-xl">
                  {t.rich("hero.description", {
                    bold: (chunks) => <strong className="text-text font-semibold">{chunks}</strong>,
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
                      className="focus:ring-primary w-full rounded-full py-4 pr-32 pl-6 text-base text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary-dark focus:ring-primary absolute right-2 flex items-center gap-2 rounded-full px-6 py-2.5 font-semibold text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
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

                {/* Trust indicators */}
                <div className="text-text-muted mt-10 flex flex-wrap items-center gap-4 text-sm sm:gap-6">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="text-success h-5 w-5" />
                    <span>Lehrplan 21</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="text-success h-5 w-5" />
                    <span>Schweizer Qualität</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="text-success h-5 w-5" />
                    <span>Zeitersparnis</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Hero Image with decorative container */}
              <div className="hero-image-container order-2 flex items-center justify-center">
                <Image
                  src="/images/hero-teachers.png"
                  alt="Lehrer hilft Schülern bei Gruppenarbeit im Klassenzimmer"
                  width={1000}
                  height={667}
                  className="hero-image aspect-[3/2] w-full max-w-lg object-cover object-center lg:max-w-none"
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
              <h2 className="text-text text-2xl font-semibold">{t("howItWorks.title")}</h2>
              <p className="text-text-muted mt-2">{t("howItWorks.description")}</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-primary-light mb-5 flex h-16 w-16 items-center justify-center rounded-2xl">
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <div className="border-border absolute top-8 left-[60%] hidden w-[80%] border-t-2 border-dashed md:block" />
                  <span className="bg-primary text-text-on-accent mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold">
                    1
                  </span>
                  <h3 className="text-text text-lg font-semibold">{t("howItWorks.step1.title")}</h3>
                  <p className="text-text-muted mt-2 max-w-xs text-sm">
                    {t("howItWorks.step1.description")}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-accent-light mb-5 flex h-16 w-16 items-center justify-center rounded-2xl">
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
                  <div className="border-border absolute top-8 left-[60%] hidden w-[80%] border-t-2 border-dashed md:block" />
                  <span className="bg-primary text-text-on-accent mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold">
                    2
                  </span>
                  <h3 className="text-text text-lg font-semibold">{t("howItWorks.step2.title")}</h3>
                  <p className="text-text-muted mt-2 max-w-xs text-sm">
                    {t("howItWorks.step2.description")}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-success-light mb-5 flex h-16 w-16 items-center justify-center rounded-2xl">
                    <svg
                      className="text-success h-8 w-8"
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
                  <span className="bg-primary text-text-on-accent mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold">
                    3
                  </span>
                  <h3 className="text-text text-lg font-semibold">{t("howItWorks.step3.title")}</h3>
                  <p className="text-text-muted mt-2 max-w-xs text-sm">
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
                <h2 className="text-text text-2xl font-semibold">{t("featuredResources.title")}</h2>
                <p className="text-text-muted mt-2">{t("featuredResources.description")}</p>
              </div>
              <Link
                href="/resources"
                className="text-primary hidden items-center text-sm font-medium hover:underline sm:flex"
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
                    <div className="border-border-subtle flex items-center justify-between border-t pt-4">
                      <span className="text-text-muted text-sm">
                        {t(`featuredResources.${card.key}.documents`)}
                      </span>
                      <div className="text-text-secondary flex items-center gap-1 text-sm font-medium">
                        <svg
                          className="text-warning h-4 w-4"
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
                className="text-primary inline-flex items-center text-sm font-medium hover:underline"
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

        {/* Seller CTA Section - Premium Design */}
        <SellerHeroSection />

        {/* Features Section - Clean Grid */}
        <section id="features" className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="text-text text-3xl font-semibold">{t("features.title")}</h2>
              <p className="text-text-muted mt-4 text-lg">{t("features.description")}</p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1: Quality Checked */}
              <div className="card p-8">
                <div className="bg-primary-light mb-6 flex h-12 w-12 items-center justify-center rounded-xl">
                  <BadgeCheck className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-text text-lg font-bold">{t("features.feature1.title")}</h3>
                <p className="text-text-muted mt-3 leading-relaxed">
                  {t("features.feature1.description")}
                </p>
              </div>

              {/* Feature 2: LP21 Compliant */}
              <div className="card p-8">
                <div className="bg-accent-light mb-6 flex h-12 w-12 items-center justify-center rounded-xl">
                  <BookOpen className="text-accent h-6 w-6" />
                </div>
                <h3 className="text-text text-lg font-bold">{t("features.feature2.title")}</h3>
                <p className="text-text-muted mt-3 leading-relaxed">
                  {t("features.feature2.description")}
                </p>
              </div>

              {/* Feature 3: Ready to Use */}
              <div className="card p-8">
                <div className="bg-success-light mb-6 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Zap className="text-success h-6 w-6" />
                </div>
                <h3 className="text-text text-lg font-bold">{t("features.feature3.title")}</h3>
                <p className="text-text-muted mt-3 leading-relaxed">
                  {t("features.feature3.description")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pilot Teacher CTA Section */}
        <section className="bg-surface py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="border-border-subtle bg-bg relative overflow-hidden rounded-2xl border p-8 md:p-12">
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-gradient-to-br from-[var(--ctp-mauve)]/10 to-[var(--ctp-blue)]/10 blur-3xl" />

              <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12">
                {/* Left: Text content */}
                <div>
                  <span className="text-primary mb-4 inline-flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="h-4 w-4" />
                    {t("pilotTeacher.note")}
                  </span>
                  <h2 className="text-text text-2xl font-bold md:text-3xl">
                    {t("pilotTeacher.title")}
                  </h2>
                  <p className="text-text-muted mt-4 text-lg">{t("pilotTeacher.text")}</p>
                  <Link
                    href="/contact"
                    className="bg-primary hover:bg-primary-hover text-text-on-accent mt-8 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition-colors"
                  >
                    {t("pilotTeacher.button")}
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>

                {/* Right: Benefits */}
                <div className="flex flex-col justify-center gap-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary-light flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                      <Sparkles className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-text font-semibold">
                        {t("pilotTeacher.benefits.early")}
                      </h3>
                      <p className="text-text-muted mt-1 text-sm">
                        Testen Sie neue Funktionen vor allen anderen.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-accent-light flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                      <MessageCircle className="text-accent h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-text font-semibold">
                        {t("pilotTeacher.benefits.feedback")}
                      </h3>
                      <p className="text-text-muted mt-1 text-sm">
                        Ihre Ideen fliessen direkt in die Entwicklung ein.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-success-light flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                      <Gift className="text-success h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-text font-semibold">{t("pilotTeacher.benefits.free")}</h3>
                      <p className="text-text-muted mt-1 text-sm">
                        Exklusive Materialien als Dankeschön.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
