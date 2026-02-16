import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toStringArray } from "@/lib/json-array";
import { formatPrice } from "@/lib/utils/price";
import { requireAuth, unauthorized } from "@/lib/api";

/**
 * GET /api/user/wishlist
 * Fetch all resources in user's wishlist
 */
export async function GET(request: NextRequest) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10) || 0);

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
      skip: offset,
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
      pagination: {
        limit,
        offset,
        hasMore: wishlistItems.length === limit,
      },
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json({ error: "WISHLIST_FETCH_FAILED" }, { status: 500 });
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
    const { resourceId } = body;

    if (!resourceId) {
      return NextResponse.json({ error: "RESOURCE_ID_REQUIRED" }, { status: 400 });
    }

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
      return NextResponse.json({ error: "MATERIAL_NOT_FOUND" }, { status: 404 });
    }

    // Don't allow wishlisting own resources
    if (resource.seller_id === userId) {
      return NextResponse.json({ error: "CANNOT_WISHLIST_OWN_MATERIAL" }, { status: 400 });
    }

    if (!resource.is_published || !resource.is_approved || !resource.is_public) {
      return NextResponse.json({ error: "MATERIAL_NOT_AVAILABLE" }, { status: 400 });
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
      message: "WISHLIST_ADDED",
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json({ error: "WISHLIST_ADD_FAILED" }, { status: 500 });
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
      return NextResponse.json({ error: "RESOURCE_ID_REQUIRED" }, { status: 400 });
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
      message: "WISHLIST_REMOVED",
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json({ error: "WISHLIST_REMOVE_FAILED" }, { status: 500 });
  }
}
