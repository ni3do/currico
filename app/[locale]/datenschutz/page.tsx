"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Mail, List, X } from "lucide-react";

const TOC_SECTIONS = [
  "responsible",
  "collection",
  "purpose",
  "cookies",
  "paymentProcessors",
  "sharing",
  "storage",
  "rights",
  "security",
  "changes",
  "jurisdiction",
  "gdpr",
  "automatedDecisions",
  "minors",
] as const;

export default function PrivacyPage() {
  const t = useTranslations("privacyPage");
  const tCommon = useTranslations("common");

  const [activeSection, setActiveSection] = useState<string>("");
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  // Scroll-spy: highlight active TOC link based on visible section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    for (const section of TOC_SECTIONS) {
      const el = document.getElementById(`section-${section}`);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  // Scroll to anchor on page load
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      requestAnimationFrame(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, []);

  /** Shared TOC link list */
  const renderTocLinks = (onLinkClick?: () => void) => (
    <ol className="space-y-0.5">
      {TOC_SECTIONS.map((key, index) => (
        <li key={key}>
          <a
            href={`#section-${key}`}
            onClick={onLinkClick}
            aria-current={activeSection === `section-${key}` ? "true" : undefined}
            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition-colors ${
              activeSection === `section-${key}`
                ? "bg-primary/10 text-primary font-medium"
                : "text-text-secondary hover:text-primary hover:bg-primary/5"
            }`}
          >
            <span className="text-text-muted w-4 text-xs">{index + 1}.</span>
            {t(`sections.${key}.title`)}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <div
      id="top"
      className="bg-bg flex min-h-screen flex-col"
      style={{ "--header-offset": "6rem" } as React.CSSProperties}
    >
      <TopBar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <Breadcrumb items={[{ label: tCommon("breadcrumb.privacy") }]} />
          <h1 className="text-text text-2xl font-bold sm:text-3xl">{t("title")}</h1>
          <p className="text-text-muted mt-1">{t("lastUpdated")}</p>
        </div>

        {/* Two-column layout: sidebar TOC + content */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Desktop Sidebar TOC */}
          <div className="hidden w-72 flex-shrink-0 lg:block">
            <div className="sticky top-[var(--header-offset)]">
              <nav
                className="border-border bg-bg-secondary rounded-xl border p-4 shadow-sm"
                aria-label={t("toc.label")}
              >
                <h2 className="text-text mb-3 text-sm font-semibold">{t("toc.title")}</h2>
                {renderTocLinks()}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="min-w-0 flex-1">
            {/* Intro */}
            <div className="border-primary/20 bg-accent-subtle mb-8 rounded-xl border p-6">
              <p className="text-text">{t("intro")}</p>
            </div>

            <div className="prose prose-lg text-text-secondary max-w-none space-y-10">
              {/* Section 1: Responsible Party */}
              <section id="section-responsible" className="scroll-mt-[var(--header-offset)]">
                <h2 className="text-text text-xl font-semibold">
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
                      title={t("emailTitle")}
                    >
                      {t("sections.responsible.email")}
                    </a>
                  </p>
                </div>
              </section>

              {/* Section 2: Data Collection */}
              <section id="section-collection" className="scroll-mt-[var(--header-offset)]">
                <h2 className="text-text text-xl font-semibold">
                  {t("sections.collection.title")}
                </h2>
                <p>{t("sections.collection.intro")}</p>
                <h3 className="text-text mt-4 text-lg font-semibold">
                  {t("sections.collection.account.title")}
                </h3>
                <ul className="ml-4 list-disc space-y-1">
                  <li>{t("sections.collection.account.items.name")}</li>
                  <li>{t("sections.collection.account.items.email")}</li>
                  <li>{t("sections.collection.account.items.password")}</li>
                  <li>{t("sections.collection.account.items.profile")}</li>
                </ul>
                <h3 className="text-text mt-4 text-lg font-semibold">
                  {t("sections.collection.payment.title")}
                </h3>
                <ul className="ml-4 list-disc space-y-1">
                  <li>{t("sections.collection.payment.items.transaction")}</li>
                  <li>{t("sections.collection.payment.items.billing")}</li>
                </ul>
                <p className="mt-2 text-sm">{t("sections.collection.payment.note")}</p>

                <h3 className="text-text mt-4 text-lg font-semibold">
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

                <h3 className="text-text mt-4 text-lg font-semibold">
                  {t("sections.collection.thirdPartyData.title")}
                </h3>
                <p>{t("sections.collection.thirdPartyData.content")}</p>
              </section>

              {/* Section 3: Purpose */}
              <section id="section-purpose" className="scroll-mt-[var(--header-offset)]">
                <h2 className="text-text text-xl font-semibold">{t("sections.purpose.title")}</h2>
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
              </section>

              {/* Section 4: Cookies */}
              <section id="section-cookies" className="scroll-mt-[var(--header-offset)]">
                <h2 className="text-text text-xl font-semibold">{t("sections.cookies.title")}</h2>
                <p>{t("sections.cookies.intro")}</p>
                <p className="mt-2">{t("sections.cookies.noPersonalData")}</p>
                <h3 className="text-text mt-4 text-lg font-semibold">
                  {t("sections.cookies.essential.title")}
                </h3>
                <p>{t("sections.cookies.essential.content")}</p>
                <h3 className="text-text mt-4 text-lg font-semibold">
                  {t("sections.cookies.analytics.title")}
                </h3>
                <p>{t("sections.cookies.analytics.content")}</p>
                <p className="mt-4 text-sm">{t("sections.cookies.browserSettings")}</p>
              </section>

              {/* Section 5: Payment Processors */}
              <section id="section-paymentProcessors" className="scroll-mt-[var(--header-offset)]">
                <h2 className="text-text text-xl font-semibold">
                  {t("sections.paymentProcessors.title")}
                </h2>
                <p>{t("sections.paymentProcessors.intro")}</p>

                {/* Stripe */}
                <div className="bg-bg-secondary mt-4 rounded-lg p-4">
                  <h3 className="text-text text-lg font-semibold">
                    {t("sections.paymentProcessors.stripe.title")}
                  </h3>
                  <p className="mt-2">{t("sections.paymentProcessors.stripe.content")}</p>
                  <p className="mt-2 text-sm">
                    {t("sections.paymentProcessors.stripe.dataShared")}
                  </p>
                  <p className="text-sm">{t("sections.paymentProcessors.stripe.location")}</p>
                  <p className="text-primary mt-2 text-sm">
                    {t("sections.paymentProcessors.stripe.link")}
                  </p>
                </div>

                {/* TWINT */}
                <div className="bg-bg-secondary mt-4 rounded-lg p-4">
                  <h3 className="text-text text-lg font-semibold">
                    {t("sections.paymentProcessors.twint.title")}
                  </h3>
                  <p className="mt-2">{t("sections.paymentProcessors.twint.content")}</p>
                  <p className="mt-2 text-sm">{t("sections.paymentProcessors.twint.dataShared")}</p>
                  <p className="text-sm">{t("sections.paymentProcessors.twint.location")}</p>
                  <p className="text-primary mt-2 text-sm">
                    {t("sections.paymentProcessors.twint.link")}
                  </p>
                </div>
              </section>

              {/* Section 6: Data Sharing */}
              <section id="section-sharing" className="scroll-mt-[var(--header-offset)]">
                <h2 className="text-text text-xl font-semibold">{t("sections.sharing.title")}</h2>
                <p>{t("sections.sharing.intro")}</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>{t("sections.sharing.items.stripe")}</li>
                  <li>{t("sections.sharing.items.twint")}</li>
                  <li>{t("sections.sharing.items.hosting")}</li>
                  <li>{t("sections.sharing.items.email")}</li>
                </ul>
              </section>

              {/* Section 7: Data Storage */}
              <section id="section-storage" className="scroll-mt-[var(--header-offset)]">
                <h2 className="text-text text-xl font-semibold">{t("sections.storage.title")}</h2>
                <p>{t("sections.storage.location")}</p>
                <p className="mt-2">{t("sections.storage.transfer")}</p>
                <p className="mt-2">{t("sections.storage.retention")}</p>
              </section>

              {/* Section 8: Your Rights */}
              <section id="section-rights" className="scroll-mt-[var(--header-offset)]">
                <h2 className="text-text text-xl font-semibold">{t("sections.rights.title")}</h2>
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
              </section>

              {/* Section 9: Security */}
              <section id="section-security" className="scroll-mt-[var(--header-offset)]">
                <h2 className="text-text text-xl font-semibold">{t("sections.security.title")}</h2>
                <p>{t("sections.security.content")}</p>
              </section>

              {/* Section 10: Changes */}
              <section id="section-changes" className="scroll-mt-[var(--header-offset)]">
                <h2 className="text-text text-xl font-semibold">{t("sections.changes.title")}</h2>
                <p>{t("sections.changes.content")}</p>
              </section>

              {/* Section 11: Jurisdiction */}
              <section id="section-jurisdiction" className="scroll-mt-[var(--header-offset)]">
                <h2 className="text-text text-xl font-semibold">
                  {t("sections.jurisdiction.title")}
                </h2>
                <p>{t("sections.jurisdiction.content")}</p>
              </section>

              {/* Section 12: GDPR */}
              <section id="section-gdpr" className="scroll-mt-[var(--header-offset)]">
                <h2 className="text-text text-xl font-semibold">{t("sections.gdpr.title")}</h2>
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
              </section>

              {/* Section 13: Automated Decisions */}
              <section id="section-automatedDecisions" className="scroll-mt-[var(--header-offset)]">
                <h2 className="text-text text-xl font-semibold">
                  {t("sections.automatedDecisions.title")}
                </h2>
                <p>{t("sections.automatedDecisions.content")}</p>
              </section>

              {/* Section 14: Minors */}
              <section id="section-minors" className="scroll-mt-[var(--header-offset)]">
                <h2 className="text-text text-xl font-semibold">{t("sections.minors.title")}</h2>
                <p>{t("sections.minors.content")}</p>
              </section>
            </div>

            {/* Version */}
            <p className="text-text-muted mt-8 text-sm">{t("version")}</p>

            {/* Contact CTA */}
            <div className="border-border bg-bg-secondary mt-12 rounded-xl border p-6 text-center">
              <Mail className="text-primary mx-auto mb-4 h-8 w-8" aria-hidden="true" />
              <h2 className="text-text text-lg font-semibold">{t("contact.title")}</h2>
              <p className="text-text-muted mt-2">{t("contact.description")}</p>
              <a
                href={`mailto:${t("contact.email")}`}
                className="bg-primary text-text-on-accent hover:bg-primary-hover mt-4 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors"
                title={t("emailTitle")}
              >
                {t("contact.email")}
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Mobile TOC floating button */}
      {!mobileTocOpen && (
        <button
          type="button"
          className="bg-primary text-text-on-accent fixed right-6 bottom-6 z-40 flex items-center gap-2 rounded-full px-4 py-3 shadow-lg transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 lg:hidden"
          onClick={() => setMobileTocOpen(true)}
          aria-label={t("toc.showContents")}
        >
          <List className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm font-medium">{t("toc.title")}</span>
        </button>
      )}

      {/* Mobile TOC overlay */}
      {mobileTocOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileTocOpen(false)}
            aria-hidden="true"
          />
          <nav
            className="bg-surface absolute right-0 bottom-0 left-0 max-h-[70vh] overflow-y-auto rounded-t-2xl p-6 shadow-xl"
            aria-label={t("toc.title")}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-text text-lg font-semibold">{t("toc.title")}</h2>
              <button
                type="button"
                onClick={() => setMobileTocOpen(false)}
                aria-label={t("toc.hideContents")}
                className="text-text-muted hover:text-text rounded-lg p-1 transition-colors"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {renderTocLinks(() => setMobileTocOpen(false))}
          </nav>
        </div>
      )}
    </div>
  );
}
