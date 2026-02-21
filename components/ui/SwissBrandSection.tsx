"use client";

import { useTranslations } from "next-intl";
import { Star, Award, Server, Lock, Headphones } from "lucide-react";
import { FeatureGrid, type FeatureCard } from "@/components/ui/FeatureGrid";

export function SwissBrandSection() {
  const t = useTranslations("homePage.swissBrand");

  const brandCards: FeatureCard[] = [
    {
      key: "swissMade",
      icon: <Award className="h-6 w-6" aria-hidden="true" />,
      iconBgClass: "bg-primary-light",
      iconColorClass: "text-primary",
      title: t("swissMade.title"),
      description: t("swissMade.description"),
    },
    {
      key: "swissHosted",
      icon: <Server className="h-6 w-6" aria-hidden="true" />,
      iconBgClass: "bg-success-light",
      iconColorClass: "text-success",
      title: t("swissHosted.title"),
      description: t("swissHosted.description"),
    },
    {
      key: "dataProtection",
      icon: <Lock className="h-6 w-6" aria-hidden="true" />,
      iconBgClass: "bg-primary-light",
      iconColorClass: "text-primary",
      title: t("dataProtection.title"),
      description: t("dataProtection.description"),
      href: "/datenschutz",
    },
    {
      key: "localSupport",
      icon: <Headphones className="h-6 w-6" aria-hidden="true" />,
      iconBgClass: "bg-accent-light",
      iconColorClass: "text-accent",
      title: t("localSupport.title"),
      description: t("localSupport.description"),
    },
  ];

  return (
    <FeatureGrid
      bgClass="bg-bg"
      badge={
        <div className="bg-primary mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2">
          <Star className="text-text-on-accent h-5 w-5" aria-hidden="true" />
          <span className="text-text-on-accent font-semibold">{t("badge")}</span>
        </div>
      }
      title={t("title")}
      description={t("description")}
      cards={brandCards}
      variant="compact"
    />
  );
}
