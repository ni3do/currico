import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toStringArray } from "@/lib/json-array";
import { formatPrice } from "@/lib/utils/price";
import { checkRateLimit, getClientIP, rateLimitHeaders } from "@/lib/rateLimit";
import {
  requireAuth,
  requireSeller,
  checkSellerProfile,
  unauthorized,
  forbidden,
  badRequest,
  serverError,
} from "@/lib/api";
import {
  createResourceSchema,
  validateMagicBytes,
  isAllowedResourceType,
  isAllowedPreviewType,
  getExtensionFromMimeType,
  MAX_RESOURCE_FILE_SIZE,
  MAX_PREVIEW_FILE_SIZE,
} from "@/lib/validations/resource";
import { getStorage } from "@/lib/storage";

/**
 * GET /api/resources
 * Public endpoint to fetch published and approved resources
 *
 * Query params:
 *   - page: page number (default: 1)
 *   - limit: results per page (default: 20, max: 100)
 *   - subject: filter by subject
 *   - cycle: filter by cycle
 *   - search: search in title and description
 *   - sort: "newest" | "price-low" | "price-high"
 *   - competency: filter by LP21 competency code (fuzzy match)
 *   - transversal: filter by transversal competency code
 *   - bne: filter by BNE theme code
 *   - mi_integrated: "true" to show only M&I integrated resources
 *   - lehrmittel: filter by lehrmittel ID
 */
