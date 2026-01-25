import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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
            role: true,
            stripe_charges_enabled: true,
          },
        }),
      ]);

    if (!user) return notFound("Benutzer nicht gefunden");

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        displayName: user.display_name,
        bio: user.bio,
        subjects: user.subjects,
        cycles: user.cycles,
        cantons: user.cantons,
        isSeller: user.role === "SELLER",
        stripeChargesEnabled: user.stripe_charges_enabled,
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
