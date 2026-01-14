import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Easy Lehrer - Unterrichtsmaterial fur Lehrpersonen",
  description:
    "Entdecken Sie hochwertige Unterrichtsmaterialien fur Schweizer Lehrpersonen",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
