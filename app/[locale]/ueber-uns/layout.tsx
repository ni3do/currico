import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isDE = locale === "de";

  return {
    title: isDE ? "Über uns" : "About Us",
    description: isDE
      ? "Lerne Simon und Laurent kennen — die zwei Schweizer hinter Currico. Erfahre, wie aus einer Idee am Küchentisch eine Plattform für Lehrpersonen wurde."
      : "Meet Simon and Laurent — the two Swiss founders behind Currico. Learn how a kitchen table idea became a platform for teachers.",
    alternates: {
      canonical: `/${locale}/ueber-uns`,
      languages: { de: "/de/ueber-uns", en: "/en/ueber-uns" },
    },
  };
}

export default async function AboutLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://currico.ch";

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Currico",
      legalName: "Angle Labs GmbH",
      url: "https://www.currico.ch",
      email: "info@currico.ch",
      foundingDate: "2022-06-27",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Zellmatte 6",
        postalCode: "6214",
        addressLocality: "Schenkon",
        addressCountry: "CH",
      },
      vatID: "CHE-216.579.392",
      description:
        locale === "de"
          ? "Schweizer Plattform für Lehrpersonen zum Kaufen und Verkaufen von Unterrichtsmaterialien."
          : "Swiss platform for teachers to buy and sell teaching materials.",
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
          name: locale === "de" ? "Über uns" : "About Us",
          item: `${baseUrl}/${locale}/ueber-uns`,
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
