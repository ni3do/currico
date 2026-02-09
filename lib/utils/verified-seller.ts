/**
 * Verified Seller criteria and eligibility check.
 * Pure utility — no DB dependency.
 */

export const VERIFIED_SELLER_CRITERIA = {
  minSales: 10,
  minRating: 4.5,
  minResources: 3,
  accountAgeDays: 30,
  noOpenReports: true,
} as const;

export interface VerificationInput {
  totalSales: number;
  avgRating: number | null;
  publishedResourceCount: number;
  accountCreatedAt: Date;
  openReportCount: number;
}

export interface VerificationResult {
  eligible: boolean;
  failedCriteria: string[];
  /** How many of the 5 criteria are met */
  metCount: number;
}

export function checkVerificationEligibility(input: VerificationInput): VerificationResult {
  const failedCriteria: string[] = [];

  if (input.totalSales < VERIFIED_SELLER_CRITERIA.minSales) {
    failedCriteria.push("minSales");
  }

  if (input.avgRating === null || input.avgRating < VERIFIED_SELLER_CRITERIA.minRating) {
    failedCriteria.push("minRating");
  }

  if (input.publishedResourceCount < VERIFIED_SELLER_CRITERIA.minResources) {
    failedCriteria.push("minResources");
  }

  const accountAgeMs = Date.now() - input.accountCreatedAt.getTime();
  const accountAgeDays = accountAgeMs / (1000 * 60 * 60 * 24);
  if (accountAgeDays < VERIFIED_SELLER_CRITERIA.accountAgeDays) {
    failedCriteria.push("accountAgeDays");
  }

  if (input.openReportCount > 0) {
    failedCriteria.push("noOpenReports");
  }

  const totalCriteria = 5;
  return {
    eligible: failedCriteria.length === 0,
    failedCriteria,
    metCount: totalCriteria - failedCriteria.length,
  };
}
