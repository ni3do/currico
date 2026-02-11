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

export default function SellerLevelsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
