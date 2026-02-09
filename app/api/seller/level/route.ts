import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireSeller, unauthorized, forbidden } from "@/lib/api";
import {
  calculatePoints,
  getCurrentLevel,
  getProgressToNextLevel,
  getDownloadMultiplier,
} from "@/lib/utils/seller-levels";
import { checkVerificationEligibility } from "@/lib/utils/verified-seller";

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

    const [uploadCount, downloadCount, reviewData, publishedResourceCount, openReportCount, user] =
      await Promise.all([
        prisma.resource.count({
          where: { seller_id: userId },
        }),
        prisma.transaction.count({
          where: {
            resource: { seller_id: userId },
            status: "COMPLETED",
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
        prisma.report.count({
          where: {
            reported_user_id: userId,
            status: { in: ["OPEN", "IN_REVIEW"] },
          },
        }),
        prisma.user.findUniqueOrThrow({
          where: { id: userId },
          select: {
            created_at: true,
            is_verified_seller: true,
            verified_seller_method: true,
          },
        }),
      ]);

    const reviewCount = reviewData._count.id;
    const avgRating = reviewData._avg.rating;
    const downloadMultiplier = getDownloadMultiplier(avgRating);

    // Check verified seller eligibility first (affects points calculation)
    const verification = checkVerificationEligibility({
      totalSales: downloadCount,
      avgRating,
      publishedResourceCount,
      accountCreatedAt: user.created_at,
      openReportCount,
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
    const level = getCurrentLevel(points);
    const progress = getProgressToNextLevel(points);

    // Add level cache to update
    updateData.seller_level = level.level;
    updateData.seller_xp = points;

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
      isVerifiedSeller,
      verificationProgress: {
        metCount: verification.metCount,
        totalCriteria: 5,
        failedCriteria: verification.failedCriteria,
      },
    });
  } catch (error) {
    console.error("Error fetching seller level:", error);
    return NextResponse.json({ error: "Fehler beim Laden der Level-Daten" }, { status: 500 });
  }
}
