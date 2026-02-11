import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toStringArray } from "@/lib/json-array";
import { requireAuth, unauthorized, notFound } from "@/lib/api";

/**
 * GET /api/user/stats
 * Fetch user statistics for the account page
 */
export async function GET() {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    // Get user data with relations counts
    const [purchasedCount, downloadedCount, wishlistCount, uploadedCount, followingCount, user] =
      await Promise.all([
        // Purchased resources (completed transactions)
        prisma.transaction.count({
          where: {
            buyer_id: userId,
            status: "COMPLETED",
          },
        }),
        // Free downloads
        prisma.download.count({
          where: { user_id: userId },
        }),
        // Wishlist items
        prisma.wishlist.count({
          where: { user_id: userId },
        }),
        // Uploaded resources (as seller)
        prisma.resource.count({
          where: { seller_id: userId },
        }),
        // Following count
        prisma.follow.count({
          where: { follower_id: userId },
        }),
        // User profile data
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            display_name: true,
            bio: true,
            subjects: true,
            cycles: true,
            cantons: true,
            website: true,
            school: true,
            teaching_experience: true,
            preferred_language: true,
            instagram: true,
            pinterest: true,
            is_private: true,
            role: true,
            seller_xp: true,
            stripe_charges_enabled: true,
            // Notification preferences
            notify_new_from_followed: true,
            notify_recommendations: true,
            notify_material_updates: true,
            notify_review_reminders: true,
            notify_wishlist_price_drops: true,
            notify_welcome_offers: true,
            notify_sales: true,
            notify_newsletter: true,
            notify_platform_updates: true,
          },
        }),
      ]);

    if (!user) return notFound();

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        displayName: user.display_name,
        bio: user.bio,
        subjects: toStringArray(user.subjects),
        cycles: toStringArray(user.cycles),
        cantons: toStringArray(user.cantons),
        website: user.website,
        school: user.school,
        teaching_experience: user.teaching_experience,
        preferred_language: user.preferred_language,
        instagram: user.instagram,
        pinterest: user.pinterest,
        is_private: user.is_private,
        isSeller: user.role === "SELLER",
        sellerPoints: user.seller_xp,
        stripeChargesEnabled: user.stripe_charges_enabled,
        // Notification preferences
        notify_new_from_followed: user.notify_new_from_followed,
        notify_recommendations: user.notify_recommendations,
        notify_material_updates: user.notify_material_updates,
        notify_review_reminders: user.notify_review_reminders,
        notify_wishlist_price_drops: user.notify_wishlist_price_drops,
        notify_welcome_offers: user.notify_welcome_offers,
        notify_sales: user.notify_sales,
        notify_newsletter: user.notify_newsletter,
        notify_platform_updates: user.notify_platform_updates,
      },
      stats: {
        purchasedResources: purchasedCount,
        downloadedResources: downloadedCount,
        totalInLibrary: purchasedCount + downloadedCount,
        wishlistItems: wishlistCount,
        uploadedResources: uploadedCount,
        followedSellers: followingCount,
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json({ error: "Fehler beim Laden der Statistiken" }, { status: 500 });
  }
}
