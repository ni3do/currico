import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Currico - Unterrichtsmaterial für Lehrpersonen",
  description:
    "Entdecken Sie hochwertige Unterrichtsmaterialien für Schweizer Lehrpersonen",
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
