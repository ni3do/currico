import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit, rateLimitHeaders, isValidId } from "@/lib/rateLimit";
import { requireAuth, unauthorized } from "@/lib/api";

// POST /api/materials/[id]/like - Toggle like on a material
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    // Rate limiting check
    const rateLimitResult = checkRateLimit(userId, "materials:like");
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut.",
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429, headers: rateLimitHeaders(rateLimitResult) }
      );
    }

    const { id: materialId } = await params;

    // Validate material ID format
    if (!isValidId(materialId)) {
      return NextResponse.json({ error: "Ungültige Material-ID" }, { status: 400 });
    }

    // Check if material exists
    const material = await prisma.resource.findUnique({
      where: { id: materialId },
      select: { id: true, seller_id: true },
    });

    if (!material) {
      return NextResponse.json({ error: "Material nicht gefunden" }, { status: 404 });
    }

    // Check if user already liked this material
    const existingLike = await prisma.resourceLike.findUnique({
      where: {
        user_id_resource_id: {
          user_id: userId,
          resource_id: materialId,
        },
      },
    });

    if (existingLike) {
      // Unlike - remove the like
      await prisma.resourceLike.delete({
        where: { id: existingLike.id },
      });

      const likeCount = await prisma.resourceLike.count({
        where: { resource_id: materialId },
      });

      return NextResponse.json({
        liked: false,
        likeCount,
        message: "Like entfernt",
      });
    } else {
      // Like - add new like
      await prisma.resourceLike.create({
        data: {
          user_id: userId,
          resource_id: materialId,
        },
      });

      const likeCount = await prisma.resourceLike.count({
        where: { resource_id: materialId },
      });

      return NextResponse.json({
        liked: true,
        likeCount,
        message: "Material gefällt Ihnen",
      });
    }
  } catch (error) {
    console.error("Error toggling material like:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}

// GET /api/materials/[id]/like - Get like status for a material
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    const { id: materialId } = await params;

    // Check if material exists
    const material = await prisma.resource.findUnique({
      where: { id: materialId },
      select: { id: true },
    });

    if (!material) {
      return NextResponse.json({ error: "Material nicht gefunden" }, { status: 404 });
    }

    // Get like count
    const likeCount = await prisma.resourceLike.count({
      where: { resource_id: materialId },
    });

    // Check if current user has liked
    let liked = false;
    if (userId) {
      const existingLike = await prisma.resourceLike.findUnique({
        where: {
          user_id_resource_id: {
            user_id: userId,
            resource_id: materialId,
          },
        },
      });
      liked = !!existingLike;
    }

    return NextResponse.json({ liked, likeCount });
  } catch (error) {
    console.error("Error getting material like status:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
