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
      canonical: `/${locale}/contact`,
      languages: { de: "/de/contact", en: "/en/contact" },
    },
  };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
