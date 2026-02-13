import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toStringArray } from "@/lib/json-array";
import { formatPrice } from "@/lib/utils/price";
import { checkRateLimit, getClientIP, rateLimitHeaders, safeParseInt } from "@/lib/rateLimit";
import {
  requireAuth,
  checkCanUpload,
  unauthorized,
  forbidden,
  badRequest,
  serverError,
} from "@/lib/api";
import {
  createMaterialSchema,
  validateMagicBytes,
  isAllowedMaterialType,
  isAllowedPreviewType,
  getExtensionFromMimeType,
  MAX_MATERIAL_FILE_SIZE,
  MAX_PREVIEW_FILE_SIZE,
} from "@/lib/validations/material";
import { getStorage } from "@/lib/storage";
import { sanitizeSearchQuery, isLP21Code } from "@/lib/search-utils";

/** Minimum trigram similarity score for fuzzy search fallback */
const FUZZY_MATCH_THRESHOLD = 0.15;

/**
 * GET /api/materials
 * Public endpoint to fetch published and approved materials
 *
 * Query params:
 *   - page: page number (default: 1)
 *   - limit: results per page (default: 20, max: 100)
 *   - subject: filter by subject code (e.g., "MA", "DE", "NMG")
 *   - cycle: filter by cycle (1, 2, or 3)
 *   - search: search in title and description
 *   - sort: "newest" | "price-low" | "price-high"
 *   - competency: filter by LP21 competency code (fuzzy match)
 *   - transversal: filter by transversal competency code
 *   - bne: filter by BNE theme code
 *   - mi_integrated: "true" to show only M&I integrated materials
 *   - lehrmittel: filter by lehrmittel ID
 *   - maxPrice: maximum price in CHF (e.g., "10" for CHF 10, "0" for free only)
 *   - minPrice: minimum price in CHF (e.g., "1" for paid only)
 *   - formats: comma-separated format IDs (pdf,word,ppt,excel,image,onenote,audio,video,zip)
 */
