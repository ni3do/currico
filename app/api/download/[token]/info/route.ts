import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, badRequest, serverError, API_ERROR_CODES } from "@/lib/api";
import { captureError } from "@/lib/api-error";

/**
 * GET /api/download/[token]/info
 * Get information about a download token without downloading
 * Returns resource info, expiration, and remaining downloads
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find the download token with transaction and resource info
    const downloadToken = await prisma.downloadToken.findUnique({
      where: { token },
      select: {
        id: true,
        expires_at: true,
        download_count: true,
        max_downloads: true,
        transaction: {
          select: {
            id: true,
            status: true,
            amount: true,
            created_at: true,
            guest_email: true,
            resource: {
              select: {
                id: true,
                title: true,
                description: true,
                subjects: true,
                cycles: true,
                seller: {
                  select: {
                    display_name: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!downloadToken) {
      return notFound("Download link not found", API_ERROR_CODES.INVALID_TOKEN);
    }

    // Check if transaction is completed
    if (downloadToken.transaction.status !== "COMPLETED") {
      return badRequest("Payment not completed", undefined, API_ERROR_CODES.PAYMENT_INCOMPLETE);
    }

    const now = new Date();
    const isExpired = now > downloadToken.expires_at;
    const remainingDownloads = downloadToken.max_downloads - downloadToken.download_count;
    const maxDownloadsReached = remainingDownloads <= 0;

    // Determine status
    let status: "valid" | "expired" | "max_downloads";
    if (isExpired) {
      status = "expired";
    } else if (maxDownloadsReached) {
      status = "max_downloads";
    } else {
      status = "valid";
    }

    const resource = downloadToken.transaction.resource;
    const seller = resource.seller;

    return NextResponse.json({
      status,
      expiresAt: downloadToken.expires_at.toISOString(),
      downloadCount: downloadToken.download_count,
      maxDownloads: downloadToken.max_downloads,
      remainingDownloads: Math.max(0, remainingDownloads),
      purchaseDate: downloadToken.transaction.created_at.toISOString(),
      amount: downloadToken.transaction.amount,
      amountFormatted: `CHF ${(downloadToken.transaction.amount / 100).toFixed(2)}`,
      resource: {
        id: resource.id,
        title: resource.title,
        description: resource.description,
        subjects: resource.subjects,
        cycles: resource.cycles,
        sellerName: seller.display_name || seller.name || "Unknown",
      },
    });
  } catch (error) {
    captureError("Error fetching download token info:", error);
    return serverError();
  }
}
