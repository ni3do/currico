import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, forbiddenResponse } from "@/lib/admin-auth";
import { serverError } from "@/lib/api";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return forbiddenResponse();
  }

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
      sellerCount,
      buyerCount,
      adminCount,
      openReports,
      newMessages,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { created_at: { gte: todayStart } },
      }),
      prisma.resource.count(),
      prisma.resource.count({
        where: { status: "PENDING", is_published: true },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: "COMPLETED" },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: "COMPLETED", created_at: { gte: todayStart } },
      }),
      prisma.user.count({ where: { role: "SELLER" } }),
      prisma.user.count({ where: { role: "BUYER" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.report.count({ where: { status: { in: ["OPEN", "IN_REVIEW"] } } }),
      prisma.contactMessage.count({ where: { status: "NEW" } }),
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
      openReports,
      newMessages,
      userBreakdown: {
        buyers: buyerCount,
        sellers: sellerCount,
        admins: adminCount,
      },
      weeklyRevenue: weeklyRevenue.map((r) => (r._sum.amount || 0) / 100),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return serverError("Fehler beim Laden der Statistiken");
  }
}
