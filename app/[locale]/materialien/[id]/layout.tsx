import { cache } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { toStringArray } from "@/lib/json-array";

/**
 * Cached material query shared between generateMetadata and the layout component.
 * React cache() deduplicates this within a single request so both consumers
 * hit the DB only once.
 */
const getMaterial = cache(async (id: string) => {
  return prisma.resource.findUnique({
    where: { id },
    select: {
      title: true,
      description: true,
      price: true,
      preview_url: true,
      subjects: true,
      is_approved: true,
      is_published: true,
      created_at: true,
      seller: {
        select: {
          display_name: true,
        },
      },
      reviews: {
        select: { rating: true },
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
    const material = await getMaterial(id);

    if (!material) {
      return {
        title: isDE ? "Material nicht gefunden" : "Material not found",
      };
    }

    const description = material.description?.slice(0, 160) || "";

    return {
      title: material.title,
      description,
      openGraph: {
        title: `${material.title} | Currico`,
        description,
        type: "article",
        ...(material.preview_url && {
          images: [
            {
              url: material.preview_url,
              width: 1200,
              height: 630,
              alt: material.title,
            },
          ],
        }),
      },
      twitter: {
        card: material.preview_url ? "summary_large_image" : "summary",
        title: material.title,
        description,
        ...(material.preview_url && { images: [material.preview_url] }),
      },
      alternates: {
        canonical: `/${locale}/materialien/${id}`,
        languages: {
          de: `/de/materialien/${id}`,
          en: `/en/materialien/${id}`,
        },
      },
    };
  } catch {
    return {
      title: isDE ? "Material" : "Material",
    };
  }
}

export default async function MaterialDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  let jsonLd: object | null = null;

  try {
    const material = await getMaterial(id);

    if (material && material.is_published) {
      const subjects = toStringArray(material.subjects);
      const primarySubject = subjects[0] || (locale === "de" ? "Materialien" : "Materials");
      const priceInChf = (material.price / 100).toFixed(2);
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://currico.ch";

      // Product schema
      const productSchema: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: material.title,
        description: material.description?.slice(0, 500),
        ...(material.preview_url && { image: material.preview_url }),
        datePublished: material.created_at.toISOString(),
        offers: {
          "@type": "Offer",
          price: priceInChf,
          priceCurrency: "CHF",
          availability: material.is_approved
            ? "https://schema.org/InStock"
            : "https://schema.org/PreOrder",
          seller: {
            "@type": "Person",
            name: material.seller.display_name || (locale === "de" ? "Anonym" : "Anonymous"),
          },
        },
      };

      // AggregateRating — only if reviews exist
      if (material.reviews.length > 0) {
        const sum = material.reviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = sum / material.reviews.length;
        productSchema.aggregateRating = {
          "@type": "AggregateRating",
          ratingValue: avg.toFixed(1),
          bestRating: "5",
          worstRating: "1",
          reviewCount: material.reviews.length,
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
            name: primarySubject,
            item: `${baseUrl}/${locale}/materialien?subject=${encodeURIComponent(primarySubject)}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: material.title,
          },
        ],
      };

      jsonLd = [productSchema, breadcrumbSchema];
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
