import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { formatPrice, getResourceStatus } from "@/lib/utils/price";
import { requireAuth, requireSeller, unauthorized, forbidden } from "@/lib/api";
import { PLATFORM_FEE_PERCENT } from "@/lib/constants";

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
    if (!seller) return forbidden("Nur für Verkäufer zugänglich");

    // Fetch data in parallel
    const [materials, transactions, totalEarnings, followerCount] = await Promise.all([
      // Get seller's materials with transaction counts
      prisma.resource.findMany({
        where: { seller_id: userId },
        select: {
          id: true,
          title: true,
          price: true,
          is_published: true,
          is_approved: true,
          created_at: true,
          _count: {
            select: { transactions: { where: { status: "COMPLETED" } } },
          },
          transactions: {
            where: { status: "COMPLETED" },
            select: { amount: true },
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
    const totalDownloads = materials.reduce((sum, r) => sum + r._count.transactions, 0);

    // Transform materials
    const transformedMaterials = materials.map((material) => {
      const grossEarnings = material.transactions.reduce((sum, t) => sum + t.amount, 0);
      const netEarnings = grossEarnings * (1 - platformFeeRate);

      return {
        id: material.id,
        title: material.title,
        type: "Material",
        status: getResourceStatus(material.is_published, material.is_approved),
        downloads: material._count.transactions,
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

    return NextResponse.json({
      stats: {
        netEarnings: formatPrice(totalNet, { showFreeLabel: false }),
        totalDownloads,
        followers: followerCount,
      },
      materials: transformedMaterials,
      transactions: transformedTransactions,
    });
  } catch (error) {
    console.error("Error fetching seller dashboard:", error);
    return NextResponse.json({ error: "Fehler beim Laden der Dashboard-Daten" }, { status: 500 });
  }
}
