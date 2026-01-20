"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Building2, Mail, Phone, Globe, FileText } from "lucide-react";

export default function ImpressumPage() {
  const t = useTranslations("impressumPage");

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-border bg-bg-secondary border-b">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="bg-accent-subtle flex h-12 w-12 items-center justify-center rounded-full">
                <FileText className="text-primary h-6 w-6" />
              </div>
              <h1 className="text-text-primary text-3xl font-bold tracking-tight sm:text-4xl">
                {t("title")}
              </h1>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Company Information */}
              <div className="border-border bg-bg-primary rounded-xl border p-6">
                <div className="mb-4 flex items-center gap-3">
                  <Building2 className="text-primary h-5 w-5" />
                  <h2 className="text-text-primary text-lg font-semibold">{t("company.title")}</h2>
                </div>
                <div className="text-text-secondary space-y-3">
                  <p className="text-text-primary font-medium">{t("company.name")}</p>
                  <p>{t("company.address.street")}</p>
                  <p>{t("company.address.city")}</p>
                  <p>{t("company.address.country")}</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-border bg-bg-primary rounded-xl border p-6">
                <div className="mb-4 flex items-center gap-3">
                  <Mail className="text-primary h-5 w-5" />
                  <h2 className="text-text-primary text-lg font-semibold">{t("contact.title")}</h2>
                </div>
                <div className="text-text-secondary space-y-3">
                  <p className="flex items-center gap-2">
                    <Mail className="text-text-muted h-4 w-4" />
                    <a
                      href={`mailto:${t("contact.email")}`}
                      className="text-primary hover:underline"
                    >
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
            <div className="border-border bg-bg-primary mt-8 rounded-xl border p-6">
              <h2 className="text-text-primary mb-4 text-lg font-semibold">{t("legal.title")}</h2>
              <div className="text-text-secondary grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-text-muted text-sm">{t("legal.uid.label")}</p>
                  <p className="text-text-primary font-medium">{t("legal.uid.value")}</p>
                </div>
                <div>
                  <p className="text-text-muted text-sm">{t("legal.register.label")}</p>
                  <p className="text-text-primary font-medium">{t("legal.register.value")}</p>
                </div>
              </div>
            </div>

            {/* Responsible Person */}
            <div className="border-border bg-bg-primary mt-8 rounded-xl border p-6">
              <h2 className="text-text-primary mb-4 text-lg font-semibold">
                {t("responsible.title")}
              </h2>
              <p className="text-text-secondary">{t("responsible.name")}</p>
              <p className="text-text-secondary">{t("responsible.role")}</p>
            </div>

            {/* Disclaimer */}
            <div className="border-border bg-bg-secondary mt-8 rounded-xl border p-6">
              <h2 className="text-text-primary mb-4 text-lg font-semibold">
                {t("disclaimer.title")}
              </h2>
              <div className="text-text-secondary space-y-4 text-sm">
                <div>
                  <h3 className="text-text-primary mb-1 font-medium">
                    {t("disclaimer.liability.title")}
                  </h3>
                  <p>{t("disclaimer.liability.content")}</p>
                </div>
                <div>
                  <h3 className="text-text-primary mb-1 font-medium">
                    {t("disclaimer.links.title")}
                  </h3>
                  <p>{t("disclaimer.links.content")}</p>
                </div>
                <div>
                  <h3 className="text-text-primary mb-1 font-medium">
                    {t("disclaimer.copyright.title")}
                  </h3>
                  <p>{t("disclaimer.copyright.content")}</p>
                </div>
              </div>
            </div>

            {/* Links to other legal pages */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/privacy"
                className="border-border bg-bg-primary text-text-primary hover:bg-bg-secondary inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
              >
                {t("links.privacy")}
              </Link>
              <Link
                href="/terms"
                className="border-border bg-bg-primary text-text-primary hover:bg-bg-secondary inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
              >
                {t("links.terms")}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