export async function GET(request: NextRequest) {
  // Rate limiting check
  const clientIP = getClientIP(request);
  const rateLimitResult = checkRateLimit(clientIP, "materials:list");

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        code: "RATE_LIMITED",
        retryAfter: rateLimitResult.retryAfter,
      },
      {
        status: 429,
        headers: rateLimitHeaders(rateLimitResult),
      }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, safeParseInt(searchParams.get("page"), 1));
    const limit = Math.min(100, Math.max(1, safeParseInt(searchParams.get("limit"), 20)));
    const subject = searchParams.get("subject");
    const cycle = searchParams.get("cycle");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";

    // LP21 curriculum filters
    const competencyCode = searchParams.get("competency");
    const transversalCode = searchParams.get("transversal");
    const bneCode = searchParams.get("bne");
    const miIntegrated = searchParams.get("mi_integrated") === "true";
    const lehrmittelId = searchParams.get("lehrmittel");

    // Dialect filter
    const dialect = searchParams.get("dialect");

    // Additional filters
    const maxPrice = searchParams.get("maxPrice");
    const minPrice = searchParams.get("minPrice");
    const formats = searchParams.get("formats");
    const cantons = searchParams.get("cantons");

    const skip = (page - 1) * limit;

    // Build where clause - only show published and public (verified) materials
    const where: Record<string, unknown> = {
      is_published: true,
      is_public: true, // Only show verified/public resources
    };

    // For PostgreSQL with JSONB columns, we use Prisma's $queryRaw with tagged template literals
    // for safe parameterized queries. First, get IDs that match the JSON array filters.
    let jsonFilteredIds: string[] | null = null;

    if (subject || cycle) {
      const { Prisma } = await import("@prisma/client");

      const conditions = [Prisma.sql`is_published = true AND is_public = true`];
      if (subject) {
        conditions.push(Prisma.sql`subjects::jsonb @> ${JSON.stringify(subject)}::jsonb`);
      }
      if (cycle) {
        conditions.push(Prisma.sql`cycles::jsonb @> ${JSON.stringify(cycle)}::jsonb`);
      }

      const results = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM resources WHERE ${Prisma.join(conditions, " AND ")}
      `;

      jsonFilteredIds = results.map((r) => r.id);

      // If no results match the JSON filters, return empty
      if (jsonFilteredIds.length === 0) {
        return NextResponse.json({
          materials: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        });
      }

      where.id = { in: jsonFilteredIds };
    }

    // Full-text search using PostgreSQL tsvector
    // Track if we're doing a full-text search for sorting
    let fullTextSearchIds: string[] | null = null;
    let fullTextRankMap: Map<string, number> | null = null;

    if (search) {
      const sanitizedSearch = sanitizeSearchQuery(search);

      if (sanitizedSearch) {
        // Check if search looks like an LP21 code (will be handled by competency filter)
        if (!isLP21Code(sanitizedSearch)) {
          // Execute full-text search with ranking
          const searchResults = await prisma.$queryRaw<{ id: string; rank: number }[]>`
            SELECT id, ts_rank(search_vector, plainto_tsquery('german', ${sanitizedSearch})) as rank
            FROM resources
            WHERE search_vector @@ plainto_tsquery('german', ${sanitizedSearch})
              AND is_published = true
              AND is_public = true
            ORDER BY rank DESC
          `;

          if (searchResults.length > 0) {
            fullTextSearchIds = searchResults.map((r) => r.id);
            fullTextRankMap = new Map(searchResults.map((r) => [r.id, r.rank]));

            // Combine with existing ID filter if present
            if (where.id && typeof where.id === "object" && "in" in (where.id as object)) {
              // Intersection of JSON-filtered IDs and full-text search IDs
              const existingIds = new Set((where.id as { in: string[] }).in);
              fullTextSearchIds = fullTextSearchIds.filter((id) => existingIds.has(id));
            }

            where.id = { in: fullTextSearchIds };
          } else {
            // Full-text returned nothing — try fuzzy match with pg_trgm
            try {
              const fuzzyResults = await prisma.$queryRaw<{ id: string; sim: number }[]>`
                SELECT id, GREATEST(
                  similarity(title, ${sanitizedSearch}),
                  similarity(description, ${sanitizedSearch})
                ) as sim
                FROM resources
                WHERE is_published = true AND is_public = true
                  AND (
                    similarity(title, ${sanitizedSearch}) > ${FUZZY_MATCH_THRESHOLD}
                    OR similarity(description, ${sanitizedSearch}) > ${FUZZY_MATCH_THRESHOLD}
                  )
                ORDER BY sim DESC
                LIMIT 50
              `;
              if (fuzzyResults.length > 0) {
                fullTextSearchIds = fuzzyResults.map((r) => r.id);
                fullTextRankMap = new Map(fuzzyResults.map((r) => [r.id, r.sim]));
                where.id = { in: fullTextSearchIds };
              } else {
                return NextResponse.json({
                  materials: [],
                  pagination: { page, limit, total: 0, totalPages: 0 },
                });
              }
            } catch {
              // pg_trgm extension might not be available — return empty
              return NextResponse.json({
                materials: [],
                pagination: { page, limit, total: 0, totalPages: 0 },
              });
            }
          }
        } else {
          // For LP21 code searches, fall back to simple contains for title/description
          // The competency filter will handle the actual LP21 code matching
          where.OR = [{ title: { contains: search } }, { description: { contains: search } }];
        }
      }
    }

    // M&I integration filter
    if (miIntegrated) {
      where.is_mi_integrated = true;
    }

    // Dialect filter: SWISS shows SWISS + BOTH, STANDARD shows STANDARD + BOTH
    if (dialect === "SWISS" || dialect === "STANDARD") {
      where.dialect = { in: [dialect, "BOTH"] };
    }

    // Competency filter - fuzzy match on code
    if (competencyCode) {
      const normalizedCode = competencyCode.replace(/[\s.]/g, "").toUpperCase();
      // Find competencies that match the code pattern (exact contains first)
      let matchingCompetencies = await prisma.curriculumCompetency.findMany({
        where: {
          code: {
            contains: competencyCode.toUpperCase(),
          },
        },
        select: { id: true },
      });

      // Fallback: use SQL REPLACE for normalized fuzzy search in-database
      if (matchingCompetencies.length === 0 && normalizedCode.length >= 2) {
        matchingCompetencies = await prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM curriculum_competencies
          WHERE UPPER(REPLACE(REPLACE(code, ' ', ''), '.', '')) LIKE ${"%" + normalizedCode + "%"}
        `;
      }

      if (matchingCompetencies.length > 0) {
        where.competencies = {
          some: {
            competency_id: {
              in: matchingCompetencies.map((c) => c.id),
            },
          },
        };
      } else {
        // No matching competencies, return empty results
        return NextResponse.json({
          materials: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        });
      }
    }

    // Transversal competency filter
    if (transversalCode) {
      const transversal = await prisma.transversalCompetency.findFirst({
        where: {
          code: {
            contains: transversalCode.toUpperCase(),
          },
        },
        select: { id: true },
      });

      if (transversal) {
        where.transversals = {
          some: {
            transversal_id: transversal.id,
          },
        };
      } else {
        return NextResponse.json({
          materials: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        });
      }
    }

    // BNE theme filter
    if (bneCode) {
      const bneTheme = await prisma.bneTheme.findFirst({
        where: {
          code: {
            contains: bneCode.toUpperCase(),
          },
        },
        select: { id: true },
      });

      if (bneTheme) {
        where.bne_themes = {
          some: {
            bne_id: bneTheme.id,
          },
        };
      } else {
        return NextResponse.json({
          materials: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        });
      }
    }

    // Lehrmittel filter
    if (lehrmittelId) {
      where.lehrmittel = {
        some: {
          lehrmittel_id: lehrmittelId,
        },
      };
    }

    // Price filter (maxPrice/minPrice in CHF, stored in cents)
    if (maxPrice !== null || minPrice !== null) {
      const priceFilter: Record<string, number> = {};
      if (maxPrice !== null) {
        const maxPriceValue = parseInt(maxPrice, 10);
        if (!isNaN(maxPriceValue)) {
          // Convert CHF to cents (price stored in cents)
          // maxPrice=0 means free resources only
          priceFilter.lte = maxPriceValue * 100;
        }
      }
      if (minPrice !== null) {
        const minPriceValue = parseInt(minPrice, 10);
        if (!isNaN(minPriceValue)) {
          // Convert CHF to cents — minPrice=1 means paid only (price >= 100 cents)
          priceFilter.gte = minPriceValue * 100;
        }
      }
      if (Object.keys(priceFilter).length > 0) {
        where.price = priceFilter;
      }
    }

    // Format filter (pdf, word, ppt, excel, onenote, other)
    if (formats) {
      const formatList = formats.split(",").map((f) => f.trim().toLowerCase());
      const formatMapping: Record<string, string[]> = {
        pdf: ["pdf"],
        word: ["doc", "docx"],
        ppt: ["ppt", "pptx"],
        excel: ["xls", "xlsx"],
        onenote: ["one", "onetoc2"],
      };
      const knownExtensions = Object.values(formatMapping).flat();
      const allowedExtensions: string[] = [];
      const includeOther = formatList.includes("other");
      for (const format of formatList) {
        if (formatMapping[format]) {
          allowedExtensions.push(...formatMapping[format]);
        }
      }
      const orConditions: Record<string, unknown>[] = allowedExtensions.map((ext) => ({
        file_url: { endsWith: `.${ext}` },
      }));
      // "other" = files whose extension is NOT in any known format
      if (includeOther) {
        orConditions.push({
          AND: knownExtensions.map((ext) => ({
            file_url: { not: { endsWith: `.${ext}` } },
          })),
        });
      }
      if (orConditions.length > 0) {
        where.AND = [...(Array.isArray(where.AND) ? where.AND : []), { OR: orConditions }];
      }
    }

    // Canton filter - filter by seller's canton(s)
    if (cantons) {
      const cantonList = cantons
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      if (cantonList.length > 0) {
        // Find sellers whose cantons JSON array contains any of the selected cantons
        const { Prisma } = await import("@prisma/client");
        const cantonConditions = cantonList.map(
          (c) => Prisma.sql`u.cantons::jsonb @> ${JSON.stringify(c)}::jsonb`
        );
        const sellerResults = await prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM users u
          WHERE (${Prisma.join(cantonConditions, " OR ")})
        `;
        const sellerIds = sellerResults.map((r) => r.id);
        if (sellerIds.length === 0) {
          return NextResponse.json({
            materials: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
          });
        }
        where.seller_id = { in: sellerIds };
      }
    }

    // Build orderBy
    // If doing full-text search and sort is "relevance" or not specified, we'll sort by rank
    const useRelevanceSort = fullTextSearchIds && (sort === "relevance" || sort === "newest");
    let orderBy: Record<string, string> = { created_at: "desc" };
    if (sort === "price-low") {
      orderBy = { price: "asc" };
    } else if (sort === "price-high") {
      orderBy = { price: "desc" };
    } else if (sort === "relevance" && !fullTextSearchIds) {
      // Relevance sort without search falls back to newest
      orderBy = { created_at: "desc" };
    }
    // Note: When using relevance sort with full-text search, we'll sort in memory after fetching

    const [materials, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          subjects: true,
          cycles: true,
          preview_url: true,
          created_at: true,
          dialect: true,
          is_mi_integrated: true,
          seller: {
            select: {
              id: true,
              display_name: true,
              is_verified_seller: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
          competencies: {
            select: {
              competency: {
                select: {
                  id: true,
                  code: true,
                  description_de: true,
                  anforderungsstufe: true,
                  subject: {
                    select: {
                      code: true,
                      color: true,
                    },
                  },
                },
              },
            },
          },
          transversals: {
            select: {
              transversal: {
                select: {
                  id: true,
                  code: true,
                  name_de: true,
                  icon: true,
                  color: true,
                },
              },
            },
          },
          bne_themes: {
            select: {
              bne: {
                select: {
                  id: true,
                  code: true,
                  name_de: true,
                  icon: true,
                  color: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.resource.count({ where }),
    ]);

    // Sort by relevance if we have full-text search results and relevance sort
    let sortedMaterials = materials;
    if (useRelevanceSort && fullTextRankMap) {
      sortedMaterials = [...materials].sort((a, b) => {
        const rankA = fullTextRankMap!.get(a.id) ?? 0;
        const rankB = fullTextRankMap!.get(b.id) ?? 0;
        return rankB - rankA;
      });
    }

    // Transform materials for frontend
    const transformedMaterials = sortedMaterials.map((material) => {
      const subjects = toStringArray(material.subjects);
      const cycles = toStringArray(material.cycles);
      const reviewCount = material.reviews?.length ?? 0;
      const averageRating =
        reviewCount > 0 ? material.reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;
      return {
        id: material.id,
        title: material.title,
        description: material.description,
        price: material.price,
        priceFormatted: formatPrice(material.price),
        subject: subjects[0] || "Allgemein",
        cycle: cycles[0] || "",
        subjects,
        cycles,
        previewUrl: material.preview_url,
        createdAt: material.created_at,
        dialect: material.dialect,
        seller: material.seller,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount,
        isMiIntegrated: material.is_mi_integrated,
        competencies: (material.competencies ?? []).map((rc) => ({
          id: rc.competency.id,
          code: rc.competency.code,
          description_de: rc.competency.description_de,
          anforderungsstufe: rc.competency.anforderungsstufe,
          subjectCode: rc.competency.subject.code,
          subjectColor: rc.competency.subject.color,
        })),
        transversals: (material.transversals ?? []).map((rt) => ({
          id: rt.transversal.id,
          code: rt.transversal.code,
          name_de: rt.transversal.name_de,
          icon: rt.transversal.icon,
          color: rt.transversal.color,
        })),
        bneThemes: (material.bne_themes ?? []).map((rb) => ({
          id: rb.bne.id,
          code: rb.bne.code,
          name_de: rb.bne.name_de,
          icon: rb.bne.icon,
          color: rb.bne.color,
        })),
      };
    });

    return NextResponse.json({
      materials: transformedMaterials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching materials:", error);
    return serverError();
  }
}

/**
 * POST /api/materials
 * Create a new material (seller only)
 */
export async function POST(request: NextRequest) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  // Rate limiting check
  const rateLimitResult = checkRateLimit(userId, "materials:create");
  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        code: "RATE_LIMITED",
        retryAfter: rateLimitResult.retryAfter,
      },
      {
        status: 429,
        headers: rateLimitHeaders(rateLimitResult),
      }
    );
  }

  try {
    // Parse form data first to get the price
    const formData = await request.formData();

    // Extract metadata
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priceStr = formData.get("price") as string;
    const subjectsStr = formData.get("subjects") as string;
    const cyclesStr = formData.get("cycles") as string;
    const language = (formData.get("language") as string) || "de";
    const dialect = (formData.get("dialect") as string) || "BOTH";
    const resourceType = (formData.get("resourceType") as string) || "pdf";
    const isPublishedStr = formData.get("is_published") as string;

    // Parse arrays from JSON strings or comma-separated values
    let subjects: string[] = [];
    let cycles: string[] = [];
    try {
      subjects = subjectsStr ? JSON.parse(subjectsStr) : [];
    } catch {
      subjects = subjectsStr ? subjectsStr.split(",").map((s) => s.trim()) : [];
    }
    try {
      cycles = cyclesStr ? JSON.parse(cyclesStr) : [];
    } catch {
      cycles = cyclesStr ? cyclesStr.split(",").map((s) => s.trim()) : [];
    }

    // Validate metadata with schema
    const parsed = createMaterialSchema.safeParse({
      title,
      description,
      price: parseInt(priceStr || "0", 10),
      subjects,
      cycles,
      language,
      dialect,
      resourceType,
      is_published: isPublishedStr === "true",
    });

    if (!parsed.success) {
      return badRequest("Invalid input", { details: parsed.error.flatten().fieldErrors });
    }

    const data = parsed.data;

    // Check upload permissions based on price
    // Free resources (price = 0): Any user with verified email can upload
    // Paid resources (price > 0): Requires Stripe verification
    const uploadCheck = await checkCanUpload(userId, data.price);
    if (!uploadCheck.canUpload) {
      if (uploadCheck.missing && uploadCheck.missing.length > 0) {
        // For paid resources without Stripe, give a helpful message
        if (data.price > 0 && uploadCheck.missing.includes("STRIPE_VERIFICATION")) {
          return badRequest("Stripe verification required for paid resources", {
            code: "STRIPE_REQUIRED",
            missing: uploadCheck.missing,
          });
        }
        return badRequest("Profile incomplete", {
          code: "PROFILE_INCOMPLETE",
          missing: uploadCheck.missing,
        });
      }
      return forbidden(uploadCheck.error || "Zugriff verweigert");
    }

    // Handle file upload
    const file = formData.get("file") as File | null;
    const previewFile = formData.get("preview") as File | null;

    if (!file) return badRequest("No file uploaded");

    // Validate main file
    if (file.size > MAX_MATERIAL_FILE_SIZE) return badRequest("File too large (max 50MB)");

    if (!isAllowedMaterialType(file.type, data.resourceType || "other")) {
      return badRequest(`Invalid file type for ${data.resourceType}`);
    }

    // Read file buffer and validate magic bytes
    const fileBytes = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileBytes);

    if (!validateMagicBytes(fileBuffer, file.type)) {
      return badRequest("File content does not match file type");
    }

    // Get storage provider
    const storage = getStorage();

    // Fetch seller's display name for watermark
    const seller = await prisma.user.findUnique({
      where: { id: userId },
      select: { display_name: true },
    });
    const sellerName = seller?.display_name || undefined;

    // Create material in database first to get ID
    const material = await prisma.resource.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        subjects: data.subjects,
        cycles: data.cycles,
        dialect: data.dialect as "STANDARD" | "SWISS" | "BOTH",
        is_published: data.is_published,
        is_approved: false, // Requires admin approval
        status: "PENDING", // New uploads are pending verification
        is_public: false, // Not visible to others until verified
        seller_id: userId,
        file_url: "", // Will be updated after file save
        preview_url: null,
      },
    });

    // Helper to clean up on error
    const cleanupOnError = async (fileKey?: string, previewKey?: string) => {
      await prisma.resource.delete({ where: { id: material.id } });
      if (fileKey) {
        await storage.delete(fileKey, "material").catch(() => {});
      }
      if (previewKey) {
        await storage.delete(previewKey, "preview").catch(() => {});
      }
    };

    // Upload main file to private bucket
    const fileExt = getExtensionFromMimeType(file.type);
    const mainFileResult = await storage.upload(fileBuffer, {
      category: "material",
      userId,
      filename: `${material.id}.${fileExt}`,
      contentType: file.type,
      metadata: {
        resourceId: material.id,
        originalName: file.name,
      },
    });

    // Handle preview file(s)
    let previewUrl: string | null = null;
    let previewUrls: string[] = [];
    let previewCount = 0;

    if (previewFile) {
      // User uploaded a preview file
      if (previewFile.size > MAX_PREVIEW_FILE_SIZE) {
        await cleanupOnError(mainFileResult.key);
        return badRequest("Preview image too large (max 5MB)");
      }

      if (!isAllowedPreviewType(previewFile.type)) {
        await cleanupOnError(mainFileResult.key);
        return badRequest("Invalid preview type (JPEG, PNG or WebP)");
      }

      const previewBytes = await previewFile.arrayBuffer();
      const previewBuffer = Buffer.from(previewBytes);

      if (!validateMagicBytes(previewBuffer, previewFile.type)) {
        await cleanupOnError(mainFileResult.key);
        return badRequest("Preview content does not match file type");
      }

      const previewExt = getExtensionFromMimeType(previewFile.type);
      const previewResult = await storage.upload(previewBuffer, {
        category: "preview",
        userId,
        filename: `${material.id}-preview.${previewExt}`,
        contentType: previewFile.type,
        metadata: {
          resourceId: material.id,
        },
      });

      // Use public URL for previews (they're in the public bucket)
      previewUrl = previewResult.publicUrl || previewResult.key;
      previewUrls = [previewUrl];
      previewCount = 1;
    } else {
      // No preview uploaded - try to auto-generate from main file
      // This is best-effort and should never block the upload
      try {
        // Dynamic import may fail if native dependencies are missing (e.g., in some Docker environments)
        const previewModule = await import("@/lib/utils/preview-generator").catch(() => null);

        if (previewModule && previewModule.canGeneratePreview(file.type)) {
          // For PDFs, generate multi-page previews (up to 3 pages)
          if (file.type === "application/pdf" && previewModule.generatePdfPreviewPages) {
            const previewPages = await previewModule.generatePdfPreviewPages(
              fileBuffer,
              3,
              sellerName
            );

            for (const page of previewPages) {
              if (Buffer.isBuffer(page.buffer) && page.buffer.length > 0) {
                const pageResult = await storage.upload(page.buffer, {
                  category: "preview",
                  userId,
                  filename: `${material.id}-preview-${page.pageNumber}.webp`,
                  contentType: "image/webp",
                  metadata: {
                    resourceId: material.id,
                    generated: "true",
                    pageNumber: String(page.pageNumber),
                  },
                });
                const pageUrl = pageResult.publicUrl || pageResult.key;
                previewUrls.push(pageUrl);

                // First page is also the main preview_url for backwards compatibility
                if (page.pageNumber === 1) {
                  previewUrl = pageUrl;
                }
              }
            }
            previewCount = previewUrls.length;
          } else {
            // For images, generate a single preview
            const generatedPreview = await previewModule.generatePreview(
              fileBuffer,
              file.type,
              sellerName
            );

            // Validate that we got actual buffer data before uploading
            if (
              generatedPreview &&
              Buffer.isBuffer(generatedPreview) &&
              generatedPreview.length > 0
            ) {
              const previewResult = await storage.upload(generatedPreview, {
                category: "preview",
                userId,
                filename: `${material.id}-preview.webp`,
                contentType: "image/webp",
                metadata: {
                  resourceId: material.id,
                  generated: "true",
                },
              });
              previewUrl = previewResult.publicUrl || previewResult.key;
              previewUrls = [previewUrl];
              previewCount = 1;
            }
          }
        }
      } catch (previewError) {
        // Preview generation failed, but we continue without a preview
        // This can happen due to missing native dependencies (canvas, pdf-to-img) in some environments
        console.error("Auto-preview generation failed:", previewError);
      }
    }

    // Update material with file URLs
    // For the file_url, store the storage key (not the full URL)
    const updatedMaterial = await prisma.resource.update({
      where: { id: material.id },
      data: {
        file_url: mainFileResult.key,
        preview_url: previewUrl,
        preview_urls: previewUrls,
        preview_count: previewCount || 1,
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        subjects: true,
        cycles: true,
        file_url: true,
        preview_url: true,
        preview_urls: true,
        preview_count: true,
        is_published: true,
        is_approved: true,
        status: true,
        is_public: true,
        created_at: true,
      },
    });

    return NextResponse.json(
      {
        message: "Material created successfully",
        material: updatedMaterial,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating material:", error);
    return serverError();
  }
}
