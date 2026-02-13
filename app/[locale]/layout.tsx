import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/i18n/config";
import CookieConsent from "@/components/ui/CookieConsent";
import { SkipToContent } from "@/components/ui/SkipToContent";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

// Force dynamic rendering to avoid prerender errors with client-side hooks
export const dynamic = "force-dynamic";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const localeMetadata: Record<string, { title: string; description: string }> = {
  de: {
    title: "Currico - Unterrichtsmaterial für Lehrpersonen",
    description:
      "Hochwertige Unterrichtsmaterialien von Schweizer Lehrpersonen. Qualitätsgeprüft, Lehrplan 21 konform, zeitsparend.",
  },
  en: {
    title: "Currico - Teaching Materials for Educators",
    description:
      "Quality teaching materials from Swiss educators. Quality-checked, LP21 curriculum-aligned, time-saving.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const meta = localeMetadata[locale] || localeMetadata.de;

  return {
    title: {
      default: meta.title,
      template: "%s | Currico",
    },
    description: meta.description,
    openGraph: {
      type: "website",
      siteName: "Currico",
      locale: locale === "de" ? "de_CH" : "en_US",
      title: meta.title,
      description: meta.description,
      images: [
        {
          url: "/images/hero-teachers.png",
          width: 1000,
          height: 667,
          alt: meta.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: ["/images/hero-teachers.png"],
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        de: "/de",
        en: "/en",
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate that the incoming locale is valid
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for the current locale
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <SkipToContent />
      {children}
      <ScrollToTop />
      <CookieConsent />
    </NextIntlClientProvider>
  );
}
