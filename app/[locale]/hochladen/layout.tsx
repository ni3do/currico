import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isDE = locale === "de";

  return {
    title: isDE ? "Material hochladen" : "Upload Material",
    description: isDE
      ? "Lade dein Unterrichtsmaterial hoch und teile es mit Schweizer Lehrpersonen. Kostenlos oder zum Verkauf."
      : "Upload your teaching material and share it with Swiss educators. Free or for sale.",
    robots: { index: false },
    alternates: {
      canonical: `/${locale}/hochladen`,
    },
  };
}

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return children;
}
