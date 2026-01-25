import { NextRequest, NextResponse } from "next/server";
import { prisma, publicUserSelect } from "@/lib/db";
import { toStringArray } from "@/lib/json-array";
import { parsePagination, paginationResponse } from "@/lib/api";

/**
 * GET /api/users/search
 * Search for users/profiles
 * Query params:
 *   - q: search query (searches name, display_name, bio)
 *   - subjects: comma-separated list of subjects to filter by
 *   - cycles: comma-separated list of cycles to filter by
 *   - role: filter by role (SELLER, etc.)
 *   - page, limit: pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams, { limit: 12 });

    const query = searchParams.get("q") || "";
    const subjectsParam = searchParams.get("subjects");
    const cyclesParam = searchParams.get("cycles");
    const role = searchParams.get("role");

    const subjects = subjectsParam ? subjectsParam.split(",") : [];
    const cycles = cyclesParam ? cyclesParam.split(",") : [];

    // Build where clause
    const where: Record<string, unknown> = {};

    // Search by name/display_name/bio
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { display_name: { contains: query, mode: "insensitive" } },
        { bio: { contains: query, mode: "insensitive" } },
      ];
    }

    // For MySQL with JSON columns, use raw SQL for array overlap checks
    if (subjects.length > 0 || cycles.length > 0) {
      const conditions: string[] = [];
      const params: string[] = [];

      if (subjects.length > 0) {
        // JSON_OVERLAPS checks if any value in the array matches
        conditions.push(`JSON_OVERLAPS(subjects, ?)`);
        params.push(JSON.stringify(subjects));
      }

      if (cycles.length > 0) {
        conditions.push(`JSON_OVERLAPS(cycles, ?)`);
        params.push(JSON.stringify(cycles));
      }

      const sqlConditions = conditions.join(" AND ");
      const query = `SELECT id FROM users WHERE ${sqlConditions}`;
      const results = await prisma.$queryRawUnsafe<{ id: string }[]>(query, ...params);
      const filteredIds = results.map((r) => r.id);

      if (filteredIds.length === 0) {
        return NextResponse.json({
          profiles: [],
          pagination: paginationResponse(page, limit, 0),
        });
      }

      where.id = { in: filteredIds };
    }

    // Filter by role
    if (role) {
      where.role = role;
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users
    const users = await prisma.user.findMany({
      where,
      select: {
        ...publicUserSelect,
        _count: {
          select: {
            resources: { where: { is_published: true, is_public: true } },
            followers: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: [
        { role: "asc" }, // SELLER first
        { created_at: "desc" },
      ],
    });

    // Transform response
    const profiles = users.map((u) => ({
      id: u.id,
      name: u.display_name || u.name,
      image: u.image,
      bio: u.bio,
      subjects: toStringArray(u.subjects),
      cycles: toStringArray(u.cycles),
      cantons: toStringArray(u.cantons),
      role: u.role,
      created_at: u.created_at,
      resourceCount: u._count.resources,
      followerCount: u._count.followers,
    }));

    return NextResponse.json({
      profiles,
      pagination: paginationResponse(page, limit, total),
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json({ error: "Fehler bei der Suche" }, { status: 500 });
  }
}
