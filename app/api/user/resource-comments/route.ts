import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/user/resource-comments - Get all comments on seller's resources
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;
    const filter = searchParams.get("filter") || "all"; // all, unreplied

    // Get all resources owned by the seller
    const sellerResources = await prisma.resource.findMany({
      where: { seller_id: session.user.id },
      select: { id: true },
    });

    const resourceIds = sellerResources.map((r) => r.id);

    if (resourceIds.length === 0) {
      return NextResponse.json({
        comments: [],
        pagination: {
          page,
          limit,
          totalCount: 0,
          totalPages: 0,
        },
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
              user_id: session.user.id,
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
                user_id: session.user.id,
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
            isSeller: reply.user.id === session.user.id,
          },
        })),
        replyCount: comment.replies.length,
        hasSellerReply: comment.replies.some((reply) => reply.user.id === session.user.id),
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats: {
        totalComments: allCommentsCount,
        unrepliedComments: unrepliedCount,
      },
    });
  } catch (error) {
    console.error("Error fetching seller resource comments:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
