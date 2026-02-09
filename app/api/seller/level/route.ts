import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireSeller, unauthorized, forbidden } from "@/lib/api";
import {
  calculatePoints,
  getCurrentLevel,
  getProgressToNextLevel,
  getDownloadMultiplier,
} from "@/lib/utils/seller-levels";

/**
 * GET /api/seller/level
 * Returns the current seller's level, points, stats, and progress.
 * Access: Authenticated seller only.
 */
export async function GET() {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    const seller = await requireSeller(userId);
    if (!seller) return forbidden("Nur für Verkäufer zugänglich");

    const [uploadCount, downloadCount, reviewData] = await Promise.all([
      prisma.resource.count({
        where: { seller_id: userId },
      }),
      prisma.transaction.count({
        where: {
          resource: { seller_id: userId },
          status: "COMPLETED",
        },
      }),
      // Reviews on this seller's resources + average rating
      prisma.review.aggregate({
        where: {
          resource: { seller_id: userId },
        },
        _count: { id: true },
        _avg: { rating: true },
      }),
    ]);

    const reviewCount = reviewData._count.id;
    const avgRating = reviewData._avg.rating;

    const points = calculatePoints({
      uploads: uploadCount,
      downloads: downloadCount,
      reviews: reviewCount,
      avgRating,
    });
    const level = getCurrentLevel(points);
    const progress = getProgressToNextLevel(points);
    const downloadMultiplier = getDownloadMultiplier(avgRating);

    // Update cached fields on user (fire-and-forget)
    prisma.user
      .update({
        where: { id: userId },
        data: { seller_level: level.level, seller_xp: points },
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
    });
  } catch (error) {
    console.error("Error fetching seller level:", error);
    return NextResponse.json({ error: "Fehler beim Laden der Level-Daten" }, { status: 500 });
  }
}
