import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isDE = locale === "de";

  return {
    title: isDE ? "Anmelden" : "Login",
    description: isDE
      ? "Melden Sie sich bei Ihrem Currico-Konto an."
      : "Sign in to your Currico account.",
    alternates: {
      canonical: `/${locale}/anmelden`,
      languages: { de: "/de/anmelden", en: "/en/anmelden" },
    },
  };
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
