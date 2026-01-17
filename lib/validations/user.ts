import { z } from "zod";

// ============================================================
// CONSTANTS - Swiss Education System
// ============================================================

export const SWISS_SUBJECTS = [
  "Mathematik",
  "Deutsch",
  "Französisch",
  "Englisch",
  "Natur, Mensch, Gesellschaft", // NMG
  "Bildnerisches Gestalten",
  "Textiles und Technisches Gestalten",
  "Musik",
  "Bewegung und Sport",
  "Medien und Informatik",
  "Berufliche Orientierung",
  "Religionen, Kulturen, Ethik",
] as const;

export const SWISS_CYCLES = [
  "Zyklus 1", // Kindergarten - 2. Klasse
  "Zyklus 2", // 3. - 6. Klasse
  "Zyklus 3", // 7. - 9. Klasse (Sekundarstufe I)
] as const;

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

// Profile update schema
// Note: Payout information is now handled via Stripe Connect, not stored locally
export const updateProfileSchema = z.object({
  display_name: z
    .string()
    .min(2, "Name muss mindestens 2 Zeichen haben")
    .max(50, "Name darf maximal 50 Zeichen haben"),
  bio: z.string().max(500, "Bio darf maximal 500 Zeichen haben").optional().nullable(),
  subjects: z.array(z.string()).min(1, "Mindestens ein Fach auswählen"),
  cycles: z.array(z.string()).min(1, "Mindestens einen Zyklus auswählen"),
  cantons: z.array(z.string()).optional(),
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

// ============================================================
// TYPE EXPORTS
// ============================================================

export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

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
