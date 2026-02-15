"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  Clock,
  Package,
  Users,
  Heart,
  Flag,
  ShieldCheck,
  Lightbulb,
  MessageSquare,
  ArrowRight,
  Mail,
} from "lucide-react";

export default function AboutPage() {
  const t = useTranslations("aboutPage");
  const tCommon = useTranslations("common");
  const [simonImgError, setSimonImgError] = useState(false);

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
                <Clock className="text-primary h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="text-text mb-2 text-lg font-bold">{t("problem.point1.title")}</h3>
              <p className="text-text-muted leading-relaxed">{t("problem.point1.description")}</p>
            </div>

            {/* Pain point 2 */}
            <div className="card group p-8 text-center transition-all hover:scale-[1.02]">
              <div className="bg-accent/10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl">
                <Package className="text-accent h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="text-text mb-2 text-lg font-bold">{t("problem.point2.title")}</h3>
              <p className="text-text-muted leading-relaxed">{t("problem.point2.description")}</p>
            </div>

            {/* Pain point 3 */}
            <div className="card group p-8 text-center transition-all hover:scale-[1.02]">
              <div className="bg-warning/10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl">
                <Users className="text-warning h-8 w-8" aria-hidden="true" />
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
                {simonImgError ? (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
                    <span className="text-7xl font-bold text-white/90">SW</span>
                  </div>
                ) : (
                  <Image
                    src="/images/simon-wachter.jpg"
                    alt={t("founders.founder1.name")}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    onError={() => setSimonImgError(true)}
                  />
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-text text-xl font-bold">{t("founders.founder1.name")}</h3>
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
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-text text-xl font-bold">{t("founders.founder2.name")}</h3>
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
              </div>
            </div>
          </div>

          {/* Personal quote */}
          <div className="mx-auto mt-12 max-w-3xl">
            <blockquote className="border-primary/30 bg-bg-secondary rounded-xl border-l-4 p-6 sm:p-8">
              <p className="text-text-secondary text-lg leading-relaxed italic">
                &ldquo;{t("founders.story")}&rdquo;
              </p>
              <footer className="text-text-muted mt-4 text-sm">
                — <cite className="not-italic">{t("founders.quoteAttribution")}</cite>
              </footer>
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
                  <Clock className="text-primary h-7 w-7" aria-hidden="true" />
                </div>
                <h3 className="text-text mb-2 font-bold">{t("values.value1.title")}</h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {t("values.value1.description")}
                </p>
              </div>

              {/* Value 2 */}
              <div className="card p-6 text-center">
                <div className="bg-accent/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl">
                  <Heart className="text-accent h-7 w-7" aria-hidden="true" />
                </div>
                <h3 className="text-text mb-2 font-bold">{t("values.value2.title")}</h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {t("values.value2.description")}
                </p>
              </div>

              {/* Value 3 */}
              <div className="card p-6 text-center">
                <div className="bg-success/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl">
                  <Flag className="text-success h-7 w-7" aria-hidden="true" />
                </div>
                <h3 className="text-text mb-2 font-bold">{t("values.value3.title")}</h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {t("values.value3.description")}
                </p>
              </div>

              {/* Value 4 */}
              <div className="card p-6 text-center">
                <div className="bg-warning/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl">
                  <ShieldCheck className="text-warning h-7 w-7" aria-hidden="true" />
                </div>
                <h3 className="text-text mb-2 font-bold">{t("values.value4.title")}</h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {t("values.value4.description")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Help Us Grow Section */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
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

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="card p-5">
                  <div className="mb-2">
                    <Lightbulb className="text-accent mx-auto h-8 w-8" aria-hidden="true" />
                  </div>
                  <p className="text-text text-sm font-semibold">{t("helpUs.idea1")}</p>
                </div>
                <div className="card p-5">
                  <div className="mb-2">
                    <MessageSquare className="text-accent mx-auto h-8 w-8" aria-hidden="true" />
                  </div>
                  <p className="text-text text-sm font-semibold">{t("helpUs.idea2")}</p>
                </div>
                <div className="card p-5">
                  <div className="mb-2">
                    <Heart className="text-accent mx-auto h-8 w-8" aria-hidden="true" />
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
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
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
