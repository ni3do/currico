"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { Upload, Download, ArrowRight, HelpCircle, Star, BadgeCheck, Circle } from "lucide-react";
import { calculatePoints, getProgressToNextLevel, SELLER_LEVELS } from "@/lib/utils/seller-levels";

interface SellerLevelCardProps {
  uploads: number;
  downloads: number;
  reviews: number;
  avgRating: number | null;
  downloadMultiplier: number;
  isVerifiedSeller?: boolean;
  verificationProgress?: {
    metCount: number;
    totalCriteria: number;
  };
  className?: string;
}

export function SellerLevelCard({
  uploads,
  downloads,
  reviews,
  avgRating,
  downloadMultiplier,
  isVerifiedSeller,
  verificationProgress,
  className = "",
}: SellerLevelCardProps) {
  const t = useTranslations("rewards");
  const points = calculatePoints({ uploads, downloads, reviews, avgRating, isVerifiedSeller });
  const { current, next, progressPercent, pointsNeeded } = getProgressToNextLevel(points);
  const CurrentIcon = current.icon;
  const NextIcon = next?.icon;

  const currentName = t(`levels.${current.name}` as any);
  const currentDesc = t(`descriptions.${current.name}` as any);
  const nextName = next ? t(`levels.${next.name}` as any) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-border bg-surface relative overflow-hidden rounded-2xl border ${className}`}
    >
      {/* Header */}
      <div className={`${current.bgClass} px-6 py-5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${current.badgeBg}`}
            >
              <CurrentIcon className={`h-6 w-6 ${current.textClass}`} />
            </div>
            <div>
              <p className="text-text-muted text-xs font-medium tracking-wider uppercase">
                {t("yourLevel")}
              </p>
              <h3 className={`text-lg font-bold ${current.textClass}`}>{currentName}</h3>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${current.textClass}`}>{points}</p>
            <p className="text-text-muted text-xs">{t("pointsUnit")}</p>
          </div>
        </div>
        <p className="text-text-muted mt-2 text-sm">{currentDesc}</p>
      </div>

      {/* Stats row */}
      <div className="border-border grid grid-cols-3 border-t">
        <div className="border-border flex items-center gap-2.5 border-r px-4 py-4">
          <div className="bg-primary/10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg">
            <Upload className="text-primary h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-text text-lg font-bold">{uploads}</p>
            <p className="text-text-muted text-xs">{t("uploads")}</p>
          </div>
        </div>
        <div className="border-border flex items-center gap-2.5 border-r px-4 py-4">
          <div className="bg-accent/10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg">
            <Download className="text-accent h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-text text-lg font-bold">{downloads}</p>
            <p className="text-text-muted text-xs">
              {t("downloads")}
              {downloadMultiplier > 2 && (
                <span className="text-success ml-1">×{downloadMultiplier}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-4">
          <div className="bg-warning/10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg">
            <Star className="text-warning h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-text text-lg font-bold">
              {avgRating !== null ? avgRating.toFixed(1) : "—"}
            </p>
            <p className="text-text-muted text-xs">{t("reviewsCount", { count: reviews })}</p>
          </div>
        </div>
      </div>

      {/* Rating bonus indicator */}
      {downloadMultiplier > 2 && (
        <div className="bg-success/5 border-border flex items-center gap-2 border-t px-6 py-2.5">
          <Star className="text-success h-3.5 w-3.5" />
          <span className="text-success text-xs font-medium">
            {t("ratingBonus", { multiplier: downloadMultiplier })}
          </span>
        </div>
      )}

      {/* Progress to next level */}
      {next ? (
        <div className="px-6 py-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-text-muted text-xs font-medium">{t("progress")}</span>
            <span className="text-text-muted text-xs">
              {t("pointsToNext", { points: pointsNeeded })}
            </span>
          </div>
          <div className="bg-border h-2.5 overflow-hidden rounded-full">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `var(--color-${current.color === "text-muted" ? "overlay" : current.color})`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className={`text-xs font-medium ${current.textClass}`}>{currentName}</span>
            <ArrowRight className="text-text-faint h-3 w-3" />
            {NextIcon && (
              <span className={`flex items-center gap-1 text-xs font-medium ${next.textClass}`}>
                <NextIcon className="h-3 w-3" />
                {nextName}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="px-6 py-5 text-center">
          <p className={`text-sm font-semibold ${current.textClass}`}>{t("maxLevel")}</p>
        </div>
      )}

      {/* Level roadmap */}
      <div className="border-border border-t px-6 py-4">
        <div className="flex items-center justify-between gap-1">
          {SELLER_LEVELS.map((level) => {
            const LvlIcon = level.icon;
            const isActive = level.level <= current.level;
            const isCurrent = level.level === current.level;
            return (
              <div key={level.level} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                    isCurrent
                      ? `${level.badgeBg} ring-offset-surface ring-2 ring-offset-1`
                      : isActive
                        ? level.bgClass
                        : "bg-surface-hover"
                  }`}
                  style={
                    isCurrent
                      ? {
                          ["--tw-ring-color" as string]: `var(--color-${level.color === "text-muted" ? "overlay" : level.color})`,
                        }
                      : undefined
                  }
                >
                  <LvlIcon
                    className={`h-4 w-4 ${isActive ? level.textClass : "text-text-faint"}`}
                  />
                </div>
                <span
                  className={`text-[9px] font-medium ${
                    isCurrent ? level.textClass : isActive ? "text-text-muted" : "text-text-faint"
                  }`}
                >
                  {t(`levels.${level.name}` as any)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verified seller status */}
      <div className="border-border border-t px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BadgeCheck
              className={`h-4 w-4 ${isVerifiedSeller ? "text-success" : "text-text-faint"}`}
            />
            <span
              className={`text-sm font-medium ${isVerifiedSeller ? "text-success" : "text-text-muted"}`}
            >
              {isVerifiedSeller
                ? t("verifiedBadge")
                : verificationProgress
                  ? t("verificationProgress", {
                      met: verificationProgress.metCount,
                      total: verificationProgress.totalCriteria,
                    })
                  : t("notVerified")}
            </span>
          </div>
          <Link
            href="/verifizierter-verkaeufer"
            className="text-text-muted hover:text-primary text-xs font-medium transition-colors"
          >
            {t("verifiedInfo")}
          </Link>
        </div>
        {!isVerifiedSeller && verificationProgress && (
          <div className="mt-2 flex gap-1">
            {Array.from({ length: verificationProgress.totalCriteria }).map((_, i) => (
              <Circle
                key={i}
                className={`h-2 w-2 ${
                  i < verificationProgress.metCount
                    ? "fill-success text-success"
                    : "text-text-faint"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Link to info page */}
      <div className="border-border border-t px-6 py-3">
        <Link
          href="/verkaeufer-stufen"
          className="text-text-muted hover:text-primary flex items-center justify-center gap-1.5 text-xs font-medium transition-colors"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          {t("howItWorks")}
        </Link>
      </div>
    </motion.div>
  );
}
