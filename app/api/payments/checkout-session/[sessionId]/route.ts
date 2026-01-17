import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

/**
 * GET /api/payments/checkout-session/[sessionId]
 * Retrieves transaction and resource info for a checkout session
 * Access: Authenticated users only (must be the buyer)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  // Get authenticated user
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  const { sessionId } = await params;

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 }
    );
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
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Format amount for display
    const amountFormatted =
      transaction.amount === 0
        ? "Free"
        : `CHF ${(transaction.amount / 100).toFixed(2)}`;

    return NextResponse.json({
      id: transaction.id,
      amount: transaction.amount,
      amountFormatted,
      status: transaction.status,
      createdAt: transaction.created_at.toISOString(),
      resource: transaction.resource,
    });
  } catch (error) {
    console.error("Error fetching checkout session:", error);
    return NextResponse.json(
      { error: "Failed to fetch checkout session" },
      { status: 500 }
    );
  }
}
