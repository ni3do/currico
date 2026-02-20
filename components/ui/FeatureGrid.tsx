"use client";

import { Link } from "@/i18n/navigation";
import { FadeIn, StaggerChildren, StaggerItem, motion } from "@/components/ui/animations";

export interface FeatureCard {
  key: string;
  icon: React.ReactNode;
  iconBgClass: string;
  iconColorClass: string;
  title: string;
  description: string;
  href?: string;
}

interface FeatureGridProps {
  bgClass?: string;
  badge?: React.ReactNode;
  title: string;
  description: string;
  cards: FeatureCard[];
  variant?: "compact" | "spacious";
}

export function FeatureGrid({
  bgClass = "bg-bg",
  badge,
  title,
  description,
  cards,
  variant = "compact",
}: FeatureGridProps) {
  const isSpacious = variant === "spacious";

  return (
    <section className={`${bgClass} py-20`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up" className={isSpacious ? "mb-12 text-center" : "mb-10 text-center"}>
          {badge}
          <h2 className="text-text mb-2 text-2xl font-semibold sm:text-3xl">{title}</h2>
          <p className="text-text-muted mx-auto max-w-2xl text-lg">{description}</p>
        </FadeIn>

        <StaggerChildren
          staggerDelay={0.15}
          className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3 sm:gap-8"
        >
          {cards.map((card) => {
            const inner = (
              <motion.div
                className={`card text-center ${isSpacious ? "p-8" : "p-6"}`}
                whileHover={{
                  y: -4,
                  scale: 1.02,
                  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                }}
              >
                <motion.div
                  className={`mx-auto flex items-center justify-center ${card.iconBgClass} ${
                    isSpacious ? "mb-5 h-16 w-16 rounded-2xl" : "mb-4 h-12 w-12 rounded-full"
                  }`}
                  whileHover={{
                    scale: 1.1,
                    rotate: 5,
                    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
                  }}
                >
                  <span className={card.iconColorClass}>{card.icon}</span>
                </motion.div>
                <h3 className={`text-text font-bold ${isSpacious ? "text-lg" : ""}`}>
                  {card.title}
                </h3>
                <p
                  className={`text-text-muted ${isSpacious ? "mt-3 leading-relaxed" : "mt-2 text-sm"}`}
                >
                  {card.description}
                </p>
              </motion.div>
            );
            return (
              <StaggerItem key={card.key}>
                {card.href ? (
                  <Link href={card.href} className="block">
                    {inner}
                  </Link>
                ) : (
                  inner
                )}
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      </div>
    </section>
  );
}
