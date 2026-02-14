import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createReviewSchema } from "@/lib/validations/review";
import { checkRateLimit, rateLimitHeaders, isValidId, safeParseInt } from "@/lib/rateLimit";
import { notifyReview } from "@/lib/notifications";

// GET /api/materials/[id]/reviews - Get all reviews for a material
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: materialId } = await params;

    // Validate material ID format
    if (!isValidId(materialId)) {
      return NextResponse.json({ error: "Ungültige Material-ID" }, { status: 400 });
    }

    const session = await auth();
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
      return NextResponse.json({ error: "Material nicht gefunden" }, { status: 404 });
    }

    // Get reviews with user info
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

    // Check if user has purchased/downloaded the material (for verified purchase badge)
    const purchasedUserIds = await prisma.transaction.findMany({
      where: {
        resource_id: materialId,
        status: "COMPLETED",
      },
      select: { buyer_id: true },
    });
    const purchasedUserIdSet = new Set(purchasedUserIds.map((t) => t.buyer_id));

    // Check if current user has already reviewed
    let userReview = null;
    if (session?.user?.id) {
      userReview = await prisma.review.findUnique({
        where: {
          user_id_resource_id: {
            user_id: session.user.id,
            resource_id: materialId,
          },
        },
      });
    }

    // Check if current user is the owner of this material
    const isOwner = session?.user?.id === material.seller_id;

    // Check if current user can review (has purchased/downloaded, not the seller)
    let canReview = false;
    if (session?.user?.id && !userReview && !isOwner) {
      const hasPurchased = await prisma.transaction.findFirst({
        where: {
          buyer_id: session.user.id,
          resource_id: materialId,
          status: "COMPLETED",
        },
      });
      const hasDownloaded = await prisma.download.findFirst({
        where: {
          user_id: session.user.id,
          resource_id: materialId,
        },
      });
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
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}

// POST /api/materials/[id]/reviews - Create a new review
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    // Rate limiting check
    const rateLimitResult = checkRateLimit(session.user.id, "materials:review");
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
      select: { id: true, seller_id: true, title: true },
    });

    if (!material) {
      return NextResponse.json({ error: "Material nicht gefunden" }, { status: 404 });
    }

    // Don't allow reviewing own material
    if (material.seller_id === session.user.id) {
      return NextResponse.json(
        { error: "Sie können Ihr eigenes Material nicht bewerten" },
        { status: 403 }
      );
    }

    // Check if user has purchased or downloaded this material
    const hasPurchased = await prisma.transaction.findFirst({
      where: {
        buyer_id: session.user.id,
        resource_id: materialId,
        status: "COMPLETED",
      },
    });

    const hasDownloaded = await prisma.download.findFirst({
      where: {
        user_id: session.user.id,
        resource_id: materialId,
      },
    });

    if (!hasPurchased && !hasDownloaded) {
      return NextResponse.json(
        {
          error: "Sie müssen dieses Material kaufen oder herunterladen, um es bewerten zu können",
        },
        { status: 403 }
      );
    }

    // Check if user already reviewed
    const existingReview = await prisma.review.findUnique({
      where: {
        user_id_resource_id: {
          user_id: session.user.id,
          resource_id: materialId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Sie haben dieses Material bereits bewertet" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createReviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Ungültige Eingabe", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { rating, title, content } = validation.data;

    // Create review
    const review = await prisma.review.create({
      data: {
        rating,
        title: title || null,
        content: content || null,
        user_id: session.user.id,
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
      message: "Bewertung erfolgreich erstellt",
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
