import { NextRequest, NextResponse } from "next/server";
import { prisma, privateUserSelect } from "@/lib/db";
import { toStringArray } from "@/lib/json-array";
import { updateNotificationPreferencesSchema } from "@/lib/validations/user";
import { getCurrentUserId } from "@/lib/auth";

/**
 * PATCH /api/users/me/notifications
 * Update the current user's notification preferences
 * Access: Authenticated user only
 */
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
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
