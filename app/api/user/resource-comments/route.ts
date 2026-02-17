import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  requireAuth,
  unauthorized,
  serverError,
  parsePagination,
  paginationResponse,
} from "@/lib/api";

// GET /api/user/resource-comments - Get all comments on seller's resources
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
        comments: [],
        pagination: paginationResponse(page, limit, 0),
        stats: {
          totalComments: 0,
          unrepliedComments: 0,
        },
      });
    }

    // Build where clause based on filter
    let whereClause: object = {
      resource_id: { in: resourceIds },
    };

    if (filter === "unreplied") {
      // Filter to comments without a reply from the seller
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

    // Get comments on seller's resources
    const [comments, totalCount] = await Promise.all([
      prisma.comment.findMany({
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
          likes: {
            select: { user_id: true },
          },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where: whereClause }),
    ]);

    // Get stats
    const [allCommentsCount, unrepliedCount] = await Promise.all([
      prisma.comment.count({
        where: { resource_id: { in: resourceIds } },
      }),
      prisma.comment.count({
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
      comments: comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.created_at.toISOString(),
        updatedAt: comment.updated_at.toISOString(),
        user: {
          id: comment.user.id,
          displayName: comment.user.display_name || comment.user.name || "Anonym",
          image: comment.user.image,
        },
        resource: {
          id: comment.resource.id,
          title: comment.resource.title,
          previewUrl: comment.resource.preview_url,
        },
        likeCount: comment.likes.length,
        replies: comment.replies.map((reply) => ({
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
        replyCount: comment.replies.length,
        hasSellerReply: comment.replies.some((reply) => reply.user.id === userId),
      })),
      pagination: paginationResponse(page, limit, totalCount),
      stats: {
        totalComments: allCommentsCount,
        unrepliedComments: unrepliedCount,
      },
    });
  } catch (error) {
    console.error("Error fetching seller resource comments:", error);
    return serverError();
  }
}
