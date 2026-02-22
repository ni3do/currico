import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

// ============================================================
// ERROR CODES — used by client-side translateApiError() for i18n
// ============================================================

export const API_ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  BAD_REQUEST: "BAD_REQUEST",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  INVALID_ID: "INVALID_ID",
  INVALID_JSON_BODY: "INVALID_JSON_BODY",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  RATE_LIMITED: "RATE_LIMITED",
  CONFLICT: "CONFLICT",
  // Auth
  MISSING_TOKEN: "MISSING_TOKEN",
  EMAIL_ALREADY_VERIFIED: "EMAIL_ALREADY_VERIFIED",
  EMAIL_VERIFICATION_REQUIRED: "EMAIL_VERIFICATION_REQUIRED",
  SELLER_TERMS_REQUIRED: "SELLER_TERMS_REQUIRED",
  EMAIL_EXISTS: "EMAIL_EXISTS",
  // Materials
  MATERIAL_NOT_FOUND: "MATERIAL_NOT_FOUND",
  MATERIAL_EDIT_FORBIDDEN: "MATERIAL_EDIT_FORBIDDEN",
  MATERIAL_DELETE_FORBIDDEN: "MATERIAL_DELETE_FORBIDDEN",
  MATERIAL_HAS_PURCHASES: "MATERIAL_HAS_PURCHASES",
  MATERIAL_UNDER_REVIEW: "MATERIAL_UNDER_REVIEW",
  PURCHASE_REQUIRED: "PURCHASE_REQUIRED",
  PRICE_CHANGE_AFTER_APPROVAL: "PRICE_CHANGE_AFTER_APPROVAL",
  NO_FILE_UPLOADED: "NO_FILE_UPLOADED",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_FILE_CONTENT: "INVALID_FILE_CONTENT",
  STRIPE_REQUIRED: "STRIPE_REQUIRED",
  PROFILE_INCOMPLETE: "PROFILE_INCOMPLETE",
  // Checkout/Payment
  ALREADY_OWNED: "ALREADY_OWNED",
  CANNOT_BUY_OWN: "CANNOT_BUY_OWN",
  MATERIAL_UNAVAILABLE: "MATERIAL_UNAVAILABLE",
  SELLER_PAYMENTS_DISABLED: "SELLER_PAYMENTS_DISABLED",
  FREE_MATERIAL: "FREE_MATERIAL",
  PAYMENT_SERVICE_ERROR: "PAYMENT_SERVICE_ERROR",
  // Reviews
  CANNOT_REVIEW_OWN: "CANNOT_REVIEW_OWN",
  MUST_PURCHASE_TO_REVIEW: "MUST_PURCHASE_TO_REVIEW",
  ALREADY_REVIEWED: "ALREADY_REVIEWED",
  OWN_REVIEW_ONLY: "OWN_REVIEW_ONLY",
  // Downloads
  INVALID_TOKEN: "INVALID_TOKEN",
  PAYMENT_INCOMPLETE: "PAYMENT_INCOMPLETE",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  MAX_DOWNLOADS_REACHED: "MAX_DOWNLOADS_REACHED",
  FILE_NOT_FOUND: "FILE_NOT_FOUND",
  INVALID_OR_EXPIRED_TOKEN: "INVALID_OR_EXPIRED_TOKEN",
  // Bundles
  BUNDLE_NOT_FOUND: "BUNDLE_NOT_FOUND",
  BUNDLE_MATERIALS_INVALID: "BUNDLE_MATERIALS_INVALID",
  BUNDLE_EDIT_FORBIDDEN: "BUNDLE_EDIT_FORBIDDEN",
  BUNDLE_DELETE_FORBIDDEN: "BUNDLE_DELETE_FORBIDDEN",
  PRICE_INCREMENT_INVALID: "PRICE_INCREMENT_INVALID",
  // Comments/Replies
  OWN_COMMENT_ONLY: "OWN_COMMENT_ONLY",
  OWN_REPLY_ONLY: "OWN_REPLY_ONLY",
  // Collections
  COLLECTION_PRIVATE: "COLLECTION_PRIVATE",
  OWN_COLLECTION_ONLY: "OWN_COLLECTION_ONLY",
  ALREADY_IN_COLLECTION: "ALREADY_IN_COLLECTION",
  // Users
  CANNOT_FOLLOW_SELF: "CANNOT_FOLLOW_SELF",
  SELLER_ONLY: "SELLER_ONLY",
  PROTECTED_USER: "PROTECTED_USER",
  CANNOT_DELETE_SELF: "CANNOT_DELETE_SELF",
  CANNOT_WISHLIST_OWN: "CANNOT_WISHLIST_OWN",
  NOT_A_SELLER: "NOT_A_SELLER",
  // Reports
  ALREADY_REPORTED: "ALREADY_REPORTED",
  // Admin
  DRAFTS_ONLY: "DRAFTS_ONLY",
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

