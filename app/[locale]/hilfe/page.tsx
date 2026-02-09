"use client";

import { useState, useMemo } from "react";
import { useTranslations, useMessages } from "next-intl";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn } from "@/components/ui/animations";
import {
  Search,
  ChevronDown,
  Mail,
  MessageCircle,
  ArrowRight,
  ShoppingCart,
  Upload,
  Settings,
  HelpCircle,
  Scale,
  BookOpen,
  FileText,
  ExternalLink,
} from "lucide-react";

type FAQCategory = "general" | "buying" | "selling" | "technical";

interface FAQItem {
  question: string;
  answer: string;
  category: FAQCategory;
  link?: { href: string; label: string };
}

const MAX_QUESTIONS_PER_CATEGORY = 10;

const categoryIcons: Record<FAQCategory, typeof HelpCircle> = {
  general: HelpCircle,
  buying: ShoppingCart,
  selling: Upload,
  technical: Settings,
};

const categoryColors: Record<FAQCategory, { bg: string; text: string; ring: string }> = {
  general: { bg: "bg-primary/10", text: "text-primary", ring: "ring-primary/30" },
  buying: { bg: "bg-accent/10", text: "text-accent", ring: "ring-accent/30" },
  selling: { bg: "bg-success/10", text: "text-success", ring: "ring-success/30" },
  technical: { bg: "bg-info/10", text: "text-info", ring: "ring-info/30" },
};

// Top questions with direct links
const TOP_QUESTIONS: {
  key: string;
  icon: typeof Upload;
  href: string;
  bgColor: string;
  textColor: string;
}[] = [
  {
    key: "upload",
    icon: Upload,
    href: "/upload",
    bgColor: "bg-primary/10",
    textColor: "text-primary",
  },
  {
    key: "copyright",
    icon: Scale,
    href: "/urheberrecht",
    bgColor: "bg-accent/10",
    textColor: "text-accent",
  },
  {
    key: "browse",
    icon: BookOpen,
    href: "/materialien",
    bgColor: "bg-success/10",
    textColor: "text-success",
  },
];

// Useful links config
const USEFUL_LINKS: {
  key: string;
  icon: typeof Scale;
  href: string;
  bgColor: string;
  textColor: string;
  hoverColor: string;
}[] = [
  {
    key: "copyrightGuide",
    icon: Scale,
    href: "/urheberrecht",
    bgColor: "bg-accent/10",
    textColor: "text-accent",
    hoverColor: "group-hover:text-accent",
  },
  {
    key: "terms",
    icon: FileText,
    href: "/terms",
    bgColor: "bg-primary/10",
    textColor: "text-primary",
    hoverColor: "group-hover:text-primary",
  },
  {
    key: "privacy",
    icon: Settings,
    href: "/datenschutz",
    bgColor: "bg-info/10",
    textColor: "text-info",
    hoverColor: "group-hover:text-info",
  },
  {
    key: "impressum",
    icon: HelpCircle,
    href: "/impressum",
    bgColor: "bg-text-muted/10",
    textColor: "text-text-muted",
    hoverColor: "group-hover:text-text",
  },
];

// FAQ items that have an associated link
const FAQ_ITEM_LINKS: Record<string, string> = {
  "general-1": "/materialien",
  "general-4": "/register",
  "general-7": "/contact",
  "buying-1": "/materialien",
  "buying-5": "/account/library",
  "buying-7": "/contact",
  "buying-8": "/account/wishlist",
  "selling-1": "/upload",
  "selling-4": "/urheberrecht",
  "selling-7": "/upload",
  "selling-8": "/account/uploads",
  "technical-1": "/account/library",
  "technical-2": "/contact",
  "technical-4": "/datenschutz",
  "technical-7": "/upload",
};

