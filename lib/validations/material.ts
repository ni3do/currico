import { z } from "zod";

// ============================================================
// CONSTANTS
// ============================================================

export const MATERIAL_LANGUAGES = ["de", "fr", "it", "en"] as const;

export const MATERIAL_DIALECTS = ["STANDARD", "SWISS", "BOTH"] as const;

export const MATERIAL_TYPES = ["pdf", "word", "powerpoint", "excel", "onenote", "other"] as const;

// File size limits (in bytes)
export const MAX_MATERIAL_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_PREVIEW_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Allowed MIME types for material files
export const ALLOWED_MATERIAL_TYPES: Record<string, string[]> = {
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
  onenote: ["application/onenote", "application/msonenote"],
  // Safe file types for "other" - educational/document formats only
  other: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/onenote",
    "application/msonenote",
    "application/rtf",
    "text/plain",
    "text/csv",
    "application/zip",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "audio/mpeg",
    "audio/wav",
    "video/mp4",
    "video/webm",
  ],
};

// Allowed MIME types for preview images
export const ALLOWED_PREVIEW_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [[0x50, 0x4b, 0x03, 0x04]],
  // Legacy Office formats
  "application/msword": [[0xd0, 0xcf, 0x11, 0xe0]], // OLE compound document
  "application/vnd.ms-powerpoint": [[0xd0, 0xcf, 0x11, 0xe0]],
  "application/vnd.ms-excel": [[0xd0, 0xcf, 0x11, 0xe0]],
};

// ============================================================
// CONSTANTS
// ============================================================

/** Special subject code for non-LP21 materials (classroom deco, org tools, etc.) */
export const SONSTIGE_CODE = "SONSTIGE";

// ============================================================
// SHARED SUB-SCHEMAS
// ============================================================

const tagsSchema = z
  .array(
    z
      .string()
      .min(2, "Schlagwort muss mindestens 2 Zeichen haben")
      .max(30, "Schlagwort darf maximal 30 Zeichen haben")
      .transform((s) => s.toLowerCase().trim())
  )
  .max(10, "Maximal 10 Schlagwörter")
  .default([]);

// ============================================================
// ZOD SCHEMAS
// ============================================================

// Schema for creating a new material
// Note: subjects and cycles accept any strings - validation against database happens at API level
export const createMaterialSchema = z
  .object({
    title: z
      .string()
      .min(3, "Titel muss mindestens 3 Zeichen haben")
      .max(64, "Titel darf maximal 64 Zeichen haben"),
    description: z
      .string()
      .min(10, "Beschreibung muss mindestens 10 Zeichen haben")
      .max(5000, "Beschreibung darf maximal 5000 Zeichen haben"),
    price: z
      .number()
      .int("Preis muss eine ganze Zahl sein")
      .min(0, "Preis darf nicht negativ sein")
      .max(100000, "Preis darf maximal 1000 CHF sein") // Max 1000 CHF in cents
      .refine(
        (val) => val === 0 || (val >= 50 && val % 50 === 0),
        "Preis muss 0 (gratis) oder mindestens CHF 0.50 in 50-Rappen-Schritten sein"
      ),
    subjects: z
      .array(z.string().min(1, "Fachkürzel darf nicht leer sein"))
      .min(1, "Mindestens ein Fach auswählen"),
    cycles: z.array(z.string().min(1)).default([]),
    tags: tagsSchema,
    language: z.enum(MATERIAL_LANGUAGES).optional().default("de"),
    dialect: z.enum(MATERIAL_DIALECTS).optional().default("BOTH"),
    resourceType: z.enum(MATERIAL_TYPES).optional().default("pdf"),
    is_published: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    const isSonstige = data.subjects.includes(SONSTIGE_CODE);
    if (!isSonstige && data.cycles.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Mindestens einen Zyklus auswählen",
        path: ["cycles"],
      });
    }
  });

// Schema for updating an existing material
export const updateMaterialSchema = z
  .object({
    title: z
      .string()
      .min(3, "Titel muss mindestens 3 Zeichen haben")
      .max(64, "Titel darf maximal 64 Zeichen haben")
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
      .refine(
        (val) => val === 0 || (val >= 50 && val % 50 === 0),
        "Preis muss 0 (gratis) oder mindestens CHF 0.50 in 50-Rappen-Schritten sein"
      )
      .optional(),
    subjects: z
      .array(z.string().min(1, "Fachkürzel darf nicht leer sein"))
      .min(1, "Mindestens ein Fach auswählen")
      .optional(),
    cycles: z.array(z.string().min(1)).optional(),
    tags: tagsSchema.optional(),
    is_published: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // Only validate cycles when both subjects and cycles are provided
    if (data.subjects && data.cycles !== undefined) {
      const isSonstige = data.subjects.includes(SONSTIGE_CODE);
      if (!isSonstige && data.cycles.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "Mindestens einen Zyklus auswählen",
          path: ["cycles"],
        });
      }
    }
  });

// ============================================================
// TYPE EXPORTS
// ============================================================

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;

// ============================================================
// VALIDATION HELPERS
// ============================================================

/**
 * Validate file magic bytes to ensure file content matches declared type
 */
export function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) {
    // No signature defined, skip validation
    return true;
  }

  return signatures.some((signature) => signature.every((byte, index) => buffer[index] === byte));
}

/**
 * Check if a MIME type is allowed for material files
 */
export function isAllowedMaterialType(mimeType: string, resourceType: string): boolean {
  const allowedTypes = ALLOWED_MATERIAL_TYPES[resourceType];
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
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return extensions[mimeType] || "bin";
}
