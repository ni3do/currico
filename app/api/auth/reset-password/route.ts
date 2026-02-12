import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

/**
 * POST /api/auth/reset-password
 * Validate token and update password
 */
export async function POST(request: NextRequest) {
  try {
    let body: { token?: string; password?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ error: "Token und Passwort erforderlich" }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Passwort muss mindestens 8 Zeichen haben" },
        { status: 400 }
      );
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { error: "Passwort muss Gross-, Kleinbuchstaben und Zahlen enthalten" },
        { status: 400 }
      );
    }

    // Find valid token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      select: { id: true, user_id: true, expires: true },
    });

    if (!resetToken) {
      return NextResponse.json({ error: "Ungültiger oder abgelaufener Link" }, { status: 400 });
    }

    if (new Date() > resetToken.expires) {
      // Clean up expired token
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      return NextResponse.json(
        { error: "Der Link ist abgelaufen. Bitte fordern Sie einen neuen an." },
        { status: 400 }
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
      message: "Passwort erfolgreich zurückgesetzt. Sie können sich jetzt anmelden.",
    });
  } catch (error) {
    console.error("Error in reset-password:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
