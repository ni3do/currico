"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Coins, Upload, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { FadeIn, StaggerChildren, StaggerItem, motion } from "./animations";
import { MagneticButton } from "./MagneticButton";

interface SellerHeroSectionProps {
  className?: string;
}

export function SellerHeroSection({ className = "" }: SellerHeroSectionProps) {
  const t = useTranslations("sellerHero");

  const features = [
    {
      icon: <Coins className="h-5 w-5" aria-hidden="true" />,
      title: t("features.commission.title"),
      description: t("features.commission.description"),
      bgGradient: "from-warning/20 to-warning/10",
      iconColor: "text-warning",
    },
    {
      icon: <Upload className="h-5 w-5" aria-hidden="true" />,
      title: t("features.curriculum.title"),
      description: t("features.curriculum.description"),
      bgGradient: "from-accent/20 to-success/10",
      iconColor: "text-accent",
    },
  ];

  return (
    <section
      className={`seller-hero-premium bg-surface relative overflow-hidden rounded-2xl ${className}`}
    >
      {/* Subtle gradient accent */}
      <div className="from-primary/[0.08] to-accent/[0.05] absolute inset-0 bg-gradient-to-br opacity-50" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        {/* Centered Header */}
        <FadeIn direction="up" className="mx-auto max-w-2xl text-center">
          {/* Premium Badge */}
          <motion.div
            className="border-primary/30 bg-primary/10 mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
            whileHover={{ scale: 1.02, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
          >
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="text-primary h-3.5 w-3.5" aria-hidden="true" />
            </motion.span>
            <span className="text-primary text-xs font-semibold">{t("badge")}</span>
          </motion.div>

          {/* Headline */}
          <h2 className="text-text text-2xl leading-tight font-bold tracking-tight sm:text-3xl">
            {t("headline")}
          </h2>

          {/* Subheadline */}
          <p className="text-text-secondary mx-auto mt-3 max-w-xl text-sm leading-relaxed sm:text-base">
            {t("subheadline")}
          </p>
        </FadeIn>

        {/* Feature Cards Grid */}
        <StaggerChildren
          staggerDelay={0.1}
          className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2"
        >
          {features.map((feature, index) => (
            <StaggerItem key={index}>
              <motion.div
                className="group border-border bg-bg hover:border-border relative overflow-hidden rounded-xl border p-5 transition-shadow duration-200 hover:shadow-sm"
                whileHover={{
                  y: -4,
                  scale: 1.02,
                  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                }}
              >
                {/* Icon */}
                <motion.div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${feature.bgGradient} ${feature.iconColor}`}
                  whileHover={{
                    rotate: 10,
                    scale: 1.1,
                    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
                  }}
                >
                  {feature.icon}
                </motion.div>

                {/* Content */}
                <h3 className="text-text text-sm font-semibold">{feature.title}</h3>
                <p className="text-text-muted mt-1.5 text-xs leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerChildren>

        {/* Bottom CTA Section */}
        <FadeIn
          direction="up"
          delay={0.3}
          className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-3 text-center"
        >
          {/* CTA Button */}
          <MagneticButton>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/verkaeufer-werden"
                className="btn-primary group inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold"
              >
                <span>{t("ctaButton")}</span>
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </motion.div>
          </MagneticButton>

          {/* Free Note */}
          <p className="text-text-muted flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="text-success h-3.5 w-3.5" aria-hidden="true" />
            {t("freeNote")}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
