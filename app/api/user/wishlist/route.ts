import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toStringArray } from "@/lib/json-array";
import { formatPrice } from "@/lib/utils/price";
import {
  requireAuth,
  unauthorized,
  badRequest,
  notFound,
  serverError,
  parsePagination,
  paginationResponse,
  API_ERROR_CODES,
} from "@/lib/api";
import { captureError } from "@/lib/api-error";
import { addToWishlistSchema } from "@/lib/validations/user";

/**
 * GET /api/user/wishlist
 * Fetch all resources in user's wishlist
 */
export async function GET(request: NextRequest) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams, { limit: 50 });

    const wishlistItems = await prisma.wishlist.findMany({
      where: {
        user_id: userId,
        resource: {
          is_published: true,
          is_approved: true,
          is_public: true,
        },
      },
      select: {
        id: true,
        created_at: true,
        resource: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            preview_url: true,
            subjects: true,
            cycles: true,
            seller: {
              select: {
                id: true,
                display_name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: limit,
      skip,
    });

    // Transform items (already filtered by DB query)
    const items = wishlistItems.map((w) => {
      const subjects = toStringArray(w.resource.subjects);
      const cycles = toStringArray(w.resource.cycles);
      return {
        id: w.resource.id,
        title: w.resource.title,
        description: w.resource.description,
        price: w.resource.price,
        priceFormatted: formatPrice(w.resource.price),
        previewUrl: w.resource.preview_url,
        subjects,
        cycles,
        addedAt: w.created_at,
        seller: {
          id: w.resource.seller.id,
          displayName: w.resource.seller.display_name,
          image: w.resource.seller.image,
        },
      };
    });

    const totalCount = await prisma.wishlist.count({
      where: {
        user_id: userId,
        resource: {
          is_published: true,
          is_approved: true,
          is_public: true,
        },
      },
    });

    return NextResponse.json({
      items,
      stats: {
        totalItems: totalCount,
      },
      pagination: paginationResponse(page, limit, totalCount),
    });
  } catch (error) {
    captureError("Error fetching wishlist:", error);
    return serverError("WISHLIST_FETCH_FAILED");
  }
}

/**
 * POST /api/user/wishlist
 * Add a resource to wishlist
 */
export async function POST(request: NextRequest) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const body = await request.json();
    const parsed = addToWishlistSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Resource ID required", undefined, API_ERROR_CODES.INVALID_INPUT);
    }
    const { resourceId } = parsed.data;

    // Check if resource exists and is public
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: {
        id: true,
        is_published: true,
        is_approved: true,
        is_public: true,
        seller_id: true,
      },
    });

    if (!resource) {
      return notFound("Material not found", API_ERROR_CODES.MATERIAL_NOT_FOUND);
    }

    // Don't allow wishlisting own resources
    if (resource.seller_id === userId) {
      return badRequest(
        "Cannot wishlist own material",
        undefined,
        API_ERROR_CODES.CANNOT_WISHLIST_OWN
      );
    }

    if (!resource.is_published || !resource.is_approved || !resource.is_public) {
      return badRequest("Material not available", undefined, API_ERROR_CODES.MATERIAL_UNAVAILABLE);
    }

    // Add to wishlist (upsert to avoid duplicates)
    await prisma.wishlist.upsert({
      where: {
        user_id_resource_id: {
          user_id: userId,
          resource_id: resourceId,
        },
      },
      create: {
        user_id: userId,
        resource_id: resourceId,
      },
      update: {},
    });

    return NextResponse.json({
      success: true,
      message: "Added to wishlist",
    });
  } catch (error) {
    captureError("Error adding to wishlist:", error);
    return serverError("WISHLIST_ADD_FAILED");
  }
}

/**
 * DELETE /api/user/wishlist
 * Remove a resource from wishlist
 */
export async function DELETE(request: NextRequest) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get("resourceId");

    if (!resourceId) {
      return badRequest("Resource ID required", undefined, API_ERROR_CODES.INVALID_INPUT);
    }

    // Delete from wishlist
    await prisma.wishlist.deleteMany({
      where: {
        user_id: userId,
        resource_id: resourceId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (error) {
    captureError("Error removing from wishlist:", error);
    return serverError("WISHLIST_REMOVE_FAILED");
  }
}
