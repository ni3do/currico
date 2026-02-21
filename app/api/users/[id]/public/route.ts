import { NextRequest, NextResponse } from "next/server";
import { prisma, publicUserSelect } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { badRequest, notFound, serverError } from "@/lib/api";
import { isValidId } from "@/lib/rateLimit";
import { captureError } from "@/lib/api-error";

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

    if (!isValidId(id)) {
      return badRequest("Invalid ID");
    }

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
      return notFound();
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

    const isOwnProfile = currentUserId === id;

    // If profile is private and it's not the user's own profile, hide extra info
    if (user.is_private && !isOwnProfile) {
      return NextResponse.json({
        id: user.id,
        name: user.name,
        display_name: user.display_name,
        image: user.image,
        role: user.role,
        created_at: user.created_at,
        is_private: true,
        is_verified_seller: user.is_verified_seller,
        // Hide these fields for private profiles
        bio: null,
        subjects: [],
        cycles: [],
        cantons: [],
        instagram: null,
        pinterest: null,
        website: null,
        school: null,
        teaching_experience: null,
        is_teacher_verified: false,
        // Seller level is public (it's a badge), but hide XP detail
        seller_level: user.seller_level,
        seller_xp: 0,
        stripe_charges_enabled: user.stripe_charges_enabled,
        stats: {
          resourceCount: user._count.resources,
          followerCount: 0, // Hide follower count
          followingCount: 0, // Hide following count
          collectionCount: 0, // Hide collection count
        },
        isFollowing,
        isOwnProfile: false,
      });
    }

    const { _count, ...userData } = user;
    return NextResponse.json({
      ...userData,
      stats: {
        resourceCount: _count.resources,
        followerCount: _count.followers,
        followingCount: _count.following,
        collectionCount: _count.collections,
      },
      isFollowing,
      isOwnProfile,
    });
  } catch (error) {
    captureError("Error fetching public profile:", error);
    return serverError();
  }
}
