"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { ChevronDown } from "lucide-react";
import { useCurriculum } from "@/lib/hooks/useCurriculum";
import { useScroll, useTransform, useReducedMotion } from "framer-motion";
import Image from "next/image";
import dynamic from "next/dynamic";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { MaterialCard } from "@/components/ui/MaterialCard";
import { TrustBar } from "@/components/ui/TrustBar";
import { FadeIn, StaggerChildren, StaggerItem, motion } from "@/components/ui/animations";
import { Skeleton } from "@/components/ui/Skeleton";

// Skeleton placeholder for below-fold dynamic imports (prevents CLS)
const SectionSkeleton = () => (
  <div className="py-24" role="status" aria-busy="true">
    <div className="mx-auto max-w-7xl px-4">
      <Skeleton className="h-48 rounded-2xl" />
    </div>
  </div>
);

// Dynamic imports for below-fold sections (code-splitting, ssr: false for smaller initial HTML)
const SwissBrandSection = dynamic(
  () => import("@/components/ui/SwissBrandSection").then((m) => ({ default: m.SwissBrandSection })),
  { ssr: false, loading: SectionSkeleton }
);
const CategoryQuickAccess = dynamic(
  () =>
    import("@/components/ui/CategoryQuickAccess").then((m) => ({ default: m.CategoryQuickAccess })),
  { ssr: false, loading: SectionSkeleton }
);
const HowItWorks = dynamic(
  () => import("@/components/ui/HowItWorks").then((m) => ({ default: m.HowItWorks })),
  { ssr: false, loading: SectionSkeleton }
);
const ValueProposition = dynamic(
  () => import("@/components/ui/ValueProposition").then((m) => ({ default: m.ValueProposition })),
  { ssr: false, loading: SectionSkeleton }
);
const SellerHeroSection = dynamic(
  () => import("@/components/ui/SellerHeroSection").then((m) => ({ default: m.SellerHeroSection })),
  { ssr: false, loading: SectionSkeleton }
);
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";
import { getSubjectPillClass } from "@/lib/constants/subject-colors";
import { PlatformStatsBar, type PlatformStats } from "@/components/ui/PlatformStatsBar";
import type { FeaturedMaterial } from "@/lib/types/material";

interface HomeClientProps {
  initialMaterials: FeaturedMaterial[];
  platformStats: PlatformStats;
}

