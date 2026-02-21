import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  requireAuth,
  unauthorized,
  serverError,
  parsePagination,
  paginationResponse,
} from "@/lib/api";
import { captureError } from "@/lib/api-error";

// GET /api/user/resource-reviews - Get all reviews on seller's resources
export async function GET(request: Request) {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);
    const filter = searchParams.get("filter") || "all"; // all, unreplied

    // Get all resources owned by the seller
    const sellerResources = await prisma.resource.findMany({
      where: { seller_id: userId },
      select: { id: true },
    });

    const resourceIds = sellerResources.map((r) => r.id);

    if (resourceIds.length === 0) {
      return NextResponse.json({
        reviews: [],
        pagination: paginationResponse(page, limit, 0),
        stats: {
          totalReviews: 0,
          unrepliedReviews: 0,
        },
      });
    }

    // Build where clause based on filter
    let whereClause: object = {
      resource_id: { in: resourceIds },
    };

    if (filter === "unreplied") {
      whereClause = {
        ...whereClause,
        NOT: {
          replies: {
            some: {
              user_id: userId,
            },
          },
        },
      };
    }

    // Get reviews on seller's resources
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              display_name: true,
              name: true,
              image: true,
            },
          },
          resource: {
            select: {
              id: true,
              title: true,
              preview_url: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  display_name: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: { created_at: "asc" },
          },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: whereClause }),
    ]);

    // Get stats
    const [allReviewsCount, unrepliedCount] = await Promise.all([
      prisma.review.count({
        where: { resource_id: { in: resourceIds } },
      }),
      prisma.review.count({
        where: {
          resource_id: { in: resourceIds },
          NOT: {
            replies: {
              some: {
                user_id: userId,
              },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        createdAt: review.created_at.toISOString(),
        updatedAt: review.updated_at.toISOString(),
        user: {
          id: review.user.id,
          displayName: review.user.display_name || review.user.name || "Anonym",
          image: review.user.image,
        },
        resource: {
          id: review.resource.id,
          title: review.resource.title,
          previewUrl: review.resource.preview_url,
        },
        replies: review.replies.map((reply) => ({
          id: reply.id,
          content: reply.content,
          createdAt: reply.created_at.toISOString(),
          updatedAt: reply.updated_at.toISOString(),
          user: {
            id: reply.user.id,
            displayName: reply.user.display_name || reply.user.name || "Anonym",
            image: reply.user.image,
            isSeller: reply.user.id === userId,
          },
        })),
        replyCount: review.replies.length,
        hasSellerReply: review.replies.some((reply) => reply.user.id === userId),
      })),
      pagination: paginationResponse(page, limit, totalCount),
      stats: {
        totalReviews: allReviewsCount,
        unrepliedReviews: unrepliedCount,
      },
    });
  } catch (error) {
    captureError("Error fetching seller resource reviews:", error);
    return serverError();
  }
}
