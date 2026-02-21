import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import {
  requireAuth,
  unauthorized,
  notFound,
  badRequest,
  rateLimited,
  serverError,
} from "@/lib/api";
import { captureError } from "@/lib/api-error";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import { twoFactorRegenerateSchema } from "@/lib/validations/auth";
import { generateBackupCodes } from "@/lib/totp";

/**
 * POST /api/auth/2fa/regenerate-backup-codes
 * Generate new backup codes (requires password confirmation)
 */
export async function POST(request: NextRequest) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  const clientIP = getClientIP(request);
  const rl = checkRateLimit(`${userId}:${clientIP}`, "auth:2fa-regenerate");
  if (!rl.success) {
    return rateLimited();
  }

  try {
    const body = await request.json();
    const parsed = twoFactorRegenerateSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("INVALID_INPUT");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password_hash: true, totp_enabled: true },
    });

    if (!user || !user.password_hash) {
      return notFound("USER_NOT_FOUND");
    }

    if (!user.totp_enabled) {
      return badRequest("NOT_ENABLED");
    }

    const isValid = await bcrypt.compare(parsed.data.password, user.password_hash);
    if (!isValid) {
      return unauthorized("WRONG_PASSWORD");
    }

    const { codes, hashes } = generateBackupCodes();

    await prisma.user.update({
      where: { id: userId },
      data: { backup_codes: hashes },
    });

    return NextResponse.json({ backupCodes: codes });
  } catch (error) {
    captureError("2FA regenerate error:", error);
    return serverError();
  }
}
