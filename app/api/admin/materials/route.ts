import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin, forbiddenResponse } from "@/lib/admin-auth";
import { parsePagination, paginationResponse, serverError } from "@/lib/api";
import { formatPriceAdmin, getResourceStatus } from "@/lib/utils/price";

const materialSelect = Prisma.validator<Prisma.ResourceSelect>()({
  id: true,
  title: true,
  description: true,
  price: true,
  subjects: true,
  cycles: true,
  is_published: true,
  is_approved: true,
  status: true,
  is_public: true,
  file_url: true,
  preview_url: true,
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

type MaterialWithRelations = Prisma.ResourceGetPayload<{
  select: typeof materialSelect;
}>;

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return forbiddenResponse();
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const { page, limit, skip } = parsePagination(searchParams);
    const status = searchParams.get("status") || "all";

    const where: Record<string, unknown> = {};

    if (status === "pending") {
      where.status = "PENDING";
      where.is_published = true;
    } else if (status === "approved") {
      where.status = "VERIFIED";
    } else if (status === "rejected") {
      where.status = "REJECTED";
    } else if (status === "draft") {
      where.is_published = false;
    }

    const [materials, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        select: materialSelect,
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.resource.count({ where }),
    ]);

    // Transform materials
    const transformedMaterials = materials.map((material: MaterialWithRelations) => ({
      ...material,
      status: getResourceStatus(material.is_published, material.is_approved),
      priceFormatted: formatPriceAdmin(material.price),
      subjects: material.subjects,
      cycles: material.cycles,
      salesCount: material._count.transactions,
    }));

    return NextResponse.json({
      materials: transformedMaterials,
      pagination: paginationResponse(page, limit, total),
    });
  } catch (error) {
    console.error("Error fetching materials:", error);
    return serverError();
  }
}
