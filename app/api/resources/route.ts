import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { formatPrice } from "@/lib/utils/price";
import { checkRateLimit, getClientIP, rateLimitHeaders } from "@/lib/rateLimit";
import {
  createResourceSchema,
  validateMagicBytes,
  isAllowedResourceType,
  isAllowedPreviewType,
  getExtensionFromMimeType,
  MAX_RESOURCE_FILE_SIZE,
  MAX_PREVIEW_FILE_SIZE,
} from "@/lib/validations/resource";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";

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

    if (subject) {
      where.subjects = { has: subject };
    }

    if (cycle) {
      where.cycles = { has: cycle };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
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
            mode: "insensitive",
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
            mode: "insensitive",
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
            mode: "insensitive",
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
    const transformedResources = resources.map((resource) => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      price: resource.price,
      priceFormatted: formatPrice(resource.price),
      subject: resource.subjects[0] || "Allgemein",
      cycle: resource.cycles[0] || "",
      subjects: resource.subjects,
      cycles: resource.cycles,
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
    }));

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
  // Authentication check
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

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
    // Check if user is a seller with Stripe enabled
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        display_name: true,
        subjects: true,
        cycles: true,
        stripe_charges_enabled: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 });
    }

    if (user.role !== "SELLER") {
      return NextResponse.json(
        { error: "Nur Verkäufer können Ressourcen erstellen" },
        { status: 403 }
      );
    }

    // Check seller profile, email verification, and Stripe completion
    const missingFields: string[] = [];
    if (!user.emailVerified) missingFields.push("E-Mail-Verifizierung");
    if (!user.display_name) missingFields.push("Profilname");
    if (!user.subjects || user.subjects.length === 0) missingFields.push("Fächer");
    if (!user.cycles || user.cycles.length === 0) missingFields.push("Zyklen");
    if (!user.stripe_charges_enabled) missingFields.push("Stripe-Verifizierung");

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Bitte vervollständigen Sie Ihr Profil",
          missing: missingFields,
        },
        { status: 400 }
      );
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
      return NextResponse.json(
        {
          error: "Ungültige Eingabe",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Handle file upload
    const file = formData.get("file") as File | null;
    const previewFile = formData.get("preview") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Keine Datei hochgeladen" }, { status: 400 });
    }

    // Validate main file
    if (file.size > MAX_RESOURCE_FILE_SIZE) {
      return NextResponse.json({ error: "Datei zu gross (maximal 50MB)" }, { status: 400 });
    }

    if (!isAllowedResourceType(file.type, data.resourceType || "other")) {
      return NextResponse.json(
        { error: `Ungültiger Dateityp für ${data.resourceType}` },
        { status: 400 }
      );
    }

    // Read file buffer and validate magic bytes
    const fileBytes = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileBytes);

    if (!validateMagicBytes(fileBuffer, file.type)) {
      return NextResponse.json(
        { error: "Dateiinhalt stimmt nicht mit dem Dateityp überein" },
        { status: 400 }
      );
    }

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

    // Create upload directory
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "resources", userId);
    await mkdir(uploadsDir, { recursive: true });

    // Save main file
    const fileExt = getExtensionFromMimeType(file.type);
    const fileName = `${resource.id}-${Date.now()}.${fileExt}`;
    const filePath = path.join(uploadsDir, fileName);
    await writeFile(filePath, fileBuffer);
    const fileUrl = `/uploads/resources/${userId}/${fileName}`;

    // Helper to clean up on preview validation failure
    const cleanupOnError = async () => {
      await prisma.resource.delete({ where: { id: resource.id } });
      await unlink(filePath).catch(() => {}); // Clean up main file, ignore errors
    };

    // Handle preview file
    let previewUrl: string | null = null;
    if (previewFile) {
      // User uploaded a preview file
      if (previewFile.size > MAX_PREVIEW_FILE_SIZE) {
        await cleanupOnError();
        return NextResponse.json({ error: "Vorschaubild zu gross (maximal 5MB)" }, { status: 400 });
      }

      if (!isAllowedPreviewType(previewFile.type)) {
        await cleanupOnError();
        return NextResponse.json(
          { error: "Ungültiger Vorschaubild-Typ (JPEG, PNG oder WebP)" },
          { status: 400 }
        );
      }

      const previewBytes = await previewFile.arrayBuffer();
      const previewBuffer = Buffer.from(previewBytes);

      if (!validateMagicBytes(previewBuffer, previewFile.type)) {
        await cleanupOnError();
        return NextResponse.json(
          { error: "Vorschaubild-Inhalt stimmt nicht mit dem Dateityp überein" },
          { status: 400 }
        );
      }

      const previewExt = getExtensionFromMimeType(previewFile.type);
      const previewFileName = `${resource.id}-preview-${Date.now()}.${previewExt}`;
      const previewPath = path.join(uploadsDir, previewFileName);
      await writeFile(previewPath, previewBuffer);
      previewUrl = `/uploads/resources/${userId}/${previewFileName}`;
    } else {
      // No preview uploaded - try to auto-generate from main file
      // Use dynamic import to avoid build-time issues with pdf-to-img native deps
      try {
        const { canGeneratePreview, generatePreview } =
          await import("@/lib/utils/preview-generator");
        if (canGeneratePreview(file.type)) {
          const generatedPreview = await generatePreview(fileBuffer, file.type);
          if (generatedPreview) {
            const previewFileName = `${resource.id}-preview-${Date.now()}.png`;
            const previewPath = path.join(uploadsDir, previewFileName);
            await writeFile(previewPath, generatedPreview);
            previewUrl = `/uploads/resources/${userId}/${previewFileName}`;
          }
        }
      } catch (previewError) {
        // Preview generation failed, but we continue without a preview
        console.error("Auto-preview generation failed:", previewError);
      }
    }

    // Update resource with file URLs
    const updatedResource = await prisma.resource.update({
      where: { id: resource.id },
      data: {
        file_url: fileUrl,
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
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
