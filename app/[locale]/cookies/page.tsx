"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Cookie, Shield, BarChart3, Settings, Mail } from "lucide-react";

export default function CookiesPage() {
  const t = useTranslations("cookiesPage");
  const tCommon = useTranslations("common");

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <Breadcrumb items={[{ label: tCommon("footer.links.cookies") }]} />
          <h1 className="text-text text-2xl font-bold sm:text-3xl">{t("title")}</h1>
          <p className="text-text-muted mt-1">{t("lastUpdated")}</p>
        </div>

        {/* Intro */}
        <div className="border-primary/20 bg-accent-subtle mb-8 rounded-xl border p-6">
          <p className="text-text">{t("intro")}</p>
        </div>

        <div className="prose prose-lg text-text-secondary max-w-none">
          {/* Section 1: What Are Cookies */}
          <h2 className="text-text text-xl font-semibold">{t("sections.what.title")}</h2>
          <p>{t("sections.what.content")}</p>

          {/* Section 2: How We Use Cookies */}
          <h2 className="text-text mt-8 text-xl font-semibold">{t("sections.howWeUse.title")}</h2>
          <p>{t("sections.howWeUse.content")}</p>

          {/* Section 3: Types of Cookies */}
          <h2 className="text-text mt-8 text-xl font-semibold">{t("sections.types.title")}</h2>

          {/* Essential Cookies */}
          <div className="not-prose border-border bg-surface mt-4 rounded-xl border p-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="text-success h-5 w-5" />
                <h3 className="text-text text-lg font-semibold">
                  {t("sections.types.essential.title")}
                </h3>
              </div>
              <span className="bg-success/10 text-success rounded-full px-3 py-1 text-xs font-medium">
                {t("sections.types.essential.badge")}
              </span>
            </div>
            <p className="text-text-secondary mb-4 text-sm">
              {t("sections.types.essential.content")}
            </p>

            <div className="divide-border-subtle divide-y">
              {(["consent", "session", "csrf", "locale"] as const).map((cookie) => (
                <div key={cookie} className="flex items-start gap-3 py-3">
                  <Cookie className="text-text-muted mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <span className="text-text text-sm font-medium">{cookie}</span>
                    <p className="text-text-muted text-sm">
                      {t(`sections.types.essential.cookies.${cookie}`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics Cookies */}
          <div className="not-prose border-border bg-surface mt-4 rounded-xl border p-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="text-primary h-5 w-5" />
                <h3 className="text-text text-lg font-semibold">
                  {t("sections.types.analytics.title")}
                </h3>
              </div>
              <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                {t("sections.types.analytics.badge")}
              </span>
            </div>
            <p className="text-text-secondary mb-2 text-sm">
              {t("sections.types.analytics.content")}
            </p>
            <p className="text-text-muted text-sm italic">{t("sections.types.analytics.note")}</p>
          </div>

          {/* Section 4: Managing Preferences */}
          <h2 className="text-text mt-8 text-xl font-semibold">{t("sections.managing.title")}</h2>
          <p>{t("sections.managing.content")}</p>
          <p className="mt-2 flex items-center gap-1">
            <Settings className="h-4 w-4" />
            {t("sections.managing.browser")}
          </p>

          {/* Section 5: Changes */}
          <h2 className="text-text mt-8 text-xl font-semibold">{t("sections.changes.title")}</h2>
          <p>{t("sections.changes.content")}</p>
        </div>

        {/* Related Links */}
        <div className="border-border mt-8 rounded-xl border p-6">
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="text-primary text-sm font-medium hover:underline">
              {t("links.privacy")}
            </Link>
            <Link href="/impressum" className="text-primary text-sm font-medium hover:underline">
              {t("links.impressum")}
            </Link>
            <Link href="/terms" className="text-primary text-sm font-medium hover:underline">
              {t("links.terms")}
            </Link>
          </div>
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
