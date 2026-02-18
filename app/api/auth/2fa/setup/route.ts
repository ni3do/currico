import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  requireAuth,
  unauthorized,
  notFound,
  badRequest,
  rateLimited,
  serverError,
} from "@/lib/api";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import { generateTOTPSetup } from "@/lib/totp";

/**
 * POST /api/auth/2fa/setup
 * Generate a TOTP secret and QR code for the current user
 */
export async function POST(request: NextRequest) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  const clientIP = getClientIP(request);
  const rl = checkRateLimit(`${userId}:${clientIP}`, "auth:2fa-setup");
  if (!rl.success) {
    return rateLimited();
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, totp_enabled: true, password_hash: true },
    });

    if (!user) {
      return notFound("USER_NOT_FOUND");
    }

    // Must have a password set (OAuth-only users need to set one first)
    if (!user.password_hash) {
      return badRequest("PASSWORD_REQUIRED");
    }

    if (user.totp_enabled) {
      return badRequest("ALREADY_ENABLED");
    }

    const { secret, encrypted, qrCodeUrl } = await generateTOTPSetup(user.email);

    // Store encrypted secret temporarily (not yet enabled)
    await prisma.user.update({
      where: { id: userId },
      data: { totp_secret: encrypted },
    });

    return NextResponse.json({ qrCodeUrl, secret });
  } catch (error) {
    console.error("2FA setup error:", error);
    return serverError();
  }
}
