"use client";

import { useTranslations } from "next-intl";
import { Clock, Shield, Users } from "lucide-react";
import { FeatureGrid, type FeatureCard } from "@/components/ui/FeatureGrid";

export function ValueProposition() {
  const t = useTranslations("homePage.valueProposition");

  const valueProps: FeatureCard[] = [
    {
      key: "timeSaving",
      icon: <Clock className="h-7 w-7" aria-hidden="true" />,
      iconBgClass: "bg-primary-light",
      iconColorClass: "text-primary",
      title: t("timeSaving.title"),
      description: t("timeSaving.description"),
    },
    {
      key: "quality",
      icon: <Shield className="h-7 w-7" aria-hidden="true" />,
      iconBgClass: "bg-success-light",
      iconColorClass: "text-success",
      title: t("quality.title"),
      description: t("quality.description"),
    },
    {
      key: "community",
      icon: <Users className="h-7 w-7" aria-hidden="true" />,
      iconBgClass: "bg-accent-light",
      iconColorClass: "text-accent",
      title: t("community.title"),
      description: t("community.description"),
    },
  ];

  return (
    <FeatureGrid
      bgClass="bg-surface"
      title={t("title")}
      description={t("description")}
      cards={valueProps}
      variant="spacious"
    />
  );
}
