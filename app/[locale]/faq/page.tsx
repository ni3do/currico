"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { ChevronDown, HelpCircle, Mail } from "lucide-react";

type FAQCategory = "general" | "buying" | "selling" | "technical";

interface FAQItem {
  question: string;
  answer: string;
}

function FAQAccordion({ items, categoryKey }: { items: FAQItem[]; categoryKey: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-border border-border divide-y rounded-lg border">
      {items.map((item, index) => (
        <div key={`${categoryKey}-${index}`}>
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="hover:bg-bg-secondary flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors"
            aria-expanded={openIndex === index}
          >
            <span className="text-text-primary font-medium">{item.question}</span>
            <ChevronDown
              className={`text-text-muted h-5 w-5 shrink-0 transition-transform duration-200 ${
                openIndex === index ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`grid transition-all duration-200 ${
              openIndex === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <p className="text-text-secondary px-5 pb-4">{item.answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FAQPage() {
  const t = useTranslations("faqPage");
  const [activeCategory, setActiveCategory] = useState<FAQCategory>("general");

  const categories: { key: FAQCategory; label: string }[] = [
    { key: "general", label: t("categories.general") },
    { key: "buying", label: t("categories.buying") },
    { key: "selling", label: t("categories.selling") },
    { key: "technical", label: t("categories.technical") },
  ];

  // Get FAQ items for the active category
  const getFAQItems = (category: FAQCategory): FAQItem[] => {
    const count = 5; // Each category has up to 5 questions
    const items: FAQItem[] = [];
    for (let i = 1; i <= count; i++) {
      const questionKey = `${category}.q${i}.question`;
      const answerKey = `${category}.q${i}.answer`;
      // Check if the translation exists (not returning the key)
      const question = t(questionKey as never);
      if (question !== questionKey) {
        items.push({
          question,
          answer: t(answerKey as never),
        });
      }
    }
    return items;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-border bg-bg-secondary border-b">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="bg-accent-subtle flex h-12 w-12 items-center justify-center rounded-full">
                <HelpCircle className="text-primary h-6 w-6" />
              </div>
              <div>
                <h1 className="text-text-primary text-3xl font-bold tracking-tight sm:text-4xl">
                  {t("title")}
                </h1>
                <p className="text-text-muted mt-1">{t("subtitle")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Category Tabs */}
            <div className="mb-8 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    activeCategory === category.key
                      ? "bg-primary text-text-on-accent"
                      : "bg-bg-secondary text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* FAQ Accordion */}
            <FAQAccordion items={getFAQItems(activeCategory)} categoryKey={activeCategory} />
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-bg-secondary py-12">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <Mail className="text-primary mx-auto mb-4 h-8 w-8" />
            <h2 className="text-text-primary text-xl font-semibold">{t("contact.title")}</h2>
            <p className="text-text-muted mt-2">{t("contact.description")}</p>
            <Link
              href="/contact"
              className="bg-primary text-text-on-accent hover:bg-primary-hover mt-4 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors"
            >
              {t("contact.button")}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
