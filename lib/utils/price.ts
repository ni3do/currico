/**
 * Price formatting utilities for Swiss Francs (CHF)
 * All prices are stored in cents in the database
 */

/**
 * Format a price in cents to a display string
 * @param priceInCents - Price in cents (e.g., 500 = CHF 5.00)
 * @param options - Formatting options
 * @returns Formatted price string (e.g., "CHF 5.00" or "Gratis")
 */
export function formatPrice(
  priceInCents: number,
  options: {
    showFreeLabel?: boolean;
    freeLabel?: string;
    includePrefix?: boolean;
  } = {}
): string {
  const {
    showFreeLabel = true,
    freeLabel = "Gratis",
    includePrefix = true,
  } = options;

  if (priceInCents === 0 && showFreeLabel) {
    return freeLabel;
  }

  const formatted = (priceInCents / 100).toFixed(2);
  return includePrefix ? `CHF ${formatted}` : formatted;
}

/**
 * Format a price for admin display (always shows numeric value)
 * @param priceInCents - Price in cents
 * @returns Formatted price without "Gratis" label
 */
export function formatPriceAdmin(priceInCents: number): string {
  return (priceInCents / 100).toFixed(2);
}

/**
 * Calculate resource status based on published/approved flags
 * @param isPublished - Whether the resource is published
 * @param isApproved - Whether the resource is approved
 * @returns Status string
 */
export function getResourceStatus(
  isPublished: boolean,
  isApproved: boolean
): string {
  if (isApproved) {
    return "Verified";
  }
  if (isPublished) {
    return "Pending";
  }
  return "Draft";
}
