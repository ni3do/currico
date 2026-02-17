"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useScroll, useTransform, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  FadeIn,
  StaggerChildren,
  StaggerItem,
  MotionCard,
  motion,
} from "@/components/ui/animations";
import {
  BookOpen,
  Shield,
  Users,
  Coins,
  Lightbulb,
  MessageSquare,
  ArrowRight,
  Mail,
  Heart,
  Sparkles,
  Code2,
  Rocket,
  GraduationCap,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ================================================================
// CONFIG ARRAYS
// ================================================================

const STATS_KEYS = ["materials", "teachers", "cantons", "lp21"] as const;

const TIMELINE_MILESTONES = [
  { key: "milestone1", icon: Sparkles },
  { key: "milestone2", icon: Code2 },
  { key: "milestone3", icon: Rocket },
  { key: "milestone4", icon: GraduationCap },
  { key: "milestone5", icon: TrendingUp },
  { key: "milestone6", icon: ArrowUpRight },
] as const;

const VALUES_CONFIG: {
  key: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}[] = [
  { key: "value1", icon: BookOpen, iconBg: "bg-success/10", iconColor: "text-success" },
  { key: "value2", icon: Shield, iconBg: "bg-primary/10", iconColor: "text-primary" },
  { key: "value3", icon: Users, iconBg: "bg-accent/10", iconColor: "text-accent" },
  { key: "value4", icon: Coins, iconBg: "bg-warning/10", iconColor: "text-warning" },
];

// ================================================================
// PAGE COMPONENT
// ================================================================

export default function AboutPage() {
  const t = useTranslations("aboutPage");
  const tCommon = useTranslations("common");
  const [simonImgError, setSimonImgError] = useState(false);
  const [laurentImgError, setLaurentImgError] = useState(false);

  // Parallax scroll for hero section
  const heroRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImageY = useTransform(scrollYProgress, [0, 1], [0, -20]);

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="flex-1">
        {/* ──────────── 1. Hero ──────────── */}
        <section ref={heroRef} className="relative overflow-hidden">
          <div className="bg-bg-secondary">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
              <Breadcrumb items={[{ label: tCommon("breadcrumb.about") }]} />

              <div className="mt-6 grid items-center gap-12 lg:grid-cols-2">
                <FadeIn direction="up">
                  <span className="pill pill-primary mb-4 inline-block">{t("hero.badge")}</span>
                  <h1 className="text-text text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
                    {t("hero.title")}
                  </h1>
                  <p className="text-text-secondary mt-6 text-lg leading-relaxed sm:text-xl">
                    {t("hero.subtitle")}
                  </p>
                  <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                    <Link
                      href="/materialien"
                      className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3 font-medium transition-colors"
                    >
                      {t("hero.primaryCta")}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <Link
                      href="/anmelden"
                      className="border-border text-text hover:bg-surface inline-flex items-center justify-center gap-2 rounded-lg border px-8 py-3 font-medium transition-colors"
                    >
                      {t("hero.secondaryCta")}
                    </Link>
                  </div>
                </FadeIn>
                <FadeIn direction="right">
                  <motion.div
                    className="relative aspect-square overflow-hidden rounded-2xl"
                    style={prefersReducedMotion ? undefined : { y: heroImageY }}
                  >
                    <Image
                      src="/images/about-hero.png"
                      alt={t("hero.imageAlt")}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                      priority
                    />
                  </motion.div>
                </FadeIn>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────── 2. Stats Bar ──────────── */}
        <section className="bg-surface border-border border-y">
          <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
            <StaggerChildren className="grid grid-cols-2 gap-6 text-center sm:grid-cols-4">
              {STATS_KEYS.map((key) => (
                <StaggerItem key={key}>
                  <p className="text-text text-3xl font-bold">{t(`stats.${key}.value`)}</p>
                  <p className="text-text-muted mt-1 text-sm">{t(`stats.${key}.label`)}</p>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* ──────────── 3. Origin Story ──────────── */}
        <section className="bg-bg">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <FadeIn direction="left">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <Image
                    src="/images/about-team.png"
                    alt={t("origin.imageAlt")}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </FadeIn>
              <FadeIn direction="right">
                <h2 className="text-text text-2xl font-bold sm:text-3xl">{t("origin.title")}</h2>
                <div className="text-text-secondary mt-6 space-y-4 text-base leading-relaxed sm:text-lg">
                  <p>{t("origin.paragraph1")}</p>
                  <p>{t("origin.paragraph2")}</p>
                  <p>{t("origin.paragraph3")}</p>
                </div>
                <blockquote className="border-primary/30 mt-6 border-l-4 py-2 pl-4">
                  <p className="text-text text-lg font-medium italic">{t("origin.highlight")}</p>
                </blockquote>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ──────────── 4. Timeline / Journey ──────────── */}
        <section className="bg-bg-secondary">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-text text-2xl font-bold sm:text-3xl">{t("timeline.title")}</h2>
              <p className="text-text-muted mt-4 text-lg">{t("timeline.subtitle")}</p>
            </FadeIn>

            <StaggerChildren className="relative mx-auto max-w-3xl">
              {/* Vertical line */}
              <div className="bg-border absolute top-0 bottom-0 left-6 w-0.5 lg:left-1/2 lg:-translate-x-px" />

              {TIMELINE_MILESTONES.map((milestone, index) => {
                const Icon = milestone.icon;
                const isLeft = index % 2 === 0;

                return (
                  <StaggerItem key={milestone.key} variant="card">
                    <div className="relative mb-8 flex items-start lg:mb-12">
                      {/* Mobile: icon on the left line */}
                      <div className="bg-primary text-text-on-accent z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full lg:absolute lg:left-1/2 lg:-translate-x-1/2">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>

                      {/* Card */}
                      <div
                        className={`card ml-6 flex-1 p-5 lg:ml-0 lg:w-[calc(50%-2.5rem)] ${
                          isLeft ? "lg:mr-auto lg:pr-6" : "lg:ml-auto lg:pl-6"
                        }`}
                      >
                        <p className="text-primary text-xs font-semibold tracking-wider uppercase">
                          {t(`timeline.${milestone.key}.date`)}
                        </p>
                        <h3 className="text-text mt-1 text-lg font-bold">
                          {t(`timeline.${milestone.key}.title`)}
                        </h3>
                        <p className="text-text-muted mt-1 text-sm leading-relaxed">
                          {t(`timeline.${milestone.key}.description`)}
                        </p>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerChildren>
          </div>
        </section>

        {/* ──────────── 5. Meet the Team ──────────── */}
        <section className="bg-bg">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-text text-2xl font-bold sm:text-3xl">{t("founders.title")}</h2>
              <p className="text-text-muted mt-4 text-lg">{t("founders.subtitle")}</p>
            </FadeIn>

            <StaggerChildren variant="grid" className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-2">
              {/* Simon */}
              <StaggerItem variant="card">
                <MotionCard hoverEffect="lift" className="card overflow-hidden">
                  <div className="relative h-80 w-full overflow-hidden">
                    {simonImgError ? (
                      <div className="from-success to-primary flex h-full w-full items-center justify-center bg-gradient-to-br">
                        <span className="text-text-on-accent text-7xl font-bold opacity-90">
                          SW
                        </span>
                      </div>
                    ) : (
                      <Image
                        src="/images/simon-wachter.jpg"
                        alt={t("founders.founder1.name")}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover object-top"
                        onError={() => setSimonImgError(true)}
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-text text-xl font-bold">
                          {t("founders.founder1.name")}
                        </h3>
                        <p className="text-primary text-sm font-semibold">
                          {t("founders.founder1.role")}
                        </p>
                      </div>
                      <a
                        href="mailto:info@currico.ch"
                        className="text-text-muted hover:text-primary flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                        aria-label={t("founders.emailLabel", { name: "Simon" })}
                      >
                        <Mail className="h-5 w-5" aria-hidden="true" />
                      </a>
                    </div>
                    <p className="text-text-muted mt-3 text-sm leading-relaxed">
                      {t("founders.founder1.bio")}
                    </p>
                    <p className="text-text-muted mt-2 text-xs italic">
                      {t("founders.founder1.funFact")}
                    </p>
                  </div>
                </MotionCard>
              </StaggerItem>

              {/* Laurent */}
              <StaggerItem variant="card">
                <MotionCard hoverEffect="lift" className="card overflow-hidden">
                  <div className="relative h-80 w-full overflow-hidden">
                    {laurentImgError ? (
                      <div className="from-primary to-accent flex h-full w-full items-center justify-center bg-gradient-to-br">
                        <span className="text-text-on-accent text-7xl font-bold opacity-90">
                          LZ
                        </span>
                      </div>
                    ) : (
                      <Image
                        src="/images/laurent-zoccoletti.jpg"
                        alt={t("founders.founder2.name")}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover object-top"
                        onError={() => setLaurentImgError(true)}
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-text text-xl font-bold">
                          {t("founders.founder2.name")}
                        </h3>
                        <p className="text-primary text-sm font-semibold">
                          {t("founders.founder2.role")}
                        </p>
                      </div>
                      <a
                        href="mailto:info@currico.ch"
                        className="text-text-muted hover:text-primary flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                        aria-label={t("founders.emailLabel", { name: "Laurent" })}
                      >
                        <Mail className="h-5 w-5" aria-hidden="true" />
                      </a>
                    </div>
                    <p className="text-text-muted mt-3 text-sm leading-relaxed">
                      {t("founders.founder2.bio")}
                    </p>
                    <p className="text-text-muted mt-2 text-xs italic">
                      {t("founders.founder2.funFact")}
                    </p>
                  </div>
                </MotionCard>
              </StaggerItem>
            </StaggerChildren>
          </div>
        </section>

        {/* ──────────── 6. Founders Quote ──────────── */}
        <section className="bg-bg-secondary">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <FadeIn className="mx-auto max-w-3xl">
              <p className="text-text-muted mb-4 text-center text-sm font-semibold tracking-wider uppercase">
                {t("quote.context")}
              </p>
              <blockquote className="border-primary/30 bg-surface rounded-xl border-l-4 p-8">
                <p className="text-text-secondary text-lg leading-relaxed italic">
                  &ldquo;{t("quote.text")}&rdquo;
                </p>
                <footer className="mt-6 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="ring-surface h-8 w-8 overflow-hidden rounded-full ring-2">
                      {simonImgError ? (
                        <div className="from-success to-primary text-text-on-accent flex h-full w-full items-center justify-center bg-gradient-to-br text-xs font-bold">
                          SW
                        </div>
                      ) : (
                        <Image
                          src="/images/simon-wachter.jpg"
                          alt="Simon"
                          width={32}
                          height={32}
                          className="object-cover object-top"
                        />
                      )}
                    </div>
                    <div className="ring-surface h-8 w-8 overflow-hidden rounded-full ring-2">
                      {laurentImgError ? (
                        <div className="from-primary to-accent text-text-on-accent flex h-full w-full items-center justify-center bg-gradient-to-br text-xs font-bold">
                          LZ
                        </div>
                      ) : (
                        <Image
                          src="/images/laurent-zoccoletti.jpg"
                          alt="Laurent"
                          width={32}
                          height={32}
                          className="object-cover object-top"
                        />
                      )}
                    </div>
                  </div>
                  <div className="text-sm">
                    <cite className="text-text font-medium not-italic">
                      {t("quote.attribution")}
                    </cite>
                    <span className="text-text-muted"> — {t("quote.role")}</span>
                  </div>
                </footer>
              </blockquote>
            </FadeIn>
          </div>
        </section>

        {/* ──────────── 7. Values — Swiss-specific ──────────── */}
        <section className="bg-bg">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-text text-2xl font-bold sm:text-3xl">{t("values.title")}</h2>
            </FadeIn>

            <StaggerChildren variant="grid" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES_CONFIG.map(({ key, icon: Icon, iconBg, iconColor }) => (
                <StaggerItem key={key} variant="card">
                  <MotionCard hoverEffect="lift" className="card p-6 text-center">
                    <div
                      className={`${iconBg} mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl`}
                    >
                      <Icon className={`${iconColor} h-7 w-7`} aria-hidden="true" />
                    </div>
                    <h3 className="text-text mb-2 font-bold">{t(`values.${key}.title`)}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">
                      {t(`values.${key}.description`)}
                    </p>
                  </MotionCard>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* ──────────── 8. Help Us Grow ──────────── */}
        <section className="bg-bg-secondary">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <FadeIn>
              <div className="border-primary/20 bg-primary/5 rounded-3xl border-2 border-dashed p-8 sm:p-12">
                <div className="mx-auto max-w-3xl text-center">
                  <div className="bg-primary/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                    <Lightbulb className="text-primary h-8 w-8" aria-hidden="true" />
                  </div>
                  <h2 className="text-text text-2xl font-bold sm:text-3xl">{t("helpUs.title")}</h2>
                  <p className="text-text-secondary mt-4 text-lg leading-relaxed">
                    {t("helpUs.paragraph1")}
                  </p>
                  <p className="text-text-secondary mt-4 text-lg leading-relaxed">
                    {t("helpUs.paragraph2")}
                  </p>

                  <StaggerChildren className="mt-8 grid gap-4 sm:grid-cols-3">
                    <StaggerItem variant="card">
                      <div className="card p-5">
                        <div className="mb-2">
                          <Lightbulb className="text-accent mx-auto h-8 w-8" aria-hidden="true" />
                        </div>
                        <p className="text-text text-sm font-semibold">{t("helpUs.idea1")}</p>
                      </div>
                    </StaggerItem>
                    <StaggerItem variant="card">
                      <div className="card p-5">
                        <div className="mb-2">
                          <MessageSquare
                            className="text-accent mx-auto h-8 w-8"
                            aria-hidden="true"
                          />
                        </div>
                        <p className="text-text text-sm font-semibold">{t("helpUs.idea2")}</p>
                      </div>
                    </StaggerItem>
                    <StaggerItem variant="card">
                      <div className="card p-5">
                        <div className="mb-2">
                          <Heart className="text-accent mx-auto h-8 w-8" aria-hidden="true" />
                        </div>
                        <p className="text-text text-sm font-semibold">{t("helpUs.idea3")}</p>
                      </div>
                    </StaggerItem>
                  </StaggerChildren>

                  <div className="mt-8">
                    <Link
                      href="/kontakt"
                      className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center gap-2 rounded-lg px-8 py-3 font-medium transition-colors"
                    >
                      {t("helpUs.button")}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ──────────── 9. Final CTA ──────────── */}
        <section className="bg-bg">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <FadeIn className="mx-auto max-w-3xl text-center">
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
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
                <Link
                  href="/anmelden"
                  className="border-border text-text hover:bg-surface inline-flex items-center justify-center gap-2 rounded-lg border px-8 py-3.5 text-lg font-medium transition-colors"
                >
                  {t("cta.secondaryButton")}
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
