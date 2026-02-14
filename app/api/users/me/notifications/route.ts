import { NextRequest, NextResponse } from "next/server";
import { prisma, privateUserSelect } from "@/lib/db";
import { toStringArray } from "@/lib/json-array";
import { updateNotificationPreferencesSchema } from "@/lib/validations/user";
import { getCurrentUserId } from "@/lib/auth";
import type { NotificationType } from "@prisma/client";

const VALID_TYPES: NotificationType[] = ["SALE", "FOLLOW", "REVIEW", "COMMENT", "SYSTEM"];
const DEFAULT_LIMIT = 20;

/**
 * GET /api/users/me/notifications
 * List the current user's notifications (newest first, cursor-based pagination).
 * Query params: ?type=SALE&cursor=...&limit=20&unread=true
 * Access: Authenticated user only
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const url = new URL(request.url);
    const unreadOnly = url.searchParams.get("unread") === "true";
    const typeParam = url.searchParams.get("type");
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(
      50,
      Math.max(1, parseInt(url.searchParams.get("limit") || String(DEFAULT_LIMIT), 10))
    );

    // Build where clause
    const where: Record<string, unknown> = { user_id: userId };
    if (unreadOnly) where.read_at = null;
    if (typeParam && VALID_TYPES.includes(typeParam as NotificationType)) {
      where.type = typeParam as NotificationType;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: limit + 1, // fetch one extra to determine if there are more
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = notifications.length > limit;
    if (hasMore) notifications.pop();

    const nextCursor = hasMore ? notifications[notifications.length - 1]?.id : null;

    const unreadCount = await prisma.notification.count({
      where: { user_id: userId, read_at: null },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}

/**
 * PATCH /api/users/me/notifications
 * Update notification preferences OR mark notifications as read.
 * Body: { markAllRead: true } — marks all as read
 * Body: { notificationId: "..." } — marks one as read
 * Body: { notify_*: boolean } — updates preferences
 * Access: Authenticated user only
 */
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const body = await request.json();

    // Mark all notifications as read
    if (body.markAllRead === true) {
      await prisma.notification.updateMany({
        where: { user_id: userId, read_at: null },
        data: { read_at: new Date() },
      });
      return NextResponse.json({ success: true });
    }

    // Mark a single notification as read
    if (body.notificationId) {
      await prisma.notification.updateMany({
        where: { id: body.notificationId, user_id: userId, read_at: null },
        data: { read_at: new Date() },
      });
      return NextResponse.json({ success: true });
    }

    // Validate input for notification preferences
    const validationResult = updateNotificationPreferencesSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Ungültige Eingabe",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Update user notification preferences
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.notify_new_from_followed !== undefined && {
          notify_new_from_followed: data.notify_new_from_followed,
        }),
        ...(data.notify_recommendations !== undefined && {
          notify_recommendations: data.notify_recommendations,
        }),
        ...(data.notify_material_updates !== undefined && {
          notify_material_updates: data.notify_material_updates,
        }),
        ...(data.notify_review_reminders !== undefined && {
          notify_review_reminders: data.notify_review_reminders,
        }),
        ...(data.notify_wishlist_price_drops !== undefined && {
          notify_wishlist_price_drops: data.notify_wishlist_price_drops,
        }),
        ...(data.notify_welcome_offers !== undefined && {
          notify_welcome_offers: data.notify_welcome_offers,
        }),
        ...(data.notify_sales !== undefined && {
          notify_sales: data.notify_sales,
        }),
        ...(data.notify_newsletter !== undefined && {
          notify_newsletter: data.notify_newsletter,
        }),
        ...(data.notify_platform_updates !== undefined && {
          notify_platform_updates: data.notify_platform_updates,
        }),
        ...(data.notify_comments !== undefined && {
          notify_comments: data.notify_comments,
        }),
        ...(data.notify_new_followers !== undefined && {
          notify_new_followers: data.notify_new_followers,
        }),
      },
      select: privateUserSelect,
    });

    // Ensure JSON array fields are proper arrays
    return NextResponse.json({
      ...updatedUser,
      subjects: toStringArray(updatedUser.subjects),
      cycles: toStringArray(updatedUser.cycles),
      cantons: toStringArray(updatedUser.cantons),
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
