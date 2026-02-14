"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { BadgeCheck, ShoppingCart, Star, FileText, Calendar, Upload } from "lucide-react";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { VERIFIED_SELLER_CRITERIA } from "@/lib/utils/verified-seller";

const criteriaIcons = [ShoppingCart, Star, FileText, Calendar];

export default function VerifiedSellerPage() {
  const t = useTranslations("verifiedSeller");
  const tCommon = useTranslations("common");

  const criteriaKeys = ["minSales", "minRating", "minResources", "accountAge"] as const;

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
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h2 className="text-text mb-2 text-xl font-semibold">{t("page.whatTitle")}</h2>
          <p className="text-text-muted mb-4 text-sm">{t("page.whatDescription")}</p>
        </motion.section>

        {/* The 4 Criteria */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <h2 className="text-text mb-2 text-xl font-semibold">{t("page.criteriaTitle")}</h2>
          <p className="text-text-muted mb-6 text-sm">{t("page.criteriaDescription")}</p>

          <div className="space-y-3">
            {criteriaKeys.map((key, index) => {
              const Icon = criteriaIcons[index];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.08 }}
                  className="card flex items-start gap-4 p-5"
                >
                  <div className="bg-success/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl">
                    <Icon className="text-success h-6 w-6" />
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
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* How it works */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-10"
        >
          <h2 className="text-text mb-2 text-xl font-semibold">{t("page.howTitle")}</h2>
          <div className="card p-6">
            <div className="space-y-4 text-sm">
              <p className="text-text-muted">{t("page.howAutomatic")}</p>
              <p className="text-text-muted">{t("page.howRevocation")}</p>
              <p className="text-text-muted">{t("page.howManual")}</p>
            </div>
          </div>
        </motion.section>

        {/* Benefits */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-10"
        >
          <h2 className="text-text mb-2 text-xl font-semibold">{t("page.benefitsTitle")}</h2>
          <div className="card p-6">
            <ul className="text-text-muted space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <BadgeCheck className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                {t("page.benefits.badge")}
              </li>
              <li className="flex items-start gap-2">
                <BadgeCheck className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                {t("page.benefits.trust")}
              </li>
              <li className="flex items-start gap-2">
                <BadgeCheck className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                {t("page.benefits.visibility")}
              </li>
            </ul>
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
            href="/hochladen"
            className="bg-primary text-text-on-accent hover:bg-primary-hover inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-colors"
          >
            <Upload className="h-4 w-4" />
            {t("page.cta")}
          </Link>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
