import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

// ============================================================
// ERROR RESPONSES
// ============================================================

export function unauthorized(message = "Nicht authentifiziert") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Zugriff verweigert") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function badRequest(message: string, details?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...details }, { status: 400 });
}

export function notFound(message = "Nicht gefunden") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(message = "Interner Serverfehler") {
  return NextResponse.json({ error: message }, { status: 500 });
}

// ============================================================
// AUTH HELPERS
// ============================================================

/**
 * Require authentication - returns user ID or null
 * Use with: const userId = await requireAuth(); if (!userId) return unauthorized();
 */
export async function requireAuth(): Promise<string | null> {
  return getCurrentUserId();
}

/**
 * Check if user is a seller
 * Returns user object with seller info or null if not a seller
 */
export async function requireSeller(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) return null;
  if (user.role !== "SELLER") return null;

  return user;
}

/**
 * Check seller profile completion for uploading
 * Returns array of missing field names, or empty array if complete
 *
 * Required fields:
 * - display_name: Profile name
 * - emailVerified: Email must be verified
 * - stripe_onboarding_complete + stripe_charges_enabled: Stripe verification (only for paid resources)
 *
 * @param userId - The user ID to check
 * @param requireStripe - If true, require Stripe verification (for paid resources)
 */
export async function checkSellerProfile(
  userId: string,
  requireStripe: boolean = true
): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      display_name: true,
      emailVerified: true,
      stripe_onboarding_complete: true,
      stripe_charges_enabled: true,
    },
  });

  if (!user) return ["Benutzer nicht gefunden"];

  const missing: string[] = [];
  if (!user.display_name) missing.push("Profilname");
  if (!user.emailVerified) missing.push("E-Mail-Verifizierung");

  // Only require Stripe for paid resources
  if (requireStripe && (!user.stripe_onboarding_complete || !user.stripe_charges_enabled)) {
    missing.push("Stripe-Verifizierung");
  }

  return missing;
}

/**
 * Check if user can upload resources
 * Any authenticated user with verified email can upload free resources
 * Only verified sellers can upload paid resources
 *
 * @returns Object with canUpload boolean and optional error message
 */
export async function checkCanUpload(
  userId: string,
  price: number
): Promise<{ canUpload: boolean; error?: string; missing?: string[] }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      display_name: true,
      emailVerified: true,
      role: true,
      stripe_onboarding_complete: true,
      stripe_charges_enabled: true,
    },
  });

  if (!user) {
    return { canUpload: false, error: "Benutzer nicht gefunden" };
  }

  const missing: string[] = [];

  // Basic requirements for all uploads
  if (!user.display_name) missing.push("Profilname");
  if (!user.emailVerified) missing.push("E-Mail-Verifizierung");

  // Paid resources require Stripe verification
  if (price > 0) {
    if (!user.stripe_onboarding_complete || !user.stripe_charges_enabled) {
      missing.push("Stripe-Verifizierung");
    }
  }

  if (missing.length > 0) {
    return { canUpload: false, missing };
  }

  return { canUpload: true };
}

// ============================================================
// PAGINATION
// ============================================================

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Parse pagination parameters from URL search params
 * @param searchParams - URL search params or object with page/limit
 * @param defaults - Default values for page and limit
 */
export function parsePagination(
  searchParams: URLSearchParams | { page?: string; limit?: string },
  defaults: { page?: number; limit?: number; maxLimit?: number } = {}
): PaginationParams {
  const { page: defaultPage = 1, limit: defaultLimit = 20, maxLimit = 100 } = defaults;

  let pageStr: string | null;
  let limitStr: string | null;

  if (searchParams instanceof URLSearchParams) {
    pageStr = searchParams.get("page");
    limitStr = searchParams.get("limit");
  } else {
    pageStr = searchParams.page ?? null;
    limitStr = searchParams.limit ?? null;
  }

  const page = Math.max(1, parseInt(pageStr || String(defaultPage)));
  const limit = Math.min(maxLimit, Math.max(1, parseInt(limitStr || String(defaultLimit))));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Create pagination response object
 */
export function paginationResponse(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
