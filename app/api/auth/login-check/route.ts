import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import { loginCheckSchema } from "@/lib/validations/auth";
import { unauthorized, badRequest, rateLimited, serverError } from "@/lib/api";

/**
 * POST /api/auth/login-check
 * Check credentials and whether 2FA is required before calling signIn()
 */
export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const rl = checkRateLimit(clientIP, "auth:login-check");
  if (!rl.success) {
    return rateLimited();
  }

  try {
    const body = await request.json();
    const parsed = loginCheckSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("INVALID_INPUT");
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { password_hash: true, totp_enabled: true },
    });

    if (!user || !user.password_hash) {
      // Don't reveal whether user exists — return same as invalid credentials
      return unauthorized("INVALID_CREDENTIALS");
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return unauthorized("INVALID_CREDENTIALS");
    }

    return NextResponse.json({ requires2FA: user.totp_enabled });
  } catch {
    return serverError();
  }
}
