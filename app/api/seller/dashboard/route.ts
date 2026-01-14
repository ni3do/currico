import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

/**
 * GET /api/seller/dashboard
 * Get seller dashboard data including stats, resources, and transactions
 * Access: Authenticated seller only
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check if user is a seller
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { is_seller: true, role: true },
    });

    if (!user?.is_seller && user?.role !== "SELLER") {
      return NextResponse.json(
        { error: "Nur für Verkäufer zugänglich" },
        { status: 403 }
      );
    }

    // Fetch data in parallel
    const [resources, transactions, totalEarnings] = await Promise.all([
      // Get seller's resources with transaction counts
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
      }),
      // Get recent transactions for this seller's resources
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
    ]);

    // Calculate stats
    const platformFeeRate = 0.15; // 15%
    const totalGross = totalEarnings._sum.amount || 0;
    const totalNet = totalGross * (1 - platformFeeRate);
    const totalDownloads = resources.reduce((sum, r) => sum + r._count.transactions, 0);

    // Transform resources
    const transformedResources = resources.map((resource) => {
      const grossEarnings = resource.transactions.reduce((sum, t) => sum + t.amount, 0);
      const netEarnings = grossEarnings * (1 - platformFeeRate);

      let status = "Entwurf";
      if (resource.is_approved) {
        status = "Verified";
      } else if (resource.is_published) {
        status = "Pending";
      }

      return {
        id: resource.id,
        title: resource.title,
        type: "Resource",
        status,
        downloads: resource._count.transactions,
        netEarnings: `CHF ${(netEarnings / 100).toFixed(2)}`,
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
        gross: `CHF ${(gross / 100).toFixed(2)}`,
        platformFee: `CHF ${(platformFee / 100).toFixed(2)}`,
        sellerPayout: `CHF ${(sellerPayout / 100).toFixed(2)}`,
      };
    });

    return NextResponse.json({
      stats: {
        netEarnings: `CHF ${(totalNet / 100).toFixed(2)}`,
        totalDownloads,
        followers: 0, // TODO: Implement following feature
      },
      resources: transformedResources,
      transactions: transformedTransactions,
    });
  } catch (error) {
    console.error("Error fetching seller dashboard:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Dashboard-Daten" },
      { status: 500 }
    );
  }
}
