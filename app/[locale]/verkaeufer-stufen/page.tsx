"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FadeIn, StaggerChildren, StaggerItem, motion } from "@/components/ui/animations";
import {
  Upload,
  Download,
  Star,
  Lightbulb,
  ArrowRight,
  Sparkles,
  BookOpen,
  Search,
  CalendarPlus,
  TrendingUp,
  BadgeCheck,
  Lock,
  CheckCircle2,
  LogIn,
  AlertTriangle,
} from "lucide-react";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  SELLER_LEVELS,
  POINTS_PER_UPLOAD,
  POINTS_PER_DOWNLOAD_BASE,
  POINTS_PER_DOWNLOAD_GOOD,
  POINTS_PER_DOWNLOAD_GREAT,
  POINTS_PER_REVIEW,
  VERIFIED_SELLER_BONUS,
} from "@/lib/utils/seller-levels";
import { useSellerProgress } from "@/lib/hooks/useSellerProgress";

const TIP_CONFIG: Record<string, typeof Sparkles> = {
  quality: Sparkles,
  variety: BookOpen,
  keywords: Search,
  regular: CalendarPlus,
};

export default function SellerLevelsPage() {
  const t = useTranslations("rewards");
  const tCommon = useTranslations("common");
  const { isLoggedIn, isSeller, data: sellerData, loading } = useSellerProgress();

  const exampleUploads = 8;
  const exampleDownloads = 20;
  const exampleReviews = 5;
  const exampleTotal =
    exampleUploads * POINTS_PER_UPLOAD +
    exampleDownloads * POINTS_PER_DOWNLOAD_BASE +
    exampleReviews * POINTS_PER_REVIEW;

  // Determine current level index for personalization
  const currentLevelIndex = sellerData?.level ?? -1;

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <Breadcrumb items={[{ label: t("page.heroTitle") }]} />
          <h1 className="text-text text-2xl font-bold sm:text-3xl">{t("page.heroTitle")}</h1>
          <p className="text-text-muted mt-1">{t("page.heroDescription")}</p>
        </div>

        {/* Personalized Progress Summary */}
        {!loading && isLoggedIn && isSeller && sellerData && (
          <FadeIn className="mb-10">
            <div className="border-border bg-surface overflow-hidden rounded-2xl border">
              <div
                className={`${SELLER_LEVELS[sellerData.level]?.bgClass ?? "bg-surface"} px-6 py-5`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const CurrentIcon =
                        SELLER_LEVELS[sellerData.level]?.icon ?? SELLER_LEVELS[0].icon;
                      const levelDef = SELLER_LEVELS[sellerData.level] ?? SELLER_LEVELS[0];
                      return (
                        <>
                          <div
                            className={`flex h-14 w-14 items-center justify-center rounded-xl ${levelDef.badgeBg}`}
                          >
                            <CurrentIcon
                              aria-hidden="true"
                              className={`h-7 w-7 ${levelDef.textClass}`}
                            />
                          </div>
                          <div>
                            <p className="text-text-muted text-xs font-medium tracking-wider uppercase">
                              {t("page.yourLevel")}
                            </p>
                            <h2 className={`text-xl font-bold ${levelDef.textClass}`}>
                              {t(`levels.${levelDef.name}` as never)}
                            </h2>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-2xl font-bold ${SELLER_LEVELS[sellerData.level]?.textClass ?? "text-text"}`}
                    >
                      {sellerData.points}
                    </p>
                    <p className="text-text-muted text-xs">{t("pointsUnit")}</p>
                  </div>
                </div>
              </div>
              <div className="border-border grid grid-cols-3 border-t">
                <div className="border-border flex items-center justify-center gap-2 border-r px-4 py-3">
                  <Upload aria-hidden="true" className="text-primary h-4 w-4" />
                  <span className="text-text text-sm font-semibold">{sellerData.uploads}</span>
                  <span className="text-text-muted text-xs">{t("uploads")}</span>
                </div>
                <div className="border-border flex items-center justify-center gap-2 border-r px-4 py-3">
                  <Download aria-hidden="true" className="text-accent h-4 w-4" />
                  <span className="text-text text-sm font-semibold">{sellerData.downloads}</span>
                  <span className="text-text-muted text-xs">{t("downloads")}</span>
                </div>
                <div className="flex items-center justify-center gap-2 px-4 py-3">
                  <Star aria-hidden="true" className="text-warning h-4 w-4" />
                  <span className="text-text text-sm font-semibold">
                    {sellerData.avgRating !== null ? sellerData.avgRating.toFixed(1) : "—"}
                  </span>
                  <span className="text-text-muted text-xs">
                    {t("reviewsCount", { count: sellerData.reviews })}
                  </span>
                </div>
              </div>
              {sellerData.nextLevelName && (
                <div className="px-6 py-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-text-muted text-xs">{t("nextLevel")}</span>
                    <span className="text-text-muted text-xs">
                      {t("pointsToNext", { points: sellerData.pointsNeeded })}
                    </span>
                  </div>
                  <div className="bg-border h-2 overflow-hidden rounded-full">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: `var(--color-${SELLER_LEVELS[sellerData.level]?.color === "text-muted" ? "overlay" : (SELLER_LEVELS[sellerData.level]?.color ?? "primary")})`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${sellerData.progressPercent}%` }}
                      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </FadeIn>
        )}

        {/* Non-seller CTA */}
        {!loading && isLoggedIn && !isSeller && (
          <FadeIn className="mb-10">
            <div className="border-border bg-surface flex items-center justify-between rounded-2xl border px-6 py-4">
              <p className="text-text-muted text-sm">{t("page.becomeSeller")}</p>
              <Link
                href="/verkaeufer-werden"
                className="bg-primary text-text-on-accent hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
              >
                {t("page.becomeSellerCta")}
              </Link>
            </div>
          </FadeIn>
        )}

        {/* Logged-out CTA */}
        {!loading && !isLoggedIn && (
          <FadeIn className="mb-10">
            <div className="border-border bg-surface flex items-center justify-between rounded-2xl border px-6 py-4">
              <p className="text-text-muted text-sm">{t("page.loginToSeeProgress")}</p>
              <Link
                href="/anmelden"
                className="bg-primary text-text-on-accent hover:bg-primary-hover flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
              >
                <LogIn aria-hidden="true" className="h-4 w-4" />
                {t("page.loginCta")}
              </Link>
            </div>
          </FadeIn>
        )}

        {/* How Points Work */}
        <FadeIn delay={0.1} className="mb-10">
          <h2 className="text-text mb-2 text-xl font-semibold">{t("page.howTitle")}</h2>
          <p className="text-text-muted mb-6 text-sm">{t("page.howDescription")}</p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Upload points */}
            <div className="card flex flex-col p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Upload aria-hidden="true" className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-text text-lg font-semibold">
                    {t("page.uploadPoints", { points: POINTS_PER_UPLOAD })}
                  </h3>
                </div>
              </div>
              <p className="text-text-muted text-sm">
                {t("page.uploadPointsDescription", { points: POINTS_PER_UPLOAD })}
              </p>
              <div className="bg-primary/5 border-primary/20 mt-auto rounded-lg border p-3 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-text text-sm font-medium">
                    {t("page.materialsCount", { count: 1 })}
                  </span>
                  <span className="text-primary text-sm font-bold">
                    +{POINTS_PER_UPLOAD} {t("pointsUnit")}
                  </span>
                </div>
                <div className="border-border my-2 border-t" />
                <div className="flex items-center justify-between">
                  <span className="text-text text-sm font-medium">
                    {t("page.materialsCount", { count: 5 })}
                  </span>
                  <span className="text-primary text-sm font-bold">
                    +{POINTS_PER_UPLOAD * 5} {t("pointsUnit")}
                  </span>
                </div>
                <div className="border-border my-2 border-t" />
                <div className="flex items-center justify-between">
                  <span className="text-text text-sm font-medium">
                    {t("page.materialsCount", { count: 25 })}
                  </span>
                  <span className="text-primary text-sm font-bold">
                    +{POINTS_PER_UPLOAD * 25} {t("pointsUnit")}
                  </span>
                </div>
              </div>
            </div>

            {/* Download points */}
            <div className="card flex flex-col p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-accent/10 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Download aria-hidden="true" className="text-accent h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-text text-lg font-semibold">
                    {t("page.downloadPoints", {
                      points: POINTS_PER_DOWNLOAD_BASE,
                      pointsMax: POINTS_PER_DOWNLOAD_GREAT,
                    })}
                  </h3>
                </div>
              </div>
              <p className="text-text-muted text-sm">
                {t("page.downloadPointsDescription", { points: POINTS_PER_DOWNLOAD_BASE })}
              </p>
              <div className="bg-accent/5 border-accent/20 mt-auto rounded-lg border p-3 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-text text-sm font-medium">
                    {t("page.downloadsCount", { count: 1 })}
                  </span>
                  <span className="text-accent text-sm font-bold">
                    +{POINTS_PER_DOWNLOAD_BASE}–{POINTS_PER_DOWNLOAD_GREAT} {t("pointsUnit")}
                  </span>
                </div>
                <div className="border-border my-2 border-t" />
                <div className="flex items-center justify-between">
                  <span className="text-text text-sm font-medium">
                    {t("page.downloadsCount", { count: 25 })}
                  </span>
                  <span className="text-accent text-sm font-bold">
                    +{POINTS_PER_DOWNLOAD_BASE * 25}–{POINTS_PER_DOWNLOAD_GREAT * 25}{" "}
                    {t("pointsUnit")}
                  </span>
                </div>
                <div className="border-border my-2 border-t" />
                <div className="flex items-center justify-between">
                  <span className="text-text text-sm font-medium">
                    {t("page.downloadsCount", { count: 100 })}
                  </span>
                  <span className="text-accent text-sm font-bold">
                    +{POINTS_PER_DOWNLOAD_BASE * 100}–{POINTS_PER_DOWNLOAD_GREAT * 100}{" "}
                    {t("pointsUnit")}
                  </span>
                </div>
              </div>
            </div>

            {/* Review points */}
            <div className="card flex flex-col p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-warning/10 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Star aria-hidden="true" className="text-warning h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-text text-lg font-semibold">
                    {t("page.reviewPoints", { points: POINTS_PER_REVIEW })}
                  </h3>
                </div>
              </div>
              <p className="text-text-muted text-sm">
                {t("page.reviewPointsDescription", { points: POINTS_PER_REVIEW })}
              </p>
              <div className="bg-warning/5 border-warning/20 mt-auto rounded-lg border p-3 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-text text-sm font-medium">
                    {t("page.reviewsExampleCount", { count: 1 })}
                  </span>
                  <span className="text-warning text-sm font-bold">
                    +{POINTS_PER_REVIEW} {t("pointsUnit")}
                  </span>
                </div>
                <div className="border-border my-2 border-t" />
                <div className="flex items-center justify-between">
                  <span className="text-text text-sm font-medium">
                    {t("page.reviewsExampleCount", { count: 10 })}
                  </span>
                  <span className="text-warning text-sm font-bold">
                    +{POINTS_PER_REVIEW * 10} {t("pointsUnit")}
                  </span>
                </div>
                <div className="border-border my-2 border-t" />
                <div className="flex items-center justify-between">
                  <span className="text-text text-sm font-medium">
                    {t("page.reviewsExampleCount", { count: 50 })}
                  </span>
                  <span className="text-warning text-sm font-bold">
                    +{POINTS_PER_REVIEW * 50} {t("pointsUnit")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Rating Bonus */}
        <FadeIn delay={0.15} className="mb-10">
          <h2 className="text-text mb-2 text-xl font-semibold">
            <TrendingUp aria-hidden="true" className="text-success mr-2 inline-block h-5 w-5" />
            {t("page.ratingBonusTitle")}
          </h2>
          <p className="text-text-muted mb-4 text-sm">{t("page.ratingBonusDescription")}</p>

          <div className="border-border bg-surface overflow-hidden rounded-2xl border">
            <div className="divide-border grid grid-cols-3 divide-x">
              {/* Base */}
              <div className="p-5 text-center">
                <div className="bg-surface-hover mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full">
                  <Star aria-hidden="true" className="text-text-muted h-5 w-5" />
                </div>
                <p className="text-text-muted text-xs font-medium">{t("page.ratingBonusBase")}</p>
                <p className="text-text mt-1 text-2xl font-bold">{POINTS_PER_DOWNLOAD_BASE}</p>
                <p className="text-text-faint text-xs">
                  {t("page.ratingBonusPerDownload", { points: POINTS_PER_DOWNLOAD_BASE })}
                </p>
              </div>
              {/* Good */}
              <div className="bg-warning/5 p-5 text-center">
                <div className="bg-warning/15 mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full">
                  <Star aria-hidden="true" className="text-warning h-5 w-5" />
                </div>
                <p className="text-warning text-xs font-medium">{t("page.ratingBonusGood")}</p>
                <p className="text-warning mt-1 text-2xl font-bold">{POINTS_PER_DOWNLOAD_GOOD}</p>
                <p className="text-text-muted text-xs">
                  {t("page.ratingBonusPerDownload", { points: POINTS_PER_DOWNLOAD_GOOD })}
                </p>
              </div>
              {/* Great */}
              <div className="bg-success/5 p-5 text-center">
                <div className="bg-success/15 mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full">
                  <Star aria-hidden="true" className="text-success h-5 w-5" />
                </div>
                <p className="text-success text-xs font-medium">{t("page.ratingBonusGreat")}</p>
                <p className="text-success mt-1 text-2xl font-bold">{POINTS_PER_DOWNLOAD_GREAT}</p>
                <p className="text-text-muted text-xs">
                  {t("page.ratingBonusPerDownload", { points: POINTS_PER_DOWNLOAD_GREAT })}
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Verified Seller Bonus */}
        <FadeIn delay={0.18} className="mb-10">
          <h2 className="text-text mb-2 text-xl font-semibold">
            <BadgeCheck aria-hidden="true" className="text-success mr-2 inline-block h-5 w-5" />
            {t("page.verifiedBonusTitle")}
          </h2>
          <p className="text-text-muted mb-4 text-sm">{t("page.verifiedBonusDescription")}</p>

          <div className="border-border bg-surface overflow-hidden rounded-2xl border">
            <div className="flex items-center gap-4 p-6">
              <div className="bg-success/10 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl">
                <BadgeCheck aria-hidden="true" className="text-success h-7 w-7" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-text text-lg font-semibold">
                  +{VERIFIED_SELLER_BONUS} {t("pointsUnit")}
                </h3>
                <p className="text-text-muted text-sm">{t("page.verifiedBonusExplain")}</p>
              </div>
            </div>
            <div className="border-border border-t px-6 py-4">
              <Link
                href="/verifizierter-verkaeufer"
                className="text-success hover:text-success/80 flex items-center gap-1.5 text-sm font-medium transition-colors"
              >
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
                {t("page.verifiedBonusLink")}
              </Link>
            </div>
          </div>
        </FadeIn>

        {/* Example Calculation */}
        <FadeIn delay={0.2} className="mb-10">
          <h2 className="text-text mb-2 text-xl font-semibold">{t("page.exampleTitle")}</h2>
          <p className="text-text-muted mb-4 text-sm">
            {t("page.exampleDescription", {
              uploads: exampleUploads,
              downloads: exampleDownloads,
            })}
          </p>
          <div className="border-border bg-surface overflow-hidden rounded-2xl border">
            <div className="bg-surface-hover px-6 py-4">
              <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
                <span className="text-primary font-bold">{exampleUploads}</span>
                <span className="text-text-muted">×</span>
                <span className="text-text">{POINTS_PER_UPLOAD}</span>
                <span className="text-text-muted">+</span>
                <span className="text-accent font-bold">{exampleDownloads}</span>
                <span className="text-text-muted">×</span>
                <span className="text-text">{POINTS_PER_DOWNLOAD_BASE}</span>
                <span className="text-text-muted">+</span>
                <span className="text-warning font-bold">{exampleReviews}</span>
                <span className="text-text-muted">×</span>
                <span className="text-text">{POINTS_PER_REVIEW}</span>
                <span className="text-text-muted">=</span>
                <span className="text-text text-lg font-semibold">
                  {exampleTotal} {t("pointsUnit")}
                </span>
              </div>
            </div>
            <div className="px-6 py-3">
              <div className="flex items-center gap-2">
                <ArrowRight aria-hidden="true" className="text-text-muted h-4 w-4" />
                <span className="text-text-muted text-sm">
                  {t("page.exampleFormula", {
                    uploads: exampleUploads,
                    pointsPerUpload: POINTS_PER_UPLOAD,
                    downloads: exampleDownloads,
                    pointsPerDownload: POINTS_PER_DOWNLOAD_BASE,
                    total: exampleTotal,
                  })}
                </span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* The 5 Levels */}
        <FadeIn delay={0.3} className="mb-10">
          <h2 className="text-text mb-2 text-xl font-semibold">{t("page.levelsTitle")}</h2>
          <p className="text-text-muted mb-6 text-sm">{t("page.levelsDescription")}</p>

          <StaggerChildren className="space-y-3">
            {SELLER_LEVELS.map((level, index) => {
              const Icon = level.icon;
              const levelName = t(`levels.${level.name}` as never);
              const levelDesc = t(`descriptions.${level.name}` as never);
              const nextLevel = SELLER_LEVELS[index + 1];

              // Personalization states
              const hasSeller = isSeller && sellerData !== null;
              const isCurrent = hasSeller && level.level === currentLevelIndex;
              const isUnlocked = hasSeller && level.level < currentLevelIndex;
              const isNext = hasSeller && level.level === currentLevelIndex + 1;
              const isLocked = hasSeller && level.level > currentLevelIndex + 1;

              return (
                <StaggerItem
                  key={level.level}
                  variant="card"
                  className={`border-border bg-surface overflow-hidden rounded-2xl border ${
                    isCurrent
                      ? `ring-2 ring-offset-2 ring-offset-[var(--color-bg)]`
                      : isLocked
                        ? "opacity-60"
                        : ""
                  }`}
                  style={
                    isCurrent
                      ? {
                          ["--tw-ring-color" as string]: `var(--color-${level.color === "text-muted" ? "overlay" : level.color})`,
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-4 p-5">
                    {/* Level icon */}
                    <div
                      className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl ${
                        isLocked ? "bg-surface-hover" : level.badgeBg
                      }`}
                    >
                      {isLocked ? (
                        <Lock aria-hidden="true" className="text-text-faint h-7 w-7" />
                      ) : (
                        <Icon aria-hidden="true" className={`h-7 w-7 ${level.textClass}`} />
                      )}
                    </div>

                    {/* Level info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-lg font-semibold ${isLocked ? "text-text-faint" : level.textClass}`}
                        >
                          {levelName}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            isLocked
                              ? "bg-surface-hover text-text-faint"
                              : `${level.badgeBg} ${level.textClass}`
                          }`}
                        >
                          {t("page.levelBadge", { level: level.level })}
                        </span>
                        {isCurrent && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${level.badgeBg} ${level.textClass}`}
                          >
                            {t("page.currentLevel")}
                          </span>
                        )}
                        {isUnlocked && (
                          <span className="text-text-muted flex items-center gap-1 text-xs font-medium">
                            <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
                            {t("page.levelUnlocked")}
                          </span>
                        )}
                        {isLocked && (
                          <span className="text-text-faint flex items-center gap-1 text-xs font-medium">
                            <Lock aria-hidden="true" className="h-3 w-3" />
                            {t("page.levelLocked")}
                          </span>
                        )}
                      </div>
                      <p
                        className={`mt-0.5 text-sm ${isLocked ? "text-text-faint" : "text-text-muted"}`}
                      >
                        {levelDesc}
                      </p>
                    </div>

                    {/* Points range */}
                    <div className="hidden flex-shrink-0 text-right sm:block">
                      <p
                        className={`text-lg font-semibold ${isLocked ? "text-text-faint" : level.textClass}`}
                      >
                        {level.minPoints === 0 ? "0" : level.minPoints}+
                      </p>
                      <p className="text-text-muted text-xs">{t("pointsUnit")}</p>
                      {nextLevel && (
                        <p className="text-text-faint mt-0.5 text-xs">
                          → {nextLevel.minPoints} {t("pointsUnit")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress bar for next level */}
                  {isNext && sellerData && (
                    <div className="border-border border-t px-5 py-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-text-muted text-xs">{t("progress")}</span>
                        <span className="text-text-muted text-xs">
                          {sellerData.progressPercent}%
                        </span>
                      </div>
                      <div className="bg-border h-2 overflow-hidden rounded-full">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: `var(--color-${level.color === "text-muted" ? "overlay" : level.color})`,
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${sellerData.progressPercent}%` }}
                          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
                        />
                      </div>

                      {/* Per-requirement progress */}
                      {sellerData.requirements.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {sellerData.requirements.map((req) => {
                            const reqIcon =
                              req.type === "points"
                                ? TrendingUp
                                : req.type === "uploads"
                                  ? Upload
                                  : Download;
                            const ReqIcon = reqIcon;
                            const reqLabel =
                              req.type === "points"
                                ? t("page.requirementPoints")
                                : req.type === "uploads"
                                  ? t("page.requirementUploads")
                                  : t("page.requirementDownloads");
                            return (
                              <div key={req.type} className="flex items-center gap-2">
                                <ReqIcon
                                  aria-hidden="true"
                                  className="text-text-muted h-3.5 w-3.5 flex-shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="bg-border h-1.5 overflow-hidden rounded-full">
                                    <motion.div
                                      className="h-full rounded-full"
                                      style={{
                                        background: `var(--color-${level.color === "text-muted" ? "overlay" : level.color})`,
                                      }}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${req.percent}%` }}
                                      transition={{
                                        duration: 0.8,
                                        ease: [0.22, 1, 0.36, 1],
                                        delay: 0.7,
                                      }}
                                    />
                                  </div>
                                </div>
                                <span className="text-text-muted text-[11px] whitespace-nowrap">
                                  {t("page.requirementProgress", {
                                    current: req.current,
                                    required: req.required,
                                  })}{" "}
                                  {reqLabel}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Blocker messages */}
                      {sellerData.blockers.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {sellerData.blockers.map((blocker) => {
                            const msg =
                              blocker.key === "needMorePoints"
                                ? t("page.blockerNeedMorePoints", { count: blocker.count })
                                : blocker.key === "needMoreUploads"
                                  ? t("page.blockerNeedMoreUploads", { count: blocker.count })
                                  : t("page.blockerNeedMoreDownloads", { count: blocker.count });
                            return (
                              <div
                                key={blocker.key}
                                className="text-warning flex items-center gap-1.5 text-[11px]"
                              >
                                <AlertTriangle
                                  aria-hidden="true"
                                  className="h-3 w-3 flex-shrink-0"
                                />
                                <span>{msg}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Requirements row */}
                  {(level.minPoints > 0 || level.minUploads > 0 || level.minDownloads > 0) && (
                    <div className="border-border divide-border grid grid-cols-3 divide-x border-t">
                      <div className="flex items-center justify-center gap-1.5 px-3 py-2.5">
                        <TrendingUp aria-hidden="true" className="text-text-muted h-3.5 w-3.5" />
                        <span className="text-text-muted text-xs">
                          {t("page.reqPoints", { count: level.minPoints })}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 px-3 py-2.5">
                        <Upload aria-hidden="true" className="text-text-muted h-3.5 w-3.5" />
                        <span className="text-text-muted text-xs">
                          {t("page.reqUploads", { count: level.minUploads })}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 px-3 py-2.5">
                        <Download aria-hidden="true" className="text-text-muted h-3.5 w-3.5" />
                        <span className="text-text-muted text-xs">
                          {t("page.reqDownloads", { count: level.minDownloads })}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Mobile points display */}
                  <div className="border-border border-t px-5 py-2 sm:hidden">
                    <span
                      className={`text-sm font-semibold ${isLocked ? "text-text-faint" : level.textClass}`}
                    >
                      {t("page.levelMinPoints", { points: level.minPoints })}
                    </span>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        </FadeIn>

        {/* Tips */}
        <FadeIn delay={0.5} className="mb-10">
          <h2 className="text-text mb-2 text-xl font-semibold">
            <Lightbulb aria-hidden="true" className="text-warning mr-2 inline-block h-5 w-5" />
            {t("page.tipsTitle")}
          </h2>

          <StaggerChildren className="mt-4 grid gap-3 sm:grid-cols-2">
            {(["quality", "variety", "keywords", "regular"] as const).map((tip) => {
              const TipIcon = TIP_CONFIG[tip];
              return (
                <StaggerItem key={tip} className="border-border bg-surface rounded-xl border p-4">
                  <div className="flex gap-3">
                    <div className="bg-warning/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg">
                      <TipIcon aria-hidden="true" className="text-warning h-4 w-4" />
                    </div>
                    <p className="text-text-muted text-sm">{t(`page.tips.${tip}` as never)}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        </FadeIn>

        {/* CTA */}
        <FadeIn delay={0.6} className="mb-10 text-center">
          <Link
            href="/hochladen"
            className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-colors"
          >
            <Upload aria-hidden="true" className="h-4 w-4" />
            {t("keepGoing")}
          </Link>
        </FadeIn>
      </main>

      <Footer />
    </div>
  );
}