export default function HilfePage() {
  const t = useTranslations("faqPage");
  const tHilfe = useTranslations("hilfePage");
  const tCommon = useTranslations("common");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FAQCategory>("general");
  const [openId, setOpenId] = useState<string | null>(null);

  // Access raw messages to check key existence without triggering MISSING_MESSAGE errors
  const messages = useMessages();
  const faqMessages = (messages as Record<string, unknown>)?.faqPage as
    | Record<string, Record<string, Record<string, string>>>
    | undefined;

  // Build all FAQ items from translations
  const allFAQItems = useMemo(() => {
    if (!faqMessages) return [];
    const cats: FAQCategory[] = ["general", "buying", "selling", "technical"];
    const items: FAQItem[] = [];

    cats.forEach((category) => {
      const categoryData = faqMessages[category];
      if (!categoryData) return;

      for (let i = 1; i <= MAX_QUESTIONS_PER_CATEGORY; i++) {
        const qData = categoryData[`q${i}`];
        if (!qData?.question || !qData?.answer) break;

        const question = t(`${category}.q${i}.question` as Parameters<typeof t>[0]);
        const answer = t(`${category}.q${i}.answer` as Parameters<typeof t>[0]);

        let link: FAQItem["link"] | undefined;
        const linkHref = FAQ_ITEM_LINKS[`${category}-${i}`];
        if (linkHref && qData.linkLabel) {
          const linkLabel = t(`${category}.q${i}.linkLabel` as Parameters<typeof t>[0]);
          link = { href: linkHref, label: linkLabel };
        }

        items.push({ question, answer, category, link });
      }
    });

    return items;
  }, [t, faqMessages]);

  // Count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<FAQCategory, number> = { general: 0, buying: 0, selling: 0, technical: 0 };
    allFAQItems.forEach((item) => counts[item.category]++);
    return counts;
  }, [allFAQItems]);

  // Filter: when searching, show across ALL categories; otherwise filter by active tab
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      return allFAQItems.filter(
        (item) =>
          item.question.toLowerCase().includes(query) || item.answer.toLowerCase().includes(query)
      );
    }
    return allFAQItems.filter((item) => item.category === activeCategory);
  }, [allFAQItems, activeCategory, searchQuery]);

  const categories: { key: FAQCategory; label: string }[] = [
    { key: "general", label: t("categories.general") },
    { key: "buying", label: t("categories.buying") },
    { key: "selling", label: t("categories.selling") },
    { key: "technical", label: t("categories.technical") },
  ];

  const hasResults = filteredItems.length > 0;
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <Breadcrumb items={[{ label: tCommon("breadcrumb.help") }]} />
          <h1 className="text-text text-2xl font-bold sm:text-3xl">{tHilfe("title")}</h1>
          <p className="text-text-muted mt-1">{tHilfe("subtitle")}</p>
        </div>

        {/* Search Bar */}
        <FadeIn className="mx-auto mb-10 max-w-xl">
          <div className="relative">
            <Search className="text-text-muted pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOpenId(null);
              }}
              placeholder={tHilfe("searchPlaceholder")}
              className="border-border bg-surface text-text placeholder:text-text-muted focus:border-primary focus:ring-primary/20 w-full rounded-xl border py-4 pr-4 pl-12 text-base shadow-sm transition-all duration-200 focus:ring-2 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-text-muted hover:text-text absolute top-1/2 right-4 -translate-y-1/2 text-sm"
              >
                {tHilfe("clearSearch")}
              </button>
            )}
          </div>
        </FadeIn>

        {/* Top Questions */}
        <FadeIn className="mb-12">
          <h2 className="text-text mb-4 text-xl font-semibold">{tHilfe("quickStart.title")}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {TOP_QUESTIONS.map(({ key, icon: Icon, href, bgColor, textColor }) => (
              <div key={key} className="bg-surface border-border rounded-xl border p-5">
                <div
                  className={`${bgColor} mb-3 flex h-10 w-10 items-center justify-center rounded-lg`}
                >
                  <Icon className={`${textColor} h-5 w-5`} />
                </div>
                <h3 className="text-text mb-1.5 text-sm font-semibold">
                  {tHilfe(`quickStart.${key}.question`)}
                </h3>
                <p className="text-text-muted mb-3 line-clamp-2 text-sm leading-relaxed">
                  {tHilfe(`quickStart.${key}.answer`)}
                </p>
                <Link
                  href={href}
                  className={`${textColor} inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80`}
                >
                  {tHilfe(`quickStart.${key}.linkLabel`)}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-text mb-4 text-xl font-semibold">{t("title")}</h2>

          {/* Category Tabs */}
          {!isSearching && (
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {categories.map((category) => {
                  const isActive = activeCategory === category.key;
                  const Icon = categoryIcons[category.key];
                  const colors = categoryColors[category.key];
                  const count = categoryCounts[category.key];

                  return (
                    <button
                      key={category.key}
                      onClick={() => {
                        setActiveCategory(category.key);
                        setOpenId(null);
                      }}
                      className={`rounded-xl border p-4 text-center transition-all duration-200 ${
                        isActive
                          ? `${colors.bg} border-transparent ring-2 ${colors.ring}`
                          : "bg-surface border-border hover:border-border-hover"
                      }`}
                    >
                      <div
                        className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${
                          isActive ? "bg-white/60 dark:bg-white/10" : colors.bg
                        }`}
                      >
                        <Icon className={`${colors.text} h-5 w-5`} />
                      </div>
                      <span
                        className={`block text-sm font-medium ${isActive ? colors.text : "text-text"}`}
                      >
                        {category.label}
                      </span>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${
                          isActive
                            ? "bg-white/60 dark:bg-white/10 " + colors.text
                            : "bg-bg-secondary text-text-muted"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search results header */}
          {isSearching && (
            <div className="mb-4">
              <p className="text-text-muted text-sm">
                {tHilfe("resultsCount", { count: filteredItems.length })}
              </p>
            </div>
          )}

          {/* FAQ Items */}
          {hasResults ? (
            <div className="space-y-3">
              {filteredItems.map((item, index) => {
                const id = `${item.category}-${index}`;
                const isOpen = openId === id;
                const colors = categoryColors[item.category];
                const Icon = categoryIcons[item.category];

                return (
                  <div
                    key={id}
                    className={`bg-surface border-border overflow-hidden rounded-xl border transition-all duration-200 ${
                      isOpen ? `ring-2 ${colors.ring}` : ""
                    }`}
                  >
                    <button
                      onClick={() => setOpenId(isOpen ? null : id)}
                      className="flex w-full items-center justify-between gap-4 p-4 text-left sm:p-5"
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`${colors.bg} flex h-7 w-7 shrink-0 items-center justify-center rounded-lg`}
                        >
                          <Icon className={`${colors.text} h-3.5 w-3.5`} />
                        </div>
                        <span className="text-text text-sm font-medium sm:text-base">
                          {item.question}
                        </span>
                      </div>
                      <ChevronDown
                        className={`text-text-muted h-5 w-5 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="border-border border-t px-4 pt-3 pb-4 sm:px-5 sm:pb-5">
                          <p className="text-text-secondary text-sm leading-relaxed sm:text-base">
                            {item.answer}
                          </p>
                          {item.link && (
                            <Link
                              href={item.link.href}
                              className={`${colors.text} hover:bg-primary/5 mt-3 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium transition-colors`}
                            >
                              {item.link.label}
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          )}
                          {isSearching && (
                            <span
                              className={`${colors.bg} ${colors.text} mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium`}
                            >
                              {t(`categories.${item.category}`)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="bg-bg-secondary mx-auto max-w-md rounded-2xl p-8">
                <div className="bg-accent/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                  <Search className="text-accent h-7 w-7" />
                </div>
                <h3 className="text-text text-lg font-semibold">{tHilfe("noResults.title")}</h3>
                <p className="text-text-muted mt-2 text-sm">{tHilfe("noResults.description")}</p>
                <Link
                  href="/contact"
                  className="bg-primary text-text-on-accent hover:bg-primary-hover mt-5 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200"
                >
                  <MessageCircle className="h-4 w-4" />
                  {tHilfe("noResults.contactButton")}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Useful Links */}
        <FadeIn className="mb-10">
          <h2 className="text-text mb-2 text-center text-xl font-semibold">
            {tHilfe("usefulLinks.title")}
          </h2>
          <p className="text-text-muted mb-6 text-center text-sm">
            {tHilfe("usefulLinks.subtitle")}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {USEFUL_LINKS.map(({ key, icon: Icon, href, bgColor, textColor, hoverColor }) => (
              <Link
                key={key}
                href={href}
                className="card group flex flex-col items-center p-5 text-center transition-all hover:shadow-md"
              >
                <div
                  className={`${bgColor} mb-3 flex h-10 w-10 items-center justify-center rounded-lg`}
                >
                  <Icon className={`${textColor} h-5 w-5`} />
                </div>
                <p className={`text-text text-sm font-semibold ${hoverColor}`}>
                  {tHilfe(`usefulLinks.${key}`)}
                </p>
                <p className="text-text-muted mt-1 text-xs">{tHilfe(`usefulLinks.${key}Desc`)}</p>
              </Link>
            ))}
          </div>
        </FadeIn>

        {/* Contact CTA */}
        <FadeIn className="mb-8">
          <div className="bg-primary/5 border-primary/20 rounded-2xl border p-6 text-center sm:p-8">
            <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
              <Mail className="text-primary h-6 w-6" />
            </div>
            <h2 className="text-text text-xl font-semibold">{t("contact.title")}</h2>
            <p className="text-text-muted mx-auto mt-2 max-w-sm text-sm">
              {t("contact.description")}
            </p>
            <Link
              href="/contact"
              className="bg-primary text-text-on-accent hover:bg-primary-hover mt-4 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              {t("contact.button")}
            </Link>
          </div>
        </FadeIn>
      </main>

      <Footer />
    </div>
  );
}
