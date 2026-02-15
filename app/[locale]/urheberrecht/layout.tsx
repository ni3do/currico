import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isDE = locale === "de";

  return {
    title: isDE ? "Urheberrechts-Leitfaden für Lehrpersonen" : "Copyright Guide for Teachers",
    description: isDE
      ? "Was darf ich als Lehrperson verkaufen? Unser Leitfaden erklärt Urheberrecht, Creative-Commons-Lizenzen, KI-Inhalte und häufige Fehler — verständlich und praxisnah."
      : "What can I sell as a teacher? Our guide explains copyright, Creative Commons licenses, AI content, and common mistakes — clearly and practically.",
    alternates: {
      canonical: `/${locale}/urheberrecht`,
      languages: { de: "/de/urheberrecht", en: "/en/urheberrecht" },
    },
    openGraph: {
      title: isDE ? "Urheberrechts-Leitfaden für Lehrpersonen" : "Copyright Guide for Teachers",
      description: isDE
        ? "Alles, was Schweizer Lehrpersonen über Urheberrecht beim Verkauf von Unterrichtsmaterialien wissen müssen."
        : "Everything Swiss teachers need to know about copyright when selling teaching materials.",
      type: "article",
    },
  };
}

export default async function CopyrightGuideLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://currico.ch";
  const isDE = locale === "de";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: isDE ? "Startseite" : "Home",
        item: `${baseUrl}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: isDE ? "Urheberrechts-Leitfaden" : "Copyright Guide",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
