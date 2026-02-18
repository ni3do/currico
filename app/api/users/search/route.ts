import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma, publicUserSelect } from "@/lib/db";
import { toStringArray } from "@/lib/json-array";
import { parsePagination, paginationResponse, rateLimited, serverError } from "@/lib/api";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";

/** Minimum word-level trigram similarity for user name fuzzy search */
const USER_NAME_WORD_SIMILARITY_THRESHOLD = 0.4;

/**
 * GET /api/users/search
 * Search for users/profiles
 * Query params:
 *   - q: search query (searches name, display_name, bio)
 *   - subjects: comma-separated list of subjects to filter by
 *   - cycles: comma-separated list of cycles to filter by
 *   - role: filter by role (SELLER, etc.)
 *   - sort: sorting (newest, mostMaterials, mostFollowers)
 *   - page, limit: pagination
 */
export async function GET(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(getClientIP(request), "users:search");
    if (!rateLimit.success) {
      return rateLimited();
    }

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams, { limit: 12 });

    const query = searchParams.get("q") || "";
    const subjectsParam = searchParams.get("subjects");
    const cyclesParam = searchParams.get("cycles");
    const role = searchParams.get("role");
    const sort = searchParams.get("sort") || "newest";

    const subjects = subjectsParam ? subjectsParam.split(",") : [];
    const cycles = cyclesParam ? cyclesParam.split(",") : [];

    // Build where clause
    const where: Record<string, unknown> = {};

    // Search by name/display_name/bio — with trigram fuzzy fallback
    if (query) {
      // First try exact contains match
      const exactCount = await prisma.user.count({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { display_name: { contains: query, mode: "insensitive" } },
            { bio: { contains: query, mode: "insensitive" } },
          ],
        },
      });

      if (exactCount > 0) {
        where.OR = [
          { name: { contains: query, mode: "insensitive" } },
          { display_name: { contains: query, mode: "insensitive" } },
          { bio: { contains: query, mode: "insensitive" } },
        ];
      } else {
        // Fuzzy fallback: use trigram similarity on name/display_name
        try {
          const fuzzyUsers = await prisma.$queryRaw<{ id: string }[]>`
            SELECT id FROM users
            WHERE word_similarity(${query}, COALESCE(name, '')) > ${USER_NAME_WORD_SIMILARITY_THRESHOLD}
               OR word_similarity(${query}, COALESCE(display_name, '')) > ${USER_NAME_WORD_SIMILARITY_THRESHOLD}
            ORDER BY GREATEST(
              word_similarity(${query}, COALESCE(name, '')),
              word_similarity(${query}, COALESCE(display_name, ''))
            ) DESC
            LIMIT 50
          `;

          if (fuzzyUsers.length > 0) {
            where.id = { in: fuzzyUsers.map((u) => u.id) };
          } else {
            // No fuzzy matches either — return empty
            return NextResponse.json({
              profiles: [],
              pagination: paginationResponse(page, limit, 0),
            });
          }
        } catch {
          // pg_trgm not available — fall back to original contains
          where.OR = [
            { name: { contains: query, mode: "insensitive" } },
            { display_name: { contains: query, mode: "insensitive" } },
            { bio: { contains: query, mode: "insensitive" } },
          ];
        }
      }
    }

    // Filter by subjects/cycles: look up sellers who have published resources matching the criteria
    let matchingCountBySeller: Map<string, number> | undefined;
    if (subjects.length > 0 || cycles.length > 0) {
      const conditions = [Prisma.sql`is_published = true AND is_public = true`];

      if (subjects.length > 0) {
        conditions.push(Prisma.sql`subjects::jsonb ?| ${subjects}::text[]`);
      }
      if (cycles.length > 0) {
        conditions.push(Prisma.sql`cycles::jsonb ?| ${cycles}::text[]`);
      }

      const results = await prisma.$queryRaw<{ seller_id: string; cnt: bigint }[]>`
        SELECT seller_id, COUNT(*)::bigint AS cnt FROM resources
        WHERE ${Prisma.join(conditions, " AND ")}
        GROUP BY seller_id
      `;

      if (results.length === 0) {
        return NextResponse.json({
          profiles: [],
          pagination: paginationResponse(page, limit, 0),
        });
      }

      matchingCountBySeller = new Map(results.map((r) => [r.seller_id, Number(r.cnt)]));
      where.id = { in: results.map((r) => r.seller_id) };
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
      orderBy:
        sort === "mostMaterials"
          ? [{ resources: { _count: "desc" } }, { created_at: "desc" }]
          : sort === "mostFollowers"
            ? [{ followers: { _count: "desc" } }, { created_at: "desc" }]
            : [{ created_at: "desc" }],
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
      ...(matchingCountBySeller && { matchingResourceCount: matchingCountBySeller.get(u.id) ?? 0 }),
    }));

    return NextResponse.json({
      profiles,
      pagination: paginationResponse(page, limit, total),
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return serverError("Fehler bei der Suche");
  }
}
