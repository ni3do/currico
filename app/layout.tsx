import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Easy Lehrer - Unterrichtsmaterial fur Lehrpersonen",
  description:
    "Entdecken Sie hochwertige Unterrichtsmaterialien fur Schweizer Lehrpersonen",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
