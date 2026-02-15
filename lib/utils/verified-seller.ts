/**
 * Verified Seller criteria, eligibility check, and event-driven auto-verification.
 */

import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

export const VERIFIED_SELLER_CRITERIA = {
  minSales: 10,
  minRating: 4.5,
  minResources: 3,
  accountAgeDays: 30,
} as const;

export interface VerificationInput {
  totalSales: number;
  avgRating: number | null;
  publishedResourceCount: number;
  accountCreatedAt: Date;
}

export interface VerificationResult {
  eligible: boolean;
  failedCriteria: string[];
  /** How many of the 4 criteria are met */
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

  const totalCriteria = 4;
  return {
    eligible: failedCriteria.length === 0,
    failedCriteria,
    metCount: totalCriteria - failedCriteria.length,
  };
}

/**
 * Event-driven verification check.
 * Queries seller stats, auto-verifies or auto-revokes, and notifies on new verification.
 * Fire-and-forget — callers should use `.catch()`.
 */
export async function checkAndUpdateVerification(sellerId: string): Promise<void> {
  const [paidDownloadCount, freeDownloadCount, reviewData, publishedResourceCount, user] =
    await Promise.all([
      prisma.transaction.count({
        where: { resource: { seller_id: sellerId }, status: "COMPLETED" },
      }),
      prisma.download.count({
        where: { resource: { seller_id: sellerId } },
      }),
      prisma.review.aggregate({
        where: { resource: { seller_id: sellerId } },
        _avg: { rating: true },
      }),
      prisma.resource.count({
        where: { seller_id: sellerId, is_published: true, is_public: true },
      }),
      prisma.user.findUniqueOrThrow({
        where: { id: sellerId },
        select: {
          created_at: true,
          is_verified_seller: true,
          verified_seller_method: true,
        },
      }),
    ]);

  const totalSales = paidDownloadCount + freeDownloadCount;
  const avgRating = reviewData._avg.rating;

  const verification = checkVerificationEligibility({
    totalSales,
    avgRating,
    publishedResourceCount,
    accountCreatedAt: user.created_at,
  });

  // Auto-verify if eligible and not yet verified
  if (verification.eligible && !user.is_verified_seller) {
    prisma.user
      .update({
        where: { id: sellerId },
        data: {
          is_verified_seller: true,
          verified_seller_at: new Date(),
          verified_seller_method: "auto",
        },
      })
      .then(() => {
        // Notify seller about new verification
        createNotification({
          userId: sellerId,
          type: "SYSTEM",
          title: "Herzlichen Glückwunsch — Sie sind jetzt ein verifizierter Verkäufer!",
          body: "Sie erfüllen alle Kriterien und haben das Abzeichen «Verifizierter Verkäufer» erhalten.",
          link: "/verifizierter-verkaeufer",
        }).catch((err) => console.error("Failed to create verification notification:", err));
      })
      .catch((err) => console.error("Failed to auto-verify seller:", err));
    return;
  }

  // Auto-revoke if no longer eligible and was auto-verified (never revoke manual)
  if (!verification.eligible && user.is_verified_seller && user.verified_seller_method === "auto") {
    prisma.user
      .update({
        where: { id: sellerId },
        data: {
          is_verified_seller: false,
          verified_seller_at: null,
          verified_seller_method: null,
        },
      })
      .catch((err) => console.error("Failed to auto-revoke seller verification:", err));
  }
}
