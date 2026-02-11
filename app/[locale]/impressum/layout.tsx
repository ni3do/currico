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

export default function ImpressumLayout({ children }: { children: React.ReactNode }) {
  return children;
}
