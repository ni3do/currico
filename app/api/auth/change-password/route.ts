import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized, serverError } from "@/lib/api";
import { checkRateLimit, getClientIP, rateLimitHeaders } from "@/lib/rateLimit";

/**
 * POST /api/auth/change-password
 * Change password for authenticated users with an existing password.
 * Returns error codes (not human-readable messages) so the frontend can
 * map them to the correct locale via i18n.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(clientIP, "auth:change-password");

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "RATE_LIMITED" },
        { status: 429, headers: rateLimitHeaders(rateLimitResult) }
      );
    }

    let body: { currentPassword?: string; newPassword?: string; confirmPassword?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
    }

    const { currentPassword, newPassword, confirmPassword } = body;

    // Validate all fields present
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "FIELDS_REQUIRED" }, { status: 400 });
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "PASSWORDS_MISMATCH" }, { status: 400 });
    }

    // Validate password strength (same as registration)
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "PASSWORD_TOO_SHORT" }, { status: 400 });
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return NextResponse.json({ error: "PASSWORD_TOO_WEAK" }, { status: 400 });
    }

    // Fetch user's password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password_hash: true },
    });

    if (!user) {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 400 });
    }

    // OAuth-only users cannot change password
    if (!user.password_hash) {
      return NextResponse.json({ error: "NO_PASSWORD_SET" }, { status: 400 });
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentValid) {
      return NextResponse.json({ error: "CURRENT_PASSWORD_WRONG" }, { status: 400 });
    }

    // Ensure new password differs from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
    if (isSamePassword) {
      return NextResponse.json({ error: "SAME_PASSWORD" }, { status: 400 });
    }

    // Hash and update
    const newHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password_hash: newHash },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in change-password:", error);
    return serverError();
  }
}
