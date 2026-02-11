import type { Metadata } from "next";

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

export default function HilfeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
