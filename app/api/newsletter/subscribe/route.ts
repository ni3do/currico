import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateVerificationToken } from "@/lib/email";
import { checkRateLimit, getClientIP, rateLimitHeaders } from "@/lib/rateLimit";

/**
 * POST /api/newsletter/subscribe
 * Subscribe an email to the newsletter
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(getClientIP(request), "newsletter:subscribe");
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." },
        { status: 429, headers: rateLimitHeaders(rateLimit) }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "E-Mail-Adresse ist erforderlich" }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Ungültige E-Mail-Adresse" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      if (existing.confirmed && !existing.unsubscribed_at) {
        // Already confirmed and active - return success silently
        return NextResponse.json({ success: true });
      }

      if (existing.unsubscribed_at) {
        // Re-subscribe: reset unsubscribed_at and generate new token
        const token = generateVerificationToken();
        await prisma.newsletterSubscriber.update({
          where: { id: existing.id },
          data: {
            unsubscribed_at: null,
            confirmed: true,
            confirm_token: token,
          },
        });
        return NextResponse.json({ success: true });
      }

      // Exists but not confirmed yet - return success silently
      return NextResponse.json({ success: true });
    }

    // Create new subscriber
    const token = generateVerificationToken();
    await prisma.newsletterSubscriber.create({
      data: {
        email: normalizedEmail,
        confirm_token: token,
        confirmed: true, // Auto-confirm for now (double opt-in can be added later)
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
