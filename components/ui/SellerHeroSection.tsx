"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HeroWithOverlap } from "./HeroWithOverlap";
import { EarningsCalculator } from "./EarningsCalculator";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="card group p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white"
        style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--ctp-sapphire) 100%)" }}
      >
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-text">{title}</h3>
      <p className="text-sm leading-relaxed text-text-muted">{description}</p>
    </div>
  );
}

interface SellerHeroSectionProps {
  className?: string;
}

export function SellerHeroSection({ className = "" }: SellerHeroSectionProps) {
  const t = useTranslations("sellerHero");

  const features = [
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: t("features.commission.title"),
      description: t("features.commission.description"),
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      title: t("features.community.title"),
      description: t("features.community.description"),
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: t("features.curriculum.title"),
      description: t("features.curriculum.description"),
    },
  ];

  return (
    <div className={`seller-hero-section ${className}`}>
      {/* Hero with Overlapping Calculator */}
      <HeroWithOverlap
        headline={t("headline")}
        subheadline={t("subheadline")}
        cardMaxWidth="max-w-md"
      >
        <EarningsCalculator />
      </HeroWithOverlap>

      {/* Content Section */}
      <section className="bg-bg px-4 pb-16 pt-12 md:px-6 md:pb-20 md:pt-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-semibold text-text md:text-3xl">
            {t("whySell.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-text-muted md:text-lg">
            {t("whySell.description")}
          </p>

          {/* Feature Cards */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12">
            <Link
              href="/register"
              className="btn-action inline-flex items-center gap-2 px-8 py-3 text-lg"
            >
              <span>{t("ctaButton")}</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SellerHeroSection;
