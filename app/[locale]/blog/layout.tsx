import type { Metadata } from "next";

const BASE_URL = process.env.NEXTAUTH_URL || "https://currico.siwachter.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isDE = locale === "de";

  const title = isDE ? "Blog" : "Blog";
  const description = isDE
    ? "Tipps, Neuigkeiten und Inspiration rund um Unterrichtsmaterial und die Currico-Plattform."
    : "Tips, news, and inspiration about teaching materials and the Currico platform.";

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/blog`,
      languages: {
        de: `${BASE_URL}/de/blog`,
        en: `${BASE_URL}/en/blog`,
      },
    },
    openGraph: {
      title: `${title} | Currico`,
      description,
      type: "website",
      url: `${BASE_URL}/${locale}/blog`,
    },
  };
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
