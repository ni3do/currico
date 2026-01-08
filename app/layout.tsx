import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Schwer Lehrer - Unterrichtsmaterial für Lehrpersonen",
  description:
    "Entdecken Sie hochwertige Unterrichtsmaterialien für Schweizer Schulen",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="antialiased">{children}</body>
    </html>
  );
}
