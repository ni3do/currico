"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Cookie, Mail, Check, X } from "lucide-react";

export default function CookiesPage() {
  const t = useTranslations("cookiesPage");

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-border bg-bg-secondary border-b">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="bg-accent-subtle flex h-12 w-12 items-center justify-center rounded-full">
                <Cookie className="text-primary h-6 w-6" />
              </div>
              <div>
                <h1 className="text-text-primary text-3xl font-bold tracking-tight sm:text-4xl">
                  {t("title")}
                </h1>
                <p className="text-text-muted mt-1">{t("lastUpdated")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg text-text-secondary max-w-none">
              {/* Introduction */}
              <div className="border-primary/20 bg-accent-subtle mb-8 rounded-xl border p-6">
                <p className="text-text-primary">{t("intro")}</p>
              </div>

              {/* Section 1: What Are Cookies */}
              <h2 className="text-text-primary mt-8 text-xl font-semibold">
                {t("sections.what.title")}
              </h2>
              <p>{t("sections.what.content")}</p>

              {/* Section 2: How We Use Cookies */}
              <h2 className="text-text-primary mt-8 text-xl font-semibold">
                {t("sections.howWeUse.title")}
              </h2>
              <p>{t("sections.howWeUse.content")}</p>

              {/* Section 3: Cookie Types */}
              <h2 className="text-text-primary mt-8 text-xl font-semibold">
                {t("sections.types.title")}
              </h2>

              {/* Essential Cookies */}
              <div className="bg-bg-secondary mt-4 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Check className="text-success h-5 w-5" />
                  <h3 className="text-text-primary text-lg font-medium">
                    {t("sections.types.essential.title")}
                  </h3>
                  <span className="bg-success/10 text-success rounded-full px-2 py-0.5 text-xs font-medium">
                    {t("sections.types.essential.badge")}
                  </span>
                </div>
                <p className="mt-2">{t("sections.types.essential.content")}</p>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-border border-b">
                        <th className="text-text-primary py-2 text-left font-medium">
                          {t("sections.types.table.name")}
                        </th>
                        <th className="text-text-primary py-2 text-left font-medium">
                          {t("sections.types.table.purpose")}
                        </th>
                        <th className="text-text-primary py-2 text-left font-medium">
                          {t("sections.types.table.duration")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-border border-b">
                        <td className="py-2 font-mono text-xs">cookie-consent</td>
                        <td className="py-2">{t("sections.types.essential.cookies.consent")}</td>
                        <td className="py-2">1 {t("sections.types.table.year")}</td>
                      </tr>
                      <tr className="border-border border-b">
                        <td className="py-2 font-mono text-xs">next-auth.session-token</td>
                        <td className="py-2">{t("sections.types.essential.cookies.session")}</td>
                        <td className="py-2">30 {t("sections.types.table.days")}</td>
                      </tr>
                      <tr className="border-border border-b">
                        <td className="py-2 font-mono text-xs">next-auth.csrf-token</td>
                        <td className="py-2">{t("sections.types.essential.cookies.csrf")}</td>
                        <td className="py-2">{t("sections.types.table.session")}</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-xs">NEXT_LOCALE</td>
                        <td className="py-2">{t("sections.types.essential.cookies.locale")}</td>
                        <td className="py-2">1 {t("sections.types.table.year")}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-bg-secondary mt-4 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <X className="text-text-muted h-5 w-5" />
                  <h3 className="text-text-primary text-lg font-medium">
                    {t("sections.types.analytics.title")}
                  </h3>
                  <span className="bg-bg-tertiary text-text-muted rounded-full px-2 py-0.5 text-xs font-medium">
                    {t("sections.types.analytics.badge")}
                  </span>
                </div>
                <p className="mt-2">{t("sections.types.analytics.content")}</p>
                <p className="mt-2 text-sm italic">{t("sections.types.analytics.note")}</p>
              </div>

              {/* Section 4: Managing Cookies */}
              <h2 className="text-text-primary mt-8 text-xl font-semibold">
                {t("sections.managing.title")}
              </h2>
              <p>{t("sections.managing.content")}</p>
              <p className="mt-2">{t("sections.managing.browser")}</p>
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li>
                  <a
                    href="https://support.google.com/chrome/answer/95647"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Chrome
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Firefox
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Safari
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Microsoft Edge
                  </a>
                </li>
              </ul>

              {/* Section 5: Changes */}
              <h2 className="text-text-primary mt-8 text-xl font-semibold">
                {t("sections.changes.title")}
              </h2>
              <p>{t("sections.changes.content")}</p>
            </div>

            {/* Contact CTA */}
            <div className="border-border bg-bg-secondary mt-12 rounded-xl border p-6 text-center">
              <Mail className="text-primary mx-auto mb-4 h-8 w-8" />
              <h2 className="text-text-primary text-lg font-semibold">{t("contact.title")}</h2>
              <p className="text-text-muted mt-2">{t("contact.description")}</p>
              <a
                href={`mailto:${t("contact.email")}`}
                className="bg-primary text-text-on-accent hover:bg-primary-hover mt-4 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors"
              >
                {t("contact.email")}
              </a>
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
                href="/impressum"
                className="border-border bg-bg-primary text-text-primary hover:bg-bg-secondary inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
              >
                {t("links.impressum")}
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
