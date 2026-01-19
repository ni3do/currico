"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Coins, Users, Upload, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

interface SellerHeroSectionProps {
  className?: string;
}

export function SellerHeroSection({ className = "" }: SellerHeroSectionProps) {
  const t = useTranslations("sellerHero");

  const features = [
    {
      icon: <Coins className="h-6 w-6" />,
      title: t("features.commission.title"),
      description: t("features.commission.description"),
      gradient: "from-[var(--ctp-yellow)] to-[var(--ctp-peach)]",
      bgGradient: "from-[var(--ctp-yellow)]/20 to-[var(--ctp-peach)]/10",
      iconColor: "text-[var(--ctp-yellow)]",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: t("features.community.title"),
      description: t("features.community.description"),
      gradient: "from-[var(--ctp-blue)] to-[var(--ctp-sapphire)]",
      bgGradient: "from-[var(--ctp-blue)]/20 to-[var(--ctp-sapphire)]/10",
      iconColor: "text-[var(--ctp-sapphire)]",
    },
    {
      icon: <Upload className="h-6 w-6" />,
      title: t("features.curriculum.title"),
      description: t("features.curriculum.description"),
      gradient: "from-[var(--ctp-teal)] to-[var(--ctp-green)]",
      bgGradient: "from-[var(--ctp-teal)]/20 to-[var(--ctp-green)]/10",
      iconColor: "text-[var(--ctp-teal)]",
    },
  ];

  return (
    <section className={`seller-hero-premium relative overflow-hidden ${className}`}>
      {/* Premium gradient background using Catppuccin Mocha base colors */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg,
            var(--ctp-crust) 0%,
            #0c1929 25%,
            #0f2744 50%,
            #0c1929 75%,
            var(--ctp-crust) 100%
          )`,
        }}
      />

      {/* Gradient orbs using Catppuccin accent colors */}
      <div
        className="absolute -top-32 left-1/4 h-[600px] w-[600px] rounded-full blur-[150px]"
        style={{ background: `color-mix(in srgb, var(--ctp-blue) 25%, transparent)` }}
      />
      <div
        className="absolute right-1/4 -bottom-32 h-[500px] w-[500px] rounded-full blur-[130px]"
        style={{ background: `color-mix(in srgb, var(--ctp-teal) 20%, transparent)` }}
      />
      <div
        className="absolute top-1/3 right-1/3 h-[350px] w-[350px] rounded-full blur-[100px]"
        style={{ background: `color-mix(in srgb, var(--ctp-sapphire) 15%, transparent)` }}
      />

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24 lg:px-8 lg:py-28">
        {/* Centered Header */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Premium Badge */}
          <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-[var(--ctp-yellow)]/30 bg-[var(--ctp-yellow)]/10 px-5 py-2.5 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-[var(--ctp-yellow)]" />
            <span className="text-sm font-semibold text-[var(--ctp-yellow)]">
              70% Provision für Sie
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl leading-[1.08] font-extrabold tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
            {t("headline")}
          </h2>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl sm:leading-relaxed">
            {t("subheadline")}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-3 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10"
            >
              {/* Gradient accent line at top */}
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${feature.gradient}`}
              />

              {/* Icon */}
              <div
                className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.bgGradient} ${feature.iconColor} ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110`}
              >
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="mx-auto mt-16 flex max-w-xl flex-col items-center gap-6 text-center">
          {/* CTA Button */}
          <Link
            href="/become-seller"
            className="group inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-[var(--ctp-blue)]/25 hover:shadow-xl"
            style={{
              background: `linear-gradient(135deg, var(--ctp-blue) 0%, var(--ctp-sapphire) 100%)`,
            }}
          >
            <span>{t("ctaButton")}</span>
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          {/* Free Note */}
          <p className="flex items-center gap-2 text-sm text-white/50">
            <CheckCircle2 className="h-4 w-4 text-[var(--ctp-green)]" />
            {t("freeNote")}
          </p>
        </div>
      </div>
    </section>
  );
}

export default SellerHeroSection;
