import { z } from "zod";
import { SWISS_SUBJECTS, SWISS_CYCLES } from "./user";

// ============================================================
// CONSTANTS
// ============================================================

export const RESOURCE_LANGUAGES = ["de", "fr", "it", "en"] as const;

export const RESOURCE_TYPES = [
  "pdf",
  "word",
  "powerpoint",
  "excel",
  "other",
] as const;

// File size limits (in bytes)
export const MAX_RESOURCE_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_PREVIEW_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Allowed MIME types for resource files
export const ALLOWED_RESOURCE_TYPES: Record<string, string[]> = {
  pdf: ["application/pdf"],
  word: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  powerpoint: [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
  excel: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  other: [], // Allow any file type
};

// Allowed MIME types for preview images
export const ALLOWED_PREVIEW_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

// Magic bytes for file validation
export const MAGIC_BYTES: Record<string, number[][]> = {
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]], // %PDF
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF (WebP container)
  // Office files use ZIP format (PK signature)
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    [0x50, 0x4b, 0x03, 0x04],
  ],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [
    [0x50, 0x4b, 0x03, 0x04],
  ],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    [0x50, 0x4b, 0x03, 0x04],
  ],
  // Legacy Office formats
  "application/msword": [[0xd0, 0xcf, 0x11, 0xe0]], // OLE compound document
  "application/vnd.ms-powerpoint": [[0xd0, 0xcf, 0x11, 0xe0]],
  "application/vnd.ms-excel": [[0xd0, 0xcf, 0x11, 0xe0]],
};

// ============================================================
// ZOD SCHEMAS
// ============================================================

// Schema for creating a new resource
export const createResourceSchema = z.object({
  title: z
    .string()
    .min(3, "Titel muss mindestens 3 Zeichen haben")
    .max(100, "Titel darf maximal 100 Zeichen haben"),
  description: z
    .string()
    .min(10, "Beschreibung muss mindestens 10 Zeichen haben")
    .max(5000, "Beschreibung darf maximal 5000 Zeichen haben"),
  price: z
    .number()
    .int("Preis muss eine ganze Zahl sein")
    .min(0, "Preis darf nicht negativ sein")
    .max(100000, "Preis darf maximal 1000 CHF sein"), // Max 1000 CHF in cents
  subjects: z
    .array(z.enum(SWISS_SUBJECTS as unknown as [string, ...string[]]))
    .min(1, "Mindestens ein Fach auswählen"),
  cycles: z
    .array(z.enum(SWISS_CYCLES as unknown as [string, ...string[]]))
    .min(1, "Mindestens einen Zyklus auswählen"),
  language: z.enum(RESOURCE_LANGUAGES).optional().default("de"),
  resourceType: z.enum(RESOURCE_TYPES).optional().default("pdf"),
  is_published: z.boolean().optional().default(false),
});

// Schema for updating an existing resource
export const updateResourceSchema = z.object({
  title: z
    .string()
    .min(3, "Titel muss mindestens 3 Zeichen haben")
    .max(100, "Titel darf maximal 100 Zeichen haben")
    .optional(),
  description: z
    .string()
    .min(10, "Beschreibung muss mindestens 10 Zeichen haben")
    .max(5000, "Beschreibung darf maximal 5000 Zeichen haben")
    .optional(),
  price: z
    .number()
    .int("Preis muss eine ganze Zahl sein")
    .min(0, "Preis darf nicht negativ sein")
    .max(100000, "Preis darf maximal 1000 CHF sein")
    .optional(),
  subjects: z
    .array(z.enum(SWISS_SUBJECTS as unknown as [string, ...string[]]))
    .min(1, "Mindestens ein Fach auswählen")
    .optional(),
  cycles: z
    .array(z.enum(SWISS_CYCLES as unknown as [string, ...string[]]))
    .min(1, "Mindestens einen Zyklus auswählen")
    .optional(),
  is_published: z.boolean().optional(),
});

// ============================================================
// TYPE EXPORTS
// ============================================================

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;

// ============================================================
// VALIDATION HELPERS
// ============================================================

/**
 * Validate file magic bytes to ensure file content matches declared type
 */
export function validateMagicBytes(
  buffer: Buffer,
  mimeType: string
): boolean {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) {
    // No signature defined, skip validation
    return true;
  }

  return signatures.some((signature) =>
    signature.every((byte, index) => buffer[index] === byte)
  );
}

/**
 * Check if a MIME type is allowed for resource files
 */
export function isAllowedResourceType(
  mimeType: string,
  resourceType: string
): boolean {
  if (resourceType === "other") {
    return true; // Allow any type for "other"
  }
  const allowedTypes = ALLOWED_RESOURCE_TYPES[resourceType];
  return allowedTypes ? allowedTypes.includes(mimeType) : false;
}

/**
 * Check if a MIME type is allowed for preview images
 */
export function isAllowedPreviewType(mimeType: string): boolean {
  return ALLOWED_PREVIEW_TYPES.includes(mimeType);
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const extensions: Record<string, string> = {
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "pptx",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return extensions[mimeType] || "bin";
}

/**
 * Format price in cents to Swiss Francs string
 */
export function formatPrice(priceInCents: number): string {
  const francs = priceInCents / 100;
  return `CHF ${francs.toFixed(2)}`;
}
