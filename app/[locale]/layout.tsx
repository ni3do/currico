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
    title: "Unterrichtsmaterial für Schweizer Lehrpersonen",
    description:
      "Fertige Arbeitsblätter, Prüfungen und Unterrichtseinheiten von Schweizer Lehrpersonen. Von der Community geprüft, Lehrplan 21 konform, zeitsparend.",
  },
  en: {
    title: "Teaching Materials for Swiss Educators",
    description:
      "Ready-made worksheets, exams and lesson plans from Swiss educators. Community-reviewed, LP21 curriculum-aligned, time-saving.",
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

  const baseUrl = process.env.NEXTAUTH_URL || "https://currico.siwachter.com";

  // WebSite schema with SearchAction for Google site search
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Currico",
    url: `${baseUrl}/${locale}`,
    description: localeMetadata[locale]?.description || localeMetadata.de.description,
    inLanguage: locale === "de" ? "de-CH" : "en",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/${locale}/materialien?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <NextIntlClientProvider messages={messages}>
      <SkipToContent />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {children}
      <ScrollToTop />
      <CookieConsent />
    </NextIntlClientProvider>
  );
}
