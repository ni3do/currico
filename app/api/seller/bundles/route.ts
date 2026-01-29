import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils/price";
import { requireAuth, requireSeller, unauthorized, forbidden } from "@/lib/api";
import { toStringArray } from "@/lib/json-array";

/**
 * GET /api/seller/bundles
 * Get all bundles for the authenticated seller
 */
export async function GET() {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    const seller = await requireSeller(userId);
    if (!seller) return forbidden("Nur für Verkäufer zugänglich");

    const bundles = await prisma.bundle.findMany({
      where: { seller_id: userId },
      include: {
        resources: {
          include: {
            resource: {
              select: {
                id: true,
                title: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const transformedBundles = bundles.map((bundle) => {
      const totalIndividualPrice = bundle.resources.reduce((sum, br) => sum + br.resource.price, 0);
      const savings = totalIndividualPrice - bundle.price;
      const savingsPercent =
        totalIndividualPrice > 0 ? Math.round((savings / totalIndividualPrice) * 100) : 0;

      const subjects = toStringArray(bundle.subject);
      const cycles = toStringArray(bundle.cycle);

      return {
        id: bundle.id,
        title: bundle.title,
        description: bundle.description,
        price: bundle.price,
        priceFormatted: formatPrice(bundle.price, { showFreeLabel: true }),
        subject: subjects[0] || "Allgemein",
        cycle: cycles[0] || "",
        coverImageUrl: bundle.cover_image_url,
        status: bundle.status,
        isPublished: bundle.is_published,
        resourceCount: bundle.resources.length,
        resources: bundle.resources.map((br) => ({
          id: br.resource.id,
          title: br.resource.title,
          price: br.resource.price,
        })),
        totalIndividualPrice,
        savings,
        savingsFormatted: formatPrice(savings, { showFreeLabel: false }),
        savingsPercent,
        createdAt: bundle.created_at,
        updatedAt: bundle.updated_at,
      };
    });

    return NextResponse.json({ bundles: transformedBundles });
  } catch (error) {
    console.error("Error fetching seller bundles:", error);
    return NextResponse.json({ error: "Fehler beim Laden der Bundles" }, { status: 500 });
  }
}
