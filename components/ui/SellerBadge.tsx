"use client";

import { useTranslations } from "next-intl";
import { getCurrentLevel } from "@/lib/utils/seller-levels";

interface SellerBadgeProps {
  points: number;
  /** "compact" for cards/sidebar, "full" for profile display */
  variant?: "compact" | "full";
  className?: string;
}

export function SellerBadge({ points, variant = "compact", className = "" }: SellerBadgeProps) {
  const t = useTranslations("rewards");
  const level = getCurrentLevel(points);
  const Icon = level.icon;

  const levelName = t(`levels.${level.name}` as never);

  if (variant === "compact") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${level.badgeBg} ${level.textClass} ${className}`}
        title={levelName}
      >
        <Icon className="h-3 w-3" />
        {levelName}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${level.bgClass}`}>
        <Icon className={`h-4 w-4 ${level.textClass}`} />
      </div>
      <div>
        <div className={`text-sm font-semibold ${level.textClass}`}>{levelName}</div>
        <div className="text-text-muted text-xs">{t("pointsLabel", { points })}</div>
      </div>
    </div>
  );
}
