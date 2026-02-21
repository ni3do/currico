import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { formatPrice, getResourceStatus } from "@/lib/utils/price";
import { requireAuth, requireSeller, unauthorized, forbidden, serverError } from "@/lib/api";
import { captureError } from "@/lib/api-error";
import { PLATFORM_FEE_PERCENT } from "@/lib/constants";
import { getFileFormat } from "@/lib/utils/file-format";

/**
 * GET /api/seller/dashboard
 * Get seller dashboard data including stats, resources, and transactions
 * Access: Authenticated seller only
 */
export async function GET() {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    const seller = await requireSeller(userId);
    if (!seller) return forbidden("Seller only");

    // Fetch data in parallel
    const [materials, transactions, totalEarnings, followerCount] = await Promise.all([
      // Get seller's materials with transaction counts and actual download data
      prisma.resource.findMany({
        where: { seller_id: userId },
        select: {
          id: true,
          title: true,
          price: true,
          file_url: true,
          is_published: true,
          is_approved: true,
          created_at: true,
          _count: {
            select: {
              transactions: { where: { status: "COMPLETED" } },
              downloads: true,
            },
          },
          transactions: {
            where: { status: "COMPLETED" },
            select: {
              amount: true,
              downloadTokens: {
                select: { download_count: true },
              },
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: 50,
      }),
      // Get recent transactions for this seller's materials
      prisma.transaction.findMany({
        where: {
          resource: { seller_id: userId },
          status: "COMPLETED",
        },
        select: {
          id: true,
          amount: true,
          created_at: true,
          resource: {
            select: { title: true },
          },
        },
        orderBy: { created_at: "desc" },
        take: 20,
      }),
      // Get total earnings
      prisma.transaction.aggregate({
        where: {
          resource: { seller_id: userId },
          status: "COMPLETED",
        },
        _sum: { amount: true },
      }),
      // Get follower count
      prisma.follow.count({
        where: { followed_id: userId },
      }),
    ]);

    // Calculate stats
    const platformFeeRate = PLATFORM_FEE_PERCENT / 100;
    const totalGross = totalEarnings._sum.amount || 0;
    const totalNet = totalGross * (1 - platformFeeRate);

    // Calculate actual downloads from download tokens + free downloads
    const totalDownloads = materials.reduce((sum, r) => {
      const paidDownloads = r.transactions.reduce(
        (tSum, t) => tSum + t.downloadTokens.reduce((dSum, dt) => dSum + dt.download_count, 0),
        0
      );
      return sum + paidDownloads + r._count.downloads;
    }, 0);
    const totalPurchases = materials.reduce((sum, r) => sum + r._count.transactions, 0);

    // Transform materials
    const transformedMaterials = materials.map((material) => {
      const grossEarnings = material.transactions.reduce((sum, t) => sum + t.amount, 0);
      const netEarnings = grossEarnings * (1 - platformFeeRate);
      const paidDownloads = material.transactions.reduce(
        (tSum, t) => tSum + t.downloadTokens.reduce((dSum, dt) => dSum + dt.download_count, 0),
        0
      );

      return {
        id: material.id,
        title: material.title,
        type: "Material",
        fileFormat: getFileFormat(material.file_url),
        status: getResourceStatus(material.is_published, material.is_approved),
        purchases: material._count.transactions,
        downloads: paidDownloads + material._count.downloads,
        netEarnings: formatPrice(netEarnings, { showFreeLabel: false }),
      };
    });

    // Transform transactions
    const transformedTransactions = transactions.map((transaction) => {
      const gross = transaction.amount;
      const platformFee = gross * platformFeeRate;
      const sellerPayout = gross - platformFee;

      return {
        id: transaction.id,
        resource: transaction.resource.title,
        date: transaction.created_at.toISOString().split("T")[0],
        gross: formatPrice(gross, { showFreeLabel: false }),
        platformFee: formatPrice(platformFee, { showFreeLabel: false }),
        sellerPayout: formatPrice(sellerPayout, { showFreeLabel: false }),
      };
    });

    return NextResponse.json(
      {
        stats: {
          netEarnings: formatPrice(totalNet, { showFreeLabel: false }),
          totalDownloads,
          totalPurchases,
          followers: followerCount,
        },
        materials: transformedMaterials,
        transactions: transformedTransactions,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=30",
        },
      }
    );
  } catch (error) {
    captureError("Error fetching seller dashboard:", error);
    return serverError();
  }
}
