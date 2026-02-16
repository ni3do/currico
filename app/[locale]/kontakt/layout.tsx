import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isDE = locale === "de";

  return {
    title: isDE ? "Kontakt" : "Contact",
    description: isDE
      ? "Kontaktieren Sie das Currico-Team. Wir helfen Ihnen gerne weiter."
      : "Contact the Currico team. We're happy to help.",
    alternates: {
      canonical: `/${locale}/kontakt`,
      languages: { de: "/de/kontakt", en: "/en/kontakt" },
    },
  };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Currico Kontakt",
    url: "https://currico.ch/de/kontakt",
    mainEntity: {
      "@type": "Organization",
      name: "Currico",
      url: "https://currico.ch",
      contactPoint: {
        "@type": "ContactPoint",
        email: "info@currico.ch",
        contactType: "customer service",
        availableLanguage: ["German", "English"],
        areaServed: "CH",
      },
    },
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
