/**
 * Translates API error responses using i18n.
 *
 * API responses include a `code` field (e.g. "UNAUTHORIZED") and a
 * German `error` fallback string. This utility maps error codes to
 * i18n translation keys so the client can show localized messages.
 *
 * Usage:
 *   const t = useTranslations("apiErrors");
 *   const message = translateApiError(data.code, data.error, t);
 */

type TranslateFunction = (key: string) => string;

/**
 * Map an API error code to a localized message.
 * Falls back to the raw `error` string if no translation is found.
 */
export function translateApiError(
  code: string | undefined,
  fallback: string,
  t: TranslateFunction
): string {
  if (!code) return fallback;

  // Map API error codes to i18n keys
  const codeToKey: Record<string, string> = {
    UNAUTHORIZED: "unauthorized",
    FORBIDDEN: "forbidden",
    NOT_FOUND: "notFound",
    BAD_REQUEST: "badRequest",
    INTERNAL_ERROR: "internalError",
    INVALID_INPUT: "invalidInput",
    INVALID_FILE_TYPE: "invalidFileType",
    USER_NOT_FOUND: "userNotFound",
    RATE_LIMITED: "rateLimited",
    CONFLICT: "conflict",
    // Checkout/Payment
    EMAIL_EXISTS: "emailExists",
    ALREADY_OWNED: "alreadyOwned",
    CANNOT_BUY_OWN: "cannotBuyOwn",
    MATERIAL_UNAVAILABLE: "materialUnavailable",
    SELLER_PAYMENTS_DISABLED: "sellerPaymentsDisabled",
    FREE_MATERIAL: "freeMaterial",
    PAYMENT_SERVICE_ERROR: "paymentServiceError",
    // Reviews
    CANNOT_REVIEW_OWN: "cannotReviewOwn",
    MUST_PURCHASE_TO_REVIEW: "mustPurchaseToReview",
    ALREADY_REVIEWED: "alreadyReviewed",
    OWN_REVIEW_ONLY: "ownReviewOnly",
  };

  const key = codeToKey[code];
  if (!key) return fallback;

  try {
    return t(key);
  } catch {
    return fallback;
  }
}
