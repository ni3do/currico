import { cache } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { toStringArray } from "@/lib/json-array";
import { SELLER_LEVELS } from "@/lib/utils/seller-levels";

// Translated level names for SSR metadata (can't use useTranslations in server components)
const LEVEL_NAMES: Record<string, Record<string, string>> = {
  de: {
    bronze: "Bronze",
    silber: "Silber",
    gold: "Gold",
    platin: "Platin",
    diamant: "Diamant",
  },
  en: {
    bronze: "Bronze",
    silber: "Silver",
    gold: "Gold",
    platin: "Platinum",
    diamant: "Diamond",
  },
};

/**
 * Cached profile query shared between generateMetadata and the layout component.
 * React cache() deduplicates this within a single request.
 */
const getProfile = cache(async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      name: true,
      display_name: true,
      image: true,
      bio: true,
      subjects: true,
      is_private: true,
      seller_level: true,
      is_verified_seller: true,
      _count: {
        select: {
          resources: { where: { is_published: true, is_public: true } },
        },
      },
    },
  });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const isDE = locale === "de";

  try {
    const profile = await getProfile(id);

    if (!profile) {
      return {
        title: isDE ? "Profil nicht gefunden" : "Profile not found",
      };
    }

    const displayName = profile.display_name || profile.name || (isDE ? "Benutzer" : "User");
    const levelDef = SELLER_LEVELS[profile.seller_level] ?? SELLER_LEVELS[0];
    const levelName = LEVEL_NAMES[locale]?.[levelDef.name] ?? levelDef.name;
    const materialCount = profile._count.resources;

    const description = profile.is_private
      ? isDE
        ? `${displayName} auf Currico — ${materialCount} Materialien`
        : `${displayName} on Currico — ${materialCount} materials`
      : profile.bio?.slice(0, 160) ||
        (isDE
          ? `${displayName} auf Currico — ${levelName}, ${materialCount} Materialien`
          : `${displayName} on Currico — ${levelName}, ${materialCount} materials`);

    const subjects = toStringArray(profile.subjects);
    const keywords = [
      displayName,
      "Currico",
      isDE ? "Unterrichtsmaterial" : "Teaching materials",
      ...subjects.slice(0, 5),
    ];

    return {
      title: displayName,
      description,
      keywords,
      openGraph: {
        title: `${displayName} | Currico`,
        description,
        type: "profile",
        ...(profile.image && {
          images: [
            {
              url: profile.image,
              width: 200,
              height: 200,
              alt: displayName,
            },
          ],
        }),
      },
      twitter: {
        card: "summary",
        title: `${displayName} | Currico`,
        description,
        ...(profile.image && { images: [profile.image] }),
      },
      alternates: {
        canonical: `/${locale}/profil/${id}`,
        languages: {
          de: `/de/profil/${id}`,
          en: `/en/profil/${id}`,
        },
      },
    };
  } catch {
    return {
      title: isDE ? "Profil" : "Profile",
    };
  }
}

export default async function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  let jsonLd: object | null = null;

  try {
    const profile = await getProfile(id);

    if (profile) {
      const displayName =
        profile.display_name || profile.name || (locale === "de" ? "Benutzer" : "User");
      const subjects = toStringArray(profile.subjects);
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://currico.ch";

      // Person schema
      const personSchema: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "Person",
        name: displayName,
        url: `${baseUrl}/${locale}/profil/${id}`,
        ...(profile.image && { image: profile.image }),
        ...(profile.bio && !profile.is_private && { description: profile.bio.slice(0, 500) }),
        ...(subjects.length > 0 &&
          !profile.is_private && {
            knowsAbout: subjects,
          }),
      };

      if (profile.is_verified_seller) {
        personSchema.hasCredential = {
          "@type": "EducationalOccupationalCredential",
          credentialCategory: "Verified Seller",
        };
      }

      // BreadcrumbList schema
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: locale === "de" ? "Startseite" : "Home",
            item: `${baseUrl}/${locale}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: locale === "de" ? "Materialien" : "Materials",
            item: `${baseUrl}/${locale}/materialien`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: displayName,
          },
        ],
      };

      jsonLd = [personSchema, breadcrumbSchema];
    }
  } catch {
    // Structured data is non-critical — fail silently
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
