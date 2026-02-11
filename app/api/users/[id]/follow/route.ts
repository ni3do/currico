import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized, badRequest, notFound } from "@/lib/api";
import { checkRateLimit, rateLimitHeaders, isValidId } from "@/lib/rateLimit";
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
    return NextResponse.json(
      {
        error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut.",
        retryAfter: rateLimitResult.retryAfter,
      },
      { status: 429, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  try {
    const { id: targetUserId } = await params;

    // Validate user ID format
    if (!isValidId(targetUserId)) {
      return badRequest("Ungültige Benutzer-ID");
    }

    // Can't follow yourself
    if (targetUserId === currentUserId) {
      return badRequest("Sie können sich nicht selbst folgen");
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
    console.error("Error following user:", error);
    return NextResponse.json({ error: "Fehler beim Folgen des Benutzers" }, { status: 500 });
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
    return NextResponse.json(
      {
        error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut.",
        retryAfter: rateLimitResult.retryAfter,
      },
      { status: 429, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  try {
    const { id: targetUserId } = await params;

    // Validate user ID format
    if (!isValidId(targetUserId)) {
      return badRequest("Ungültige Benutzer-ID");
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
    console.error("Error unfollowing user:", error);
    return NextResponse.json({ error: "Fehler beim Entfolgen des Benutzers" }, { status: 500 });
  }
}
