import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isDE = locale === "de";

  return {
    title: isDE ? "Sammlungen" : "Collections",
    description: isDE
      ? "Entdecke kuratierte Sammlungen von Unterrichtsmaterialien für den Schweizer Lehrplan 21."
      : "Discover curated collections of teaching materials for the Swiss LP21 curriculum.",
    alternates: {
      canonical: `/${locale}/sammlungen`,
      languages: {
        de: "/de/sammlungen",
        en: "/en/sammlungen",
      },
    },
  };
}

export default function CollectionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
