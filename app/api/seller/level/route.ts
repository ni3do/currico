import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireSeller, unauthorized, forbidden, serverError } from "@/lib/api";
import {
  calculatePoints,
  getCurrentLevel,
  getProgressToNextLevel,
  getDownloadMultiplier,
  SELLER_LEVELS,
} from "@/lib/utils/seller-levels";
import { checkVerificationEligibility } from "@/lib/utils/verified-seller";
import { createNotification } from "@/lib/notifications";

/**
 * GET /api/seller/level
 * Returns the current seller's level, points, stats, and progress.
 * Also handles auto-verification/revocation for verified seller status.
 * Access: Authenticated seller only.
 */
export async function GET() {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    const seller = await requireSeller(userId);
    if (!seller) return forbidden("Nur für Verkäufer zugänglich");

    const [
      uploadCount,
      paidDownloadCount,
      freeDownloadCount,
      reviewData,
      publishedResourceCount,
      user,
    ] = await Promise.all([
      prisma.resource.count({
        where: { seller_id: userId },
      }),
      prisma.transaction.count({
        where: {
          resource: { seller_id: userId },
          status: "COMPLETED",
        },
      }),
      prisma.download.count({
        where: {
          resource: { seller_id: userId },
        },
      }),
      prisma.review.aggregate({
        where: {
          resource: { seller_id: userId },
        },
        _count: { id: true },
        _avg: { rating: true },
      }),
      prisma.resource.count({
        where: { seller_id: userId, is_published: true, is_public: true },
      }),
      prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          created_at: true,
          is_verified_seller: true,
          verified_seller_method: true,
          seller_level: true,
        },
      }),
    ]);

    const downloadCount = paidDownloadCount + freeDownloadCount;
    const reviewCount = reviewData._count.id;
    const avgRating = reviewData._avg.rating;
    const downloadMultiplier = getDownloadMultiplier(avgRating);

    // Check verified seller eligibility first (affects points calculation)
    const verification = checkVerificationEligibility({
      totalSales: downloadCount,
      avgRating,
      publishedResourceCount,
      accountCreatedAt: user.created_at,
    });

    // Determine verified status after potential auto-verify/revoke
    let isVerifiedSeller = user.is_verified_seller;
    const updateData: Record<string, unknown> = {};

    // Auto-verify if eligible and not yet verified
    if (verification.eligible && !user.is_verified_seller) {
      isVerifiedSeller = true;
      updateData.is_verified_seller = true;
      updateData.verified_seller_at = new Date();
      updateData.verified_seller_method = "auto";
    }

    // Auto-revoke if no longer eligible and was auto-verified (never revoke manual)
    if (
      !verification.eligible &&
      user.is_verified_seller &&
      user.verified_seller_method === "auto"
    ) {
      isVerifiedSeller = false;
      updateData.is_verified_seller = false;
      updateData.verified_seller_at = null;
      updateData.verified_seller_method = null;
    }

    // Calculate points with verified bonus
    const points = calculatePoints({
      uploads: uploadCount,
      downloads: downloadCount,
      reviews: reviewCount,
      avgRating,
      isVerifiedSeller,
    });
    const sellerStats = { uploads: uploadCount, downloads: downloadCount };
    const level = getCurrentLevel(points, sellerStats);
    const progress = getProgressToNextLevel(points, sellerStats);

    // Add level cache to update
    updateData.seller_level = level.level;
    updateData.seller_xp = points;

    // Level-up notification: compare previous cached level with current
    const LEVEL_DISPLAY_NAMES: Record<string, string> = {
      bronze: "Bronze",
      silber: "Silber",
      gold: "Gold",
      platin: "Platin",
      diamant: "Diamant",
    };
    const previousLevel = user.seller_level ?? 0;
    if (level.level > previousLevel) {
      const newLevelDef = SELLER_LEVELS[level.level];
      const displayName = LEVEL_DISPLAY_NAMES[newLevelDef?.name ?? ""] ?? newLevelDef?.name ?? "";
      createNotification({
        userId,
        type: "SYSTEM",
        title: `Level-Up: ${displayName}!`,
        body: `Herzlichen Glückwunsch! Sie haben Level ${level.level} (${displayName}) erreicht.`,
        link: "/konto",
      }).catch((err) => console.error("Failed to create level-up notification:", err));
    }

    // Fire-and-forget update
    prisma.user
      .update({
        where: { id: userId },
        data: updateData,
      })
      .catch(() => {});

    return NextResponse.json({
      points,
      level: level.level,
      levelName: level.name,
      uploads: uploadCount,
      downloads: downloadCount,
      reviews: reviewCount,
      avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
      downloadMultiplier,
      progressPercent: progress.progressPercent,
      pointsNeeded: progress.pointsNeeded,
      nextLevelName: progress.next?.name ?? null,
      blockers: progress.blockers,
      requirements: progress.requirements,
      isVerifiedSeller,
      verificationProgress: {
        metCount: verification.metCount,
        totalCriteria: 4,
        failedCriteria: verification.failedCriteria,
      },
    });
  } catch (error) {
    console.error("Error fetching seller level:", error);
    return serverError("Fehler beim Laden der Level-Daten");
  }
}
