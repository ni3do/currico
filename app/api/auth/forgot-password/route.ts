import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

const PASSWORD_RESET_EXPIRY_HOURS = 1;

/**
 * POST /api/auth/forgot-password
 * Generate a password reset token and send email
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "E-Mail-Adresse erforderlich" }, { status: 400 });
    }

    // Find user with password (credentials account only)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, password_hash: true, preferred_language: true },
    });

    // Always return success to prevent email enumeration
    if (!user || !user.password_hash) {
      return NextResponse.json({
        message:
          "Falls ein Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen gesendet.",
      });
    }

    // Delete existing tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { user_id: user.id },
    });

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date();
    expires.setHours(expires.getHours() + PASSWORD_RESET_EXPIRY_HOURS);

    await prisma.passwordResetToken.create({
      data: {
        token,
        expires,
        user_id: user.id,
      },
    });

    // Send email
    await sendPasswordResetEmail({
      email: email.toLowerCase().trim(),
      token,
      locale: (user.preferred_language as "de" | "en") || "de",
    });

    return NextResponse.json({
      message:
        "Falls ein Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen gesendet.",
    });
  } catch (error) {
    console.error("Error in forgot-password:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
