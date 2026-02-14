import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isDE = locale === "de";

  return {
    title: isDE ? "Impressum — Currico" : "Legal Notice — Currico",
    description: isDE
      ? "Impressum und rechtliche Informationen der Currico GmbH – Schweizer Plattform für Unterrichtsmaterialien."
      : "Legal notice and company information for Currico GmbH – Swiss platform for teaching materials.",
    alternates: {
      canonical: `/${locale}/impressum`,
      languages: { de: "/de/impressum", en: "/en/impressum" },
    },
  };
}

export default async function ImpressumLayout({
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
          name: "Impressum",
          item: `${baseUrl}/${locale}/impressum`,
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
