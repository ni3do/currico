import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  requireAuth,
  unauthorized,
  badRequest,
  notFound,
  rateLimited,
  serverError,
} from "@/lib/api";
import { captureError } from "@/lib/api-error";
import { checkRateLimit, isValidId } from "@/lib/rateLimit";
import { notifyFollow } from "@/lib/notifications";

/**
 * POST /api/users/[id]/follow
 * Follow a user
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUserId = await requireAuth();
  if (!currentUserId) return unauthorized();

  // Rate limiting check
  const rateLimitResult = checkRateLimit(currentUserId, "users:follow");
  if (!rateLimitResult.success) {
    return rateLimited();
  }

  try {
    const { id: targetUserId } = await params;

    // Validate user ID format
    if (!isValidId(targetUserId)) {
      return badRequest("Invalid ID");
    }

    // Can't follow yourself
    if (targetUserId === currentUserId) {
      return badRequest("Cannot follow self");
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true },
    });

    if (!targetUser) {
      return notFound();
    }

    // Create follow relationship (upsert to handle duplicates)
    const follow = await prisma.follow.upsert({
      where: {
        follower_id_followed_id: {
          follower_id: currentUserId,
          followed_id: targetUserId,
        },
      },
      update: {},
      create: {
        follower_id: currentUserId,
        followed_id: targetUserId,
      },
    });

    // Get updated follower count + follower name for notification
    const [followerCount, follower] = await Promise.all([
      prisma.follow.count({ where: { followed_id: targetUserId } }),
      prisma.user.findUnique({
        where: { id: currentUserId },
        select: { display_name: true },
      }),
    ]);

    // Fire-and-forget notification
    notifyFollow(targetUserId, follower?.display_name || "Jemand");

    return NextResponse.json({
      success: true,
      message: "Erfolgreich gefolgt",
      followId: follow.id,
      followerCount,
    });
  } catch (error) {
    captureError("Error following user:", error);
    return serverError();
  }
}

/**
 * DELETE /api/users/[id]/follow
 * Unfollow a user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUserId = await requireAuth();
  if (!currentUserId) return unauthorized();

  // Rate limiting check (same limit as follow)
  const rateLimitResult = checkRateLimit(currentUserId, "users:follow");
  if (!rateLimitResult.success) {
    return rateLimited();
  }

  try {
    const { id: targetUserId } = await params;

    // Validate user ID format
    if (!isValidId(targetUserId)) {
      return badRequest("Invalid ID");
    }

    await prisma.follow.deleteMany({
      where: {
        follower_id: currentUserId,
        followed_id: targetUserId,
      },
    });

    // Get updated follower count
    const followerCount = await prisma.follow.count({
      where: { followed_id: targetUserId },
    });

    return NextResponse.json({
      success: true,
      message: "Erfolgreich entfolgt",
      followerCount,
    });
  } catch (error) {
    captureError("Error unfollowing user:", error);
    return serverError();
  }
}
