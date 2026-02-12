import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

// Magic bytes for image type validation
const MAGIC_BYTES: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47], // \x89PNG
  "image/webp": [0x52, 0x49, 0x46, 0x46], // RIFF (WebP also has WEBP at offset 8)
};

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const expectedBytes = MAGIC_BYTES[mimeType];
  if (!expectedBytes) return false;

  for (let i = 0; i < expectedBytes.length; i++) {
    if (buffer[i] !== expectedBytes[i]) return false;
  }

  // Additional check for WebP: bytes 8-11 should be "WEBP"
  if (mimeType === "image/webp") {
    const webpSignature = [0x57, 0x45, 0x42, 0x50]; // WEBP
    for (let i = 0; i < webpSignature.length; i++) {
      if (buffer[8 + i] !== webpSignature[i]) return false;
    }
  }

  return true;
}

/**
 * POST /api/users/me/avatar
 * Upload a new avatar image
 * Access: Authenticated user only
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Keine Datei hochgeladen" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Ungültiger Dateityp. Erlaubt: JPG, PNG, WebP" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Datei zu gross. Maximum: 2MB" }, { status: 400 });
    }

    // Validate file content with magic bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!validateMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { error: "Dateiinhalt stimmt nicht mit dem Dateityp überein" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = file.type.split("/")[1];
    const filename = `${userId}-${Date.now()}.${ext}`;

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await mkdir(uploadsDir, { recursive: true });

    // Delete old avatar file if it exists
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });
    if (currentUser?.image?.startsWith("/uploads/avatars/")) {
      const oldPath = path.join(uploadsDir, path.basename(currentUser.image));
      await unlink(oldPath).catch(() => {}); // ignore if missing
    }

    // Save file
    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    // Update user's image in database
    const imageUrl = `/uploads/avatars/${filename}`;
    await prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl },
    });

    return NextResponse.json({
      message: "Avatar erfolgreich hochgeladen",
      url: imageUrl,
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}

/**
 * DELETE /api/users/me/avatar
 * Remove the current avatar
 * Access: Authenticated user only
 */
export async function DELETE() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    // Remove avatar from database (keep file for now, could add cleanup later)
    await prisma.user.update({
      where: { id: userId },
      data: { image: null },
    });

    return NextResponse.json({
      message: "Avatar erfolgreich entfernt",
    });
  } catch (error) {
    console.error("Error deleting avatar:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
