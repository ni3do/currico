import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { formatPrice } from "@/lib/utils/price";

/**
 * GET /api/user/wishlist
 * Fetch all resources in user's wishlist
 */
export async function GET(request: NextRequest) {
  // Authentication check
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const wishlistItems = await prisma.wishlist.findMany({
      where: {
        user_id: userId,
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
            is_published: true,
            is_approved: true,
            is_public: true,
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

    // Transform and filter only publicly available resources
    const items = wishlistItems
      .filter((w) => w.resource.is_published && w.resource.is_approved && w.resource.is_public)
      .map((w) => ({
        id: w.resource.id,
        title: w.resource.title,
        description: w.resource.description,
        price: w.resource.price,
        priceFormatted: formatPrice(w.resource.price),
        previewUrl: w.resource.preview_url,
        subjects: w.resource.subjects,
        cycles: w.resource.cycles,
        subject: w.resource.subjects[0] || "Allgemein",
        cycle: w.resource.cycles[0] || "",
        addedAt: w.created_at,
        seller: {
          id: w.resource.seller.id,
          displayName: w.resource.seller.display_name,
          image: w.resource.seller.image,
        },
      }));

    const totalCount = await prisma.wishlist.count({
      where: { user_id: userId },
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
    return NextResponse.json({ error: "Fehler beim Laden der Wunschliste" }, { status: 500 });
  }
}

/**
 * POST /api/user/wishlist
 * Add a resource to wishlist
 */
export async function POST(request: NextRequest) {
  // Authentication check
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { resourceId } = body;

    if (!resourceId) {
      return NextResponse.json({ error: "Ressourcen-ID erforderlich" }, { status: 400 });
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
      return NextResponse.json({ error: "Ressource nicht gefunden" }, { status: 404 });
    }

    // Don't allow wishlisting own resources
    if (resource.seller_id === userId) {
      return NextResponse.json(
        { error: "Sie können Ihre eigenen Ressourcen nicht auf die Wunschliste setzen" },
        { status: 400 }
      );
    }

    if (!resource.is_published || !resource.is_approved || !resource.is_public) {
      return NextResponse.json({ error: "Diese Ressource ist nicht verfügbar" }, { status: 400 });
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
      message: "Zur Wunschliste hinzugefügt",
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json({ error: "Fehler beim Hinzufügen zur Wunschliste" }, { status: 500 });
  }
}

/**
 * DELETE /api/user/wishlist
 * Remove a resource from wishlist
 */
export async function DELETE(request: NextRequest) {
  // Authentication check
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get("resourceId");

    if (!resourceId) {
      return NextResponse.json({ error: "Ressourcen-ID erforderlich" }, { status: 400 });
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
      message: "Von der Wunschliste entfernt",
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { error: "Fehler beim Entfernen von der Wunschliste" },
      { status: 500 }
    );
  }
}
