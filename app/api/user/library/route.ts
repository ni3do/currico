import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toStringArray } from "@/lib/json-array";
import { formatPrice } from "@/lib/utils/price";
import { getFileFormat } from "@/lib/utils/file-format";
import { requireAuth, unauthorized, parsePagination, paginationResponse } from "@/lib/api";

/**
 * GET /api/user/library
 * Fetch all resources in user's library (purchased + free downloads)
 * Query params:
 * - type: "acquired" (default) | "uploaded" - filter by resource type
 * - search: search query for title
 * - limit: max items to return
 * - offset: pagination offset
 */
export async function GET(request: NextRequest) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "acquired";
    const { page, limit, skip } = parsePagination(searchParams, { limit: 50 });

    // If type is "uploaded", return user's own resources
    if (type === "uploaded") {
      const sort = searchParams.get("sort") || "newest";
      const orderBy: Record<string, "asc" | "desc"> =
        sort === "oldest"
          ? { created_at: "asc" }
          : sort === "title"
            ? { title: "asc" }
            : { created_at: "desc" };

      const uploadedResources = await prisma.resource.findMany({
        where: {
          seller_id: userId,
          ...(search ? { title: { contains: search } } : {}),
        },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          file_url: true,
          preview_url: true,
          subjects: true,
          cycles: true,
          is_approved: true,
          status: true,
          created_at: true,
          _count: {
            select: {
              downloads: true,
              transactions: { where: { status: "COMPLETED" } },
            },
          },
        },
        orderBy,
        take: limit,
        skip,
      });

      const uploadedCount = await prisma.resource.count({
        where: { seller_id: userId },
      });

      let items = uploadedResources.map((r) => {
        const subjects = toStringArray(r.subjects);
        const cycles = toStringArray(r.cycles);
        return {
          id: r.id,
          title: r.title,
          description: r.description,
          price: r.price,
          priceFormatted: formatPrice(r.price),
          fileUrl: r.file_url,
          previewUrl: r.preview_url,
          subjects,
          cycles,
          verified: r.is_approved && r.status === "VERIFIED",
          status: r.status,
          isApproved: r.is_approved,
          type: "uploaded" as const,
          fileFormat: getFileFormat(r.file_url),
          createdAt: r.created_at,
          downloadCount: r._count.downloads + r._count.transactions,
          purchaseCount: r._count.transactions,
        };
      });

      // Sort by popularity (download count) client-side since Prisma can't sort by _count easily
      if (sort === "popular") {
        items = items.sort((a, b) => b.downloadCount - a.downloadCount);
      }

      return NextResponse.json({
        items,
        stats: {
          totalUploaded: uploadedCount,
        },
        pagination: paginationResponse(page, limit, uploadedCount),
      });
    }

    // Get purchased resources (completed transactions)
    const purchasedResources = await prisma.transaction.findMany({
      where: {
        buyer_id: userId,
        status: "COMPLETED",
        resource: search
          ? {
              title: { contains: search },
            }
          : undefined,
      },
      select: {
        id: true,
        created_at: true,
        amount: true,
        resource: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            file_url: true,
            preview_url: true,
            subjects: true,
            cycles: true,
            is_approved: true,
            status: true,
            seller: {
              select: {
                id: true,
                display_name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: limit,
      skip,
    });

    // Get free downloads
    const freeDownloads = await prisma.download.findMany({
      where: {
        user_id: userId,
        resource: search
          ? {
              title: { contains: search },
              price: 0, // Only free resources
            }
          : {
              price: 0,
            },
      },
      select: {
        id: true,
        created_at: true,
        resource: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            file_url: true,
            preview_url: true,
            subjects: true,
            cycles: true,
            is_approved: true,
            status: true,
            seller: {
              select: {
                id: true,
                display_name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: limit,
      skip,
    });

    // Combine and transform the results
    const libraryItems = [
      ...purchasedResources.map((t) => {
        const subjects = toStringArray(t.resource.subjects);
        const cycles = toStringArray(t.resource.cycles);
        return {
          id: t.resource.id,
          title: t.resource.title,
          description: t.resource.description,
          price: t.resource.price,
          priceFormatted: formatPrice(t.resource.price),
          fileUrl: t.resource.file_url,
          previewUrl: t.resource.preview_url,
          subjects,
          cycles,
          verified: t.resource.is_approved && t.resource.status === "VERIFIED",
          type: "purchased" as const,
          acquiredAt: t.created_at,
          amountPaid: t.amount,
          seller: {
            id: t.resource.seller.id,
            displayName: t.resource.seller.display_name,
            image: t.resource.seller.image,
          },
        };
      }),
      ...freeDownloads.map((d) => {
        const subjects = toStringArray(d.resource.subjects);
        const cycles = toStringArray(d.resource.cycles);
        return {
          id: d.resource.id,
          title: d.resource.title,
          description: d.resource.description,
          price: d.resource.price,
          priceFormatted: formatPrice(d.resource.price),
          fileUrl: d.resource.file_url,
          previewUrl: d.resource.preview_url,
          subjects,
          cycles,
          verified: d.resource.is_approved && d.resource.status === "VERIFIED",
          type: "free" as const,
          acquiredAt: d.created_at,
          amountPaid: 0,
          seller: {
            id: d.resource.seller.id,
            displayName: d.resource.seller.display_name,
            image: d.resource.seller.image,
          },
        };
      }),
    ];

    // Remove duplicates (in case a resource was both purchased and downloaded)
    const uniqueItems = libraryItems.reduce(
      (acc, item) => {
        if (!acc.seen.has(item.id)) {
          acc.seen.add(item.id);
          acc.items.push(item);
        }
        return acc;
      },
      { seen: new Set<string>(), items: [] as typeof libraryItems }
    ).items;

    // Sort by acquired date (most recent first)
    uniqueItems.sort((a, b) => new Date(b.acquiredAt).getTime() - new Date(a.acquiredAt).getTime());

    // Get counts for stats
    const [purchasedCount, downloadedCount] = await Promise.all([
      prisma.transaction.count({
        where: { buyer_id: userId, status: "COMPLETED" },
      }),
      prisma.download.count({
        where: { user_id: userId },
      }),
    ]);

    return NextResponse.json({
      items: uniqueItems,
      stats: {
        totalPurchased: purchasedCount,
        totalDownloaded: downloadedCount,
        totalInLibrary: purchasedCount + downloadedCount,
      },
      pagination: paginationResponse(page, limit, purchasedCount + downloadedCount),
    });
  } catch (error) {
    console.error("Error fetching library:", error);
    return NextResponse.json({ error: "LIBRARY_FETCH_FAILED" }, { status: 500 });
  }
}
