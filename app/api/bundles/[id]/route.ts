import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { formatPrice } from "@/lib/utils/price";
import { requireAuth, unauthorized, forbidden, notFound, badRequest } from "@/lib/api";
import { toStringArray } from "@/lib/json-array";

/**
 * GET /api/bundles/[id]
 * Fetch a single published and verified bundle by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const bundle = await prisma.bundle.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            display_name: true,
            image: true,
            stripe_charges_enabled: true,
            _count: {
              select: { resources: true },
            },
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
                description: true,
              },
            },
          },
        },
      },
    });

    // Return 404 if not found or not publicly visible
    if (!bundle || !bundle.is_published || bundle.status !== "VERIFIED") {
      return notFound("Bundle nicht gefunden");
    }

    // Calculate savings
    const totalIndividualPrice = bundle.resources.reduce((sum, br) => sum + br.resource.price, 0);
    const savings = totalIndividualPrice - bundle.price;
    const savingsPercent =
      totalIndividualPrice > 0 ? Math.round((savings / totalIndividualPrice) * 100) : 0;

    // Transform subject and cycle arrays
    const subjects = toStringArray(bundle.subject);
    const cycles = toStringArray(bundle.cycle);

    const transformedBundle = {
      id: bundle.id,
      title: bundle.title,
      description: bundle.description,
      price: bundle.price,
      priceFormatted: formatPrice(bundle.price, { showFreeLabel: true }),
      subject: subjects[0] || "Allgemein",
      subjects,
      cycle: cycles[0] || "",
      cycles,
      coverImageUrl: bundle.cover_image_url,
      createdAt: bundle.created_at,
      seller: {
        id: bundle.seller.id,
        displayName: bundle.seller.display_name || bundle.seller.name,
        image: bundle.seller.image,
        verified: bundle.seller.stripe_charges_enabled,
        materialCount: bundle.seller._count.resources,
      },
      resources: bundle.resources.map((br) => ({
        id: br.resource.id,
        title: br.resource.title,
        price: br.resource.price,
        priceFormatted: formatPrice(br.resource.price, { showFreeLabel: true }),
        previewUrl: br.resource.preview_url,
        description: br.resource.description,
      })),
      resourceCount: bundle.resources.length,
      totalIndividualPrice,
      totalIndividualPriceFormatted: formatPrice(totalIndividualPrice, { showFreeLabel: false }),
      savings,
      savingsFormatted: formatPrice(savings, { showFreeLabel: false }),
      savingsPercent,
    };

    return NextResponse.json({ bundle: transformedBundle });
  } catch (error) {
    console.error("Error fetching bundle:", error);
    return NextResponse.json({ error: "Fehler beim Laden des Bundles" }, { status: 500 });
  }
}

const updateBundleSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  price: z.number().min(0).optional(),
  subject: z.array(z.string()).min(1).optional(),
  cycle: z.array(z.string()).min(1).optional(),
  resourceIds: z.array(z.string()).min(2).optional(),
  coverImageUrl: z.string().url().optional().nullable(),
  isPublished: z.boolean().optional(),
});

/**
 * PUT /api/bundles/[id]
 * Update a bundle (owner only)
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    const { id } = await params;

    // Fetch bundle to verify ownership
    const bundle = await prisma.bundle.findUnique({
      where: { id },
      select: {
        id: true,
        seller_id: true,
        status: true,
      },
    });

    if (!bundle) {
      return notFound("Bundle nicht gefunden");
    }

    if (bundle.seller_id !== userId) {
      return forbidden("Keine Berechtigung zum Bearbeiten dieses Bundles");
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = updateBundleSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return badRequest(firstError?.message ?? "Ungültige Eingabe");
    }

    const { title, description, price, subject, cycle, resourceIds, coverImageUrl, isPublished } =
      parsed.data;

    // If resourceIds provided, verify they belong to the seller
    if (resourceIds) {
      const materials = await prisma.resource.findMany({
        where: {
          id: { in: resourceIds },
          seller_id: userId,
          is_published: true,
        },
        select: { id: true },
      });

      if (materials.length !== resourceIds.length) {
        return badRequest("Einige Materialien wurden nicht gefunden oder gehören Ihnen nicht");
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (subject !== undefined) updateData.subject = subject;
    if (cycle !== undefined) updateData.cycle = cycle;
    if (coverImageUrl !== undefined) updateData.cover_image_url = coverImageUrl;
    if (isPublished !== undefined) updateData.is_published = isPublished;

    // Update bundle with resources if provided
    if (resourceIds) {
      // Delete existing resource links and create new ones
      await prisma.$transaction([
        prisma.bundleResource.deleteMany({ where: { bundle_id: id } }),
        prisma.bundle.update({
          where: { id },
          data: {
            ...updateData,
            resources: {
              create: resourceIds.map((resourceId) => ({
                resource_id: resourceId,
              })),
            },
          },
        }),
      ]);
    } else {
      await prisma.bundle.update({
        where: { id },
        data: updateData,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Bundle erfolgreich aktualisiert",
    });
  } catch (error) {
    console.error("Error updating bundle:", error);
    return NextResponse.json({ error: "Fehler beim Aktualisieren des Bundles" }, { status: 500 });
  }
}

/**
 * DELETE /api/bundles/[id]
 * Delete a bundle (owner only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    const { id } = await params;

    // Fetch bundle to verify ownership
    const bundle = await prisma.bundle.findUnique({
      where: { id },
      select: {
        id: true,
        seller_id: true,
      },
    });

    if (!bundle) {
      return notFound("Bundle nicht gefunden");
    }

    if (bundle.seller_id !== userId) {
      return forbidden("Keine Berechtigung zum Löschen dieses Bundles");
    }

    // Delete bundle (cascade will remove BundleResource entries)
    await prisma.bundle.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Bundle erfolgreich gelöscht",
    });
  } catch (error) {
    console.error("Error deleting bundle:", error);
    return NextResponse.json({ error: "Fehler beim Löschen des Bundles" }, { status: 500 });
  }
}
