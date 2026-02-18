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
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import { twoFactorDisableSchema } from "@/lib/validations/auth";

/**
 * POST /api/auth/2fa/disable
 * Disable 2FA (requires password confirmation)
 */
export async function POST(request: NextRequest) {
  const userId = await requireAuth();
  if (!userId) return unauthorized();

  const clientIP = getClientIP(request);
  const rl = checkRateLimit(`${userId}:${clientIP}`, "auth:2fa-disable");
  if (!rl.success) {
    return rateLimited();
  }

  try {
    const body = await request.json();
    const parsed = twoFactorDisableSchema.safeParse(body);
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

    await prisma.user.update({
      where: { id: userId },
      data: {
        totp_enabled: false,
        totp_secret: null,
        backup_codes: [],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("2FA disable error:", error);
    return serverError();
  }
}
