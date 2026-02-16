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

  const isDE = locale === "de";

  const breadcrumbLd = {
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
        name: isDE ? "Verkäufer-Levels" : "Seller Levels",
        item: `${baseUrl}/${locale}/verkaeufer-stufen`,
      },
    ],
  };

  const levelsLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: isDE ? "Currico Verkäufer-Levels" : "Currico Seller Levels",
    description: isDE
      ? "Die 5 Verkäufer-Levels auf Currico — von Bronze bis Diamant."
      : "The 5 seller levels on Currico — from Bronze to Diamond.",
    numberOfItems: 5,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Bronze",
        description: isDE ? "Einstiegslevel — ab 0 Punkten" : "Entry level — from 0 points",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: isDE ? "Silber" : "Silver",
        description: isDE
          ? "Ab 50 Punkten, 3 Uploads und 5 Downloads"
          : "From 50 points, 3 uploads and 5 downloads",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Gold",
        description: isDE
          ? "Ab 250 Punkten, 8 Uploads und 25 Downloads"
          : "From 250 points, 8 uploads and 25 downloads",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: isDE ? "Platin" : "Platinum",
        description: isDE
          ? "Ab 750 Punkten, 15 Uploads und 75 Downloads"
          : "From 750 points, 15 uploads and 75 downloads",
      },
      {
        "@type": "ListItem",
        position: 5,
        name: isDE ? "Diamant" : "Diamond",
        description: isDE
          ? "Ab 2500 Punkten, 30 Uploads und 200 Downloads"
          : "From 2500 points, 30 uploads and 200 downloads",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(levelsLd) }}
      />
      {children}
    </>
  );
}
