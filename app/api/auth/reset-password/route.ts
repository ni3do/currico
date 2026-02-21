import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { badRequest, serverError, rateLimited, API_ERROR_CODES } from "@/lib/api";
import { captureError } from "@/lib/api-error";
import { checkRateLimit, getClientIP, rateLimitHeaders } from "@/lib/rateLimit";
import { resetPasswordSchema } from "@/lib/validations/auth";

/**
 * POST /api/auth/reset-password
 * Validate token and update password
 */
export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(clientIP, "auth:reset-password");

    if (!rateLimitResult.success) {
      return rateLimited("Too many requests", rateLimitHeaders(rateLimitResult));
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(
        "Invalid token or password requirements not met",
        undefined,
        API_ERROR_CODES.INVALID_INPUT
      );
    }
    const { token, password } = parsed.data;

    // Find valid token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      select: { id: true, user_id: true, expires: true },
    });

    if (!resetToken) {
      return badRequest(
        "Invalid or expired link",
        undefined,
        API_ERROR_CODES.INVALID_OR_EXPIRED_TOKEN
      );
    }

    if (new Date() > resetToken.expires) {
      // Clean up expired token
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      return badRequest(
        "Link has expired. Please request a new one.",
        undefined,
        API_ERROR_CODES.INVALID_OR_EXPIRED_TOKEN
      );
    }

    // Hash new password and update user
    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.user_id },
        data: { password_hash: passwordHash },
      }),
      // Delete all reset tokens for this user
      prisma.passwordResetToken.deleteMany({
        where: { user_id: resetToken.user_id },
      }),
    ]);

    return NextResponse.json({
      message: "Password reset successfully. You can now sign in.",
    });
  } catch (error) {
    captureError("Error in reset-password:", error);
    return serverError();
  }
}
