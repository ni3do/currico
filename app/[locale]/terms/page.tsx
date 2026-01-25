"use client";

import { useTranslations } from "next-intl";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";

export default function TermsPage() {
  const t = useTranslations("termsPage");
  const tSellerTerms = useTranslations("sellerTerms");

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-border bg-bg-secondary border-b">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="text-text-primary text-3xl font-bold tracking-tight sm:text-4xl">
              {t("title")}
            </h1>
            <p className="text-text-muted mt-4">{t("lastUpdated")}</p>
          </div>
        </section>

        {/* General Terms Section */}
        <section className="py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg text-text-secondary max-w-none">
              {/* Introduction */}
              <h2 className="text-text-primary text-xl font-semibold">
                {t("general.introduction.title")}
              </h2>
              <p>{t("general.introduction.content")}</p>

              {/* Account Terms */}
              <h2 className="text-text-primary mt-8 text-xl font-semibold">
                {t("general.account.title")}
              </h2>
              <p>{t("general.account.content")}</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>{t("general.account.items.accurate")}</li>
                <li>{t("general.account.items.secure")}</li>
                <li>{t("general.account.items.age")}</li>
                <li>{t("general.account.items.oneAccount")}</li>
              </ul>

              {/* Acceptable Use */}
              <h2 className="text-text-primary mt-8 text-xl font-semibold">
                {t("general.acceptableUse.title")}
              </h2>
              <p>{t("general.acceptableUse.content")}</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>{t("general.acceptableUse.items.lawful")}</li>
                <li>{t("general.acceptableUse.items.noAbuse")}</li>
                <li>{t("general.acceptableUse.items.noScraping")}</li>
                <li>{t("general.acceptableUse.items.respectOthers")}</li>
              </ul>

              {/* Intellectual Property */}
              <h2 className="text-text-primary mt-8 text-xl font-semibold">
                {t("general.intellectualProperty.title")}
              </h2>
              <p>{t("general.intellectualProperty.content")}</p>

              {/* Purchases and Downloads */}
              <h2 className="text-text-primary mt-8 text-xl font-semibold">
                {t("general.purchases.title")}
              </h2>
              <p>{t("general.purchases.content")}</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>{t("general.purchases.items.personal")}</li>
                <li>{t("general.purchases.items.noRedistribution")}</li>
                <li>{t("general.purchases.items.refunds")}</li>
              </ul>

              {/* Limitation of Liability */}
              <h2 className="text-text-primary mt-8 text-xl font-semibold">
                {t("general.liability.title")}
              </h2>
              <p>{t("general.liability.content")}</p>

              {/* Governing Law */}
              <h2 className="text-text-primary mt-8 text-xl font-semibold">
                {t("general.governingLaw.title")}
              </h2>
              <p>{t("general.governingLaw.content")}</p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <hr className="border-border" />
        </div>

        {/* Seller Terms Section */}
        <section className="py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-text-primary text-2xl font-bold">{tSellerTerms("pageTitle")}</h2>
              <p className="text-text-muted mt-2">{tSellerTerms("pageSubtitle")}</p>
            </div>

            <div className="prose prose-lg text-text-secondary max-w-none">
              {/* Overview */}
              <h3 className="text-text-primary text-lg font-semibold">
                {tSellerTerms("sections.overview.title")}
              </h3>
              <p>{tSellerTerms("sections.overview.content")}</p>

              {/* Platform Fee */}
              <h3 className="text-text-primary mt-6 text-lg font-semibold">
                {tSellerTerms("sections.platformFee.title")}
              </h3>
              <p>{tSellerTerms("sections.platformFee.content")}</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>{tSellerTerms("sections.platformFee.breakdown.seller")}</li>
                <li>{tSellerTerms("sections.platformFee.breakdown.platform")}</li>
                <li className="italic">{tSellerTerms("sections.platformFee.breakdown.example")}</li>
              </ul>
              <p className="text-sm">{tSellerTerms("sections.platformFee.note")}</p>

              {/* Payouts */}
              <h3 className="text-text-primary mt-6 text-lg font-semibold">
                {tSellerTerms("sections.payouts.title")}
              </h3>
              <p>{tSellerTerms("sections.payouts.content")}</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>{tSellerTerms("sections.payouts.details.schedule")}</li>
                <li>{tSellerTerms("sections.payouts.details.minimum")}</li>
                <li>{tSellerTerms("sections.payouts.details.currency")}</li>
                <li>{tSellerTerms("sections.payouts.details.account")}</li>
              </ul>

              {/* Content Policies */}
              <h3 className="text-text-primary mt-6 text-lg font-semibold">
                {tSellerTerms("sections.contentPolicies.title")}
              </h3>
              <p>{tSellerTerms("sections.contentPolicies.content")}</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>{tSellerTerms("sections.contentPolicies.requirements.original")}</li>
                <li>{tSellerTerms("sections.contentPolicies.requirements.appropriate")}</li>
                <li>{tSellerTerms("sections.contentPolicies.requirements.accurate")}</li>
                <li>{tSellerTerms("sections.contentPolicies.requirements.quality")}</li>
                <li>{tSellerTerms("sections.contentPolicies.requirements.lp21")}</li>
              </ul>

              {/* Prohibited Content */}
              <h3 className="text-text-primary mt-6 text-lg font-semibold">
                {tSellerTerms("sections.prohibited.title")}
              </h3>
              <p>{tSellerTerms("sections.prohibited.content")}</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>{tSellerTerms("sections.prohibited.items.copyright")}</li>
                <li>{tSellerTerms("sections.prohibited.items.inappropriate")}</li>
                <li>{tSellerTerms("sections.prohibited.items.misleading")}</li>
                <li>{tSellerTerms("sections.prohibited.items.plagiarized")}</li>
                <li>{tSellerTerms("sections.prohibited.items.malicious")}</li>
                <li>{tSellerTerms("sections.prohibited.items.personal")}</li>
              </ul>

              {/* Seller Responsibilities */}
              <h3 className="text-text-primary mt-6 text-lg font-semibold">
                {tSellerTerms("sections.responsibilities.title")}
              </h3>
              <p>{tSellerTerms("sections.responsibilities.content")}</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>{tSellerTerms("sections.responsibilities.items.accuracy")}</li>
                <li>{tSellerTerms("sections.responsibilities.items.support")}</li>
                <li>{tSellerTerms("sections.responsibilities.items.updates")}</li>
                <li>{tSellerTerms("sections.responsibilities.items.taxes")}</li>
                <li>{tSellerTerms("sections.responsibilities.items.compliance")}</li>
              </ul>

              {/* Account Termination */}
              <h3 className="text-text-primary mt-6 text-lg font-semibold">
                {tSellerTerms("sections.termination.title")}
              </h3>
              <p>{tSellerTerms("sections.termination.content")}</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>{tSellerTerms("sections.termination.rights.remove")}</li>
                <li>{tSellerTerms("sections.termination.rights.suspend")}</li>
                <li>{tSellerTerms("sections.termination.rights.withhold")}</li>
              </ul>

              {/* Changes to Terms */}
              <h3 className="text-text-primary mt-6 text-lg font-semibold">
                {tSellerTerms("sections.changes.title")}
              </h3>
              <p>{tSellerTerms("sections.changes.content")}</p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-bg-secondary py-12">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-text-primary text-xl font-semibold">{t("contact.title")}</h2>
            <p className="text-text-muted mt-2">{t("contact.content")}</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
