"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
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
} from "@/lib/utils/seller-levels";

export default function SellerLevelsPage() {
  const t = useTranslations("rewards");
  const tCommon = useTranslations("common");

  const exampleUploads = 8;
  const exampleDownloads = 20;
  const exampleReviews = 5;
  const exampleTotal =
    exampleUploads * POINTS_PER_UPLOAD +
    exampleDownloads * POINTS_PER_DOWNLOAD_BASE +
    exampleReviews * POINTS_PER_REVIEW;

  const tipIcons = [Sparkles, BookOpen, Search, CalendarPlus];

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[{ label: tCommon("breadcrumb.home"), href: "/" }, { label: t("page.heroTitle") }]}
          className="mb-6"
        />

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="text-text text-3xl font-bold sm:text-4xl">{t("page.heroTitle")}</h1>
          <p className="text-text-muted mx-auto mt-3 max-w-2xl text-lg">
            {t("page.heroDescription")}
          </p>
        </motion.div>

        {/* How Points Work */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h2 className="text-text mb-2 text-xl font-bold">{t("page.howTitle")}</h2>
          <p className="text-text-muted mb-6 text-sm">{t("page.howDescription")}</p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Upload points */}
            <div className="border-border bg-surface rounded-2xl border p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Upload className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-text text-lg font-bold">
                    {t("page.uploadPoints", { points: POINTS_PER_UPLOAD })}
                  </h3>
                </div>
              </div>
              <p className="text-text-muted text-sm">
                {t("page.uploadPointsDescription", { points: POINTS_PER_UPLOAD })}
              </p>
              <div className="bg-primary/5 border-primary/20 mt-4 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-text text-sm font-medium">1 Material</span>
                  <span className="text-primary text-sm font-bold">
                    +{POINTS_PER_UPLOAD} {t("pointsUnit")}
                  </span>
                </div>
                <div className="border-border my-2 border-t" />
                <div className="flex items-center justify-between">
                  <span className="text-text text-sm font-medium">5 Materialien</span>
                  <span className="text-primary text-sm font-bold">
                    +{POINTS_PER_UPLOAD * 5} {t("pointsUnit")}
                  </span>
                </div>
                <div className="border-border my-2 border-t" />
                <div className="flex items-center justify-between">
                  <span className="text-text text-sm font-medium">25 Materialien</span>
                  <span className="text-primary text-sm font-bold">
                    +{POINTS_PER_UPLOAD * 25} {t("pointsUnit")}
                  </span>
                </div>
              </div>
            </div>

            {/* Download points */}
            <div className="border-border bg-surface rounded-2xl border p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-accent/10 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Download className="text-accent h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-text text-lg font-bold">
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
              <div className="bg-accent/5 border-accent/20 mt-4 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-text text-sm font-medium">1 Download</span>
                  <span className="text-accent text-sm font-bold">
                    +{POINTS_PER_DOWNLOAD_BASE}–{POINTS_PER_DOWNLOAD_GREAT} {t("pointsUnit")}
                  </span>
                </div>
                <div className="border-border my-2 border-t" />
                <div className="flex items-center justify-between">
                  <span className="text-text text-sm font-medium">25 Downloads</span>
                  <span className="text-accent text-sm font-bold">
                    +{POINTS_PER_DOWNLOAD_BASE * 25}–{POINTS_PER_DOWNLOAD_GREAT * 25}{" "}
                    {t("pointsUnit")}
                  </span>
                </div>
                <div className="border-border my-2 border-t" />
                <div className="flex items-center justify-between">
                  <span className="text-text text-sm font-medium">100 Downloads</span>
                  <span className="text-accent text-sm font-bold">
                    +{POINTS_PER_DOWNLOAD_BASE * 100}–{POINTS_PER_DOWNLOAD_GREAT * 100}{" "}
                    {t("pointsUnit")}
                  </span>
                </div>
              </div>
            </div>

            {/* Review points */}
            <div className="border-border bg-surface rounded-2xl border p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-warning/10 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Star className="text-warning h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-text text-lg font-bold">
                    {t("page.reviewPoints", { points: POINTS_PER_REVIEW })}
                  </h3>
                </div>
              </div>
              <p className="text-text-muted text-sm">
                {t("page.reviewPointsDescription", { points: POINTS_PER_REVIEW })}
              </p>
              <div className="bg-warning/5 border-warning/20 mt-4 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-text text-sm font-medium">1 Bewertung</span>
                  <span className="text-warning text-sm font-bold">
                    +{POINTS_PER_REVIEW} {t("pointsUnit")}
                  </span>
                </div>
                <div className="border-border my-2 border-t" />
                <div className="flex items-center justify-between">
                  <span className="text-text text-sm font-medium">10 Bewertungen</span>
                  <span className="text-warning text-sm font-bold">
                    +{POINTS_PER_REVIEW * 10} {t("pointsUnit")}
                  </span>
                </div>
                <div className="border-border my-2 border-t" />
                <div className="flex items-center justify-between">
                  <span className="text-text text-sm font-medium">50 Bewertungen</span>
                  <span className="text-warning text-sm font-bold">
                    +{POINTS_PER_REVIEW * 50} {t("pointsUnit")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Rating Bonus */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-10"
        >
          <h2 className="text-text mb-2 text-xl font-bold">
            <TrendingUp className="text-success mr-2 inline-block h-5 w-5" />
            {t("page.ratingBonusTitle")}
          </h2>
          <p className="text-text-muted mb-4 text-sm">{t("page.ratingBonusDescription")}</p>

          <div className="border-border bg-surface overflow-hidden rounded-2xl border">
            <div className="divide-border grid grid-cols-3 divide-x">
              {/* Base */}
              <div className="p-5 text-center">
                <div className="bg-surface-hover mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full">
                  <Star className="text-text-muted h-5 w-5" />
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
                  <Star className="text-warning h-5 w-5" />
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
                  <Star className="text-success h-5 w-5" />
                </div>
                <p className="text-success text-xs font-medium">{t("page.ratingBonusGreat")}</p>
                <p className="text-success mt-1 text-2xl font-bold">{POINTS_PER_DOWNLOAD_GREAT}</p>
                <p className="text-text-muted text-xs">
                  {t("page.ratingBonusPerDownload", { points: POINTS_PER_DOWNLOAD_GREAT })}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Example Calculation */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <h2 className="text-text mb-2 text-xl font-bold">{t("page.exampleTitle")}</h2>
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
                <span className="text-text text-lg font-bold">
                  {exampleTotal} {t("pointsUnit")}
                </span>
              </div>
            </div>
            <div className="px-6 py-3">
              <div className="flex items-center gap-2">
                <ArrowRight className="text-text-muted h-4 w-4" />
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
        </motion.section>

        {/* The 5 Levels */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          <h2 className="text-text mb-2 text-xl font-bold">{t("page.levelsTitle")}</h2>
          <p className="text-text-muted mb-6 text-sm">{t("page.levelsDescription")}</p>

          <div className="space-y-3">
            {SELLER_LEVELS.map((level, index) => {
              const Icon = level.icon;
              const levelName = t(`levels.${level.name}` as any);
              const levelDesc = t(`descriptions.${level.name}` as any);
              const nextLevel = SELLER_LEVELS[index + 1];

              return (
                <motion.div
                  key={level.level}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.08 }}
                  className="border-border bg-surface overflow-hidden rounded-2xl border"
                >
                  <div className="flex items-center gap-4 p-5">
                    {/* Level icon */}
                    <div
                      className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl ${level.badgeBg}`}
                    >
                      <Icon className={`h-7 w-7 ${level.textClass}`} />
                    </div>

                    {/* Level info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-lg font-bold ${level.textClass}`}>{levelName}</h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${level.badgeBg} ${level.textClass}`}
                        >
                          Level {level.level}
                        </span>
                      </div>
                      <p className="text-text-muted mt-0.5 text-sm">{levelDesc}</p>
                    </div>

                    {/* Points range */}
                    <div className="hidden flex-shrink-0 text-right sm:block">
                      <p className={`text-lg font-bold ${level.textClass}`}>
                        {level.minPoints === 0 ? "0" : level.minPoints}+
                      </p>
                      <p className="text-text-muted text-xs">{t("pointsUnit")}</p>
                      {nextLevel && (
                        <p className="text-text-faint mt-0.5 text-[10px]">
                          → {nextLevel.minPoints} {t("pointsUnit")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Mobile points display */}
                  <div className="border-border border-t px-5 py-2 sm:hidden">
                    <span className={`text-sm font-semibold ${level.textClass}`}>
                      {t("page.levelMinPoints", { points: level.minPoints })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Tips */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-10"
        >
          <h2 className="text-text mb-2 text-xl font-bold">
            <Lightbulb className="text-warning mr-2 inline-block h-5 w-5" />
            {t("page.tipsTitle")}
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(["quality", "variety", "keywords", "regular"] as const).map((tip, index) => {
              const TipIcon = tipIcons[index];
              return (
                <motion.div
                  key={tip}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.08 }}
                  className="border-border bg-surface rounded-xl border p-4"
                >
                  <div className="flex gap-3">
                    <div className="bg-warning/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg">
                      <TipIcon className="text-warning h-4 w-4" />
                    </div>
                    <p className="text-text-muted text-sm">{t(`page.tips.${tip}` as any)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-10 text-center"
        >
          <Link
            href="/upload"
            className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-colors"
          >
            <Upload className="h-4 w-4" />
            {t("keepGoing")}
          </Link>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
