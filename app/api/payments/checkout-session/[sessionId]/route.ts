import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api";

/**
 * GET /api/payments/checkout-session/[sessionId]
 * Retrieves transaction and resource info for a checkout session
 * Access: Authenticated users only (must be the buyer)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();
  const { sessionId } = await params;

  if (!sessionId) {
    return NextResponse.json({ error: "Session-ID ist erforderlich" }, { status: 400 });
  }

  try {
    // Find the transaction by checkout session ID
    const transaction = await prisma.transaction.findFirst({
      where: {
        stripe_checkout_session_id: sessionId,
        buyer_id: userId,
      },
      select: {
        id: true,
        amount: true,
        status: true,
        created_at: true,
        resource: {
          select: {
            id: true,
            title: true,
            description: true,
            subjects: true,
            cycles: true,
            preview_url: true,
            seller: {
              select: {
                id: true,
                name: true,
                display_name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaktion nicht gefunden" }, { status: 404 });
    }

    // Format amount for display
    const amountFormatted =
      transaction.amount === 0 ? "Kostenlos" : `CHF ${(transaction.amount / 100).toFixed(2)}`;

    return NextResponse.json({
      id: transaction.id,
      amount: transaction.amount,
      amountFormatted,
      status: transaction.status,
      createdAt: transaction.created_at.toISOString(),
      resource: {
        id: transaction.resource.id,
        title: transaction.resource.title,
        description: transaction.resource.description,
        subjects: transaction.resource.subjects,
        cycles: transaction.resource.cycles,
        previewUrl: transaction.resource.preview_url,
        seller: {
          id: transaction.resource.seller.id,
          name: transaction.resource.seller.name,
          displayName: transaction.resource.seller.display_name,
          image: transaction.resource.seller.image,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching checkout session:", error);
    return NextResponse.json({ error: "Fehler beim Laden der Checkout-Session" }, { status: 500 });
  }
}
