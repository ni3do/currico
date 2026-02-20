import { prisma } from "@/lib/db";
import { setRequestLocale } from "next-intl/server";
import { toStringArray } from "@/lib/json-array";
import { formatPrice } from "@/lib/utils/price";
import type { FeaturedMaterial } from "@/lib/types/material";
import HomeClient from "./HomeClient";

export const revalidate = 3600; // ISR: revalidate every hour

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  let featured: FeaturedMaterial[] = [];
  let platformStats = { materialCount: 0, sellerCount: 0, downloadCount: 0 };

  try {
    const [materials, stats] = await Promise.all([
      prisma.resource.findMany({
        where: { is_published: true, is_public: true },
        orderBy: { created_at: "desc" },
        take: 3,
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          subjects: true,
          cycles: true,
          tags: true,
          preview_url: true,
          seller: {
            select: {
              id: true,
              display_name: true,
              is_verified_seller: true,
              seller_level: true,
              seller_xp: true,
            },
          },
          reviews: {
            select: { rating: true },
          },
          _count: {
            select: {
              downloads: true,
              transactions: { where: { status: "COMPLETED" } },
            },
          },
          competencies: {
            select: {
              competency: {
                select: {
                  code: true,
                  subject: { select: { color: true } },
                },
              },
            },
          },
        },
      }),
      Promise.all([
        prisma.resource.count({ where: { is_published: true } }),
        prisma.user.count({ where: { role: { in: ["SELLER", "ADMIN"] } } }),
        prisma.download.count(),
      ]).then(([materialCount, sellerCount, downloadCount]) => ({
        materialCount,
        sellerCount,
        downloadCount,
      })),
    ]);

    platformStats = stats;

    featured = materials.map((m) => {
      const subjects = toStringArray(m.subjects);
      const cycles = toStringArray(m.cycles);
      const reviewCount = m.reviews?.length ?? 0;
      const averageRating =
        reviewCount > 0
          ? Math.round((m.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
          : 0;

      return {
        id: m.id,
        title: m.title,
        description: m.description ?? "",
        price: m.price,
        priceFormatted: formatPrice(m.price),
        subjects,
        cycles,
        tags: toStringArray(m.tags),
        previewUrl: m.preview_url,
        averageRating,
        reviewCount,
        downloadCount: m._count.downloads + m._count.transactions,
        competencies: (m.competencies ?? []).map((rc) => ({
          code: rc.competency.code,
          subjectColor: rc.competency.subject.color ?? undefined,
        })),
        seller: {
          id: m.seller.id,
          displayName: m.seller.display_name,
          isVerifiedSeller: m.seller.is_verified_seller,
          sellerLevel: m.seller.seller_level,
          sellerXp: m.seller.seller_xp,
        },
      };
    });
  } catch (error) {
    console.error("Failed to fetch featured materials:", error);
    // Graceful degradation — render homepage with empty featured section
  }

  return <HomeClient initialMaterials={featured} platformStats={platformStats} />;
}
