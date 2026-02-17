import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api";
import { checkRateLimit, getClientIP, rateLimitHeaders } from "@/lib/rateLimit";
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
    return NextResponse.json(
      { error: "RATE_LIMITED" },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, totp_enabled: true, password_hash: true },
    });

    if (!user) {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    // Must have a password set (OAuth-only users need to set one first)
    if (!user.password_hash) {
      return NextResponse.json({ error: "PASSWORD_REQUIRED" }, { status: 400 });
    }

    if (user.totp_enabled) {
      return NextResponse.json({ error: "ALREADY_ENABLED" }, { status: 400 });
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
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
