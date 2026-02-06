import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isDE = locale === "de";

  return {
    title: isDE ? "Materialien durchsuchen" : "Browse Materials",
    description: isDE
      ? "Unterrichtsmaterialien für den Schweizer Lehrplan 21 durchsuchen. Filtern nach Fachbereich, Zyklus und mehr."
      : "Browse teaching materials for the Swiss LP21 curriculum. Filter by subject, cycle, and more.",
    openGraph: {
      title: isDE ? "Materialien | Currico" : "Materials | Currico",
      description: isDE
        ? "Unterrichtsmaterialien für den Schweizer Lehrplan 21 durchsuchen."
        : "Browse teaching materials for the Swiss LP21 curriculum.",
    },
    alternates: {
      canonical: `/${locale}/materialien`,
      languages: {
        de: "/de/materialien",
        en: "/en/materialien",
      },
    },
  };
}

export default function MaterialsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
