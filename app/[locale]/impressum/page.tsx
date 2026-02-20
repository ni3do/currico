"use client";

import { useTranslations } from "next-intl";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Building2, Mail, Globe, Scale, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";

const AUTHORIZED_REPRESENTATIVES = ["p1", "p2", "p3"] as const;

const DISCLAIMER_SECTIONS = ["liability", "links", "copyright", "userContent"] as const;

export default function ImpressumPage() {
  const t = useTranslations("impressumPage");
  const tCommon = useTranslations("common");

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <Breadcrumb items={[{ label: tCommon("breadcrumb.imprint") }]} />
          <h1 className="text-text text-2xl font-bold sm:text-3xl">{t("title")}</h1>
          <p className="text-text-muted mt-1">{t("subtitle")}</p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Company Information */}
          <div className="border-border bg-surface rounded-xl border p-6">
            <div className="mb-4 flex items-center gap-3">
              <Building2 className="text-primary h-5 w-5" aria-hidden="true" />
              <h2 className="text-text text-lg font-semibold">{t("company.title")}</h2>
            </div>
            <div className="text-text-muted space-y-3">
              <p className="text-text font-medium">{t("company.name")}</p>
              <p className="text-text-muted text-sm">
                {t("company.tradeNameLabel")} {t("company.tradeName")}
              </p>
              <p>{t("company.address.street")}</p>
              <p>{t("company.address.city")}</p>
              <p>{t("company.address.country")}</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-border bg-surface rounded-xl border p-6">
            <div className="mb-4 flex items-center gap-3">
              <Mail className="text-primary h-5 w-5" aria-hidden="true" />
              <h2 className="text-text text-lg font-semibold">{t("contact.title")}</h2>
            </div>
            <div className="text-text-muted space-y-3">
              <p className="flex items-center gap-2">
                <Mail className="text-text-muted h-4 w-4" aria-hidden="true" />
                <a
                  href={`mailto:${t("contact.email")}`}
                  className="text-primary hover:underline"
                  title={t("contact.emailTitle")}
                >
                  {t("contact.email")}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Globe className="text-text-muted h-4 w-4" aria-hidden="true" />
                <a
                  href="https://www.currico.ch"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("contact.website")}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Legal Information */}
        <div className="border-border bg-surface mt-8 rounded-xl border p-6">
          <div className="mb-4 flex items-center gap-3">
            <Scale className="text-primary h-5 w-5" aria-hidden="true" />
            <h2 className="text-text text-lg font-semibold">{t("legal.title")}</h2>
          </div>
          <div className="text-text-muted grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-text-muted text-sm">{t("legal.legalForm.label")}</p>
              <p className="text-text font-medium">{t("legal.legalForm.value")}</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">{t("legal.uid.label")}</p>
              <p className="text-text font-medium">{t("legal.uid.value")}</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">{t("legal.register.label")}</p>
              <p className="text-text font-medium">{t("legal.register.value")}</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">{t("legal.capital.label")}</p>
              <p className="text-text font-medium">{t("legal.capital.value")}</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">{t("legal.founded.label")}</p>
              <p className="text-text font-medium">{t("legal.founded.value")}</p>
            </div>
          </div>
        </div>

        {/* Authorized Representatives */}
        <div className="border-border bg-surface mt-8 rounded-xl border p-6">
          <div className="mb-4 flex items-center gap-3">
            <Users className="text-primary h-5 w-5" aria-hidden="true" />
            <h2 className="text-text text-lg font-semibold">{t("responsible.title")}</h2>
          </div>
          <div className="space-y-3">
            {AUTHORIZED_REPRESENTATIVES.map((key) => (
              <div
                key={key}
                className="bg-bg-secondary flex items-center justify-between rounded-lg px-4 py-3"
              >
                <div>
                  <p className="text-text font-medium">{t(`responsible.persons.${key}.name`)}</p>
                  <p className="text-text-muted text-sm">{t(`responsible.persons.${key}.role`)}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-text-muted mt-3 text-sm">{t("responsible.signing")}</p>
        </div>

        {/* Disclaimer */}
        <section
          className="border-border bg-surface mt-8 rounded-xl border p-6"
          aria-labelledby="disclaimer-heading"
        >
          <h2 id="disclaimer-heading" className="text-text mb-4 text-lg font-semibold">
            {t("disclaimer.title")}
          </h2>
          <div className="text-text-muted space-y-4 text-sm">
            {DISCLAIMER_SECTIONS.map((key) => (
              <section key={key} aria-labelledby={`disclaimer-${key}`}>
                <h3 id={`disclaimer-${key}`} className="text-text mb-1 font-medium">
                  {t(`disclaimer.${key}.title`)}
                </h3>
                <p>{t(`disclaimer.${key}.content`)}</p>
              </section>
            ))}
          </div>
        </section>

        {/* Version */}
        <p className="text-text-muted mt-8 text-sm">{t("version")}</p>
      </main>

      <Footer />
    </div>
  );
}
