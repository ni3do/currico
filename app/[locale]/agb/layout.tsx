import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isDE = locale === "de";

  return {
    title: isDE ? "Allgemeine Geschäftsbedingungen" : "Terms and Conditions",
    description: isDE
      ? "Allgemeine Geschäftsbedingungen von Currico."
      : "Currico terms and conditions.",
    alternates: {
      canonical: `/${locale}/agb`,
      languages: { de: "/de/agb", en: "/en/agb" },
    },
  };
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
