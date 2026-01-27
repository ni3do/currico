import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  sendVerificationEmail,
  generateVerificationToken,
  VERIFICATION_TOKEN_EXPIRY_HOURS,
} from "@/lib/email";
import { checkRateLimit, getClientIP, rateLimitHeaders } from "@/lib/rateLimit";
import { locales, defaultLocale, type Locale } from "@/i18n/config";

export async function POST(request: NextRequest) {
  // Rate limiting check
  const clientIP = getClientIP(request);
  const rateLimitResult = checkRateLimit(clientIP, "auth:send-verification");

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut.",
        retryAfter: rateLimitResult.retryAfter,
      },
      {
        status: 429,
        headers: rateLimitHeaders(rateLimitResult),
      }
    );
  }

  // Get the current session
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 });
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({ error: "E-Mail-Adresse ist bereits bestätigt" }, { status: 400 });
    }

    // Delete any existing verification tokens for this user
    await prisma.emailVerificationToken.deleteMany({
      where: { user_id: user.id },
    });

    // Generate new token
    const token = generateVerificationToken();
    const expires = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // Store token in database
    await prisma.emailVerificationToken.create({
      data: {
        id: crypto.randomUUID(),
        token,
        expires,
        user_id: user.id,
      },
    });

    // Get locale from request headers, but only use available locales
    const acceptLanguage = request.headers.get("accept-language") || "";
    const preferredLocale = acceptLanguage.startsWith("en") ? "en" : "de";
    const locale: Locale = locales.includes(preferredLocale as Locale)
      ? (preferredLocale as Locale)
      : defaultLocale;

    // Send verification email
    const result = await sendVerificationEmail(user.email, token, locale);

    if (!result.success) {
      console.error("Failed to send verification email:", result.error);
      return NextResponse.json(
        { error: "E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es später erneut." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Bestätigungslink wurde an Ihre E-Mail-Adresse gesendet",
    });
  } catch (error) {
    console.error("Send verification error:", error);
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 });
  }
}
