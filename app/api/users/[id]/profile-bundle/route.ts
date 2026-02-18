import { NextRequest, NextResponse } from "next/server";
import { prisma, publicUserSelect } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { badRequest, notFound, rateLimited, serverError } from "@/lib/api";
import { isValidId, checkRateLimit, getClientIP } from "@/lib/rateLimit";

/**
 * GET /api/users/[id]/profile-bundle
 * Bundled endpoint returning all public profile page data in one request:
 * - Profile data (user info, stats, follow status)
 * - Best materials (top 6 by downloads)
 * - All materials page 1 (paginated, 12 per page)
 * - Collections (public only, or all if own profile)
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const rateLimit = checkRateLimit(getClientIP(request), "profile:bundle");
    if (!rateLimit.success) {
      return rateLimited();
    }

    const { id } = await params;

    if (!isValidId(id)) {
      return badRequest("Invalid ID");
    }

    const currentUserId = await getCurrentUserId();
    const isOwnProfile = currentUserId === id;

    // Run all queries in parallel
    const [user, followRecord, bestMaterials, allMaterials, totalMaterials, collections] =
      await Promise.all([
        // 1. User profile
        prisma.user.findUnique({
          where: { id },
          select: {
            ...publicUserSelect,
            _count: {
              select: {
                resources: { where: { is_published: true, is_public: true } },
                followers: true,
                following: true,
                collections: { where: { is_public: true } },
              },
            },
          },
        }),

        // 2. Follow status
        currentUserId && currentUserId !== id
          ? prisma.follow.findUnique({
              where: {
                follower_id_followed_id: {
                  follower_id: currentUserId,
                  followed_id: id,
                },
              },
            })
          : null,

        // 3. Best materials (top 6 by downloads)
        prisma.resource.findMany({
          where: { seller_id: id, is_published: true, is_public: true },
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            preview_url: true,
            subjects: true,
            cycles: true,
            created_at: true,
            _count: {
              select: {
                downloads: true,
                transactions: { where: { status: "COMPLETED" } },
              },
            },
          },
          orderBy: { downloads: { _count: "desc" } },
          take: 6,
        }),

        // 4. All materials page 1
        prisma.resource.findMany({
          where: { seller_id: id, is_published: true, is_public: true },
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            preview_url: true,
            subjects: true,
            cycles: true,
            created_at: true,
            _count: {
              select: {
                downloads: true,
                transactions: { where: { status: "COMPLETED" } },
              },
            },
          },
          orderBy: { created_at: "desc" },
          take: 12,
        }),

        // 5. Total material count (for pagination)
        prisma.resource.count({
          where: { seller_id: id, is_published: true, is_public: true },
        }),

        // 6. Collections
        prisma.collection.findMany({
          where: {
            owner_id: id,
            ...(isOwnProfile ? {} : { is_public: true }),
          },
          select: {
            id: true,
            name: true,
            description: true,
            is_public: true,
            position: true,
            created_at: true,
            updated_at: true,
            _count: { select: { items: true } },
            items: {
              take: 4,
              orderBy: { position: "asc" },
              select: {
                resource: {
                  select: { id: true, title: true, preview_url: true },
                },
              },
            },
          },
          orderBy: { position: "asc" },
        }),
      ]);

    if (!user) {
      return notFound("User not found");
    }

    const isFollowing = !!followRecord;

    // Transform materials helper
    const transformMaterial = (r: (typeof bestMaterials)[0]) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      price: r.price,
      preview_url: r.preview_url,
      subjects: r.subjects,
      cycles: r.cycles,
      created_at: r.created_at,
      downloadCount: r._count.downloads,
      salesCount: r._count.transactions,
    });

    // Build profile response (respecting privacy)
    const { _count, ...userData } = user;
    const isPrivate = user.is_private && !isOwnProfile;

    const profile = isPrivate
      ? {
          id: user.id,
          name: user.name,
          display_name: user.display_name,
          image: user.image,
          role: user.role,
          created_at: user.created_at,
          is_private: true,
          is_verified_seller: user.is_verified_seller,
          bio: null,
          subjects: [],
          cycles: [],
          cantons: [],
          instagram: null,
          pinterest: null,
          website: null,
          school: null,
          teaching_experience: null,
          is_teacher_verified: false,
          seller_level: user.seller_level,
          seller_xp: 0,
          stripe_charges_enabled: user.stripe_charges_enabled,
          stats: {
            resourceCount: _count.resources,
            followerCount: 0,
            followingCount: 0,
            collectionCount: 0,
          },
          isFollowing,
          isOwnProfile: false,
        }
      : {
          ...userData,
          stats: {
            resourceCount: _count.resources,
            followerCount: _count.followers,
            followingCount: _count.following,
            collectionCount: _count.collections,
          },
          isFollowing,
          isOwnProfile,
        };

    // Transform collections
    const transformedCollections = collections.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      is_public: c.is_public,
      position: c.position,
      created_at: c.created_at,
      updated_at: c.updated_at,
      itemCount: c._count.items,
      previewItems: c.items.map((i) => ({
        id: i.resource.id,
        title: i.resource.title,
        preview_url: i.resource.preview_url,
      })),
    }));

    return NextResponse.json({
      profile,
      bestMaterials: bestMaterials.map(transformMaterial),
      materials: allMaterials.map(transformMaterial),
      pagination: {
        page: 1,
        limit: 12,
        total: totalMaterials,
        totalPages: Math.ceil(totalMaterials / 12),
      },
      collections: transformedCollections,
    });
  } catch (error) {
    console.error("Error fetching profile bundle:", error);
    return serverError();
  }
}
