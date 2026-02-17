import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { checkRateLimit, getClientIP, rateLimitHeaders } from "@/lib/rateLimit";
import { loginCheckSchema } from "@/lib/validations/auth";

/**
 * POST /api/auth/login-check
 * Check credentials and whether 2FA is required before calling signIn()
 */
export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const rl = checkRateLimit(clientIP, "auth:login-check");
  if (!rl.success) {
    return NextResponse.json(
      { error: "RATE_LIMITED" },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  try {
    const body = await request.json();
    const parsed = loginCheckSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { password_hash: true, totp_enabled: true },
    });

    if (!user || !user.password_hash) {
      // Don't reveal whether user exists — return same as invalid credentials
      return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
    }

    return NextResponse.json({ requires2FA: user.totp_enabled });
  } catch {
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
