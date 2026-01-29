import sharp from "sharp";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink, readFile, mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

const execAsync = promisify(exec);

const PREVIEW_WIDTH = 800;
const PREVIEW_HEIGHT = 1131; // A4 aspect ratio (roughly)
const PREVIEW_QUALITY = 80;

/**
 * Generates a preview image from a PDF file buffer using pdftoppm (poppler-utils).
 * Returns the first page rendered as a PNG buffer.
 */
export async function generatePdfPreview(pdfBuffer: Buffer): Promise<Buffer | null> {
  let tempDir: string | null = null;

  try {
    // Create a temporary directory for the conversion
    tempDir = await mkdtemp(join(tmpdir(), "pdf-preview-"));
    const inputPath = join(tempDir, "input.pdf");
    const outputPrefix = join(tempDir, "output");

    // Write PDF buffer to temp file
    await writeFile(inputPath, pdfBuffer);

    // Use pdftoppm to convert first page to PNG
    // -png: output PNG format
    // -f 1 -l 1: only first page
    // -r 150: 150 DPI resolution (good balance of quality/size)
    await execAsync(
      `pdftoppm -png -f 1 -l 1 -r 150 "${inputPath}" "${outputPrefix}"`,
      { timeout: 30000 }
    );

    // pdftoppm outputs files like output-1.png
    const outputPath = `${outputPrefix}-1.png`;

    // Read the generated PNG
    const pngBuffer = await readFile(outputPath);

    // Resize with sharp
    const resized = await sharp(pngBuffer)
      .resize(PREVIEW_WIDTH, PREVIEW_HEIGHT, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .png({ quality: PREVIEW_QUALITY })
      .toBuffer();

    return resized;
  } catch (error) {
    // Check if pdftoppm is not available
    if (error instanceof Error && error.message.includes("not found")) {
      console.warn("pdftoppm not available - PDF preview generation disabled");
    } else {
      console.error("Error generating PDF preview:", error);
    }
    return null;
  } finally {
    // Clean up temp files
    if (tempDir) {
      try {
        const { rm } = await import("fs/promises");
        await rm(tempDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

/**
 * Generates a preview image from an image file buffer.
 * Resizes the image to preview dimensions.
 */
export async function generateImagePreview(imageBuffer: Buffer): Promise<Buffer | null> {
  try {
    const resized = await sharp(imageBuffer)
      .resize(PREVIEW_WIDTH, PREVIEW_HEIGHT, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .png({ quality: PREVIEW_QUALITY })
      .toBuffer();

    return resized;
  } catch (error) {
    console.error("Error generating image preview:", error);
    return null;
  }
}

/**
 * Determines the appropriate preview generation method based on file type
 * and generates a preview image.
 */
export async function generatePreview(
  fileBuffer: Buffer,
  mimeType: string
): Promise<Buffer | null> {
  // PDF files
  if (mimeType === "application/pdf") {
    return generatePdfPreview(fileBuffer);
  }

  // Image files - create a resized preview
  if (mimeType.startsWith("image/")) {
    return generateImagePreview(fileBuffer);
  }

  // For Office documents (Word, PowerPoint, Excel), we cannot easily
  // generate a preview without external tools like LibreOffice.
  // Return null to indicate no preview can be generated.
  // The frontend can show a type-specific placeholder icon instead.
  return null;
}

/**
 * Supported file types that can have auto-generated previews.
 */
export function canGeneratePreview(mimeType: string): boolean {
  return mimeType === "application/pdf" || mimeType.startsWith("image/");
}
