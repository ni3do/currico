"use client";

import { useTranslations } from "next-intl";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Mail } from "lucide-react";

export default function PrivacyPage() {
  const t = useTranslations("privacyPage");
  const tCommon = useTranslations("common");

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <Breadcrumb items={[{ label: tCommon("breadcrumb.privacy") }]} />
          <h1 className="text-text text-2xl font-bold sm:text-3xl">{t("title")}</h1>
          <p className="text-text-muted mt-1">{t("lastUpdated")}</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg text-text-secondary max-w-none">
          {/* Introduction */}
          <div className="border-primary/20 bg-accent-subtle mb-8 rounded-xl border p-6">
            <p className="text-text">{t("intro")}</p>
          </div>

          {/* Section 1: Responsible Party */}
          <h2 className="text-text mt-8 text-xl font-semibold">
            {t("sections.responsible.title")}
          </h2>
          <p>{t("sections.responsible.content")}</p>
          <div className="bg-bg-secondary mt-2 rounded-lg p-4">
            <p className="text-text font-medium">{t("sections.responsible.company")}</p>
            <p>{t("sections.responsible.address")}</p>
            <p>
              {t("sections.responsible.emailLabel")}:{" "}
              <a
                href={`mailto:${t("sections.responsible.email")}`}
                className="text-primary hover:underline"
              >
                {t("sections.responsible.email")}
              </a>
            </p>
          </div>

          {/* Section 2: Data Collection */}
          <h2 className="text-text mt-8 text-xl font-semibold">{t("sections.collection.title")}</h2>
          <p>{t("sections.collection.intro")}</p>
          <h3 className="text-text mt-4 text-lg font-medium">
            {t("sections.collection.account.title")}
          </h3>
          <ul className="ml-4 list-disc space-y-1">
            <li>{t("sections.collection.account.items.name")}</li>
            <li>{t("sections.collection.account.items.email")}</li>
            <li>{t("sections.collection.account.items.password")}</li>
            <li>{t("sections.collection.account.items.profile")}</li>
          </ul>
          <h3 className="text-text mt-4 text-lg font-medium">
            {t("sections.collection.payment.title")}
          </h3>
          <ul className="ml-4 list-disc space-y-1">
            <li>{t("sections.collection.payment.items.transaction")}</li>
            <li>{t("sections.collection.payment.items.billing")}</li>
          </ul>
          <p className="mt-2 text-sm">{t("sections.collection.payment.note")}</p>

          <h3 className="text-text mt-4 text-lg font-medium">
            {t("sections.collection.serverLogs.title")}
          </h3>
          <p>{t("sections.collection.serverLogs.intro")}</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>{t("sections.collection.serverLogs.items.browser")}</li>
            <li>{t("sections.collection.serverLogs.items.os")}</li>
            <li>{t("sections.collection.serverLogs.items.ip")}</li>
            <li>{t("sections.collection.serverLogs.items.time")}</li>
          </ul>
          <p className="mt-2 text-sm">{t("sections.collection.serverLogs.note")}</p>

          <h3 className="text-text mt-4 text-lg font-medium">
            {t("sections.collection.thirdPartyData.title")}
          </h3>
          <p>{t("sections.collection.thirdPartyData.content")}</p>

          {/* Section 3: Purpose */}
          <h2 className="text-text mt-8 text-xl font-semibold">{t("sections.purpose.title")}</h2>
          <p>{t("sections.purpose.intro")}</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>{t("sections.purpose.items.account")}</li>
            <li>{t("sections.purpose.items.transactions")}</li>
            <li>{t("sections.purpose.items.communication")}</li>
            <li>{t("sections.purpose.items.improvement")}</li>
            <li>{t("sections.purpose.items.marketing")}</li>
            <li>{t("sections.purpose.items.legal")}</li>
            <li>{t("sections.purpose.items.security")}</li>
            <li>{t("sections.purpose.items.compliance")}</li>
          </ul>
          <p className="mt-4">{t("sections.purpose.consent")}</p>
          <p className="mt-4">{t("sections.purpose.serviceProviders")}</p>
          <p className="mt-2">{t("sections.purpose.securityMeasures")}</p>

          {/* Section 4: Cookies */}
          <h2 className="text-text mt-8 text-xl font-semibold">{t("sections.cookies.title")}</h2>
          <p>{t("sections.cookies.intro")}</p>
          <p className="mt-2">{t("sections.cookies.noPersonalData")}</p>
          <h3 className="text-text mt-4 text-lg font-medium">
            {t("sections.cookies.essential.title")}
          </h3>
          <p>{t("sections.cookies.essential.content")}</p>
          <h3 className="text-text mt-4 text-lg font-medium">
            {t("sections.cookies.analytics.title")}
          </h3>
          <p>{t("sections.cookies.analytics.content")}</p>
          <p className="mt-4 text-sm">{t("sections.cookies.browserSettings")}</p>

          {/* Section 5: Payment Processors */}
          <h2 className="text-text mt-8 text-xl font-semibold">
            {t("sections.paymentProcessors.title")}
          </h2>
          <p>{t("sections.paymentProcessors.intro")}</p>

          {/* Stripe */}
          <div className="bg-bg-secondary mt-4 rounded-lg p-4">
            <h3 className="text-text text-lg font-medium">
              {t("sections.paymentProcessors.stripe.title")}
            </h3>
            <p className="mt-2">{t("sections.paymentProcessors.stripe.content")}</p>
            <p className="mt-2 text-sm">{t("sections.paymentProcessors.stripe.dataShared")}</p>
            <p className="text-sm">{t("sections.paymentProcessors.stripe.location")}</p>
            <p className="text-primary mt-2 text-sm">
              {t("sections.paymentProcessors.stripe.link")}
            </p>
          </div>

          {/* TWINT */}
          <div className="bg-bg-secondary mt-4 rounded-lg p-4">
            <h3 className="text-text text-lg font-medium">
              {t("sections.paymentProcessors.twint.title")}
            </h3>
            <p className="mt-2">{t("sections.paymentProcessors.twint.content")}</p>
            <p className="mt-2 text-sm">{t("sections.paymentProcessors.twint.dataShared")}</p>
            <p className="text-sm">{t("sections.paymentProcessors.twint.location")}</p>
            <p className="text-primary mt-2 text-sm">
              {t("sections.paymentProcessors.twint.link")}
            </p>
          </div>

          {/* Section 6: Data Sharing */}
          <h2 className="text-text mt-8 text-xl font-semibold">{t("sections.sharing.title")}</h2>
          <p>{t("sections.sharing.intro")}</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>{t("sections.sharing.items.stripe")}</li>
            <li>{t("sections.sharing.items.twint")}</li>
            <li>{t("sections.sharing.items.hosting")}</li>
            <li>{t("sections.sharing.items.email")}</li>
          </ul>

          {/* Section 7: Data Storage */}
          <h2 className="text-text mt-8 text-xl font-semibold">{t("sections.storage.title")}</h2>
          <p>{t("sections.storage.location")}</p>
          <p className="mt-2">{t("sections.storage.transfer")}</p>
          <p className="mt-2">{t("sections.storage.retention")}</p>

          {/* Section 8: Your Rights */}
          <h2 className="text-text mt-8 text-xl font-semibold">{t("sections.rights.title")}</h2>
          <p>{t("sections.rights.intro")}</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>{t("sections.rights.items.access")}</li>
            <li>{t("sections.rights.items.rectification")}</li>
            <li>{t("sections.rights.items.deletion")}</li>
            <li>{t("sections.rights.items.restriction")}</li>
            <li>{t("sections.rights.items.portability")}</li>
            <li>{t("sections.rights.items.objection")}</li>
            <li>{t("sections.rights.items.withdrawal")}</li>
          </ul>
          <p className="mt-4 text-sm">{t("sections.rights.limitations")}</p>
          <p className="mt-2">{t("sections.rights.contact")}</p>
          <p className="mt-2 text-sm">{t("sections.rights.complaint")}</p>
          <p className="mt-2 text-sm">{t("sections.rights.euComplaint")}</p>
          <p className="mt-2">{t("sections.rights.profileDeletion")}</p>

          {/* Section 9: Security */}
          <h2 className="text-text mt-8 text-xl font-semibold">{t("sections.security.title")}</h2>
          <p>{t("sections.security.content")}</p>

          {/* Section 10: Changes */}
          <h2 className="text-text mt-8 text-xl font-semibold">{t("sections.changes.title")}</h2>
          <p>{t("sections.changes.content")}</p>

          {/* Section 11: Jurisdiction */}
          <h2 className="text-text mt-8 text-xl font-semibold">
            {t("sections.jurisdiction.title")}
          </h2>
          <p>{t("sections.jurisdiction.content")}</p>

          {/* Section 12: GDPR */}
          <h2 className="text-text mt-8 text-xl font-semibold">{t("sections.gdpr.title")}</h2>
          <p>{t("sections.gdpr.intro")}</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>{t("sections.gdpr.items.consent")}</li>
            <li>{t("sections.gdpr.items.contract")}</li>
            <li>{t("sections.gdpr.items.legal")}</li>
            <li>{t("sections.gdpr.items.vital")}</li>
            <li>{t("sections.gdpr.items.publicInterest")}</li>
            <li>{t("sections.gdpr.items.legitimate")}</li>
          </ul>
          <p className="mt-4">{t("sections.gdpr.legitimateInterests")}</p>
          <p className="mt-4">{t("sections.gdpr.contactIfNotSatisfied")}</p>

          {/* Section 13: Automated Decisions */}
          <h2 className="text-text mt-8 text-xl font-semibold">
            {t("sections.automatedDecisions.title")}
          </h2>
          <p>{t("sections.automatedDecisions.content")}</p>

          {/* Section 14: Minors */}
          <h2 className="text-text mt-8 text-xl font-semibold">{t("sections.minors.title")}</h2>
          <p>{t("sections.minors.content")}</p>

          {/* Version */}
          <p className="text-text-muted mt-8 text-sm">{t("version")}</p>
        </div>

        {/* Contact CTA */}
        <div className="border-border bg-bg-secondary mt-12 rounded-xl border p-6 text-center">
          <Mail className="text-primary mx-auto mb-4 h-8 w-8" />
          <h2 className="text-text text-lg font-semibold">{t("contact.title")}</h2>
          <p className="text-text-muted mt-2">{t("contact.description")}</p>
          <a
            href={`mailto:${t("contact.email")}`}
            className="bg-primary text-text-on-accent hover:bg-primary-hover mt-4 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors"
          >
            {t("contact.email")}
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
