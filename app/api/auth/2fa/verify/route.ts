import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized, badRequest, rateLimited, serverError } from "@/lib/api";
import { captureError } from "@/lib/api-error";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
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
    return rateLimited();
  }

  try {
    const body = await request.json();
    const parsed = twoFactorVerifySchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("INVALID_INPUT");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totp_secret: true, totp_enabled: true },
    });

    if (!user || !user.totp_secret) {
      return badRequest("SETUP_REQUIRED");
    }

    if (user.totp_enabled) {
      return badRequest("ALREADY_ENABLED");
    }

    const isValid = validateTOTP(parsed.data.token, user.totp_secret);
    if (!isValid) {
      return badRequest("INVALID_CODE");
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
    captureError("2FA verify error:", error);
    return serverError();
  }
}
