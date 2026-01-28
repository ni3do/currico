import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

/**
 * Content type map for file extensions
 */
const contentTypes: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

/**
 * GET /api/uploads/[...path]
 * Serve uploaded files from local storage
 *
 * This is needed because Next.js standalone mode doesn't serve
 * files added to public/ at runtime.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;

    // Validate path segments to prevent directory traversal
    for (const segment of pathSegments) {
      if (segment.includes("..") || segment.includes("~")) {
        return NextResponse.json({ error: "Invalid path" }, { status: 400 });
      }
    }

    // Only allow serving from previews and avatars directories (public content)
    const category = pathSegments[0];
    if (!["previews", "avatars"].includes(category)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const relativePath = pathSegments.join("/");
    const filePath = path.join(process.cwd(), "public", "uploads", relativePath);

    // Read the file
    const fileBuffer = await readFile(filePath);

    // Determine content type
    const ext = path.extname(filePath).toLowerCase();
    const contentType = contentTypes[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    // File not found or read error
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    console.error("Error serving uploaded file:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
