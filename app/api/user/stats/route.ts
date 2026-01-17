import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

/**
 * GET /api/user/stats
 * Fetch user statistics for the account page
 */
export async function GET() {
  // Authentication check
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    // Get user data with relations counts
    const [purchasedCount, downloadedCount, wishlistCount, uploadedCount, user] = await Promise.all(
      [
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
      ]
    );

    if (!user) {
      return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 });
    }

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
        followedSellers: 0, // TODO: Implement following feature
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json({ error: "Fehler beim Laden der Statistiken" }, { status: 500 });
  }
}
