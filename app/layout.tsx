import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import "./globals.css";
import { Providers } from "./providers";
import { DecorationBg } from "@/components/ui/DecorationBg";

export const metadata: Metadata = {
  title: {
    default: "Currico - Unterrichtsmaterial für Lehrpersonen",
    template: "%s | Currico",
  },
  description:
    "Entdecken Sie hochwertige Unterrichtsmaterialien von Schweizer Lehrpersonen. Qualitätsgeprüft, Lehrplan 21 konform, zeitsparend.",
  keywords: [
    "Unterrichtsmaterial",
    "Lehrplan 21",
    "Schweiz",
    "Lehrpersonen",
    "Schule",
    "Lehrmittel",
    "teaching materials",
  ],
  authors: [{ name: "Currico" }],
  creator: "Currico",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://currico.ch"),
  openGraph: {
    type: "website",
    locale: "de_CH",
    alternateLocale: "en_US",
    siteName: "Currico",
    title: "Currico - Unterrichtsmaterial für Lehrpersonen",
    description:
      "Hochwertige Unterrichtsmaterialien von Schweizer Lehrpersonen. Qualitätsgeprüft und Lehrplan 21 konform.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Currico - Unterrichtsmaterial für Lehrpersonen",
    description:
      "Hochwertige Unterrichtsmaterialien von Schweizer Lehrpersonen. Qualitätsgeprüft und Lehrplan 21 konform.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Anti-FOUC script to set theme before React hydrates
const themeScript = `
  (function() {
    try {
      const theme = localStorage.getItem('theme') || 'system';
      const isDark = theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } catch (e) {}
  })();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="geometric-bg relative min-h-screen antialiased">
        <DecorationBg />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
