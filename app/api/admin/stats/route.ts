import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    // Get counts in parallel
    const [
      totalUsers,
      newUsersToday,
      totalResources,
      pendingApproval,
      totalTransactions,
      todayTransactions,
      schoolCount,
      sellerCount,
      buyerCount,
      openReports,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { created_at: { gte: todayStart } },
      }),
      prisma.resource.count(),
      prisma.resource.count({
        where: { is_approved: false, is_published: true },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: "COMPLETED" },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: "COMPLETED", created_at: { gte: todayStart } },
      }),
      prisma.user.count({ where: { role: "SCHOOL" } }),
      prisma.user.count({ where: { role: "SELLER" } }),
      prisma.user.count({ where: { role: "BUYER" } }),
      prisma.report.count({ where: { status: { in: ["OPEN", "IN_REVIEW"] } } }),
    ]);

    // Get weekly revenue data
    const weeklyRevenue = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date(todayStart);
        date.setDate(date.getDate() - (6 - i));
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        return prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            status: "COMPLETED",
            created_at: { gte: date, lt: nextDate },
          },
        });
      })
    );

    const stats = {
      totalUsers,
      newUsersToday,
      totalResources,
      pendingApproval,
      totalRevenue: (totalTransactions._sum.amount || 0) / 100, // Convert cents to CHF
      revenueToday: (todayTransactions._sum.amount || 0) / 100,
      activeSchools: schoolCount,
      openReports,
      userBreakdown: {
        buyers: buyerCount,
        sellers: sellerCount,
        schools: schoolCount,
      },
      weeklyRevenue: weeklyRevenue.map((r) => (r._sum.amount || 0) / 100),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
