"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  Upload,
  Shield,
  BookOpen,
  FileText,
  Lock,
  Building2,
  Mail,
  Search,
  X,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

const FAQ_TAB_STORAGE_KEY = "hilfe-faq-tab";

const faqCategories = [
  { key: "general", count: 7 },
  { key: "buying", count: 8 },
  { key: "selling", count: 8 },
  { key: "technical", count: 7 },
] as const;

type FaqCategoryKey = (typeof faqCategories)[number]["key"];

function getAllFaqItems(tFaq: ReturnType<typeof useTranslations>) {
  const items: { key: string; category: string; question: string; answer: string }[] = [];
  for (const { key: cat, count } of faqCategories) {
    for (let i = 1; i <= count; i++) {
      const qKey = `${cat}.q${i}`;
      items.push({
        key: qKey,
        category: cat,
        question: tFaq(`${qKey}.question`),
        answer: tFaq(`${qKey}.answer`),
      });
    }
  }
  return items;
}

export default function HilfePage() {
  const t = useTranslations("hilfePage");
  const tFaq = useTranslations("faqPage");
  const tCommon = useTranslations("common");
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window === "undefined") return "general";
    const saved = localStorage.getItem(FAQ_TAB_STORAGE_KEY);
    return saved && faqCategories.some(({ key }) => key === saved) ? saved : "general";
  });
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Persist active tab to localStorage
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setOpenFaq(null);
    setSearchQuery("");
    localStorage.setItem(FAQ_TAB_STORAGE_KEY, key);
  };

  const allFaqItems = useMemo(() => getAllFaqItems(tFaq), [tFaq]);

  const isSearching = searchQuery.trim().length > 0;
  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const terms = searchQuery.toLowerCase().trim().split(/\s+/);
    return allFaqItems.filter((item) => {
      const text = `${item.question} ${item.answer}`.toLowerCase();
      return terms.every((term) => text.includes(term));
    });
  }, [searchQuery, isSearching, allFaqItems]);

  const quickStartItems = [
    {
      key: "upload" as const,
      icon: <Upload className="text-primary h-5 w-5" />,
      linkHref: "/registrieren" as const,
    },
    {
      key: "copyright" as const,
      icon: <Shield className="text-success h-5 w-5" />,
      linkHref: "/urheberrecht" as const,
    },
    {
      key: "browse" as const,
      icon: <BookOpen className="text-primary h-5 w-5" />,
      linkHref: "/materialien" as const,
    },
  ];

  const usefulLinks = [
    {
      key: "copyrightGuide" as const,
      icon: <Shield className="text-success h-5 w-5" />,
      href: "/urheberrecht" as const,
    },
    {
      key: "terms" as const,
      icon: <FileText className="text-primary h-5 w-5" />,
      href: "/agb" as const,
    },
    {
      key: "privacy" as const,
      icon: <Lock className="text-primary h-5 w-5" />,
      href: "/datenschutz" as const,
    },
    {
      key: "impressum" as const,
      icon: <Building2 className="text-text-muted h-5 w-5" />,
      href: "/impressum" as const,
    },
  ];

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <Breadcrumb items={[{ label: tCommon("footer.links.help") }]} />
          <h1 className="text-text text-2xl font-bold sm:text-3xl">{t("title")}</h1>
          <p className="text-text-muted mt-1">{t("subtitle")}</p>
        </div>

        {/* Quick Start */}
        <section className="mb-12">
          <h2 className="text-text mb-6 text-xl font-semibold">{t("quickStart.title")}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {quickStartItems.map((item) => (
              <div key={item.key} className="border-border bg-surface rounded-xl border p-5">
                <div className="mb-3">{item.icon}</div>
                <h3 className="text-text mb-2 font-semibold">
                  {t(`quickStart.${item.key}.question`)}
                </h3>
                <p className="text-text-muted mb-4 text-sm">{t(`quickStart.${item.key}.answer`)}</p>
                <Link
                  href={item.linkHref}
                  className="text-primary inline-flex items-center text-sm font-medium hover:underline"
                >
                  {t(`quickStart.${item.key}.linkLabel`)}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Useful Links */}
        <section className="mb-12">
          <h2 className="text-text mb-2 text-xl font-semibold">{t("usefulLinks.title")}</h2>
          <p className="text-text-muted mb-6">{t("usefulLinks.subtitle")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {usefulLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="border-border bg-surface hover:bg-bg-secondary flex items-start gap-4 rounded-xl border p-5 transition-colors"
              >
                <div className="mt-0.5">{link.icon}</div>
                <div>
                  <h3 className="text-text font-semibold">{t(`usefulLinks.${link.key}`)}</h3>
                  <p className="text-text-muted mt-1 text-sm">{t(`usefulLinks.${link.key}Desc`)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-text mb-2 text-xl font-semibold">{tFaq("title")}</h2>
          <p className="text-text-muted mb-6">{tFaq("subtitle")}</p>

          {/* Search */}
          <div className="relative mb-6">
            <Search
              className="text-text-muted pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="border-border bg-surface text-text placeholder:text-text-muted focus:border-primary focus:ring-primary w-full rounded-lg border py-2.5 pr-10 pl-10 text-sm focus:ring-1 focus:outline-none"
              aria-label={t("searchPlaceholder")}
            />
            {isSearching && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-text-muted hover:text-text absolute top-1/2 right-3 -translate-y-1/2"
                aria-label={t("clearSearch")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search results count */}
          {isSearching && (
            <p className="text-text-muted mb-4 text-sm">
              {t("resultsCount", { count: searchResults.length })}
            </p>
          )}

          {/* Category Tabs — hidden during search */}
          {!isSearching && (
            <div className="mb-6 flex flex-wrap gap-2" role="tablist">
              {faqCategories.map(({ key }) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={activeTab === key}
                  onClick={() => handleTabChange(key)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === key
                      ? "bg-primary text-text-on-accent"
                      : "bg-surface border-border text-text hover:bg-bg-secondary border"
                  }`}
                >
                  {tFaq(`categories.${key}`)}
                </button>
              ))}
            </div>
          )}

          {/* Questions */}
          <div className="divide-border border-border min-h-[400px] divide-y rounded-xl border">
            {isSearching ? (
              searchResults.length > 0 ? (
                searchResults.map((item) => {
                  const isOpen = openFaq === item.key;
                  return (
                    <div key={item.key}>
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : item.key)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                      >
                        <div>
                          <span className="text-text font-medium">{item.question}</span>
                          <span className="text-text-muted ml-2 text-xs">
                            {tFaq(`categories.${item.category as FaqCategoryKey}`)}
                          </span>
                        </div>
                        <ChevronDown
                          className={`text-text-muted h-5 w-5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {isOpen && (
                        <div className="text-text-muted px-5 pb-4 text-sm leading-relaxed">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center p-8">
                  <p className="text-text-muted text-sm">{t("noResults.description")}</p>
                </div>
              )
            ) : (
              faqCategories
                .filter(({ key }) => key === activeTab)
                .map(({ key: cat, count }) =>
                  Array.from({ length: count }, (_, i) => {
                    const qKey = `${cat}.q${i + 1}`;
                    const isOpen = openFaq === qKey;
                    return (
                      <div key={qKey}>
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : qKey)}
                          aria-expanded={isOpen}
                          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                        >
                          <span className="text-text font-medium">{tFaq(`${qKey}.question`)}</span>
                          <ChevronDown
                            className={`text-text-muted h-5 w-5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        </button>
                        {isOpen && (
                          <div className="text-text-muted px-5 pb-4 text-sm leading-relaxed">
                            {tFaq(`${qKey}.answer`)}
                          </div>
                        )}
                      </div>
                    );
                  })
                )
            )}
          </div>
        </section>

        {/* Contact CTA */}
        <div className="border-border bg-bg-secondary rounded-xl border p-6 text-center">
          <Mail className="text-primary mx-auto mb-4 h-8 w-8" />
          <h2 className="text-text text-lg font-semibold">{t("noResults.title")}</h2>
          <p className="text-text-muted mt-2">{t("noResults.description")}</p>
          <a
            href={`mailto:${t("noResults.contactEmail")}`}
            className="bg-primary text-text-on-accent hover:bg-primary-hover mt-4 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors"
          >
            {t("noResults.contactButton")}
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
