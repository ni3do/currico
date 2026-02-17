import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isDE = locale === "de";

  return {
    title: isDE ? "Verkäufer werden" : "Become a Seller",
    description: isDE
      ? "Werden Sie Verkäufer auf Currico und teilen Sie Ihre Unterrichtsmaterialien."
      : "Become a seller on Currico and share your teaching materials.",
    alternates: {
      canonical: `/${locale}/verkaeufer-werden`,
      languages: { de: "/de/verkaeufer-werden", en: "/en/verkaeufer-werden" },
    },
  };
}

export default function BecomeSellerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
