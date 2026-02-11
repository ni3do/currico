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
      ? "Erfahren Sie mehr über Currico – die Schweizer Plattform für Unterrichtsmaterialien."
      : "Learn more about Currico – the Swiss platform for teaching materials.",
    alternates: {
      canonical: `/${locale}/ueber-uns`,
      languages: { de: "/de/ueber-uns", en: "/en/ueber-uns" },
    },
  };
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
