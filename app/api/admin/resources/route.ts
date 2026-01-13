import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin, unauthorizedResponse } from "@/lib/admin-auth";

const resourceSelect = Prisma.validator<Prisma.ResourceSelect>()({
  id: true,
  title: true,
  description: true,
  price: true,
  subjects: true,
  cycles: true,
  is_published: true,
  is_approved: true,
  created_at: true,
  updated_at: true,
  seller: {
    select: {
      id: true,
      display_name: true,
      email: true,
    },
  },
  _count: {
    select: {
      transactions: true,
    },
  },
});

type ResourceWithRelations = Prisma.ResourceGetPayload<{
  select: typeof resourceSelect;
}>;

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return unauthorizedResponse();
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "all";

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status === "pending") {
      where.is_approved = false;
      where.is_published = true;
    } else if (status === "approved") {
      where.is_approved = true;
    } else if (status === "draft") {
      where.is_published = false;
    }

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        select: resourceSelect,
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.resource.count({ where }),
    ]);

    // Transform resources
    const transformedResources = resources.map((resource: ResourceWithRelations) => {
      let resourceStatus = "Draft";
      if (resource.is_approved) {
        resourceStatus = "Verified";
      } else if (resource.is_published) {
        resourceStatus = "Pending";
      }

      return {
        ...resource,
        status: resourceStatus,
        priceFormatted: (resource.price / 100).toFixed(2),
        subjects: resource.subjects,
        cycles: resource.cycles,
        salesCount: resource._count.transactions,
      };
    });

    return NextResponse.json({
      resources: transformedResources,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { id, is_approved } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Resource ID is required" },
        { status: 400 }
      );
    }

    const updated = await prisma.resource.update({
      where: { id },
      data: { is_approved },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating resource:", error);
    return NextResponse.json(
      { error: "Failed to update resource" },
      { status: 500 }
    );
  }
}
