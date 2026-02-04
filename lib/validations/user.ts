import { z } from "zod";

// ============================================================
// CONSTANTS - Swiss Education System
// ============================================================

// Note: Subjects and cycles are fetched from the database via /api/curriculum
// SWISS_CANTONS remains hardcoded as it's stable political data

export const SWISS_CANTONS = [
  "Aargau",
  "Appenzell Ausserrhoden",
  "Appenzell Innerrhoden",
  "Basel-Landschaft",
  "Basel-Stadt",
  "Bern",
  "Freiburg",
  "Genf",
  "Glarus",
  "Graubünden",
  "Jura",
  "Luzern",
  "Neuenburg",
  "Nidwalden",
  "Obwalden",
  "Schaffhausen",
  "Schwyz",
  "Solothurn",
  "St. Gallen",
  "Thurgau",
  "Tessin",
  "Uri",
  "Waadt",
  "Wallis",
  "Zug",
  "Zürich",
] as const;

// ============================================================
// ZOD SCHEMAS
// ============================================================

// Teaching experience options
export const TEACHING_EXPERIENCE_OPTIONS = ["0-2", "3-5", "6-10", "11-20", "20+"] as const;

// Platform language options
export const LANGUAGE_OPTIONS = ["de", "en"] as const;

// Profile update schema
// Note: Payout information is now handled via Stripe Connect, not stored locally
export const updateProfileSchema = z.object({
  display_name: z
    .string()
    .min(2, "Name muss mindestens 2 Zeichen haben")
    .max(50, "Name darf maximal 50 Zeichen haben"),
  bio: z.string().max(500, "Bio darf maximal 500 Zeichen haben").optional().nullable(),
  subjects: z.array(z.string()).optional(),
  cycles: z.array(z.string()).optional(),
  cantons: z.array(z.string()).optional(),
  website: z
    .string()
    .url("Ungültige URL")
    .max(255, "URL darf maximal 255 Zeichen haben")
    .optional()
    .nullable()
    .or(z.literal("")),
  school: z.string().max(150, "Schulname darf maximal 150 Zeichen haben").optional().nullable(),
  teaching_experience: z.enum(TEACHING_EXPERIENCE_OPTIONS).optional().nullable(),
  preferred_language: z.enum(LANGUAGE_OPTIONS).optional(),
  instagram: z
    .string()
    .max(100, "Instagram-Name darf maximal 100 Zeichen haben")
    .optional()
    .nullable(),
  pinterest: z
    .string()
    .max(100, "Pinterest-Name darf maximal 100 Zeichen haben")
    .optional()
    .nullable(),
  is_private: z.boolean().optional(),
});

// Registration schema
// Note: SCHOOL role removed - only BUYER and SELLER are supported
export const registerSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z
    .string()
    .min(8, "Passwort muss mindestens 8 Zeichen haben")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Passwort muss Gross-, Kleinbuchstaben und Zahlen enthalten"
    ),
  display_name: z
    .string()
    .min(2, "Name muss mindestens 2 Zeichen haben")
    .max(50, "Name darf maximal 50 Zeichen haben"),
  role: z.enum(["BUYER", "SELLER"]),
});

// Notification preferences update schema
export const updateNotificationPreferencesSchema = z.object({
  notify_new_from_followed: z.boolean().optional(),
  notify_recommendations: z.boolean().optional(),
  notify_material_updates: z.boolean().optional(),
  notify_review_reminders: z.boolean().optional(),
  notify_wishlist_price_drops: z.boolean().optional(),
  notify_welcome_offers: z.boolean().optional(),
  notify_sales: z.boolean().optional(),
  notify_newsletter: z.boolean().optional(),
  notify_platform_updates: z.boolean().optional(),
});

// ============================================================
// TYPE EXPORTS
// ============================================================

export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateNotificationPreferences = z.infer<typeof updateNotificationPreferencesSchema>;

// ============================================================
// VALIDATION HELPERS
// ============================================================

// Check if user can upload resources (seller requirements met)
// Note: Payout verification is now handled via Stripe KYC
// Note: Email verification is required before seller onboarding
export function canUploadResources(user: {
  display_name: string | null;
  subjects: string[];
  cycles: string[];
  role: string;
  stripe_charges_enabled: boolean;
  emailVerified: Date | string | null;
}): { allowed: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!user.emailVerified) missing.push("E-Mail-Verifizierung");
  if (!user.display_name) missing.push("Profilname");
  if (!user.subjects || user.subjects.length === 0) missing.push("Fächer");
  if (!user.cycles || user.cycles.length === 0) missing.push("Zyklen");
  if (user.role !== "SELLER") missing.push("Verkäuferstatus");
  if (!user.stripe_charges_enabled) missing.push("Stripe-Verifizierung");

  return {
    allowed: missing.length === 0,
    missing,
  };
}
