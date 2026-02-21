import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit, isValidId } from "@/lib/rateLimit";
import {
  requireAuth,
  unauthorized,
  rateLimited,
  badRequest,
  notFound,
  serverError,
  API_ERROR_CODES,
} from "@/lib/api";
import { captureError } from "@/lib/api-error";

// POST /api/materials/[id]/like - Toggle like on a material
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    // Rate limiting check
    const rateLimitResult = checkRateLimit(userId, "materials:like");
    if (!rateLimitResult.success) {
      return rateLimited();
    }

    const { id: materialId } = await params;

    // Validate material ID format
    if (!isValidId(materialId)) {
      return badRequest("Invalid ID", undefined, API_ERROR_CODES.INVALID_ID);
    }

    // Check if material exists
    const material = await prisma.resource.findUnique({
      where: { id: materialId },
      select: { id: true, seller_id: true },
    });

    if (!material) {
      return notFound();
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
        message: "Like removed",
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
        message: "Material liked",
      });
    }
  } catch (error) {
    captureError("Error toggling material like:", error);
    return serverError();
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
      return notFound();
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
    captureError("Error getting material like status:", error);
    return serverError();
  }
}
