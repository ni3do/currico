import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createReviewSchema } from "@/lib/validations/review";
import { checkRateLimit, isValidId, safeParseInt } from "@/lib/rateLimit";
import { notifyReview } from "@/lib/notifications";
import { checkAndUpdateVerification } from "@/lib/utils/verified-seller";
import {
  requireAuth,
  unauthorized,
  badRequest,
  notFound,
  forbidden,
  serverError,
  rateLimited,
  API_ERROR_CODES,
} from "@/lib/api";
import { captureError } from "@/lib/api-error";

// GET /api/materials/[id]/reviews - Get all reviews for a material
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: materialId } = await params;

    // Validate material ID format
    if (!isValidId(materialId)) {
      return badRequest("Invalid ID");
    }

    const userId = await requireAuth();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, safeParseInt(searchParams.get("page"), 1));
    const limit = Math.min(50, Math.max(1, safeParseInt(searchParams.get("limit"), 10)));
    const skip = (page - 1) * limit;

    // Check if material exists
    const material = await prisma.resource.findUnique({
      where: { id: materialId },
      select: { id: true, seller_id: true },
    });

    if (!material) {
      return notFound();
    }

    // Get reviews with user info and replies
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: { resource_id: materialId },
        include: {
          user: {
            select: {
              id: true,
              display_name: true,
              name: true,
              image: true,
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
      prisma.review.count({ where: { resource_id: materialId } }),
    ]);

    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      where: { resource_id: materialId },
      _avg: { rating: true },
    });

    // Check if review authors have purchased (for verified purchase badge)
    // Only query buyer IDs for users in the current page of reviews
    const reviewUserIds = reviews.map((r) => r.user.id);
    const purchasedUserIds = await prisma.transaction.findMany({
      where: {
        resource_id: materialId,
        status: "COMPLETED",
        buyer_id: { in: reviewUserIds },
      },
      select: { buyer_id: true },
    });
    const purchasedUserIdSet = new Set(purchasedUserIds.map((t) => t.buyer_id));

    // Check if current user has already reviewed
    let userReview = null;
    if (userId) {
      userReview = await prisma.review.findUnique({
        where: {
          user_id_resource_id: {
            user_id: userId,
            resource_id: materialId,
          },
        },
      });
    }

    // Check if current user is the owner of this material
    const isOwner = userId === material.seller_id;

    // Check if current user can review (has purchased/downloaded, not the seller)
    let canReview = false;
    if (userId && !userReview && !isOwner) {
      const [hasPurchased, hasDownloaded] = await Promise.all([
        prisma.transaction.findFirst({
          where: {
            buyer_id: userId,
            resource_id: materialId,
            status: "COMPLETED",
          },
        }),
        prisma.download.findFirst({
          where: {
            user_id: userId,
            resource_id: materialId,
          },
        }),
      ]);
      canReview = !!(hasPurchased || hasDownloaded);
    }

    return NextResponse.json({
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        createdAt: review.created_at.toISOString(),
        updatedAt: review.updated_at.toISOString(),
        isVerifiedPurchase: purchasedUserIdSet.has(review.user_id),
        user: {
          id: review.user.id,
          displayName: review.user.display_name || review.user.name || "Anonym",
          image: review.user.image,
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
            isSeller: reply.user.id === material.seller_id,
          },
        })),
        replyCount: review.replies.length,
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats: {
        averageRating: avgRating._avg.rating || 0,
        totalReviews: totalCount,
      },
      userReview: userReview
        ? {
            id: userReview.id,
            rating: userReview.rating,
            title: userReview.title,
            content: userReview.content,
          }
        : null,
      canReview,
      isOwner: isOwner ?? false,
    });
  } catch (error) {
    captureError("Error fetching reviews:", error);
    return serverError();
  }
}

// POST /api/materials/[id]/reviews - Create a new review
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    // Rate limiting check
    const rateLimitResult = checkRateLimit(userId, "materials:review");
    if (!rateLimitResult.success) {
      return rateLimited();
    }

    const { id: materialId } = await params;

    // Validate material ID format
    if (!isValidId(materialId)) {
      return badRequest("Invalid ID");
    }

    // Check if material exists
    const material = await prisma.resource.findUnique({
      where: { id: materialId },
      select: { id: true, seller_id: true, title: true },
    });

    if (!material) {
      return notFound();
    }

    // Don't allow reviewing own material
    if (material.seller_id === userId) {
      return forbidden("Cannot review own material", API_ERROR_CODES.CANNOT_REVIEW_OWN);
    }

    // Check if user has purchased or downloaded this material
    const [hasPurchased, hasDownloaded] = await Promise.all([
      prisma.transaction.findFirst({
        where: {
          buyer_id: userId,
          resource_id: materialId,
          status: "COMPLETED",
        },
      }),
      prisma.download.findFirst({
        where: {
          user_id: userId,
          resource_id: materialId,
        },
      }),
    ]);

    if (!hasPurchased && !hasDownloaded) {
      return forbidden("Must purchase to review", API_ERROR_CODES.MUST_PURCHASE_TO_REVIEW);
    }

    // Check if user already reviewed
    const existingReview = await prisma.review.findUnique({
      where: {
        user_id_resource_id: {
          user_id: userId,
          resource_id: materialId,
        },
      },
    });

    if (existingReview) {
      return badRequest("Already reviewed", { code: API_ERROR_CODES.ALREADY_REVIEWED });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createReviewSchema.safeParse(body);

    if (!validation.success) {
      return badRequest("Invalid input", {
        code: "INVALID_INPUT",
        details: validation.error.flatten(),
      });
    }

    const { rating, title, content } = validation.data;

    // Create review
    const review = await prisma.review.create({
      data: {
        rating,
        title: title || null,
        content: content || null,
        user_id: userId,
        resource_id: materialId,
      },
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
    });

    // Notify the seller about the new review
    notifyReview(material.seller_id, material.title, review.rating);

    // Check if seller now qualifies for verified status (fire-and-forget)
    checkAndUpdateVerification(material.seller_id).catch((err) =>
      captureError("Verification check failed after review:", err)
    );

    return NextResponse.json({
      review: {
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        createdAt: review.created_at.toISOString(),
        isVerifiedPurchase: !!hasPurchased,
        user: {
          id: review.user.id,
          displayName: review.user.display_name || review.user.name || "Anonym",
          image: review.user.image,
        },
      },
      message: "Review created",
    });
  } catch (error) {
    captureError("Error creating review:", error);
    return serverError();
  }
}
