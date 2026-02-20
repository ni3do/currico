"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  BadgeCheck,
  ShoppingCart,
  Star,
  FileText,
  Calendar,
  Upload,
  Zap,
  AlertTriangle,
  UserCog,
  Eye,
  Shield,
  Award,
  Check,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/ui/animations";

const CRITERIA_CONFIG: { key: string; icon: LucideIcon }[] = [
  { key: "minSales", icon: ShoppingCart },
  { key: "minRating", icon: Star },
  { key: "minResources", icon: FileText },
  { key: "accountAge", icon: Calendar },
];

const HOW_STEPS: { key: string; icon: LucideIcon }[] = [
  { key: "automatic", icon: Zap },
  { key: "revocation", icon: AlertTriangle },
  { key: "manual", icon: UserCog },
];

const BENEFITS: { key: string; icon: LucideIcon }[] = [
  { key: "badge", icon: BadgeCheck },
  { key: "trust", icon: Shield },
  { key: "visibility", icon: Eye },
  { key: "credibility", icon: Award },
  { key: "recognition", icon: Star },
];

const COMPARISON_ROWS = [
  { key: "uploadMaterials", regular: true, verified: true },
  { key: "sellMaterials", regular: true, verified: true },
  { key: "receiveReviews", regular: true, verified: true },
  { key: "profileBadge", regular: false, verified: true },
  { key: "materialBadge", regular: false, verified: true },
  { key: "searchBoost", regular: false, verified: true },
] as const;

export default function VerifiedSellerPage() {
  const t = useTranslations("verifiedSeller");

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <Breadcrumb items={[{ label: t("page.title") }]} />
          <h1 className="text-text text-2xl font-bold sm:text-3xl">{t("page.title")}</h1>
          <p className="text-text-muted mt-1">{t("page.description")}</p>
        </div>

        {/* What it means */}
        <FadeIn delay={0.1} className="mb-10">
          <h2 className="text-text mb-2 text-xl font-semibold">{t("page.whatTitle")}</h2>
          <p className="text-text-muted mb-4 text-sm">{t("page.whatDescription")}</p>
        </FadeIn>

        {/* The 4 Criteria */}
        <FadeIn delay={0.2} className="mb-10">
          <h2 className="text-text mb-2 text-xl font-semibold">{t("page.criteriaTitle")}</h2>
          <p className="text-text-muted mb-6 text-sm">{t("page.criteriaDescription")}</p>

          <StaggerChildren className="space-y-3">
            {CRITERIA_CONFIG.map(({ key, icon: Icon }) => (
              <StaggerItem key={key} variant="card" className="card flex items-start gap-4 p-5">
                <div className="bg-success/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl">
                  <Icon className="text-success h-6 w-6" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-text font-semibold">{t(`page.criteria.${key}.title`)}</h3>
                  <p className="text-text-muted mt-0.5 text-sm">
                    {t(`page.criteria.${key}.description`)}
                  </p>
                </div>
                <div className="text-success flex-shrink-0 text-sm font-bold">
                  {t(`page.criteria.${key}.value`)}
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </FadeIn>

        {/* How it works */}
        <FadeIn delay={0.4} className="mb-10">
          <h2 className="text-text mb-6 text-xl font-semibold">{t("page.howTitle")}</h2>
          <div className="space-y-3">
            {HOW_STEPS.map(({ key, icon: Icon }, index) => (
              <div key={key} className="card flex items-start gap-4 p-5">
                <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl">
                  <Icon className="text-primary h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted text-xs font-medium">{index + 1}.</span>
                    <h3 className="text-text text-sm font-semibold">
                      {t(`page.howSteps.${key}.title`)}
                    </h3>
                  </div>
                  <p className="text-text-muted mt-0.5 text-sm">
                    {t(`page.howSteps.${key}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Benefits */}
        <FadeIn delay={0.5} className="mb-10">
          <h2 className="text-text mb-6 text-xl font-semibold">{t("page.benefitsTitle")}</h2>
          <div className="card p-6">
            <ul className="text-text-muted space-y-3 text-sm">
              {BENEFITS.map(({ key, icon: Icon }) => (
                <li key={key} className="flex items-start gap-3">
                  <Icon className="text-success mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  {t(`page.benefits.${key}`)}
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>

        {/* Comparison */}
        <FadeIn delay={0.6} className="mb-10">
          <h2 className="text-text mb-6 text-xl font-semibold">{t("page.comparisonTitle")}</h2>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b">
                  <th className="text-text-muted px-5 py-3 text-left font-medium" />
                  <th className="text-text-muted px-4 py-3 text-center font-medium">
                    {t("page.comparison.regular")}
                  </th>
                  <th className="bg-success/5 text-success px-4 py-3 text-center font-semibold">
                    {t("page.comparison.verified")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map(({ key, regular, verified }) => (
                  <tr key={key} className="border-border border-b last:border-0">
                    <td className="text-text px-5 py-3">{t(`page.comparison.${key}`)}</td>
                    <td className="px-4 py-3 text-center">
                      {regular ? (
                        <Check className="text-success mx-auto h-4 w-4" aria-hidden="true" />
                      ) : (
                        <X className="text-text-muted mx-auto h-4 w-4" aria-hidden="true" />
                      )}
                    </td>
                    <td className="bg-success/5 px-4 py-3 text-center">
                      {verified ? (
                        <Check className="text-success mx-auto h-4 w-4" aria-hidden="true" />
                      ) : (
                        <X className="text-text-muted mx-auto h-4 w-4" aria-hidden="true" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>

        {/* CTA */}
        <FadeIn delay={0.7} className="mb-10 text-center">
          <Link
            href="/hochladen"
            className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-colors"
          >
            <Upload className="h-4 w-4" />
            {t("page.cta")}
          </Link>
        </FadeIn>
      </main>

      <Footer />
    </div>
  );
}
