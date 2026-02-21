import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { formatPrice } from "@/lib/utils/price";
import {
  requireAuth,
  unauthorized,
  forbidden,
  notFound,
  badRequest,
  serverError,
  API_ERROR_CODES,
} from "@/lib/api";
import { captureError } from "@/lib/api-error";
import { isValidId } from "@/lib/rateLimit";
import { toStringArray } from "@/lib/json-array";

/**
 * GET /api/bundles/[id]
 * Fetch a single published and verified bundle by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid ID", undefined, API_ERROR_CODES.INVALID_ID);

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
      return notFound("Bundle not found", API_ERROR_CODES.BUNDLE_NOT_FOUND);
    }

    // Calculate savings
    const totalIndividualPrice = bundle.resources.reduce((sum, br) => sum + br.resource.price, 0);
    const savings = totalIndividualPrice - bundle.price;
    const savingsPercent =
      totalIndividualPrice > 0 ? Math.round((savings / totalIndividualPrice) * 100) : 0;

    // Transform subjects and cycles arrays
    const subjects = toStringArray(bundle.subjects);
    const cycles = toStringArray(bundle.cycles);

    const transformedBundle = {
      id: bundle.id,
      title: bundle.title,
      description: bundle.description,
      price: bundle.price,
      priceFormatted: formatPrice(bundle.price, { showFreeLabel: true }),
      subjects,
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
    captureError("Error fetching bundle:", error);
    return serverError("Failed to fetch bundle");
  }
}

const updateBundleSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  price: z
    .number()
    .min(0)
    .refine((val) => val === 0 || (val >= 50 && val % 50 === 0), {
      message: "Price must be in 0.50 CHF increments",
    })
    .optional(),
  subjects: z.array(z.string()).optional(),
  cycles: z.array(z.string()).optional(),
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
    if (!isValidId(id)) return badRequest("Invalid ID", undefined, API_ERROR_CODES.INVALID_ID);

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
      return notFound("Bundle not found", API_ERROR_CODES.BUNDLE_NOT_FOUND);
    }

    if (bundle.seller_id !== userId) {
      return forbidden("Bundle edit forbidden", API_ERROR_CODES.BUNDLE_EDIT_FORBIDDEN);
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = updateBundleSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid input", undefined, API_ERROR_CODES.INVALID_INPUT);
    }

    const { title, description, price, subjects, cycles, resourceIds, coverImageUrl, isPublished } =
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
        return badRequest(
          "Materials not found or not owned by seller",
          undefined,
          API_ERROR_CODES.BUNDLE_MATERIALS_INVALID
        );
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (subjects !== undefined) updateData.subjects = subjects;
    if (cycles !== undefined) updateData.cycles = cycles;
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
      message: "Bundle updated successfully",
    });
  } catch (error) {
    captureError("Error updating bundle:", error);
    return serverError("Failed to update bundle");
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
    if (!isValidId(id)) return badRequest("Invalid ID", undefined, API_ERROR_CODES.INVALID_ID);

    // Fetch bundle to verify ownership
    const bundle = await prisma.bundle.findUnique({
      where: { id },
      select: {
        id: true,
        seller_id: true,
      },
    });

    if (!bundle) {
      return notFound("Bundle not found", API_ERROR_CODES.BUNDLE_NOT_FOUND);
    }

    if (bundle.seller_id !== userId) {
      return forbidden("Bundle delete forbidden", API_ERROR_CODES.BUNDLE_DELETE_FORBIDDEN);
    }

    // Delete bundle (cascade will remove BundleResource entries)
    await prisma.bundle.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Bundle deleted successfully",
    });
  } catch (error) {
    captureError("Error deleting bundle:", error);
    return serverError("Failed to delete bundle");
  }
}
