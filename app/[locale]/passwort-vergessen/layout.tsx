import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isDE = locale === "de";

  return {
    title: isDE ? "Passwort vergessen" : "Forgot Password",
    description: isDE ? "Setzen Sie Ihr Currico-Passwort zurück." : "Reset your Currico password.",
    alternates: {
      canonical: `/${locale}/passwort-vergessen`,
      languages: { de: "/de/passwort-vergessen", en: "/en/passwort-vergessen" },
    },
  };
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
