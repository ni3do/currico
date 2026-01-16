import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, unauthorizedResponse } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return unauthorizedResponse();
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const status = searchParams.get("status") || "all";

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [transactions, total, todayRevenue, weekRevenue, monthRevenue] =
      await Promise.all([
        prisma.transaction.findMany({
          where,
          select: {
            id: true,
            amount: true,
            status: true,
            created_at: true,
            buyer: {
              select: {
                id: true,
                display_name: true,
                email: true,
              },
            },
            resource: {
              select: {
                id: true,
                title: true,
                seller: {
                  select: {
                    id: true,
                    display_name: true,
                  },
                },
              },
            },
          },
          orderBy: { created_at: "desc" },
          skip,
          take: limit,
        }),
        prisma.transaction.count({ where }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { status: "COMPLETED", created_at: { gte: todayStart } },
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { status: "COMPLETED", created_at: { gte: weekStart } },
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { status: "COMPLETED", created_at: { gte: monthStart } },
        }),
      ]);

    // Transform transactions
    const transformedTransactions = transactions.map((tx) => ({
      ...tx,
      amountFormatted: (tx.amount / 100).toFixed(2),
      statusLabel:
        tx.status === "COMPLETED"
          ? "Abgeschlossen"
          : tx.status === "REFUNDED"
          ? "Erstattet"
          : tx.status === "PENDING"
          ? "Ausstehend"
          : "Fehlgeschlagen",
    }));

    return NextResponse.json({
      transactions: transformedTransactions,
      summary: {
        today: (todayRevenue._sum.amount || 0) / 100,
        week: (weekRevenue._sum.amount || 0) / 100,
        month: (monthRevenue._sum.amount || 0) / 100,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
