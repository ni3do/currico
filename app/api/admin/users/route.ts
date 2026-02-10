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
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [{ display_name: { contains: search } }, { email: { contains: search } }];
    }

    if (role && role !== "all") {
      where.role = role.toUpperCase();
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          display_name: true,
          email: true,
          role: true,
          stripe_onboarding_complete: true,
          stripe_charges_enabled: true,
          is_protected: true,
          is_verified_seller: true,
          emailVerified: true,
          created_at: true,
          image: true,
          _count: {
            select: {
              resources: true,
              transactions: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Transform users to include status
    // Status is based on email verification and Stripe setup for sellers
    const transformedUsers = users.map((user) => ({
      ...user,
      status: user.emailVerified
        ? user.role === "SELLER" && !user.stripe_charges_enabled
          ? "pending"
          : "active"
        : "pending",
      resourceCount: user._count.resources,
      transactionCount: user._count.transactions,
    }));

    return NextResponse.json({
      users: transformedUsers,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Fehler beim Laden der Benutzer" }, { status: 500 });
  }
}
