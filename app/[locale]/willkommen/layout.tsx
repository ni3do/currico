import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Willkommen",
  robots: { index: false },
};

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
