"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Cookie, Shield, BarChart3, Settings, Mail, HardDrive, List, X } from "lucide-react";
import { APP_COOKIES, APP_LOCAL_STORAGE } from "@/lib/constants/cookies";

const TOC_SECTIONS = ["what", "howWeUse", "types", "localStorage", "managing", "changes"] as const;

export default function CookiesPage() {
  const t = useTranslations("cookiesPage");
  const tCommon = useTranslations("common");

  const essentialCookies = APP_COOKIES.filter((c) => c.type === "essential");
  const analyticsCookies = APP_COOKIES.filter((c) => c.type === "analytics");

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
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      });
    }
  }, []);

  /** Shared TOC link list used by both desktop sidebar and mobile overlay */
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
          <Breadcrumb items={[{ label: tCommon("footer.links.cookies") }]} />
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

            <div className="space-y-10">
              {/* Section 1: What Are Cookies */}
              <section
                id="section-what"
                aria-labelledby="heading-what"
                className="scroll-mt-[var(--header-offset)]"
              >
                <h2 id="heading-what" className="text-text text-xl font-semibold">
                  {t("sections.what.title")}
                </h2>
                <p className="text-text-secondary mt-2">{t("sections.what.content")}</p>
              </section>

              {/* Section 2: How We Use Cookies */}
              <section
                id="section-howWeUse"
                aria-labelledby="heading-howWeUse"
                className="scroll-mt-[var(--header-offset)]"
              >
                <h2 id="heading-howWeUse" className="text-text text-xl font-semibold">
                  {t("sections.howWeUse.title")}
                </h2>
                <p className="text-text-secondary mt-2">{t("sections.howWeUse.content")}</p>
              </section>

              {/* Section 3: Types of Cookies */}
              <section
                id="section-types"
                aria-labelledby="heading-types"
                className="scroll-mt-[var(--header-offset)]"
              >
                <h2 id="heading-types" className="text-text text-xl font-semibold">
                  {t("sections.types.title")}
                </h2>

                {/* Essential Cookies */}
                <div className="border-success/30 bg-success/5 mt-4 rounded-xl border border-l-4 p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="text-success h-5 w-5" aria-hidden="true" />
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

                  <dl className="divide-border-subtle divide-y">
                    {essentialCookies.map((cookie) => (
                      <div key={cookie.name} className="flex items-start gap-3 py-3">
                        <Cookie
                          className="text-success/60 mt-0.5 h-4 w-4 shrink-0"
                          aria-hidden="true"
                        />
                        <div className="flex-1">
                          <dt className="text-text text-sm font-medium">
                            <code className="bg-success/10 rounded px-1.5 py-0.5 text-xs">
                              {cookie.name}
                            </code>
                          </dt>
                          <dd className="text-text-muted mt-0.5 text-sm">
                            {t(`sections.types.essential.cookies.${cookie.purposeKey}`)}
                          </dd>
                          <dd className="text-text-faint mt-0.5 text-xs">
                            {t("sections.types.table.duration")}:{" "}
                            {t(`sections.types.table.${cookie.durationKey}`)}
                          </dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                </div>

                {/* Analytics Cookies */}
                <div className="border-primary/30 bg-primary/5 mt-4 rounded-xl border border-l-4 p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="text-primary h-5 w-5" aria-hidden="true" />
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
                  {analyticsCookies.length === 0 && (
                    <p className="text-text-muted text-sm italic">
                      {t("sections.types.analytics.note")}
                    </p>
                  )}
                  {analyticsCookies.length > 0 && (
                    <dl className="divide-border-subtle divide-y">
                      {analyticsCookies.map((cookie) => (
                        <div key={cookie.name} className="flex items-start gap-3 py-3">
                          <Cookie
                            className="text-primary/60 mt-0.5 h-4 w-4 shrink-0"
                            aria-hidden="true"
                          />
                          <div className="flex-1">
                            <dt className="text-text text-sm font-medium">
                              <code className="bg-primary/10 rounded px-1.5 py-0.5 text-xs">
                                {cookie.name}
                              </code>
                            </dt>
                            <dd className="text-text-muted mt-0.5 text-sm">
                              {t(`sections.types.analytics.cookies.${cookie.purposeKey}`)}
                            </dd>
                          </div>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              </section>

              {/* Section 4: Local Storage */}
              <section
                id="section-localStorage"
                aria-labelledby="heading-localStorage"
                className="scroll-mt-[var(--header-offset)]"
              >
                <h2 id="heading-localStorage" className="text-text text-xl font-semibold">
                  {t("sections.localStorage.title")}
                </h2>
                <p className="text-text-secondary mt-2">{t("sections.localStorage.content")}</p>

                <div className="border-border bg-surface mt-4 rounded-xl border p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <HardDrive className="text-text-muted h-5 w-5" aria-hidden="true" />
                    <h3 className="text-text text-lg font-semibold">
                      {t("sections.localStorage.subtitle")}
                    </h3>
                  </div>

                  <dl className="divide-border-subtle divide-y">
                    {APP_LOCAL_STORAGE.map((item) => (
                      <div key={item.name} className="flex items-start gap-3 py-3">
                        <HardDrive
                          className="text-text-faint mt-0.5 h-4 w-4 shrink-0"
                          aria-hidden="true"
                        />
                        <div className="flex-1">
                          <dt className="text-text text-sm font-medium">
                            <code className="bg-bg-secondary rounded px-1.5 py-0.5 text-xs">
                              {item.name}
                            </code>
                          </dt>
                          <dd className="text-text-muted mt-0.5 text-sm">
                            {t(`sections.localStorage.items.${item.purposeKey}`)}
                          </dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                </div>
              </section>

              {/* Section 5: Managing Preferences */}
              <section
                id="section-managing"
                aria-labelledby="heading-managing"
                className="scroll-mt-[var(--header-offset)]"
              >
                <h2 id="heading-managing" className="text-text text-xl font-semibold">
                  {t("sections.managing.title")}
                </h2>
                <p className="text-text-secondary mt-2">{t("sections.managing.content")}</p>
                <p className="text-text-secondary mt-2 flex items-center gap-1">
                  <Settings className="h-4 w-4" aria-hidden="true" />
                  {t("sections.managing.browser")}
                </p>
              </section>

              {/* Section 6: Changes */}
              <section
                id="section-changes"
                aria-labelledby="heading-changes"
                className="scroll-mt-[var(--header-offset)]"
              >
                <h2 id="heading-changes" className="text-text text-xl font-semibold">
                  {t("sections.changes.title")}
                </h2>
                <p className="text-text-secondary mt-2">{t("sections.changes.content")}</p>
              </section>
            </div>

            {/* Contact CTA */}
            <div className="border-border bg-bg-secondary mt-12 rounded-xl border p-6 text-center">
              <Mail className="text-primary mx-auto mb-4 h-8 w-8" aria-hidden="true" />
              <h2 className="text-text text-lg font-semibold">{t("contact.title")}</h2>
              <p className="text-text-muted mt-2">{t("contact.description")}</p>
              <a
                href={`mailto:${t("contact.email")}`}
                className="bg-primary text-text-on-accent hover:bg-primary-hover mt-4 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors"
                title={t("contact.emailTitle")}
              >
                {t("contact.email")}
              </a>
            </div>
          </div>
          {/* close content column */}
        </div>
        {/* close flex container */}
      </main>

      <Footer />

      {/* Mobile/Tablet TOC floating button (visible below lg breakpoint) */}
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

      {/* Mobile/Tablet TOC overlay panel */}
      {mobileTocOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileTocOpen(false)}
            aria-hidden="true"
          />
          {/* Bottom sheet */}
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