export async function GET(request: NextRequest) {
  // Rate limiting check
  const clientIP = getClientIP(request);
  const rateLimitResult = checkRateLimit(clientIP, "resources:list");

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut.",
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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
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

    const skip = (page - 1) * limit;

    // Build where clause - only show published and public (verified) resources
    const where: Record<string, unknown> = {
      is_published: true,
      is_public: true, // Only show verified/public resources
    };

    // For MySQL with JSON columns, we use raw SQL for array contains checks
    // First, get IDs that match the JSON array filters
    let jsonFilteredIds: string[] | null = null;

    if (subject || cycle) {
      const conditions: string[] = [];
      const params: (string | number)[] = [];

      if (subject) {
        conditions.push(`JSON_CONTAINS(subjects, ?)`);
        params.push(JSON.stringify(subject));
      }

      if (cycle) {
        conditions.push(`JSON_CONTAINS(cycles, ?)`);
        params.push(JSON.stringify(cycle));
      }

      const sqlConditions = conditions.join(" AND ");
      const query = `SELECT id FROM resources WHERE is_published = 1 AND is_public = 1 AND ${sqlConditions}`;

      const results = await prisma.$queryRawUnsafe<{ id: string }[]>(query, ...params);
      jsonFilteredIds = results.map((r) => r.id);

      // If no results match the JSON filters, return empty
      if (jsonFilteredIds.length === 0) {
        return NextResponse.json({
          resources: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        });
      }

      where.id = { in: jsonFilteredIds };
    }

    if (search) {
      where.OR = [{ title: { contains: search } }, { description: { contains: search } }];
    }

    // M&I integration filter
    if (miIntegrated) {
      where.is_mi_integrated = true;
    }

    // Competency filter - fuzzy match on code
    if (competencyCode) {
      const normalizedCode = competencyCode.replace(/[\s.]/g, "").toUpperCase();
      // Find competencies that match the code pattern
      const matchingCompetencies = await prisma.curriculumCompetency.findMany({
        where: {
          code: {
            contains: competencyCode.toUpperCase(),
          },
        },
        select: { id: true, code: true },
      });

      // Also try normalized search if no results
      if (matchingCompetencies.length === 0 && normalizedCode.length >= 2) {
        const allCompetencies = await prisma.curriculumCompetency.findMany({
          select: { id: true, code: true },
        });
        const fuzzyMatches = allCompetencies.filter((c) =>
          c.code.replace(/[\s.]/g, "").toUpperCase().includes(normalizedCode)
        );
        matchingCompetencies.push(...fuzzyMatches);
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
          resources: [],
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
          resources: [],
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
          resources: [],
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

    // Build orderBy
    let orderBy: Record<string, string> = { created_at: "desc" };
    if (sort === "price-low") {
      orderBy = { price: "asc" };
    } else if (sort === "price-high") {
      orderBy = { price: "desc" };
    }

    const [resources, total] = await Promise.all([
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
          is_mi_integrated: true,
          seller: {
            select: {
              id: true,
              display_name: true,
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

    // Transform resources for frontend
    const transformedResources = resources.map((resource) => {
      const subjects = toStringArray(resource.subjects);
      const cycles = toStringArray(resource.cycles);
      return {
        id: resource.id,
        title: resource.title,
        description: resource.description,
        price: resource.price,
        priceFormatted: formatPrice(resource.price),
        subject: subjects[0] || "Allgemein",
        cycle: cycles[0] || "",
        subjects,
        cycles,
        previewUrl: resource.preview_url,
        createdAt: resource.created_at,
        seller: resource.seller,
        isMiIntegrated: resource.is_mi_integrated,
        competencies: (resource.competencies ?? []).map((rc) => ({
          id: rc.competency.id,
          code: rc.competency.code,
          description_de: rc.competency.description_de,
          anforderungsstufe: rc.competency.anforderungsstufe,
          subjectCode: rc.competency.subject.code,
          subjectColor: rc.competency.subject.color,
        })),
        transversals: (resource.transversals ?? []).map((rt) => ({
          id: rt.transversal.id,
          code: rt.transversal.code,
          name_de: rt.transversal.name_de,
          icon: rt.transversal.icon,
          color: rt.transversal.color,
        })),
        bneThemes: (resource.bne_themes ?? []).map((rb) => ({
          id: rb.bne.id,
          code: rb.bne.code,
          name_de: rb.bne.name_de,
          icon: rb.bne.icon,
          color: rb.bne.color,
        })),
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
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
  }
}

/**
 * POST /api/resources
 * Create a new resource (seller only)
 */
export async function POST(request: NextRequest) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  // Rate limiting check
  const rateLimitResult = checkRateLimit(userId, "resources:create");
  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut.",
        retryAfter: rateLimitResult.retryAfter,
      },
      {
        status: 429,
        headers: rateLimitHeaders(rateLimitResult),
      }
    );
  }

  try {
    const seller = await requireSeller(userId);
    if (!seller) return forbidden("Nur Verkäufer können Ressourcen erstellen");

    // Check seller profile completion
    const missingFields = await checkSellerProfile(userId);
    if (missingFields.length > 0) {
      return badRequest("Bitte vervollständigen Sie Ihr Profil", { missing: missingFields });
    }

    // Parse form data
    const formData = await request.formData();

    // Extract metadata
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priceStr = formData.get("price") as string;
    const subjectsStr = formData.get("subjects") as string;
    const cyclesStr = formData.get("cycles") as string;
    const language = (formData.get("language") as string) || "de";
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
    const parsed = createResourceSchema.safeParse({
      title,
      description,
      price: parseInt(priceStr || "0", 10),
      subjects,
      cycles,
      language,
      resourceType,
      is_published: isPublishedStr === "true",
    });

    if (!parsed.success) {
      return badRequest("Ungültige Eingabe", { details: parsed.error.flatten().fieldErrors });
    }

    const data = parsed.data;

    // Handle file upload
    const file = formData.get("file") as File | null;
    const previewFile = formData.get("preview") as File | null;

    if (!file) return badRequest("Keine Datei hochgeladen");

    // Validate main file
    if (file.size > MAX_RESOURCE_FILE_SIZE) return badRequest("Datei zu gross (maximal 50MB)");

    if (!isAllowedResourceType(file.type, data.resourceType || "other")) {
      return badRequest(`Ungültiger Dateityp für ${data.resourceType}`);
    }

    // Read file buffer and validate magic bytes
    const fileBytes = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileBytes);

    if (!validateMagicBytes(fileBuffer, file.type)) {
      return badRequest("Dateiinhalt stimmt nicht mit dem Dateityp überein");
    }

    // Get storage provider
    const storage = getStorage();

    // Create resource in database first to get ID
    const resource = await prisma.resource.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        subjects: data.subjects,
        cycles: data.cycles,
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
      await prisma.resource.delete({ where: { id: resource.id } });
      if (fileKey) {
        await storage.delete(fileKey, "resource").catch(() => {});
      }
      if (previewKey) {
        await storage.delete(previewKey, "preview").catch(() => {});
      }
    };

    // Upload main file to private bucket
    const fileExt = getExtensionFromMimeType(file.type);
    const mainFileResult = await storage.upload(fileBuffer, {
      category: "resource",
      userId,
      filename: `${resource.id}.${fileExt}`,
      contentType: file.type,
      metadata: {
        resourceId: resource.id,
        originalName: file.name,
      },
    });

    // Handle preview file
    let previewUrl: string | null = null;
    if (previewFile) {
      // User uploaded a preview file
      if (previewFile.size > MAX_PREVIEW_FILE_SIZE) {
        await cleanupOnError(mainFileResult.key);
        return badRequest("Vorschaubild zu gross (maximal 5MB)");
      }

      if (!isAllowedPreviewType(previewFile.type)) {
        await cleanupOnError(mainFileResult.key);
        return badRequest("Ungültiger Vorschaubild-Typ (JPEG, PNG oder WebP)");
      }

      const previewBytes = await previewFile.arrayBuffer();
      const previewBuffer = Buffer.from(previewBytes);

      if (!validateMagicBytes(previewBuffer, previewFile.type)) {
        await cleanupOnError(mainFileResult.key);
        return badRequest("Vorschaubild-Inhalt stimmt nicht mit dem Dateityp überein");
      }

      const previewExt = getExtensionFromMimeType(previewFile.type);
      const previewResult = await storage.upload(previewBuffer, {
        category: "preview",
        userId,
        filename: `${resource.id}-preview.${previewExt}`,
        contentType: previewFile.type,
        metadata: {
          resourceId: resource.id,
        },
      });

      // Use public URL for previews (they're in the public bucket)
      previewUrl = previewResult.publicUrl || previewResult.key;
    } else {
      // No preview uploaded - try to auto-generate from main file
      try {
        const { canGeneratePreview, generatePreview } =
          await import("@/lib/utils/preview-generator");
        if (canGeneratePreview(file.type)) {
          const generatedPreview = await generatePreview(fileBuffer, file.type);
          if (generatedPreview) {
            const previewResult = await storage.upload(generatedPreview, {
              category: "preview",
              userId,
              filename: `${resource.id}-preview.png`,
              contentType: "image/png",
              metadata: {
                resourceId: resource.id,
                generated: "true",
              },
            });
            previewUrl = previewResult.publicUrl || previewResult.key;
          }
        }
      } catch (previewError) {
        // Preview generation failed, but we continue without a preview
        console.error("Auto-preview generation failed:", previewError);
      }
    }

    // Update resource with file URLs
    // For the file_url, store the storage key (not the full URL)
    const updatedResource = await prisma.resource.update({
      where: { id: resource.id },
      data: {
        file_url: mainFileResult.key,
        preview_url: previewUrl,
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
        is_published: true,
        is_approved: true,
        status: true,
        is_public: true,
        created_at: true,
      },
    });

    return NextResponse.json(
      {
        message: "Ressource erfolgreich erstellt",
        resource: updatedResource,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating resource:", error);
    return serverError();
  }
}
