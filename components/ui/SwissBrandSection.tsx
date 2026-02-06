"use client";

import { useTranslations } from "next-intl";
import { Star, Award, Server, Lock } from "lucide-react";
import { FadeIn, StaggerChildren, StaggerItem, motion } from "@/components/ui/animations";

interface BrandCard {
  key: string;
  icon: React.ReactNode;
  iconBgClass: string;
  iconColorClass: string;
}

const brandCards: BrandCard[] = [
  {
    key: "swissMade",
    icon: <Award className="h-6 w-6" />,
    iconBgClass: "bg-primary-light",
    iconColorClass: "text-primary",
  },
  {
    key: "swissHosted",
    icon: <Server className="h-6 w-6" />,
    iconBgClass: "bg-success-light",
    iconColorClass: "text-success",
  },
  {
    key: "dataProtection",
    icon: <Lock className="h-6 w-6" />,
    iconBgClass: "bg-primary-light",
    iconColorClass: "text-primary",
  },
];

export function SwissBrandSection() {
  const t = useTranslations("homePage.swissBrand");

  return (
    <section className="bg-bg py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up" className="mb-10 text-center">
          <div className="bg-primary mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2">
            <Star className="h-5 w-5 text-white" />
            <span className="font-semibold text-white">{t("badge")}</span>
          </div>
          <h2 className="text-text mb-2 text-2xl font-semibold sm:text-3xl">{t("title")}</h2>
          <p className="text-text-muted mx-auto max-w-2xl text-lg">{t("description")}</p>
        </FadeIn>

        <StaggerChildren
          staggerDelay={0.15}
          className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3 sm:gap-8"
        >
          {brandCards.map((card) => (
            <StaggerItem key={card.key}>
              <motion.div
                className="card p-6 text-center"
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${card.iconBgClass}`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className={card.iconColorClass}>{card.icon}</span>
                </motion.div>
                <h3 className="text-text font-bold">{t(`${card.key}.title`)}</h3>
                <p className="text-text-muted mt-2 text-sm">{t(`${card.key}.description`)}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
