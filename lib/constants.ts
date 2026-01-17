/**
 * Platform constants
 */

// Platform fee percentage (30%)
// This fee is deducted from each sale and passed to Stripe as application_fee_amount
export const PLATFORM_FEE_PERCENT = 30;

// Seller payout percentage (100% - platform fee)
export const SELLER_PAYOUT_PERCENT = 100 - PLATFORM_FEE_PERCENT;

// Download link settings
export const DOWNLOAD_LINK_EXPIRY_DAYS = 7;
export const DOWNLOAD_LINK_MAX_DOWNLOADS = 3;
