import sharp from "sharp";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink, readFile, mkdtemp, readdir } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

const execAsync = promisify(exec);

const PREVIEW_WIDTH = 800;
const PREVIEW_HEIGHT = 1131; // A4 aspect ratio (roughly)
const PREVIEW_QUALITY = 60; // WebP quality

// Pixelation settings - downscale to this size before upscaling for pixelated effect
const PIXELATE_WIDTH = 40; // Very low resolution for pixelation
const PIXELATE_HEIGHT = 56; // Maintains A4 aspect ratio

/**
 * Result of multi-page preview generation
 */
export interface PreviewPage {
  pageNumber: number;
  buffer: Buffer;
}

/**
 * Generates preview images from multiple pages of a PDF file.
 * Returns an array of buffers with page numbers (1-indexed).
 *
 * @param pdfBuffer The PDF file as a buffer
 * @param maxPages Maximum number of pages to generate (default: 3)
 * @returns Array of preview pages with page numbers and image buffers
 */
export async function generatePdfPreviewPages(
  pdfBuffer: Buffer,
  maxPages: number = 3
): Promise<PreviewPage[]> {
  let tempDir: string | null = null;

  try {
    // Create a temporary directory for the conversion
    tempDir = await mkdtemp(join(tmpdir(), "pdf-preview-"));
    const inputPath = join(tempDir, "input.pdf");
    const outputPrefix = join(tempDir, "output");

    // Write PDF buffer to temp file
    await writeFile(inputPath, pdfBuffer);

    // Use pdftoppm to convert first N pages to PNG
    // -png: output PNG format
    // -f 1 -l {maxPages}: first to maxPages
    // -r 150: 150 DPI resolution (good balance of quality/size)
    await execAsync(`pdftoppm -png -f 1 -l ${maxPages} -r 150 "${inputPath}" "${outputPrefix}"`, {
      timeout: 60000, // Longer timeout for multiple pages
    });

    // Read all generated PNG files
    // pdftoppm outputs files like output-1.png, output-2.png, etc.
    const files = await readdir(tempDir);
    const pngFiles = files
      .filter((f) => f.startsWith("output-") && f.endsWith(".png"))
      .sort((a, b) => {
        // Sort by page number
        const numA = parseInt(a.match(/output-(\d+)\.png/)?.[1] || "0", 10);
        const numB = parseInt(b.match(/output-(\d+)\.png/)?.[1] || "0", 10);
        return numA - numB;
      });

    const results: PreviewPage[] = [];

    for (const pngFile of pngFiles) {
      const pageNumber = parseInt(pngFile.match(/output-(\d+)\.png/)?.[1] || "0", 10);
      if (pageNumber === 0) continue;

      const outputPath = join(tempDir, pngFile);
      const pngBuffer = await readFile(outputPath);

      // Create pixelated preview:
      // 1. Downscale to tiny size
      // 2. Upscale back to preview size with nearest-neighbor (creates pixelation)
      // 3. Output as WebP for better compression
      const pixelated = await sharp(pngBuffer)
        // First downscale to tiny size
        .resize(PIXELATE_WIDTH, PIXELATE_HEIGHT, {
          fit: "inside",
          withoutEnlargement: true,
        })
        // Then upscale back to preview size with nearest-neighbor for pixelation
        .resize(PREVIEW_WIDTH, PREVIEW_HEIGHT, {
          fit: "inside",
          kernel: sharp.kernel.nearest, // Creates blocky pixelated effect
        })
        .webp({ quality: PREVIEW_QUALITY })
        .toBuffer();

      results.push({
        pageNumber,
        buffer: pixelated,
      });
    }

    return results;
  } catch (error) {
    // Check if pdftoppm is not available
    if (error instanceof Error && error.message.includes("not found")) {
      console.warn("pdftoppm not available - PDF preview generation disabled");
    } else {
      console.error("Error generating PDF preview pages:", error);
    }
    return [];
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
 * Generates a preview image from a PDF file buffer using pdftoppm (poppler-utils).
 * Returns the first page rendered as a PNG buffer.
 * @deprecated Use generatePdfPreviewPages for multi-page support
 */
export async function generatePdfPreview(pdfBuffer: Buffer): Promise<Buffer | null> {
  const pages = await generatePdfPreviewPages(pdfBuffer, 1);
  return pages.length > 0 ? pages[0].buffer : null;
}

/**
 * Generates a pixelated preview image from an image file buffer.
 * Creates a heavily pixelated version that's unusable as the actual content.
 */
export async function generateImagePreview(imageBuffer: Buffer): Promise<Buffer | null> {
  try {
    // Create pixelated preview:
    // 1. Downscale to tiny size
    // 2. Upscale back to preview size with nearest-neighbor (creates pixelation)
    // 3. Output as WebP for better compression
    const pixelated = await sharp(imageBuffer)
      // First downscale to tiny size
      .resize(PIXELATE_WIDTH, PIXELATE_HEIGHT, {
        fit: "inside",
        withoutEnlargement: true,
      })
      // Then upscale back to preview size with nearest-neighbor for pixelation
      .resize(PREVIEW_WIDTH, PREVIEW_HEIGHT, {
        fit: "inside",
        kernel: sharp.kernel.nearest, // Creates blocky pixelated effect
      })
      .webp({ quality: PREVIEW_QUALITY })
      .toBuffer();

    return pixelated;
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
