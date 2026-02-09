import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isDE = locale === "de";

  return {
    title: isDE ? "Urheberrechts-Leitfaden für Lehrpersonen" : "Copyright Guide for Teachers",
    description: isDE
      ? "Was darf ich als Lehrperson verkaufen? Unser Leitfaden erklärt Urheberrecht, Creative-Commons-Lizenzen, KI-Inhalte und häufige Fehler — verständlich und praxisnah."
      : "What can I sell as a teacher? Our guide explains copyright, Creative Commons licenses, AI content, and common mistakes — clearly and practically.",
    alternates: {
      canonical: `/${locale}/urheberrecht`,
      languages: { de: "/de/urheberrecht", en: "/en/urheberrecht" },
    },
    openGraph: {
      title: isDE ? "Urheberrechts-Leitfaden für Lehrpersonen" : "Copyright Guide for Teachers",
      description: isDE
        ? "Alles, was Schweizer Lehrpersonen über Urheberrecht beim Verkauf von Unterrichtsmaterialien wissen müssen."
        : "Everything Swiss teachers need to know about copyright when selling teaching materials.",
      type: "article",
    },
  };
}

export default function CopyrightGuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
