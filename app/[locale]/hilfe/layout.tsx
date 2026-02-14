import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

const FAQ_CATEGORIES = [
  { key: "general", count: 7 },
  { key: "buying", count: 8 },
  { key: "selling", count: 8 },
  { key: "technical", count: 7 },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isDE = locale === "de";

  return {
    title: isDE ? "Hilfe & FAQ — Currico" : "Help & FAQ — Currico",
    description: isDE
      ? "Häufig gestellte Fragen und Hilfe rund um Currico – die Schweizer Plattform für Unterrichtsmaterialien."
      : "Frequently asked questions and help for Currico – the Swiss platform for teaching materials.",
    alternates: {
      canonical: `/${locale}/hilfe`,
      languages: { de: "/de/hilfe", en: "/en/hilfe" },
    },
  };
}

export default async function HilfeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tFaq = await getTranslations({ locale, namespace: "faqPage" });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://currico.ch";

  // Build FAQPage schema from all categories
  const mainEntity: object[] = [];
  for (const { key, count } of FAQ_CATEGORIES) {
    for (let i = 1; i <= count; i++) {
      mainEntity.push({
        "@type": "Question",
        name: tFaq(`${key}.q${i}.question`),
        acceptedAnswer: {
          "@type": "Answer",
          text: tFaq(`${key}.q${i}.answer`),
        },
      });
    }
  }

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: locale === "de" ? "Startseite" : "Home",
          item: `${baseUrl}/${locale}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: locale === "de" ? "Hilfe & FAQ" : "Help & FAQ",
          item: `${baseUrl}/${locale}/hilfe`,
        },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
