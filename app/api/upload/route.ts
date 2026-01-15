import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import crypto from "crypto";

// Maximum file sizes
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for main files
const MAX_PREVIEW_SIZE = 10 * 1024 * 1024; // 10MB for previews

// Allowed file types
const ALLOWED_MAIN_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const ALLOWED_PREVIEW_TYPES = ["image/png", "image/jpeg", "image/jpg"];

/**
 * POST /api/upload
 * Upload files for a resource (requires authentication)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const fileType = formData.get("type") as string; // "main" or "preview"
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const isPreview = fileType === "preview";
    const allowedTypes = isPreview ? ALLOWED_PREVIEW_TYPES : ALLOWED_MAIN_TYPES;
    const maxSize = isPreview ? MAX_PREVIEW_SIZE : MAX_FILE_SIZE;

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type: ${file.type}`,
          allowed: allowedTypes,
        },
        { status: 400 }
      );
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`,
          size: file.size,
          maxSize,
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = path.extname(file.name);
    const hash = crypto.randomBytes(16).toString("hex");
    const filename = `${hash}${ext}`;

    // Determine upload directory
    const subdir = isPreview ? "previews" : "resources";
    const uploadDir = path.join(process.cwd(), "public", "uploads", subdir);

    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save file
    const filePath = path.join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return public URL
    const publicUrl = `/uploads/${subdir}/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
