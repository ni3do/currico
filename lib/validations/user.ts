import { z } from "zod";
import { isValidSwissIBAN } from "../utils/iban";

// ============================================================
// CONSTANTS - Swiss Education System
// ============================================================

export const SWISS_SUBJECTS = [
  "Mathematik",
  "Deutsch",
  "Französisch",
  "Englisch",
  "NMG", // Natur, Mensch, Gesellschaft
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

// Public profile update schema
export const updatePublicProfileSchema = z.object({
  display_name: z
    .string()
    .min(2, "Name muss mindestens 2 Zeichen haben")
    .max(50, "Name darf maximal 50 Zeichen haben"),
  bio: z
    .string()
    .max(500, "Bio darf maximal 500 Zeichen haben")
    .optional()
    .nullable(),
  subjects: z
    .array(z.string())
    .min(1, "Mindestens ein Fach auswählen"),
  cycles: z
    .array(z.string())
    .min(1, "Mindestens einen Zyklus auswählen"),
  cantons: z.array(z.string()).optional(),
});

// Payout information schema
export const updatePayoutSchema = z.object({
  legal_first_name: z
    .string()
    .min(1, "Vorname ist erforderlich")
    .max(100, "Vorname darf maximal 100 Zeichen haben"),
  legal_last_name: z
    .string()
    .min(1, "Nachname ist erforderlich")
    .max(100, "Nachname darf maximal 100 Zeichen haben"),
  iban: z
    .string()
    .refine(isValidSwissIBAN, "Ungültige Schweizer IBAN"),
  address_street: z.string().optional().nullable(),
  address_city: z.string().optional().nullable(),
  address_postal: z.string().optional().nullable(),
});

// Full profile update (combines both)
export const updateProfileSchema = updatePublicProfileSchema.merge(
  updatePayoutSchema.partial()
);

// Registration schema
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
  role: z.enum(["BUYER", "SELLER", "SCHOOL"]),
});

// ============================================================
// TYPE EXPORTS
// ============================================================

export type UpdatePublicProfile = z.infer<typeof updatePublicProfileSchema>;
export type UpdatePayout = z.infer<typeof updatePayoutSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// ============================================================
// VALIDATION HELPERS
// ============================================================

// Check if user can upload resources (seller requirements met)
export function canUploadResources(user: {
  display_name: string | null;
  subjects: string[];
  cycles: string[];
  legal_first_name: string | null;
  legal_last_name: string | null;
  iban: string | null;
}): { allowed: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!user.display_name) missing.push("Profilname");
  if (!user.subjects || user.subjects.length === 0) missing.push("Fächer");
  if (!user.cycles || user.cycles.length === 0) missing.push("Zyklen");
  if (!user.legal_first_name) missing.push("Vorname (rechtlich)");
  if (!user.legal_last_name) missing.push("Nachname (rechtlich)");
  if (!user.iban) missing.push("IBAN");
  else if (!isValidSwissIBAN(user.iban)) missing.push("Gültige IBAN");

  return {
    allowed: missing.length === 0,
    missing,
  };
}
