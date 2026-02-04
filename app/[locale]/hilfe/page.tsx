"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  FadeIn,
  StaggerChildren,
  StaggerItem,
  MotionCard,
  AnimatedCollapse,
} from "@/components/ui/animations";
import {
  Search,
  ChevronDown,
  Mail,
  MessageCircle,
  ArrowRight,
  Sparkles,
  ShoppingCart,
  Upload,
  Settings,
  HelpCircle,
} from "lucide-react";

type FAQCategory = "general" | "buying" | "selling" | "technical";

interface FAQItem {
  question: string;
  answer: string;
  category: FAQCategory;
}

const categoryIcons: Record<FAQCategory, typeof HelpCircle> = {
  general: Sparkles,
  buying: ShoppingCart,
  selling: Upload,
  technical: Settings,
};

const categoryColors: Record<FAQCategory, { bg: string; text: string }> = {
  general: { bg: "bg-primary/10", text: "text-primary" },
  buying: { bg: "bg-accent/10", text: "text-accent" },
  selling: { bg: "bg-success/10", text: "text-success" },
  technical: { bg: "bg-info/10", text: "text-info" },
};

export default function HilfePage() {
  const t = useTranslations("faqPage");
  const tHilfe = useTranslations("hilfePage");
  const tCommon = useTranslations("common");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FAQCategory>("general");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Get all FAQ items from all categories
  const allFAQItems = useMemo(() => {
    const cats: FAQCategory[] = ["general", "buying", "selling", "technical"];
    const items: FAQItem[] = [];

    cats.forEach((category) => {
      for (let i = 1; i <= 5; i++) {
        const questionKey = `${category}.q${i}.question` as Parameters<typeof t>[0];
        const answerKey = `${category}.q${i}.answer` as Parameters<typeof t>[0];
        try {
          const question = t(questionKey);
          const answer = t(answerKey);
          // Skip if the translation returns the key (meaning it doesn't exist)
          if (question && !question.includes(`.q${i}.`)) {
            items.push({
              question,
              answer,
              category,
            });
          }
        } catch {
          // Key doesn't exist, skip this item
        }
      }
    });

    return items;
  }, [t]);

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    let items = allFAQItems.filter((item) => item.category === activeCategory);

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.question.toLowerCase().includes(query) || item.answer.toLowerCase().includes(query)
      );
    }

    return items;
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

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <Breadcrumb items={[{ label: tCommon("breadcrumb.help") }]} />
          <h1 className="text-text text-2xl font-bold">{tHilfe("title")}</h1>
          <p className="text-text-muted mt-1">{tHilfe("subtitle")}</p>
        </div>

        {/* Search Field */}
        <FadeIn className="mb-8">
          <div className="relative">
            <Search className="text-text-muted pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOpenIndex(null);
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

        {/* Category Filter */}
        <div className="border-border mb-8 border-b">
          <div className="flex gap-2 overflow-x-auto pb-4 sm:justify-center">
            {categories.map((category) => {
              const isActive = activeCategory === category.key;
              const Icon = categoryIcons[category.key];
              const colors = categoryColors[category.key];

              return (
                <button
                  key={category.key}
                  onClick={() => {
                    setActiveCategory(category.key);
                    setOpenIndex(null);
                  }}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? `${colors.bg} ${colors.text} ring-2 ring-current/20`
                      : "text-text-secondary hover:bg-bg-secondary hover:text-text"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Results */}
        <div>
          {hasResults ? (
            <>
              {isSearching && (
                <FadeIn className="mb-6">
                  <p className="text-text-muted text-sm">
                    {tHilfe("resultsCount", { count: filteredItems.length })}
                  </p>
                </FadeIn>
              )}

              <StaggerChildren className="space-y-3">
                {filteredItems.map((item, index) => {
                  const isOpen = openIndex === index;
                  const colors = categoryColors[activeCategory];

                  return (
                    <StaggerItem key={`${item.category}-${item.question.slice(0, 20)}`}>
                      <MotionCard
                        hoverEffect="none"
                        className={`card overflow-hidden transition-all duration-200 ${
                          isOpen ? "ring-primary/30 ring-2" : ""
                        }`}
                      >
                        <button
                          onClick={() => setOpenIndex(isOpen ? null : index)}
                          className="flex w-full items-center justify-between gap-4 p-4 text-left sm:p-5"
                          aria-expanded={isOpen}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`${colors.bg} flex h-8 w-8 shrink-0 items-center justify-center rounded-lg`}
                            >
                              <span className={`${colors.text} text-sm font-bold`}>
                                {index + 1}
                              </span>
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
                        <AnimatedCollapse isOpen={isOpen}>
                          <div className="border-border border-t px-4 pt-3 pb-4 sm:px-5 sm:pb-5">
                            <p className="text-text-secondary text-sm leading-relaxed sm:text-base">
                              {item.answer}
                            </p>
                          </div>
                        </AnimatedCollapse>
                      </MotionCard>
                    </StaggerItem>
                  );
                })}
              </StaggerChildren>
            </>
          ) : (
            /* No Results - Contact CTA */
            <FadeIn className="py-8 text-center">
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
            </FadeIn>
          )}
        </div>

        {/* Contact CTA */}
        <FadeIn className="mt-12">
          <div className="card relative overflow-hidden p-6 text-center sm:p-8">
            <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
              <Mail className="text-primary h-6 w-6" />
            </div>
            <h2 className="text-text text-xl font-bold">{t("contact.title")}</h2>
            <p className="text-text-muted mx-auto mt-2 max-w-sm text-sm">
              {t("contact.description")}
            </p>
            <Link
              href="/contact"
              className="text-primary mt-4 inline-flex items-center gap-1 text-sm font-medium hover:underline"
            >
              {t("contact.button")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </FadeIn>
      </main>

      <Footer />
    </div>
  );
}
