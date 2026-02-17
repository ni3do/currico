import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isDE = locale === "de";

  return {
    title: isDE ? "Registrieren" : "Register",
    description: isDE
      ? "Erstellen Sie Ihr kostenloses Currico-Konto."
      : "Create your free Currico account.",
    alternates: {
      canonical: `/${locale}/registrieren`,
      languages: { de: "/de/registrieren", en: "/en/registrieren" },
    },
  };
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
