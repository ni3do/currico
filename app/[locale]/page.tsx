"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { ResourceCard } from "@/components/ui/ResourceCard";
import { SellerHeroSection } from "@/components/ui/SellerHeroSection";
import { TrustBar } from "@/components/ui/TrustBar";
import { SwissBrandSection } from "@/components/ui/SwissBrandSection";
import { ValueProposition } from "@/components/ui/ValueProposition";
import { FadeIn, StaggerChildren, StaggerItem, motion } from "@/components/ui/animations";

export default function Home() {
  const t = useTranslations("homePage");
  const tCommon = useTranslations("common");
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
              {/* Left Side - Text Content */}
              <div className="order-1 max-w-xl">
                <FadeIn direction="up" delay={0}>
                  <h1 className="text-text text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                    {t("hero.title")}
                  </h1>
                </FadeIn>
                <FadeIn direction="up" delay={0.1}>
                  <p className="text-text-muted mt-6 text-lg leading-relaxed sm:text-xl">
                    {t.rich("hero.description", {
                      bold: (chunks) => (
                        <strong className="text-text font-semibold">{chunks}</strong>
                      ),
                    })}
                  </p>
                </FadeIn>
                {/* Hero Search Bar */}
                <FadeIn direction="up" delay={0.2}>
                  <form onSubmit={handleSearch} className="mt-10 w-full max-w-[600px]">
                    <motion.div
                      className="relative flex items-center rounded-full bg-white shadow-lg"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t("hero.search.placeholder")}
                        className="focus:ring-primary w-full rounded-full py-4 pr-32 pl-6 text-base text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                      />
                      <motion.button
                        type="submit"
                        className="bg-primary hover:bg-primary-dark focus:ring-primary absolute right-2 flex items-center gap-2 rounded-full px-6 py-2.5 font-semibold text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
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
                      </motion.button>
                    </motion.div>
                  </form>
                </FadeIn>
              </div>

              {/* Right Side - Hero Image with decorative container */}
              <FadeIn
                direction="right"
                delay={0.2}
                className="hero-image-container order-2 flex items-center justify-center"
              >
                <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ duration: 0.3 }}>
                  <Image
                    src="/images/hero-teachers.png"
                    alt="Lehrer hilft Schülern bei Gruppenarbeit im Klassenzimmer"
                    width={1000}
                    height={667}
                    className="hero-image aspect-[3/2] w-full max-w-lg object-cover object-center lg:max-w-none"
                    priority
                  />
                </motion.div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Trust Bar - Social Proof & Authority */}
        <TrustBar />

        {/* Swiss Brand - Quality & Trust */}
        <SwissBrandSection />

        {/* Featured Resources - Visual Direction */}
        <section className="bg-surface py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn direction="up" className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-text text-2xl font-semibold">{t("featuredResources.title")}</h2>
                <p className="text-text-muted mt-2">{t("featuredResources.description")}</p>
              </div>
              <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                <Link
                  href="/resources"
                  className="text-primary hidden items-center text-sm font-medium hover:underline sm:flex"
                >
                  {tCommon("buttons.viewAll")}
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </motion.div>
            </FadeIn>

            <StaggerChildren
              staggerDelay={0.1}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
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
                <StaggerItem key={card.key}>
                  <ResourceCard
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
                </StaggerItem>
              ))}
            </StaggerChildren>

            <FadeIn direction="up" delay={0.3} className="mt-8 text-center sm:hidden">
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
            </FadeIn>
          </div>
        </section>

        {/* Value Proposition Triptych - Rule of Three */}
        <ValueProposition />

        {/* Seller CTA Section - Serial Position (Recency) */}
        <SellerHeroSection />
      </main>

      <Footer />
    </div>
  );
}