export default function HomeClient({ initialMaterials, platformStats }: HomeClientProps) {
  const t = useTranslations("homePage");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCycle, setSelectedCycle] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { zyklen, getFachbereicheByZyklus, fachbereiche } = useCurriculum();

  // Parallax scroll for hero section
  const heroRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const decorationY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const heroImageY = useTransform(scrollYProgress, [0, 1], [0, -20]);

  const availableSubjects = useMemo(() => {
    if (!selectedCycle) return fachbereiche;
    return getFachbereicheByZyklus(parseInt(selectedCycle, 10));
  }, [selectedCycle, fachbereiche, getFachbereicheByZyklus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) params.set("search", trimmedQuery);
    if (selectedCycle) params.set("zyklus", selectedCycle);
    if (selectedSubject) params.set("fachbereich", selectedSubject);
    const qs = params.toString();
    router.push(qs ? `/materialien?${qs}` : "/materialien");
  };

  // Close autocomplete when clicking outside the search container
  const handleSearchBlur = useCallback((e: React.FocusEvent) => {
    // Only close if focus moved outside the search container
    if (
      searchContainerRef.current &&
      !searchContainerRef.current.contains(e.relatedTarget as Node)
    ) {
      setSearchFocused(false);
    }
  }, []);

  const handleCycleChange = (value: string) => {
    setSelectedCycle(value);
    setSelectedSubject("");
  };

  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
  };

  const featuredMaterials = initialMaterials;

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="flex-1">
        {/* Hero Section - Split-Screen Layout */}
        <section
          ref={heroRef}
          aria-label="Hero"
          className="hero-section flex min-h-[calc(100vh-4rem)] items-center"
        >
          {/* Decorative floating shapes with parallax */}
          {prefersReducedMotion ? (
            <>
              <div className="hero-decoration hero-decoration-1" aria-hidden="true" />
              <div className="hero-decoration hero-decoration-2" aria-hidden="true" />
              <div className="hero-decoration hero-decoration-3" aria-hidden="true" />
            </>
          ) : (
            <>
              <motion.div
                className="hero-decoration hero-decoration-1"
                style={{ y: decorationY }}
                aria-hidden="true"
              />
              <motion.div
                className="hero-decoration hero-decoration-2"
                style={{ y: decorationY }}
                aria-hidden="true"
              />
              <motion.div
                className="hero-decoration hero-decoration-3"
                style={{ y: decorationY }}
                aria-hidden="true"
              />
            </>
          )}

          <div className="relative mx-auto w-full max-w-7xl px-6 pt-6 pb-12 sm:px-8 sm:pt-8 sm:pb-16 lg:px-12 lg:pt-10 lg:pb-20">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
              {/* Left Side - Text Content */}
              <div className="order-1 max-w-xl">
                <FadeIn direction="up" delay={0}>
                  <p className="text-primary mb-3 text-sm font-semibold tracking-wide uppercase">
                    {t("hero.eyebrow")}
                  </p>
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
                  <form
                    onSubmit={handleSearch}
                    className="mt-10 w-full max-w-[600px]"
                    aria-label={t("hero.search.formLabel")}
                  >
                    {/* Search bar with autocomplete */}
                    <div ref={searchContainerRef} className="relative" onBlur={handleSearchBlur}>
                      <motion.div
                        className="bg-surface border-border-subtle relative flex items-center rounded-full border shadow-lg"
                        whileHover={{
                          scale: 1.015,
                          transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
                        }}
                      >
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onFocus={() => setSearchFocused(true)}
                          placeholder={t("hero.search.placeholder")}
                          className="text-text placeholder-text-muted focus:ring-primary w-full rounded-full bg-transparent py-4 pr-32 pl-6 text-base focus:ring-2 focus:ring-offset-2 focus:outline-none"
                          role="combobox"
                          aria-expanded={searchFocused && searchQuery.length >= 2}
                          aria-autocomplete="list"
                          aria-controls="hero-autocomplete"
                        />
                        <motion.button
                          type="submit"
                          className="bg-primary hover:bg-primary-hover focus:ring-primary text-text-on-accent absolute right-2 flex items-center gap-2 rounded-full px-6 py-2.5 font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
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
                          <span className="sr-only sm:hidden">{t("hero.search.button")}</span>
                        </motion.button>
                      </motion.div>

                      <SearchAutocomplete
                        query={searchQuery}
                        isOpen={searchFocused}
                        onSelect={() => setSearchFocused(false)}
                      />
                    </div>

                    {/* Cycle + Subject dropdowns + Seller CTA */}
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      {/* Cycle dropdown */}
                      <div className="relative flex-1">
                        <label htmlFor="hero-cycle-select" className="sr-only">
                          {t("hero.search.cycleLabel")}
                        </label>
                        <select
                          id="hero-cycle-select"
                          value={selectedCycle}
                          onChange={(e) => handleCycleChange(e.target.value)}
                          className="bg-surface/80 text-text-secondary focus:bg-surface focus:ring-primary w-full appearance-none rounded-full border-0 py-3 pr-10 pl-4 text-sm font-medium shadow-md backdrop-blur-sm transition-shadow hover:shadow-lg focus:ring-2 focus:outline-none"
                        >
                          <option value="">{t("hero.search.allCycles")}</option>
                          {zyklen.map((z) => (
                            <option key={z.id} value={z.id.toString()}>
                              {z.shortName}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="text-text-muted pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
                      </div>

                      {/* Subject dropdown */}
                      <div className="relative flex-1">
                        <label htmlFor="hero-subject-select" className="sr-only">
                          {t("hero.search.subjectLabel")}
                        </label>
                        <select
                          id="hero-subject-select"
                          value={selectedSubject}
                          onChange={(e) => handleSubjectChange(e.target.value)}
                          className="bg-surface/80 text-text-secondary focus:bg-surface focus:ring-primary w-full appearance-none rounded-full border-0 py-3 pr-10 pl-4 text-sm font-medium shadow-md backdrop-blur-sm transition-shadow hover:shadow-lg focus:ring-2 focus:outline-none"
                        >
                          <option value="">{t("hero.search.allSubjects")}</option>
                          {availableSubjects.map((fb) => (
                            <option key={fb.code} value={fb.code}>
                              {fb.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="text-text-muted pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
                      </div>
                    </div>
                  </form>
                </FadeIn>

                {/* Seller CTA removed — dedicated section exists further down */}
              </div>

              {/* Right Side - Hero Image with decorative container + parallax */}
              <FadeIn
                direction="right"
                delay={0.2}
                className="hero-image-container order-2 flex items-center justify-center"
              >
                <motion.div
                  style={prefersReducedMotion ? undefined : { y: heroImageY }}
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                  }}
                >
                  <Image
                    src="/images/hero-teachers.png"
                    alt={t("hero.imageAlt")}
                    width={1000}
                    height={667}
                    className="hero-image aspect-[3/2] w-full max-w-lg object-cover object-center lg:max-w-none"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </motion.div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Trust Bar - Social Proof & Authority */}
        <TrustBar />

        {/* Platform Stats - Social Proof Counters */}
        <PlatformStatsBar {...platformStats} />

        {/* Swiss Brand - Quality & Trust */}
        <SwissBrandSection />

        {/* Beliebte Fächer - Quick Access Tiles */}
        <CategoryQuickAccess />

        {/* Featured Resources - Visual Direction */}
        <section aria-labelledby="featured-heading" className="bg-surface py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn direction="up" className="mb-8 flex items-end justify-between">
              <div>
                <h2 id="featured-heading" className="text-text text-xl font-semibold">
                  {t("featuredResources.title")}
                </h2>
                <p className="text-text-muted mt-2">{t("featuredResources.description")}</p>
              </div>
              <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                <Link
                  href="/materialien"
                  className="text-primary hidden items-center text-sm font-medium hover:underline sm:flex"
                >
                  {t("featuredResources.viewAllLink")}
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

            {featuredMaterials.length > 0 ? (
              <StaggerChildren
                staggerDelay={0.1}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {featuredMaterials.map((mat) => (
                  <StaggerItem key={mat.id}>
                    <MaterialCard
                      id={mat.id}
                      title={mat.title}
                      description={mat.description}
                      subject={mat.subjects[0] || "Allgemein"}
                      cycle={mat.cycles[0] || ""}
                      price={mat.price}
                      priceFormatted={mat.priceFormatted}
                      previewUrl={mat.previewUrl}
                      averageRating={mat.averageRating}
                      reviewCount={mat.reviewCount}
                      downloadCount={mat.downloadCount}
                      competencies={mat.competencies}
                      subjectPillClass={getSubjectPillClass(mat.subjects[0] || "Allgemein")}
                      seller={{
                        displayName: mat.seller.displayName,
                        isVerifiedSeller: mat.seller.isVerifiedSeller,
                        sellerLevel: mat.seller.sellerLevel,
                        sellerXp: mat.seller.sellerXp,
                      }}
                      href={`/materialien/${mat.id}`}
                    />
                  </StaggerItem>
                ))}
              </StaggerChildren>
            ) : (
              <FadeIn
                direction="up"
                className="border-border bg-bg flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center"
              >
                <p className="text-text text-lg font-semibold">
                  {t("featuredResources.emptyTitle")}
                </p>
                <p className="text-text-muted mt-2 text-sm">
                  {t("featuredResources.emptyDescription")}
                </p>
                <Link
                  href="/hochladen"
                  className="bg-primary text-text-on-accent hover:bg-primary-hover mt-4 inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors"
                >
                  {t("featuredResources.emptyUpload")}
                </Link>
              </FadeIn>
            )}

            <FadeIn direction="up" delay={0.3} className="mt-8 text-center sm:hidden">
              <Link
                href="/materialien"
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

        {/* How It Works - 3-Step Guide */}
        <HowItWorks />

        {/* Value Proposition Triptych - Rule of Three */}
        <ValueProposition />

        {/* Seller CTA Section - Serial Position (Recency) */}
        <SellerHeroSection />
      </main>

      <Footer />
    </div>
  );
}
