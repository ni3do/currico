import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isDE = locale === "de";

  return {
    title: isDE ? "Verkäufer-Levels — Currico" : "Seller Levels — Currico",
    description: isDE
      ? "Erfahre, wie das Punkte- und Level-System für Verkäufer:innen auf Currico funktioniert. Sammle Punkte durch Uploads und Downloads."
      : "Learn how the points and level system for sellers on Currico works. Earn points through uploads and downloads.",
    alternates: {
      canonical: `/${locale}/verkaeufer-stufen`,
      languages: { de: "/de/verkaeufer-stufen", en: "/en/verkaeufer-stufen" },
    },
  };
}

export default async function SellerLevelsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://currico.ch";

  const jsonLd = {
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
        name: locale === "de" ? "Verkäufer-Levels" : "Seller Levels",
        item: `${baseUrl}/${locale}/verkaeufer-stufen`,
      },
    ],
  };

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
