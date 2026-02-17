import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { requireAuth, unauthorized } from "@/lib/api";
import { checkRateLimit, getClientIP, rateLimitHeaders } from "@/lib/rateLimit";
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
    return NextResponse.json(
      { error: "RATE_LIMITED" },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  try {
    const body = await request.json();
    const parsed = twoFactorDisableSchema.safeParse(body);
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
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
