import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isDE = locale === "de";

  return {
    title: isDE ? "Cookie-Richtlinien — Currico" : "Cookie Policy — Currico",
    description: isDE
      ? "Informationen zu Cookies und Datenschutz auf Currico – erfahren Sie, welche Cookies wir verwenden."
      : "Information about cookies and data privacy on Currico – learn which cookies we use.",
    alternates: {
      canonical: `/${locale}/cookie-richtlinien`,
      languages: { de: "/de/cookie-richtlinien", en: "/en/cookie-richtlinien" },
    },
  };
}

export default function CookieRichtlinienLayout({ children }: { children: React.ReactNode }) {
  return children;
}
