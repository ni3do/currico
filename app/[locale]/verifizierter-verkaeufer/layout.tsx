import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isDE = locale === "de";

  return {
    title: isDE ? "Verifizierter Verkäufer — Currico" : "Verified Seller — Currico",
    description: isDE
      ? "Erfahren Sie, wie Sie verifizierter Verkäufer auf Currico werden und welche Vorteile das bietet."
      : "Learn how to become a verified seller on Currico and what benefits it provides.",
    alternates: {
      canonical: `/${locale}/verifizierter-verkaeufer`,
      languages: { de: "/de/verifizierter-verkaeufer", en: "/en/verifizierter-verkaeufer" },
    },
  };
}

export default function VerifizierterVerkaeuferLayout({ children }: { children: React.ReactNode }) {
  return children;
}
