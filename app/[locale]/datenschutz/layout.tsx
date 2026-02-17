import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isDE = locale === "de";

  return {
    title: isDE ? "Datenschutz" : "Privacy Policy",
    description: isDE
      ? "Datenschutzerklärung von Currico — wie wir Ihre Daten schützen."
      : "Currico privacy policy — how we protect your data.",
    alternates: {
      canonical: `/${locale}/datenschutz`,
      languages: { de: "/de/datenschutz", en: "/en/datenschutz" },
    },
  };
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