// ============================================================
// ERROR RESPONSES
// ============================================================

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message, code: API_ERROR_CODES.UNAUTHORIZED }, { status: 401 });
}

export function forbidden(message = "Forbidden", code: ApiErrorCode = API_ERROR_CODES.FORBIDDEN) {
  return NextResponse.json({ error: message, code }, { status: 403 });
}

export function badRequest(
  message: string,
  details?: Record<string, unknown>,
  code: ApiErrorCode = API_ERROR_CODES.BAD_REQUEST
) {
  return NextResponse.json({ error: message, code, ...details }, { status: 400 });
}

export function notFound(message = "Not found", code: ApiErrorCode = API_ERROR_CODES.NOT_FOUND) {
  return NextResponse.json({ error: message, code }, { status: 404 });
}

export function serverError(
  message = "Internal server error",
  code: ApiErrorCode = API_ERROR_CODES.INTERNAL_ERROR
) {
  return NextResponse.json({ error: message, code }, { status: 500 });
}

export function rateLimited(message = "Too many requests", headers?: HeadersInit) {
  return NextResponse.json(
    { error: message, code: API_ERROR_CODES.RATE_LIMITED },
    { status: 429, headers }
  );
}

export function conflict(message = "Conflict") {
  return NextResponse.json({ error: message, code: API_ERROR_CODES.CONFLICT }, { status: 409 });
}

export function serviceUnavailable(
  message = "Service unavailable",
  code: ApiErrorCode = API_ERROR_CODES.PAYMENT_SERVICE_ERROR
) {
  return NextResponse.json({ error: message, code }, { status: 503 });
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
 * Verify resource ownership - returns forbidden response if user doesn't own the resource
 */
export function requireOwnership(
  userId: string,
  ownerId: string,
  code: ApiErrorCode = API_ERROR_CODES.FORBIDDEN
): NextResponse | null {
  if (userId !== ownerId) {
    return forbidden("Not the owner", code);
  }
  return null;
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

  if (!user) return ["USER_NOT_FOUND"];

  const missing: string[] = [];
  if (!user.display_name) missing.push("PROFILE_NAME");
  if (!user.emailVerified) missing.push("EMAIL_VERIFICATION");

  // Only require Stripe for paid resources
  if (requireStripe && (!user.stripe_onboarding_complete || !user.stripe_charges_enabled)) {
    missing.push("STRIPE_VERIFICATION");
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
    return { canUpload: false, error: "USER_NOT_FOUND" };
  }

  const missing: string[] = [];

  // Basic requirements for all uploads
  if (!user.display_name) missing.push("PROFILE_NAME");
  if (!user.emailVerified) missing.push("EMAIL_VERIFICATION");

  // Paid resources require Stripe verification
  if (price > 0) {
    if (!user.stripe_onboarding_complete || !user.stripe_charges_enabled) {
      missing.push("STRIPE_VERIFICATION");
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
