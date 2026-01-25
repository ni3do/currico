import { NextRequest, NextResponse } from "next/server";
import { prisma, publicUserSelect } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

/**
 * GET /api/users/[id]/public
 * Get a user's public profile with stats
 * Access: Everyone (public)
 *
 * IMPORTANT: This endpoint only returns PUBLIC data.
 * Email, legal name, IBAN, and address are NEVER exposed.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUserId = await getCurrentUserId();

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        ...publicUserSelect,
        _count: {
          select: {
            resources: { where: { is_published: true, is_public: true } },
            followers: true,
            following: true,
            collections: { where: { is_public: true } },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    // Check if current user follows this profile
    let isFollowing = false;
    if (currentUserId && currentUserId !== id) {
      const follow = await prisma.follow.findUnique({
        where: {
          follower_id_followed_id: {
            follower_id: currentUserId,
            followed_id: id,
          },
        },
      });
      isFollowing = !!follow;
    }

    return NextResponse.json({
      ...user,
      stats: {
        resourceCount: user._count.resources,
        followerCount: user._count.followers,
        followingCount: user._count.following,
        collectionCount: user._count.collections,
      },
      isFollowing,
      isOwnProfile: currentUserId === id,
    });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
