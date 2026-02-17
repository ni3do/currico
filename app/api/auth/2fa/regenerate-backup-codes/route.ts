import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { requireAuth, unauthorized } from "@/lib/api";
import { checkRateLimit, getClientIP, rateLimitHeaders } from "@/lib/rateLimit";
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
    return NextResponse.json(
      { error: "RATE_LIMITED" },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  try {
    const body = await request.json();
    const parsed = twoFactorRegenerateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password_hash: true, totp_enabled: true },
    });

    if (!user || !user.password_hash) {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    if (!user.totp_enabled) {
      return NextResponse.json({ error: "NOT_ENABLED" }, { status: 400 });
    }

    const isValid = await bcrypt.compare(parsed.data.password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: "WRONG_PASSWORD" }, { status: 401 });
    }

    const { codes, hashes } = generateBackupCodes();

    await prisma.user.update({
      where: { id: userId },
      data: { backup_codes: hashes },
    });

    return NextResponse.json({ backupCodes: codes });
  } catch (error) {
    console.error("2FA regenerate error:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
