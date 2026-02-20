import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized, badRequest, rateLimited, serverError } from "@/lib/api";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import { changePasswordSchema } from "@/lib/validations/auth";

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
      return rateLimited();
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest("INVALID_BODY");
    }

    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      // Map Zod errors to existing error codes for i18n
      if (firstError?.path.includes("confirmPassword") && firstError.code === "custom") {
        return badRequest("PASSWORDS_MISMATCH");
      }
      if (firstError?.path.includes("newPassword")) {
        if (firstError.code === "too_small") return badRequest("PASSWORD_TOO_SHORT");
        return badRequest("PASSWORD_TOO_WEAK");
      }
      return badRequest("FIELDS_REQUIRED");
    }

    const { currentPassword, newPassword } = parsed.data;

    // Fetch user's password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password_hash: true },
    });

    if (!user) {
      return badRequest("USER_NOT_FOUND");
    }

    // OAuth-only users cannot change password
    if (!user.password_hash) {
      return badRequest("NO_PASSWORD_SET");
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentValid) {
      return badRequest("CURRENT_PASSWORD_WRONG");
    }

    // Ensure new password differs from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
    if (isSamePassword) {
      return badRequest("SAME_PASSWORD");
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
