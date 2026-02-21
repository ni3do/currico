import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  sendVerificationEmail,
  generateVerificationToken,
  VERIFICATION_TOKEN_EXPIRY_HOURS,
} from "@/lib/email";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import { locales, defaultLocale, type Locale } from "@/i18n/config";
import {
  requireAuth,
  unauthorized,
  notFound,
  badRequest,
  rateLimited,
  serverError,
} from "@/lib/api";
import { captureError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  // Rate limiting check
  const clientIP = getClientIP(request);
  const rateLimitResult = checkRateLimit(clientIP, "auth:send-verification");

  if (!rateLimitResult.success) {
    return rateLimited();
  }

  const userId = await requireAuth();
  if (!userId) return unauthorized();

  try {
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return notFound();
    }

    // Check if already verified
    if (user.emailVerified) {
      return badRequest("Email already verified");
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
      captureError("Failed to send verification email:", result.error);
      return serverError();
    }

    return NextResponse.json({
      message: "Bestätigungslink wurde an Ihre E-Mail-Adresse gesendet",
    });
  } catch (error) {
    captureError("Send verification error:", error);
    return serverError();
  }
}
