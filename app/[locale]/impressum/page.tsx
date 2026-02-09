"use client";

import { useTranslations } from "next-intl";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Building2, Mail, Globe } from "lucide-react";

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
        <div className="grid gap-8 md:grid-cols-2">
          {/* Company Information */}
          <div className="border-border bg-surface rounded-xl border p-6">
            <div className="mb-4 flex items-center gap-3">
              <Building2 className="text-primary h-5 w-5" />
              <h2 className="text-text text-lg font-semibold">{t("company.title")}</h2>
            </div>
            <div className="text-text-secondary space-y-3">
              <p className="text-text font-medium">{t("company.name")}</p>
              <p>{t("company.address.street")}</p>
              <p>{t("company.address.city")}</p>
              <p>{t("company.address.country")}</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-border bg-surface rounded-xl border p-6">
            <div className="mb-4 flex items-center gap-3">
              <Mail className="text-primary h-5 w-5" />
              <h2 className="text-text text-lg font-semibold">{t("contact.title")}</h2>
            </div>
            <div className="text-text-secondary space-y-3">
              <p className="flex items-center gap-2">
                <Mail className="text-text-muted h-4 w-4" />
                <a href={`mailto:${t("contact.email")}`} className="text-primary hover:underline">
                  {t("contact.email")}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Globe className="text-text-muted h-4 w-4" />
                <span>{t("contact.website")}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Legal Information */}
        <div className="border-border bg-surface mt-8 rounded-xl border p-6">
          <h2 className="text-text mb-4 text-lg font-semibold">{t("legal.title")}</h2>
          <div className="text-text-secondary grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-text-muted text-sm">{t("legal.uid.label")}</p>
              <p className="text-text font-medium">{t("legal.uid.value")}</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">{t("legal.register.label")}</p>
              <p className="text-text font-medium">{t("legal.register.value")}</p>
            </div>
          </div>
        </div>

        {/* Responsible Person */}
        <div className="border-border bg-surface mt-8 rounded-xl border p-6">
          <h2 className="text-text mb-4 text-lg font-semibold">{t("responsible.title")}</h2>
          <p className="text-text-secondary">{t("responsible.name")}</p>
          <p className="text-text-secondary">{t("responsible.role")}</p>
        </div>

        {/* Disclaimer */}
        <div className="border-border bg-bg-secondary mt-8 rounded-xl border p-6">
          <h2 className="text-text mb-4 text-lg font-semibold">{t("disclaimer.title")}</h2>
          <div className="text-text-secondary space-y-4 text-sm">
            <div>
              <h3 className="text-text mb-1 font-medium">{t("disclaimer.liability.title")}</h3>
              <p>{t("disclaimer.liability.content")}</p>
            </div>
            <div>
              <h3 className="text-text mb-1 font-medium">{t("disclaimer.links.title")}</h3>
              <p>{t("disclaimer.links.content")}</p>
            </div>
            <div>
              <h3 className="text-text mb-1 font-medium">{t("disclaimer.copyright.title")}</h3>
              <p>{t("disclaimer.copyright.content")}</p>
            </div>
            <div>
              <h3 className="text-text mb-1 font-medium">{t("disclaimer.userContent.title")}</h3>
              <p>{t("disclaimer.userContent.content")}</p>
            </div>
          </div>
        </div>

        {/* Version */}
        <p className="text-text-muted mt-8 text-sm">{t("version")}</p>
      </main>

      <Footer />
    </div>
  );
}
