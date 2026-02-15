import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized, badRequest, notFound } from "@/lib/api";

/**
 * GET /api/user/following
 * List sellers the user follows
 */
export async function GET() {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const following = await prisma.follow.findMany({
      where: { follower_id: userId },
      include: {
        followed: {
          select: {
            id: true,
            name: true,
            display_name: true,
            image: true,
            bio: true,
            subjects: true,
            _count: {
              select: {
                resources: { where: { is_published: true, is_public: true } },
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: 100,
    });

    const sellers = following.map((f) => ({
      id: f.followed.id,
      name: f.followed.display_name || f.followed.name,
      image: f.followed.image,
      bio: f.followed.bio,
      subjects: f.followed.subjects,
      resourceCount: f.followed._count.resources,
      followedAt: f.created_at,
    }));

    return NextResponse.json({ sellers });
  } catch (error) {
    console.error("Error fetching following:", error);
    return NextResponse.json({ error: "FOLLOWING_FETCH_FAILED" }, { status: 500 });
  }
}

/**
 * POST /api/user/following
 * Follow a seller
 * Body: { sellerId: string }
 */
export async function POST(request: NextRequest) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const body = await request.json();
    const { sellerId } = body;

    if (!sellerId) return badRequest("SELLER_ID_REQUIRED");
    if (sellerId === userId) return badRequest("CANNOT_FOLLOW_SELF");

    // Check if seller exists and is actually a seller
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      select: { role: true },
    });

    if (!seller) return notFound("SELLER_NOT_FOUND");
    if (seller.role !== "SELLER") {
      return badRequest("NOT_A_SELLER");
    }

    // Create follow relationship (upsert to handle duplicates)
    const follow = await prisma.follow.upsert({
      where: {
        follower_id_followed_id: {
          follower_id: userId,
          followed_id: sellerId,
        },
      },
      update: {},
      create: {
        follower_id: userId,
        followed_id: sellerId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "FOLLOWED",
      followId: follow.id,
    });
  } catch (error) {
    console.error("Error following seller:", error);
    return NextResponse.json({ error: "FOLLOW_FAILED" }, { status: 500 });
  }
}

/**
 * DELETE /api/user/following?sellerId=...
 * Unfollow a seller
 */
export async function DELETE(request: NextRequest) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get("sellerId");

    if (!sellerId) return badRequest("SELLER_ID_REQUIRED");

    await prisma.follow.deleteMany({
      where: {
        follower_id: userId,
        followed_id: sellerId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "UNFOLLOWED",
    });
  } catch (error) {
    console.error("Error unfollowing seller:", error);
    return NextResponse.json({ error: "UNFOLLOW_FAILED" }, { status: 500 });
  }
}
