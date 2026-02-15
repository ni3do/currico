import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { formatPrice } from "@/lib/utils/price";
import { requireAuth, requireSeller, unauthorized, forbidden, badRequest } from "@/lib/api";

const createBundleSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich").max(200),
  description: z.string().max(5000).optional(),
  price: z
    .number()
    .min(0, "Preis muss positiv sein")
    .refine((val) => val === 0 || (val >= 50 && val % 50 === 0), {
      message: "Price must be in 0.50 CHF increments",
    }),
  subject: z.array(z.string()).optional().default([]),
  cycle: z.array(z.string()).optional().default([]),
  resourceIds: z.array(z.string()).min(2, "Mindestens 2 Materialien sind erforderlich"),
  coverImageUrl: z.string().url().optional().nullable(),
});

/**
 * GET /api/bundles
 * List published bundles
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const bundles = await prisma.bundle.findMany({
      where: {
        is_published: true,
        status: "VERIFIED",
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            display_name: true,
            image: true,
          },
        },
        resources: {
          include: {
            resource: {
              select: {
                id: true,
                title: true,
                price: true,
                preview_url: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: limit,
      skip: offset,
    });

    const transformedBundles = bundles.map((bundle) => {
      const totalIndividualPrice = bundle.resources.reduce((sum, br) => sum + br.resource.price, 0);
      const savings = totalIndividualPrice - bundle.price;
      const savingsPercent =
        totalIndividualPrice > 0 ? Math.round((savings / totalIndividualPrice) * 100) : 0;

      return {
        id: bundle.id,
        title: bundle.title,
        description: bundle.description,
        price: bundle.price,
        priceFormatted: formatPrice(bundle.price, { showFreeLabel: true }),
        subject: bundle.subject,
        cycle: bundle.cycle,
        coverImageUrl: bundle.cover_image_url,
        seller: {
          id: bundle.seller.id,
          name: bundle.seller.display_name || bundle.seller.name,
          image: bundle.seller.image,
        },
        resourceCount: bundle.resources.length,
        resources: bundle.resources.map((br) => ({
          id: br.resource.id,
          title: br.resource.title,
          price: br.resource.price,
          priceFormatted: formatPrice(br.resource.price, { showFreeLabel: true }),
          previewUrl: br.resource.preview_url,
        })),
        savings,
        savingsFormatted: formatPrice(savings, { showFreeLabel: false }),
        savingsPercent,
        createdAt: bundle.created_at,
      };
    });

    return NextResponse.json({ bundles: transformedBundles });
  } catch (error) {
    console.error("Error fetching bundles:", error);
    return NextResponse.json({ error: "Fehler beim Laden der Bundles" }, { status: 500 });
  }
}

/**
 * POST /api/bundles
 * Create a new bundle (seller only)
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    const seller = await requireSeller(userId);
    if (!seller) return forbidden("Nur für Verkäufer zugänglich");

    const body = await request.json();
    const parsed = createBundleSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return badRequest(firstError?.message ?? "Ungültige Eingabe");
    }

    const { title, description, price, subject, cycle, resourceIds, coverImageUrl } = parsed.data;

    // Verify all resources belong to the seller
    const resources = await prisma.resource.findMany({
      where: {
        id: { in: resourceIds },
        seller_id: userId,
        is_published: true,
      },
      select: { id: true },
    });

    if (resources.length !== resourceIds.length) {
      return badRequest("Einige Materialien wurden nicht gefunden oder gehören Ihnen nicht");
    }

    // Create bundle with resources
    const bundle = await prisma.bundle.create({
      data: {
        title,
        description,
        price,
        subject,
        cycle,
        cover_image_url: coverImageUrl,
        seller_id: userId,
        is_published: false,
        status: "PENDING",
        resources: {
          create: resourceIds.map((resourceId) => ({
            resource_id: resourceId,
          })),
        },
      },
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
    });

    return NextResponse.json(
      {
        success: true,
        message: "Bundle erfolgreich erstellt",
        bundle: {
          id: bundle.id,
          title: bundle.title,
          price: bundle.price,
          priceFormatted: formatPrice(bundle.price, { showFreeLabel: true }),
          resourceCount: bundle.resources.length,
          status: bundle.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating bundle:", error);
    return NextResponse.json({ error: "Fehler beim Erstellen des Bundles" }, { status: 500 });
  }
}
