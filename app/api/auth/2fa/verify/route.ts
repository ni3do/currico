import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api";
import { checkRateLimit, getClientIP, rateLimitHeaders } from "@/lib/rateLimit";
import { twoFactorVerifySchema } from "@/lib/validations/auth";
import { validateTOTP, generateBackupCodes } from "@/lib/totp";

/**
 * POST /api/auth/2fa/verify
 * Verify a TOTP token to complete 2FA setup. Returns backup codes.
 */
export async function POST(request: NextRequest) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  const clientIP = getClientIP(request);
  const rl = checkRateLimit(`${userId}:${clientIP}`, "auth:2fa-verify");
  if (!rl.success) {
    return NextResponse.json(
      { error: "RATE_LIMITED" },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  try {
    const body = await request.json();
    const parsed = twoFactorVerifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totp_secret: true, totp_enabled: true },
    });

    if (!user || !user.totp_secret) {
      return NextResponse.json({ error: "SETUP_REQUIRED" }, { status: 400 });
    }

    if (user.totp_enabled) {
      return NextResponse.json({ error: "ALREADY_ENABLED" }, { status: 400 });
    }

    const isValid = validateTOTP(parsed.data.token, user.totp_secret);
    if (!isValid) {
      return NextResponse.json({ error: "INVALID_CODE" }, { status: 400 });
    }

    // Generate backup codes and enable 2FA
    const { codes, hashes } = generateBackupCodes();

    await prisma.user.update({
      where: { id: userId },
      data: {
        totp_enabled: true,
        backup_codes: hashes,
      },
    });

    return NextResponse.json({ backupCodes: codes });
  } catch (error) {
    console.error("2FA verify error:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
