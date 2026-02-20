"use client";

import { useTranslations } from "next-intl";
import { BookOpen, Users, Download } from "lucide-react";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/ui/animations";

export interface PlatformStats {
  materialCount: number;
  sellerCount: number;
  downloadCount: number;
}

function formatSwissNumber(n: number): string {
  // Swiss number formatting uses apostrophe as thousands separator
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u2019");
}

const MIN_MATERIALS_THRESHOLD = 10;

export function PlatformStatsBar({ materialCount, sellerCount, downloadCount }: PlatformStats) {
  const t = useTranslations("homePage.platformStats");

  // Hide stats section until we have enough content to look credible
  if (materialCount < MIN_MATERIALS_THRESHOLD) return null;

  const stats = [
    { key: "materials", icon: BookOpen, value: materialCount, label: t("materials") },
    { key: "sellers", icon: Users, value: sellerCount, label: t("sellers") },
    { key: "downloads", icon: Download, value: downloadCount, label: t("downloads") },
  ];

  return (
    <section className="bg-bg py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <StaggerChildren
            staggerDelay={0.1}
            className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16"
          >
            {stats.map((stat) => (
              <StaggerItem key={stat.key}>
                <div className="flex items-center gap-3">
                  <stat.icon className="text-primary h-6 w-6" aria-hidden="true" />
                  <div>
                    <p className="text-text text-xl font-bold">{formatSwissNumber(stat.value)}</p>
                    <p className="text-text-muted text-sm">{stat.label}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </FadeIn>
      </div>
    </section>
  );
}
