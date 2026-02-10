"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export default function TermsPage() {
  const t = useTranslations("termsPage");
  const tCommon = useTranslations("common");
  const tSellerTerms = useTranslations("sellerTerms");

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <Breadcrumb items={[{ label: tCommon("breadcrumb.terms") }]} />
          <h1 className="text-text text-2xl font-bold sm:text-3xl">{t("title")}</h1>
          <p className="text-text-muted mt-1">{t("lastUpdated")}</p>
        </div>

        {/* General Terms Section */}
        <div className="prose prose-lg text-text-secondary max-w-none">
          {/* Introduction */}
          <h2 className="text-text text-xl font-semibold">{t("general.introduction.title")}</h2>
          <p>{t("general.introduction.content")}</p>

          {/* Marketplace Model */}
          <h2 className="text-text mt-8 text-xl font-semibold">
            {t("general.marketplaceModel.title")}
          </h2>
          <p>{t("general.marketplaceModel.content")}</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>{t("general.marketplaceModel.items.intermediary")}</li>
            <li>{t("general.marketplaceModel.items.contract")}</li>
            <li>{t("general.marketplaceModel.items.noParty")}</li>
            <li>{t("general.marketplaceModel.items.sellerResponsibility")}</li>
            <li>{t("general.marketplaceModel.items.disputes")}</li>
            <li>{t("general.marketplaceModel.items.opinion")}</li>
          </ul>

          {/* Account Terms */}
          <h2 className="text-text mt-8 text-xl font-semibold">{t("general.account.title")}</h2>
          <p>{t("general.account.content")}</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>{t("general.account.items.accurate")}</li>
            <li>{t("general.account.items.secure")}</li>
            <li>{t("general.account.items.age")}</li>
            <li>{t("general.account.items.oneAccount")}</li>
          </ul>

          {/* Acceptable Use */}
          <h2 className="text-text mt-8 text-xl font-semibold">
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
          <h2 className="text-text mt-8 text-xl font-semibold">
            {t("general.intellectualProperty.title")}
          </h2>
          <p>{t("general.intellectualProperty.content")}</p>

          {/* Purchases and Downloads */}
          <h2 className="text-text mt-8 text-xl font-semibold">{t("general.purchases.title")}</h2>
          <p>{t("general.purchases.content")}</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>{t("general.purchases.items.personal")}</li>
            <li>{t("general.purchases.items.noRedistribution")}</li>
            <li>{t("general.purchases.items.refunds")}</li>
            <li>{t("general.purchases.items.pricing")}</li>
          </ul>

          {/* Digital Withdrawal Rights */}
          <h2 className="text-text mt-8 text-xl font-semibold">
            {t("general.digitalWithdrawal.title")}
          </h2>
          <p>{t("general.digitalWithdrawal.content")}</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>{t("general.digitalWithdrawal.items.noWithdrawal")}</li>
            <li>{t("general.digitalWithdrawal.items.waiver")}</li>
            <li>{t("general.digitalWithdrawal.items.consent")}</li>
            <li>{t("general.digitalWithdrawal.items.exception")}</li>
          </ul>

          {/* Limitation of Liability */}
          <h2 className="text-text mt-8 text-xl font-semibold">{t("general.liability.title")}</h2>
          <p>{t("general.liability.content")}</p>

          {/* Governing Law */}
          <h2 className="text-text mt-8 text-xl font-semibold">
            {t("general.governingLaw.title")}
          </h2>
          <p>{t("general.governingLaw.content")}</p>

          {/* Platform Availability */}
          <h2 className="text-text mt-8 text-xl font-semibold">
            {t("general.availability.title")}
          </h2>
          <p>{t("general.availability.content")}</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>{t("general.availability.items.noGuarantee")}</li>
            <li>{t("general.availability.items.maintenance")}</li>
            <li>{t("general.availability.items.noLiability")}</li>
          </ul>

          {/* Data Storage */}
          <h2 className="text-text mt-8 text-xl font-semibold">
            {t("general.dataLocation.title")}
          </h2>
          <p>{t("general.dataLocation.content")}</p>

          {/* Extended Liability Disclaimers */}
          <h2 className="text-text mt-8 text-xl font-semibold">
            {t("general.extendedLiability.title")}
          </h2>
          <p>{t("general.extendedLiability.content")}</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>{t("general.extendedLiability.items.dataLoss")}</li>
            <li>{t("general.extendedLiability.items.malware")}</li>
            <li>{t("general.extendedLiability.items.thirdPartyMisuse")}</li>
            <li>{t("general.extendedLiability.items.emailConfidentiality")}</li>
            <li>{t("general.extendedLiability.items.noGuarantees")}</li>
            <li>{t("general.extendedLiability.items.indirectDamages")}</li>
          </ul>

          {/* User Content Liability */}
          <h2 className="text-text mt-8 text-xl font-semibold">
            {t("general.userContentLiability.title")}
          </h2>
          <p>{t("general.userContentLiability.content")}</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>{t("general.userContentLiability.items.authorResponsibility")}</li>
            <li>{t("general.userContentLiability.items.ipStorage")}</li>
            <li>{t("general.userContentLiability.items.legalAction")}</li>
            <li>{t("general.userContentLiability.items.removal")}</li>
            <li>{t("general.userContentLiability.items.noNotice")}</li>
          </ul>

          {/* Prohibited Content */}
          <h2 className="text-text mt-8 text-xl font-semibold">
            {t("general.prohibitedContent.title")}
          </h2>
          <p>{t("general.prohibitedContent.content")}</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>{t("general.prohibitedContent.items.copyright")}</li>
            <li>{t("general.prohibitedContent.items.illegal")}</li>
            <li>{t("general.prohibitedContent.items.harmful")}</li>
            <li>{t("general.prohibitedContent.items.misleading")}</li>
            <li>{t("general.prohibitedContent.items.malicious")}</li>
            <li>{t("general.prohibitedContent.items.personal")}</li>
            <li>{t("general.prohibitedContent.items.spam")}</li>
            <li>{t("general.prohibitedContent.items.violent")}</li>
            <li>{t("general.prohibitedContent.items.political")}</li>
          </ul>

          {/* AI Prohibition */}
          <h2 className="text-text mt-8 text-xl font-semibold">
            {t("general.aiProhibition.title")}
          </h2>
          <p>{t("general.aiProhibition.content")}</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>{t("general.aiProhibition.items.training")}</li>
            <li>{t("general.aiProhibition.items.analysis")}</li>
            <li>{t("general.aiProhibition.items.reproduction")}</li>
          </ul>

          {/* External Links */}
          <h2 className="text-text mt-8 text-xl font-semibold">
            {t("general.externalLinks.title")}
          </h2>
          <p>{t("general.externalLinks.content")}</p>

          {/* Severability */}
          <h2 className="text-text mt-8 text-xl font-semibold">
            {t("general.severability.title")}
          </h2>
          <p>{t("general.severability.content")}</p>

          {/* Changes to Terms */}
          <h2 className="text-text mt-8 text-xl font-semibold">{t("general.changes.title")}</h2>
          <p>{t("general.changes.content")}</p>

          {/* Content Guidelines */}
          <h2 className="text-text mt-8 text-xl font-semibold">
            {t("general.contentGuidelines.title")}
          </h2>
          <p>{t("general.contentGuidelines.intro")}</p>
          <p className="mt-2">{t("general.contentGuidelines.minors")}</p>

          <h3 className="text-text mt-4 text-lg font-medium">
            {t("general.contentGuidelines.guarantees.title")}
          </h3>
          <p>{t("general.contentGuidelines.guarantees.content")}</p>

          <p className="mt-4">{t("general.contentGuidelines.responsibility")}</p>

          <h3 className="text-text mt-4 text-lg font-medium">
            {t("general.contentGuidelines.prohibited.title")}
          </h3>
          <ul className="ml-4 list-disc space-y-1">
            <li>{t("general.contentGuidelines.prohibited.items.illegal")}</li>
            <li>{t("general.contentGuidelines.prohibited.items.thirdPartyRights")}</li>
            <li>{t("general.contentGuidelines.prohibited.items.malware")}</li>
            <li>{t("general.contentGuidelines.prohibited.items.unauthorized")}</li>
          </ul>

          <h3 className="text-text mt-4 text-lg font-medium">
            {t("general.contentGuidelines.violations.title")}
          </h3>
          <p>{t("general.contentGuidelines.violations.content")}</p>

          {/* Version */}
          <p className="text-text-muted mt-8 text-sm">{t("general.version")}</p>
        </div>

        {/* Divider */}
        <hr className="border-border my-8" />

        {/* Seller Terms Section */}
        <div className="mb-8">
          <h2 className="text-text text-xl font-semibold">{tSellerTerms("pageTitle")}</h2>
          <p className="text-text-muted mt-2">{tSellerTerms("pageSubtitle")}</p>
        </div>

        <div className="prose prose-lg text-text-secondary max-w-none">
          {/* Overview */}
          <h3 className="text-text text-lg font-semibold">
            {tSellerTerms("sections.overview.title")}
          </h3>
          <p>{tSellerTerms("sections.overview.content")}</p>

          {/* Platform Fee */}
          <h3 className="text-text mt-6 text-lg font-semibold">
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
          <h3 className="text-text mt-6 text-lg font-semibold">
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
          <h3 className="text-text mt-6 text-lg font-semibold">
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

          {/* Copyright Warranty & Indemnification */}
          <h3 className="text-text mt-6 text-lg font-semibold">
            {tSellerTerms("sections.copyrightWarranty.title")}
          </h3>
          <div className="not-prose bg-primary/5 border-primary/20 my-4 rounded-lg border p-3">
            <p className="text-text-secondary text-sm">
              {tSellerTerms("sections.copyrightWarranty.guideCallout")}{" "}
              <Link href="/urheberrecht" className="text-primary font-medium hover:underline">
                {tSellerTerms("sections.copyrightWarranty.guideCalloutLink")} →
              </Link>
            </p>
          </div>
          <p>{tSellerTerms("sections.copyrightWarranty.content")}</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>{tSellerTerms("sections.copyrightWarranty.warranties.ownership")}</li>
            <li>{tSellerTerms("sections.copyrightWarranty.warranties.noInfringement")}</li>
            <li>{tSellerTerms("sections.copyrightWarranty.warranties.noThirdParty")}</li>
          </ul>
          <h4 className="text-text mt-4 font-medium">
            {tSellerTerms("sections.copyrightWarranty.indemnification.title")}
          </h4>
          <p>{tSellerTerms("sections.copyrightWarranty.indemnification.content")}</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>{tSellerTerms("sections.copyrightWarranty.indemnification.items.infringement")}</li>
            <li>{tSellerTerms("sections.copyrightWarranty.indemnification.items.breach")}</li>
            <li>{tSellerTerms("sections.copyrightWarranty.indemnification.items.content")}</li>
          </ul>

          {/* Notice and Takedown */}
          <h3 className="text-text mt-6 text-lg font-semibold">
            {tSellerTerms("sections.noticeTakedown.title")}
          </h3>
          <p>{tSellerTerms("sections.noticeTakedown.content")}</p>
          <h4 className="text-text mt-4 font-medium">
            {tSellerTerms("sections.noticeTakedown.procedure.title")}
          </h4>
          <p>{tSellerTerms("sections.noticeTakedown.procedure.content")}</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>{tSellerTerms("sections.noticeTakedown.procedure.items.identify")}</li>
            <li>{tSellerTerms("sections.noticeTakedown.procedure.items.location")}</li>
            <li>{tSellerTerms("sections.noticeTakedown.procedure.items.contact")}</li>
            <li>{tSellerTerms("sections.noticeTakedown.procedure.items.statement")}</li>
            <li>{tSellerTerms("sections.noticeTakedown.procedure.items.signature")}</li>
          </ul>
          <h4 className="text-text mt-4 font-medium">
            {tSellerTerms("sections.noticeTakedown.response.title")}
          </h4>
          <p>{tSellerTerms("sections.noticeTakedown.response.content")}</p>

          {/* Prohibited Content */}
          <h3 className="text-text mt-6 text-lg font-semibold">
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
          <h3 className="text-text mt-6 text-lg font-semibold">
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
          <h3 className="text-text mt-6 text-lg font-semibold">
            {tSellerTerms("sections.termination.title")}
          </h3>
          <p>{tSellerTerms("sections.termination.content")}</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>{tSellerTerms("sections.termination.rights.remove")}</li>
            <li>{tSellerTerms("sections.termination.rights.suspend")}</li>
            <li>{tSellerTerms("sections.termination.rights.withhold")}</li>
          </ul>

          {/* Changes to Terms */}
          <h3 className="text-text mt-6 text-lg font-semibold">
            {tSellerTerms("sections.changes.title")}
          </h3>
          <p>{tSellerTerms("sections.changes.content")}</p>
        </div>

        {/* Contact Section */}
        <div className="bg-bg-secondary mt-12 rounded-xl p-6 text-center">
          <h2 className="text-text text-xl font-semibold">{t("contact.title")}</h2>
          <p className="text-text-muted mt-2">{t("contact.content")}</p>
          <a
            href={`mailto:${t("contact.email")}`}
            className="text-primary mt-2 inline-block font-medium hover:underline"
          >
            {t("contact.email")}
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
